# Vuze Cut120 — landing page interativa V01

Página HTML baseada no design system aprovado da Blips / Vuze Juice, com o GLB existente conectado a uma seção 360°.

## Como visualizar

Execute na pasta da página:

```sh
python3 -m http.server 8741 --bind 127.0.0.1
```

Abra http://127.0.0.1:8741. Também é possível executar `iniciar-preview.command` no macOS. Mantenha a janela do servidor aberta durante a visita. Use um servidor HTTP; abrir o HTML diretamente como `file://` pode bloquear o módulo JavaScript e o GLB.

## O que está pronto

- Apresentação do produto, aplicações, ficha técnica responsiva, contato e FAQ.
- Giro livre por arraste, zoom, frente, traseira, lateral e perspectiva.
- Aproximações de painel, cabeçote/CCD, tração, conexões, cesto/pedestal e suporte de rolos.
- Hotspots posicionados no espaço 3D, com botões equivalentes fora da cena.
- Giro automático opcional, retorno ao início e exibição/ocultação de pontos.
- Carregamento por clique, progresso, foto alternativa e recuperação de falhas.
- Mesma identidade visual do design system: amarelo, fontes, botões e componentes.

O contato direciona ao formulário comercial da própria Plotter na página oficial, conforme autorizado pelo usuário. Não há número de WhatsApp inventado, envio automático de leads ou formulário simulado. Os preços e prazos encontrados nas referências divergiam; nesta versão as condições são consultadas no atendimento.

## Organização

| Pasta / arquivo | Finalidade |
|---|---|
| `index.html` | Conteúdo e estrutura da página |
| `css/tokens.css`, `css/components.css` | Cópia da biblioteca aprovada |
| `css/landing.css` | Layout específico da Cut120 |
| `js/config.js` | Canal comercial e caminhos do modelo/biblioteca |
| `js/landing.js` | Carregamento, controles e comportamento 3D |
| `js/components.js` | Abas acessíveis e acordeões |
| `assets/modelos/vuze-cut120.glb` | Modelo web, sem alteração da geometria |
| `assets/fotos/` | Fotografia oficial original, sem edição |
| `vendor/model-viewer/` | Biblioteca local e licença Apache 2.0 |
| `documentacao/IMPLEMENTACAO.md` | Integração e manutenção |
| `verificacao/` | Evidências de navegador e inventário de entrega |

Todos os recursos necessários à página e ao 3D estão no pacote. O canal comercial e a política de privacidade são links externos. Não há etapa de compilação, framework ou CDN obrigatório.

O `.blend` e o GLB original permanecem preservados em `BLENDER/`. Não foi gerado render de Blender ou alterada a modelagem. O navegador exibe o modelo interativamente em WebGL.
