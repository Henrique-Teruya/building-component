# Building Progress Blueprint

## Fluxo visual

`idle → generating → preparing → readyToReveal → revealing → ready`

Falhas de geração, carregamento, enquadramento ou decodificação chegam a `error`, que exibe feedback controlado e somente a ação “Tentar novamente”.

## Cobertura e preparação

`BuildingProgressBlueprint` mantém um wrapper relativo e transparente, sem superfície de card, borda, sombra ou padding externo. O palco conserva seu clipping; `BlueprintScanCover` é irmão do conteúdo e ocupa toda a área do componente. Durante generating, preparing e readyToReveal, o conteúdo permanece com visibility hidden, opacity 0, aria-hidden e inert. A grade pertence ao produto que hospeda o componente e permanece visível em todos os estados.

O resultado só é liberado depois de:

1. A API retornar uma URL válida.
2. Original e blueprint carregarem e serem decodificados no navegador.
3. As proporções serem compatíveis, permitindo arredondamento de até 1% na resolução de saída.
4. `ProgressComposition` montar as duas imagens no mesmo plano, com mesmo crop e object-fit.
5. A foto estar totalmente oculta e o percentual estar em 0%.
6. As imagens reais do DOM serem decodificadas e duas etapas de pintura estabilizarem o layout.

Ao chegar a readyToReveal, o scan inicia um fade de saída de 400 ms e o conteúdo um fade de entrada com a mesma duração. Durante revealing, somente o blueprint e o percentual 0% ficam visíveis. A cobertura deixa o DOM ao chegar a ready; uma pausa inicial proporcional ao destino, limitada a 60–200 ms, antecede o avanço sincronizado até a porcentagem real. Um destino de 0% mantém somente o blueprint, sem avanço nem robô de revelação.

## Motion

`BlueprintScan` usa um SVG técnico que ocupa a maior parte da altura disponível, sobre fundo transparente, preservando sua proporção. A ilustração tem 14 pavimentos e quatro vãos por andar, com janelas, montantes, varandas, lajes, estrutura interna, cobertura e cotas finas. Todas as arestas usam traços finos. Não acrescenta grade, borda ou superfície. Não há legenda visível; o status é identificado por aria-label. Os traços mantêm sua espessura ao redimensionar. Uma única linha faz a varredura em um loop CSS de 3 segundos. Uma cópia da geometria, sem o robô, recebe azul SKR de contraste e offsets subpixel para um engrossamento discreto. Uma máscara com gradiente acompanha o scanner e restaura a aparência original após a passagem. Máscara e linha compartilham a mesma animação de transform. `ScanWorker` anima o robô construtor entre quatro pontos em um ciclo CSS de 3,94 segundos: trabalha por 780–960 ms com duas ou três marteladas e muda de ponto em 100–130 ms, com compressão do corpo e um rastro curto. Cada contato realça um pequeno trecho do desenho. Ao terminar, o robô recolhe o braço e desaparece brevemente. Não há timers para simular etapas ou progresso de processamento. `BlueprintSkeleton` reutiliza esse mesmo visual.

`BlueprintLineEmphasis` mantém esse destaque na composição final sem uma linha de scanner visível. A imagem duplicada usa transforms inversos aos da janela mascarada para manter os pixels alinhados, em um loop CSS de 3 segundos. Um filtro estático aplica a cor de contraste e pequenos offsets de 0,18 pixel. A camada fica abaixo de `ProgressOverlay`, afetando somente o blueprint ainda visível, e é removida em 100%. Não adiciona processamento no servidor ou chamadas de geração.

`useConstructionProgress` separa o destino real do valor exibido. `animateConstructionProgress` usa uma única sequência requestAnimationFrame, com ease-out cubic, para dirigir foto, número, slider e robô. A duração é calculada pela diferença absoluta entre origem e destino: sem diferença não há avanço; nos demais casos, `200 + 24 × diferença` milissegundos. Assim, 0→5 leva 320 ms, 0→25 leva 800 ms, 0→50 leva 1.400 ms e 0→100 leva 2.600 ms. A janela da foto e sua imagem usam transforms inversos para manter os pixels alinhados enquanto a área revelada sobe. A linha divisória também usa transform. Transições CSS ficam desativadas durante esse avanço para evitar atraso entre as camadas. A barra já está disponível e interrompe a entrada ao ser ajustada. Uma alteração externa continua a partir do valor visível, recalculando o tempo pela diferença restante; nova geração, erro ou unmount cancelam a animação e reiniciam o valor exibido em 0%. Nenhum quadro chama onProgressChange.

`RevealWorker` reutiliza `WorkerRobot` durante a primeira entrada de cada resultado. A posição vertical segue o percentual exibido na fronteira da foto, e o tempo normalizado da mesma sequência determina os pontos horizontais, a preparação, as marteladas e as reações corporais. A coreografia adapta a quantidade de trabalho ao tempo disponível: 5% usa uma martelada em um ponto; 25%, três em dois pontos; 50%, seis em quatro pontos; 100%, oito em oito pontos. O plano combina a fração do tempo linear e a fração do progresso real, com peso igual para cada uma, para distribuir o início dos pontos. Assim, as trocas acontecem mais cedo quando a fronteira sobe rápido e desaceleram com o ease-out perto do destino. As viagens duram 40–75 ms, conforme a velocidade da fronteira. Avanços maiores percorrem mais posições ao longo da construção. O robô é renderizado sobre a composição, mantendo cabeça e mãos livres das máscaras que recortam as imagens. `ScanWorker` continua responsável pelo loop do carregamento.

Na entrada 0→destino, a pausa inicial é `4 × diferença` milissegundos, limitada a 60–200 ms. Ao terminar o avanço, o braço do martelo descansa e a mão livre faz um joinha acompanhado de um aceno de cabeça. O gesto usa `9 × diferença` milissegundos, limitado a 220–450 ms; a saída usa `3 × diferença`, limitada a 80–150 ms. O percentual fica estabilizado e a interface disponível durante a confirmação. Ajustar o slider, alterar o destino, trocar a imagem ou ativar movimento reduzido cancela o robô sem executar o gesto final. A sequência não se repete em ajustes posteriores do percentual e não exige análise de arestas, processamento no servidor ou nova chamada à IA.

Com prefers-reduced-motion, a linha e o robô do carregamento ficam estáticos, os destaques das linhas e os efeitos de marteladas desaparecem e os fades duram 150 ms. O blueprint ainda aparece em 0%; após a pausa, o destino é aplicado sem avanço gradual e sem `RevealWorker`. Ativar essa preferência durante uma animação também aplica o destino imediatamente e cancela o robô sem confirmação.

## Prévia

`/animation-preview` usa o mesmo componente e um adaptador local que aguarda uma ação de revisão. O blueprint de demonstração é produzido localmente com Sharp; a prévia não chama a API de IA.

A página inicial também prepara o blueprint do exemplo sintético no servidor e fornece `initialBlueprintUrl`. Ela funciona com ou sem chave e não submete o exemplo à IA ao montar ou atualizar a página. O envio de uma nova foto conserva o fluxo de geração configurado.

Os empreendimentos de demonstração e o valor inicial da prévia usam 50%. Somente `/animation-preview` oferece um seletor de percentuais para verificar a duração e a coreografia em diferentes destinos. A integração pode fornecer qualquer percentual real entre 0 e 100.

## Falhas da API

Antes de enviar a foto, o serviço consulta `GET /v1/account` com timeout de 15 segundos. Uma conta Free usa Qwen Image 2.1 em 640px; contas Creator, Pro e Business usam Nano Banana 2 em 2k. `imageCount: 1` mantém uma única saída. Saldo e acesso ao modelo/resolução são independentes; a conta Free pode ter créditos e continuar sem acesso ao Nano Banana 2 ou 2k.

`BlueprintGenerationError` traduz falhas do SDK em status e códigos seguros. HTTP 402 do Magic Hour vira `billing_restricted`, preservado pela Route Handler, sem assumir que a conta está sem saldo. Autenticação inválida vira `invalid_api_key` (503); limite de requisições, `rate_limited` (429); demais falhas da IA, `generation_failed` (502). A resposta não inclui o objeto de erro do SDK, que contém a requisição autenticada.

`request-blueprint.ts` conserva o status, código e mensagem segura retornados pela API, inclusive quando um gateway responde sem JSON. Recusas da API são registradas como avisos no cliente e entram no estado recuperável de erro, com apenas o botão de retry visível. Erros inesperados de código ou preparação continuam registrados como erros.

## Blueprint transparente

`blueprint-frame.ts` normaliza a orientação EXIF e seleciona a proporção de canvas suportada mais próxima da foto. A imagem inteira é redimensionada proporcionalmente e recebe margens brancas, sem crop. Essa versão é enviada como PNG por `File` em memória, com `aspectRatio` explícito e instruções de preservar as margens. A saída volta ao canvas enviado, compensando até 16 pixels de arredondamento por eixo, e extrai somente a região original. Saídas com outra proporção são rejeitadas. A validação de 1% no cliente permanece ativa. A versão `padded-frame-v1` integra a chave do cache, sem disparar regenerações automáticas da foto montada.

Para calcular o enquadramento com os mesmos bytes enviados ao provedor, `source-image.ts` lê os dados base64 ou uma URL HTTP/HTTPS pública, com limite de 10 MB e até três redirecionamentos validados. URLs locais/privadas são recusadas. A imagem não é gravada em arquivo temporário.

`blueprint-linework.ts` produz PNGs RGBA com espaços vazios realmente transparentes. A IA recebe instruções de desenhar todos os contornos com a mesma espessura fina, sobre branco uniforme, preservando os volumes, as lajes e os cantos visíveis. O servidor extrai a máscara dos traços, remove o fundo e preenchimentos sólidos e aplica o azul SKR `#0071e3`. Não há análise estrutural, afinação iterativa nem redesenho de arestas.

O canvas, as dimensões e o enquadramento são preservados. Arestas, montantes, brises, divisões de painéis, suportes internos, caixilhos e recuos secundários seguem a mesma linguagem de traços finos. O orquestrador fornece canvases de até 2048 px; a leitura de um desenho gerado também limita a decodificação a 16 megapixels.

Na demonstração local, o detector de bordas considera os três canais de cor para preservar contornos entre superfícies de luminosidade semelhante. A máscara é colorizada diretamente. Árvores, oclusões e detalhes de fotos complexas também podem aparecer nessa demonstração; a geração de IA fornece um desenho técnico mais limpo. URLs remotas usam a IA configurada; a demonstração local exige dados de imagem enviados.

O cache usa foto, empreendimento, enquadramento, a versão compartilhada em `blueprint-style.ts` e a versão de servidor em `blueprint-processing.ts`. Uma mudança da versão compartilhada atualiza a imagem enviada que já está montada, preservando o percentual; mudar somente o processamento invalida pedidos futuros sem disparar essa regeneração. A ilustração SVG padrão não dispara geração de IA. `BlueprintViewer` tem fundo transparente e não insere grade. A composição é única: blueprint na base e foto recortada pela faixa correspondente ao progresso real. `ProgressComposition` aplica duas máscaras lineares com interseção no plano compartilhado: fade de 7% nas laterais e 6% no topo/base, também suavizando os cantos. Foto, blueprint e linha divisória continuam alinhados sob a mesma máscara. Não há modos alternativos, controle de tela cheia, toolbar ou presets. O estado de erro não acrescenta uma superfície.

## Envio da imagem

O wrapper aceita arrastar/soltar. A própria área da imagem é um botão nativo sem aparência de controle adicional: clique ou ativação pelo teclado abre o input de arquivo oculto. Sem imagem inicial, uma área de envio exibe uma única instrução. O arquivo entra no mesmo fluxo de validação, upload, geração, decodificação e revelação. Durante esse fluxo, o conteúdo fica inert. O único controle persistente é a barra contínua de progresso.

## Percentual construído

`BlueprintViewer` divide o palco entre `ProgressComposition` e o percentual construído em destaque ao lado, sem legenda visível. As colunas têm larguras iguais para acomodar o número de três dígitos em 100%. O valor vem do mesmo `progress` usado na máscara, limitado a 0–100, e acompanha alterações externas e do slider. O indicador permanece visível mesmo com `showProgressSlider={false}`. O tamanho do número usa 28cqw com teto de 22rem; scaleY(1.35) aumenta especificamente a altura, sem consumir largura adicional. O token `--font-progress-display` aplica Barlow Condensed bold, servida por um WOFF2 local de cerca de 15 KB, com sua licença em `public/fonts/`. O nome acessível do indicador continua descrevendo o percentual construído. `ProgressOverlay` mantém somente a linha divisória, sem percentual sobre a imagem.

## Estilos

O registry de styled-jsx injeta o CSS na renderização inicial do App Router. Ao incorporar o componente em outra aplicação Next.js que usa styled-jsx, inclua o registry do projeto ou um equivalente no layout do produto.
