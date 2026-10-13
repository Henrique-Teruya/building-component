import { ApiError } from "magic-hour";

const failures = {
  billing_restricted: {
    status: 402,
    message: "O Magic Hour recusou a geração. Verifique o saldo e o acesso do plano ao modelo e à resolução.",
  },
  invalid_api_key: {
    status: 503,
    message: "Verifique a chave da API Magic Hour configurada no servidor.",
  },
  rate_limited: {
    status: 429,
    message: "O serviço de IA está ocupado. Aguarde um momento e tente novamente.",
  },
  generation_failed: {
    status: 502,
    message: "Não foi possível gerar o blueprint pela IA. Tente novamente.",
  },
} as const;

export class BlueprintGenerationError extends Error {
  readonly status: number;

  constructor(readonly code: keyof typeof failures) {
    super(failures[code].message);
    this.name = "BlueprintGenerationError";
    this.status = failures[code].status;
  }
}

export function mapMagicHourError(error: unknown): BlueprintGenerationError {
  if (error instanceof ApiError) {
    if (error.response.status === 402) return new BlueprintGenerationError("billing_restricted");
    if ([401, 403].includes(error.response.status)) return new BlueprintGenerationError("invalid_api_key");
    if (error.response.status === 429) return new BlueprintGenerationError("rate_limited");
  }
  return new BlueprintGenerationError("generation_failed");
}
