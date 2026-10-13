import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import http from "node:http";
import https from "node:https";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function publicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127));
  }
  // Restrict IPv6 to global unicast; mapped IPv4 and local addresses stay blocked.
  return isIP(address) === 6 && /^[23][0-9a-f]{3}:/i.test(address);
}

async function downloadPublicImage(url: URL): Promise<{ bytes?: Buffer; location?: string }> {
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("URL da imagem inválida.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error("A imagem deve usar uma URL pública.");
  const address = addresses.find((entry) => isIP(entry.address) === 4)?.address ?? addresses[0].address;
  // Pin the validated address so a second DNS response cannot redirect to a private host.
  return new Promise((resolve, reject) => {
    const request = (url.protocol === "https:" ? https : http).request(url, {
      family: isIP(address),
      lookup: (_hostname, _options, callback) => callback(null, address, isIP(address)),
    }, (response) => {
      const status = response.statusCode ?? 500;
      if ([301, 302, 303, 307, 308].includes(status)) {
        response.resume();
        if (response.headers.location) resolve({ location: response.headers.location });
        else reject(new Error("Redirecionamento de imagem inválido."));
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        reject(new Error("Não foi possível carregar a foto original."));
        return;
      }
      if (Number(response.headers["content-length"]) > MAX_IMAGE_BYTES) {
        response.destroy();
        reject(new Error("A imagem deve ter no máximo 10 MB."));
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_IMAGE_BYTES) response.destroy(new Error("A imagem deve ter no máximo 10 MB."));
        else chunks.push(chunk);
      });
      response.on("end", () => resolve({ bytes: Buffer.concat(chunks) }));
      response.on("error", reject);
    });
    const timeout = setTimeout(() => request.destroy(new Error("Tempo limite ao carregar a foto original.")), 30_000);
    request.on("error", reject);
    request.on("close", () => clearTimeout(timeout));
    request.end();
  });
}

/** Read the original bytes once so upload and frame calculations use the same image. */
export async function readSourceImage(imageUrl: string): Promise<Buffer> {
  const data = imageUrl.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
  if (data) {
    const bytes = Buffer.from(data[1], "base64");
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("Tamanho da imagem inválido.");
    return bytes;
  }

  let url = new URL(imageUrl);
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await downloadPublicImage(url);
    if (response.bytes) return response.bytes;
    if (!response.location) throw new Error("Redirecionamento de imagem inválido.");
    url = new URL(response.location, url);
  }
  throw new Error("A imagem excedeu o limite de redirecionamentos.");
}
