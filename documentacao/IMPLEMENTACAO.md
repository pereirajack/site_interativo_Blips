# Integração e manutenção da Cut120

## Fontes e decisões

- Identidade: `Site_Interativo/Design_System_Blips`, extraída do HTML fornecido da Vuze Juice V01.
- Modelo: `BLENDER/exportacao/plotter-vuze-cut120.glb`. A cópia web preserva integralmente os bytes do arquivo.
- Fotografia: `BLENDER/PNG OFICIAL/Plotter Recorte 120_8.png`, preservada sem edição.
- Informações técnicas: [página oficial da Plotter](https://promo.idealdistribuidora.com/plotter-recorte-120cm/) e cópia documental anterior em `BLENDER/docs/pagina_fonte.html`.
- Visualizador: [model-viewer](https://modelviewer.dev/), versão fixa 4.3.1, distribuição oficial do pacote `@google/model-viewer`, licença Apache 2.0 incluída. Os pontos usam posição e normal em coordenadas do modelo, como descrito nos [exemplos oficiais de anotações](https://modelviewer.dev/examples/annotations/).

A página comercial atual foi consultada para confirmar o formulário e os recursos. Valores e prazos divergiam das referências anteriores; não foram consolidados como uma oferta nesta página. Aplicações gráficas são ilustrações CSS, não fotos de trabalhos ou depoimentos. Os textos são específicos da Plotter, sem transplantar afirmações comerciais da máquina de suco.

## Instalação no processo HTML da empresa

Copie todo o conteúdo desta pasta para o diretório público da landing page. Preserve `assets/`, `vendor/`, `css/` e `js/` com sua organização. O HTML usa caminhos relativos e funciona em uma subpasta do domínio sem configurar bundler.

Configure o servidor para entregar `.glb` como `model/gltf-binary` ou `application/octet-stream`, e módulos `.js` como JavaScript. Sirva por HTTP/HTTPS. Para produção, habilite gzip/Brotli para HTML/CSS/JS e cache dos recursos estáticos. Ao atualizar biblioteca ou modelo, versione o nome ou a URL para invalidar o cache.

Mantenha o GLB e a biblioteca no mesmo domínio da página. Se mudar para outro domínio, a hospedagem dos recursos precisa permitir CORS. A pasta `verificacao/` e esta documentação não precisam ser publicadas.

## Canal comercial

O único destino é configurado em `js/config.js`:

```js
commercialUrl: 'https://promo.idealdistribuidora.com/plotter-recorte-120cm/#formulario'
```

O botão abre o formulário existente em outra aba. Isso mantém o fluxo comercial real sem criar integração de CRM desconhecida. O endereço e a âncora do formulário foram confirmados por leitura, sem preencher ou enviar cadastros.

Para trocar por WhatsApp oficial, altere `commercialUrl` para o link confirmado da empresa e `contactNote` para a orientação correspondente. Para incorporar o formulário diretamente nesta página, use a integração de formulário aprovada pela empresa, com endpoint, campos e tratamento de respostas reais; não basta copiar o visual de um formulário. A página fornecida da Juice contém apenas o layout do contato, sem um destino de envio configurado.

## Carregamento e recuperação

O HTML não atribui `src` ao `model-viewer`. Somente após o clique em Explorar em 3D o código importa a biblioteca local, registra o componente e atribui a URL do GLB. Assim, nem o módulo de aproximadamente 1,07 MB nem o modelo de aproximadamente 1,74 MB entram no carregamento inicial. A foto de apresentação é compartilhada pelo hero e pela seção de exploração e pode ser reutilizada pelo cache do navegador.

O atributo `loading=eager` controla o carregamento após essa atribuição por clique; ele não antecipa o download do modelo. Evita que a recuperação fique dependendo da observação de um elemento que estava oculto pela mensagem de erro.

O progresso usa os eventos reais do visualizador. Há limite de espera de 45 segundos. Em uma falha, permanecem disponíveis fotografia, detalhes, ficha e atendimento. A tentativa novamente usa uma URL com parâmetro `retry` para evitar reutilizar uma promessa de carregamento que falhou no cache interno da biblioteca. O arquivo GLB e seu conteúdo continuam os mesmos.

## Câmera e detalhes

O GLB está em metros, Y vertical e frente em +Z. O centro inicial de observação é `0m 0.55m 0m`. Não altere unidades, origem ou rotação do modelo para integrar o visualizador.

| Detalhe | Posição do hotspot (X, Y, Z), metros | Observação |
|---|---|---|
| Painel | `0.515, 1.087, 0.0245` | Normal aproximada da superfície inclinada |
| Cabeçote/CCD | `0.478, 0.968, 0.081` | Face frontal do conjunto |
| Tração | `-0.15, 0.997, 0.05` | Região frontal do trilho/pinçadores |
| Conexões | `-0.78, 0.846, 0.024` | Lado esquerdo; aparece ao mudar o ângulo |

Essas posições foram calculadas a partir do script e dos limites das malhas exportadas e conferidas no navegador. São pontos de apresentação, sem função de medição. Painel e cabeçote usam pequenas linhas de ligação para afastar as bolhas sem mudar a posição no modelo. Pontos fora do quadro, voltados para o outro lado ou sobrepostos são ocultados e retirados da ordem de tabulação. Todos os detalhes continuam disponíveis nos botões externos.

Os alvos e órbitas de aproximação estão no objeto `details` de `js/landing.js`; as vistas completas estão em `views`. O código mantém limites de distância de 0,4 m a 8 m. Cesto/pedestal e suporte de rolos usam botões complementares, sem aumentar a quantidade de bolhas no produto.

## Experiência e acessibilidade

- Interação por arraste e controles equivalentes por botão.
- Rolagem vertical no celular com `touch-action=pan-y`.
- Foco visível, nomes nos hotspots, mensagens em região viva e seleção com `aria-pressed`.
- Giro automático somente por escolha do visitante; pausa fora da seção e quando a aba fica oculta.
- Preferência de movimento reduzido respeitada nas transições e movimentos de câmera.
- Ficha técnica em abas com teclado no desktop e acordeões no celular.
- Atendimento fixo no celular oculto enquanto apresentação ou contato estão visíveis.

As fontes Helvetica Now seguem o comportamento do material de origem: uso local quando disponíveis, com alternativas Helvetica Neue/Helvetica/Arial. Para tipografia idêntica em todos os dispositivos, a empresa deverá fornecer os WOFF2 licenciados e configurar as declarações `@font-face`.

## Conferência

Os registros em `../verificacao/` incluem testes em Chrome com viewports de 1440, 768, 390 e 320 px, acesso ao modelo real, arraste, zoom, seleção, vistas e falha de rede controlada. As larguras menores simulam o viewport; não representam testes em aparelhos físicos. Não foram enviados leads ou mensagens comerciais durante a conferência.

O pacote ZIP contém a página completa e os recursos necessários. Os hashes dos recursos de origem e das cópias constam em `../verificacao/entrega.json`. O modelo permanece uma reconstrução visual para apresentação web; as medidas e recursos publicados são apresentados na ficha técnica.
