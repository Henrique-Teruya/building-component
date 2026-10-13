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

Ao chegar a readyToReveal, o scan inicia um fade de saída de 400 ms e o conteúdo um fade de entrada com a mesma duração. Durante revealing, somente o blueprint e o percentual 0% ficam visíveis. A cobertura deixa o DOM ao chegar a ready; após 200 ms, começa o avanço sincronizado até a porcentagem real.

## Motion

`BlueprintScan` usa um SVG técnico que ocupa a maior parte da altura disponível, sobre fundo transparente, preservando sua proporção. A ilustração tem 14 pavimentos e quatro vãos por andar, com janelas, montantes, varandas, lajes, estrutura interna, cobertura e cotas finas. Apenas as extremidades verticais recebem sete fios paralelos com pontas arredondadas, usando um gradiente entre azul SKR 500 e azul 100 para o perfil cilíndrico. IDs de gradiente usam useId para permitir vários componentes na mesma página. Não acrescenta grade, borda ou superfície. Não há legenda visível; o status é identificado por aria-label. Os traços mantêm sua espessura ao redimensionar. Uma única linha faz a varredura em um loop CSS de 3 segundos, animando transform e opacity. Não há timers para simular etapas ou progresso de processamento. `BlueprintSkeleton` reutiliza esse mesmo visual.

`useConstructionProgress` separa o destino real do valor exibido. `animateConstructionProgress` usa uma única sequência requestAnimationFrame de 1,4 segundo, com ease-out cubic, para dirigir foto, número e slider. A janela da foto e sua imagem usam transforms inversos para manter os pixels alinhados enquanto a área revelada sobe. A linha divisória também usa transform. Transições CSS ficam desativadas durante esse avanço para evitar atraso entre as camadas. A barra já está disponível e interrompe a entrada ao ser ajustada. Uma alteração externa continua a partir do valor visível; nova geração, erro ou unmount cancelam a animação e reiniciam o valor exibido em 0%. Nenhum quadro chama onProgressChange.

Com prefers-reduced-motion, a linha fica estática e os fades duram 150 ms. O blueprint ainda aparece em 0%; após a pausa, o destino é aplicado sem avanço gradual. Ativar essa preferência durante uma animação também aplica o destino imediatamente.

## Prévia

`/animation-preview` usa o mesmo componente e um adaptador local que aguarda uma ação de revisão. O blueprint de demonstração é produzido localmente com Sharp; a prévia não chama a API de IA.

A página inicial também prepara o blueprint do exemplo sintético no servidor e fornece `initialBlueprintUrl`. Ela funciona com ou sem chave e não submete o exemplo à IA ao montar ou atualizar a página. O envio de uma nova foto conserva o fluxo de geração configurado.

Todos os empreendimentos de demonstração e a prévia usam 50%. A integração pode fornecer qualquer percentual real entre 0 e 100.

## Falhas da API

Antes de enviar a foto, o serviço consulta `GET /v1/account` com timeout de 15 segundos. Uma conta Free usa Qwen Image 2.1 em 640px; contas Creator, Pro e Business usam Nano Banana 2 em 2k. `imageCount: 1` mantém uma única saída. Saldo e acesso ao modelo/resolução são independentes; a conta Free pode ter créditos e continuar sem acesso ao Nano Banana 2 ou 2k.

`BlueprintGenerationError` traduz falhas do SDK em status e códigos seguros. HTTP 402 do Magic Hour vira `billing_restricted`, preservado pela Route Handler, sem assumir que a conta está sem saldo. Autenticação inválida vira `invalid_api_key` (503); limite de requisições, `rate_limited` (429); demais falhas da IA, `generation_failed` (502). A resposta não inclui o objeto de erro do SDK, que contém a requisição autenticada.

`request-blueprint.ts` conserva o status, código e mensagem segura retornados pela API, inclusive quando um gateway responde sem JSON. Recusas da API são registradas como avisos no cliente e entram no estado recuperável de erro, com apenas o botão de retry visível. Erros inesperados de código ou preparação continuam registrados como erros.

## Blueprint transparente

`blueprint-frame.ts` normaliza a orientação EXIF e seleciona a proporção de canvas suportada mais próxima da foto. A imagem inteira é redimensionada proporcionalmente e recebe margens brancas, sem crop. Essa versão é enviada como PNG por `File` em memória, com `aspectRatio` explícito e instruções de preservar as margens. A saída volta ao canvas enviado, compensando até 16 pixels de arredondamento por eixo, e extrai somente a região original. Saídas com outra proporção são rejeitadas. A validação de 1% no cliente permanece ativa. A versão `padded-frame-v1` integra a chave do cache, sem disparar regenerações automáticas da foto montada.

Para calcular o enquadramento com os mesmos bytes enviados ao provedor, `source-image.ts` lê os dados base64 ou uma URL HTTP/HTTPS pública, com limite de 10 MB e até três redirecionamentos validados. URLs locais/privadas são recusadas. A imagem não é gravada em arquivo temporário.

`blueprint-linework.ts` produz PNGs RGBA com espaços vazios realmente transparentes. A IA recebe instruções de desenhar apenas traços sobre branco uniforme e destacar os limites dos volumes retangulares principais projetados para a frente: um par de arestas por volume, portanto quatro feixes para duas fachadas principais. Montantes, brises, divisões de painéis, suportes internos, caixilhos e recuos secundários ficam finos. O servidor descarrega a imagem retornada, remove o fundo e os núcleos de eventuais áreas preenchidas e renderiza sete fios finos agrupados nas arestas identificadas. Cada fio tem seção circular e ponta arredondada; o conjunto usa azul SKR 500 com um destaque suave em azul 100. O canvas, as dimensões e o enquadramento são preservados.

Na demonstração local, o detector de bordas considera os três canais de cor para preservar contornos entre superfícies de luminosidade semelhante. O pós-processamento agrupa segmentos verticais sem exigir 75% da altura da maior aresta. Um canto exige um contorno amplo e retilíneo de cobertura ou base, com suporte contínuo em pelo menos 85% do trecho. O alcance considera a largura da imagem e a altura do segmento; tampas curtas de janelas e ramos não bastam. Também verifica a continuação imediatamente à esquerda e à direita: colunas junto a um canto não recebem destaque quando a linha continua reta. Não existe limite de dois grupos. Os intervalos vazios da fachada continuam transparentes. Essa heurística de pixels não faz análise semântica de volumes e pode confundir detalhes em fotos complexas; a identificação dos volumes principais depende da geração de IA configurada e da validação da saída. URLs remotas usam a IA configurada; a demonstração local exige dados de imagem enviados.

O cache usa foto, empreendimento e a versão compartilhada em `blueprint-style.ts`. Uma mudança dessa versão atualiza a imagem enviada que já está montada, preservando o percentual; a ilustração SVG padrão não dispara essa regeneração. `BlueprintViewer` tem fundo transparente e não insere grade. A composição é única: blueprint na base e foto recortada pela faixa correspondente ao progresso real. `ProgressComposition` aplica duas máscaras lineares com interseção no plano compartilhado: fade de 7% nas laterais e 6% no topo/base, também suavizando os cantos. Foto, blueprint e linha divisória continuam alinhados sob a mesma máscara. Não há modos alternativos, controle de tela cheia, toolbar ou presets. O estado de erro não acrescenta uma superfície.

## Envio da imagem

O wrapper aceita arrastar/soltar. A própria área da imagem é um botão nativo sem aparência de controle adicional: clique ou ativação pelo teclado abre o input de arquivo oculto. Sem imagem inicial, uma área de envio exibe uma única instrução. O arquivo entra no mesmo fluxo de validação, upload, geração, decodificação e revelação. Durante esse fluxo, o conteúdo fica inert. O único controle persistente é a barra contínua de progresso.

## Percentual construído

`BlueprintViewer` divide o palco entre `ProgressComposition` e o percentual construído em destaque ao lado, sem legenda visível. As colunas têm larguras iguais para acomodar o número de três dígitos em 100%. O valor vem do mesmo `progress` usado na máscara, limitado a 0–100, e acompanha alterações externas e do slider. O indicador permanece visível mesmo com `showProgressSlider={false}`. O tamanho do número usa 28cqw com teto de 22rem; scaleY(1.35) aumenta especificamente a altura, sem consumir largura adicional. O token `--font-progress-display` aplica Barlow Condensed bold, servida por um WOFF2 local de cerca de 15 KB, com sua licença em `public/fonts/`. O nome acessível do indicador continua descrevendo o percentual construído. `ProgressOverlay` mantém somente a linha divisória, sem percentual sobre a imagem.

## Estilos

O registry de styled-jsx injeta o CSS na renderização inicial do App Router. Ao incorporar o componente em outra aplicação Next.js que usa styled-jsx, inclua o registry do projeto ou um equivalente no layout do produto.
