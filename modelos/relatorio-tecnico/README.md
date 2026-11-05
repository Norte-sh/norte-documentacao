# template-relatorio

Formato dos relatórios técnicos do NORTE-ITAIPU: Markdown no repositório, PDF
ao lado dele, com a logo do projeto, a base do IBM Carbon e o verde da logo como acento.

| Arquivo                             | O que é                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `GUIA.md`                           | O formato: estrutura, voz, evidência, paleta, checklist e as normas que o governam |
| `template.md`                       | O esqueleto a copiar para `relatorios/<ASSUNTO>.md`                                |
| `verificar.sh`                      | Os passos automatizáveis da checklist (`GUIA.md` §10)                              |
| `render/`                           | Markdown → PDF: `render.mjs`, `template.html`, `style.css`                         |
| `comando-relatorio-tecnico.md`      | Comando `/relatorio-tecnico`; copiar para `.claude/commands/` do repositório       |
| `norte.webp`                        | Logo da capa, fundo transparente; o acento verde sai dela (`GUIA.md` §5.3)         |
| `norte-cabecalho.png`, `itaipu.png` | Logos do cabeçalho, NORTE e ITAIPU; a da ITAIPU vai também na capa                   |

## Usar

```bash
cd render && npm install && cd ..          # uma vez
cp template.md ../<repo>/relatorios/<ASSUNTO>.md
# escrever (GUIA.md §0 a §8)
./verificar.sh ../<repo>/relatorios/<ASSUNTO>.md
```

O `.md` e o `.pdf` entram no mesmo commit.

Exemplo pronto: `../20261028-norte2-descritivo-servicos-aws/` (descritivo curto de
contratação). Logos do projeto, com e sem fundo: `../00-logos/`.

## Precisa de

`pandoc`, `ghostscript`, Node, IBM Plex Sans e Mono instaladas no
sistema. Opcionais: `pdffonts`, `pdftotext`, `pdftoppm` (poppler) para a
verificação, `exiftool` para os metadados do PDF, `npx prettier` para alinhar
as tabelas. Se o Chromium do `playwright-core` não estiver na máquina:
`npx playwright install chromium`.

## Cores

Base do Carbon Design System v11, tema white. Acento: o verde da logo,
`#57a49a`, só em superfície (barra da capa, preenchimento); em link e traço,
a variante `#2f6f64` (5,87 : 1 sobre branco). Texto e títulos em `#161616`.
Tokens e classes dos diagramas: `GUIA.md` §5.3.

