#!/usr/bin/env node
// Gera um PDF com a identidade do NORTE a partir de um Markdown. Uso:
//
//   node render/render.mjs relatorios/ASSUNTO.md relatorios/ASSUNTO.pdf
//
// Cadeia: pandoc (gfm → html5, template próprio) → Mermaid renderizado na
// página → Chromium via playwright-core → PDF A4 com capa, sumário, cabeçalho
// e rodapé numerado → pdf-lib junta a capa sem numeração ao corpo numerado.
//
// Depende de: pandoc, IBM Plex instalada no sistema e `npm install` feito
// nesta pasta. Nenhuma outra ferramenta externa.
//
// Metadados da capa vêm de um comentário no topo do Markdown:
//   <!-- pdf-meta subtitle="..." tipo="Descritivo técnico" version="1.0" date="8 de outubro de 2026" -->
// O título é o primeiro `# Título` do arquivo.

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const pasta = path.resolve(aqui, ".."); // template-relatorio/
const [entrada, saida] = process.argv.slice(2);
if (!entrada || !saida) {
  console.error("Uso: node render/render.mjs <doc.md> <doc.pdf>");
  process.exit(2);
}

const require = createRequire(path.join(aqui, "package.json"));
let chromium, mermaidJs, PDFDocument;
try {
  ({ chromium } = require("playwright-core"));
  ({ PDFDocument } = require("pdf-lib"));
  mermaidJs = readFileSync(
    require.resolve("mermaid/dist/mermaid.min.js"),
    "utf8",
  );
} catch {
  console.error(`Dependências ausentes. Rodar: cd ${aqui} && npm install`);
  process.exit(1);
}

const md = readFileSync(entrada, "utf8");
const titulo = (md.match(/^# (.+)$/m) ?? [
  ,
  path.basename(entrada, ".md"),
])[1].trim();
const meta = Object.fromEntries(
  [
    ...(md.match(/<!-- pdf-meta ([\s\S]*?)-->/)?.[1] ?? "").matchAll(
      /(\w+)="([^"]*)"/g,
    ),
  ].map((m) => [m[1], m[2]]),
);
const esperados = (md.match(/^```mermaid\s*$/gm) ?? []).length;

// ── pandoc ─────────────────────────────────────────────────────────────────
const args = [
  entrada,
  "--from=gfm",
  "--to=html5",
  "--standalone",
  "--syntax-highlighting=none",
  "--shift-heading-level-by=-1",
  `--template=${path.join(aqui, "template.html")}`,
  "--metadata=lang:pt-BR",
  `--metadata=title:${titulo}`,
];
// Sumário só quando há mais de uma seção; num documento curto seria uma página vazia.
if ((md.match(/^## /gm) ?? []).length > 1) args.push("--toc", "--toc-depth=2");
for (const chave of ["subtitle", "tipo", "version", "date"]) {
  if (meta[chave]) args.push(`--metadata=${chave}:${meta[chave]}`);
}
let html = execFileSync("pandoc", args, {
  encoding: "utf8",
  maxBuffer: 64 << 20,
});

// ── recursos inline (o PDF não pode depender de arquivo nem de rede) ──────
// A IBM Plex vem do sistema (fontconfig); o Chromium embute os subconjuntos
// que usar. A logo entra como data URI porque é um bitmap, não um SVG.
const logo =
  "data:image/webp;base64," +
  readFileSync(path.join(pasta, "norte.webp")).toString("base64");
// Logos do cabeçalho, NORTE e depois ITAIPU: recortadas (sem margem
// transparente) e reduzidas, para não repetir a logo da capa em cada página.
const png = (nome) =>
  "data:image/png;base64," +
  readFileSync(path.join(pasta, nome)).toString("base64");
const logos = ["norte-cabecalho.png", "itaipu.png"]
  .map((f) => `<img src="${png(f)}" style="height:10mm;display:block">`)
  .join("");
const estilo = readFileSync(path.join(aqui, "style.css"), "utf8");

html = html
  .replace("%%ESTILO%%", () => estilo)
  .replace("%%LOGO%%", () => logo)
  .replace("%%LOGO_ITAIPU%%", () => png("itaipu.png"))
  .replace("%%MERMAID%%", () => mermaidJs);

// ── Chromium ───────────────────────────────────────────────────────────────
const faixa = (esq, dir) =>
  `<div style="font-family:'IBM Plex Sans',system-ui,sans-serif;font-size:8px;line-height:1.333;letter-spacing:.32px;color:#6f6f6f;width:100%;padding:0 18mm;display:flex;justify-content:space-between;align-items:center;box-sizing:border-box"><span>${esq}</span><span>${dir}</span></div>`;
const cabecalho = faixa(
  titulo,
  `<span style="display:flex;align-items:center;gap:4mm">${logos}</span>`,
);
const rodape = faixa(
  [meta.version && `Versão ${meta.version}`, meta.date]
    .filter(Boolean)
    .join(" · "),
  'Página <span class="pageNumber"></span> de <span class="totalPages"></span>',
);

const navegador = await chromium.launch().catch((e) => {
  console.error(
    `Chromium indisponível para o playwright-core (${e.message}).\n` +
      "Rodar: npx playwright install chromium",
  );
  process.exit(1);
});
const pagina = await navegador.newPage();
await pagina.setContent(html, { waitUntil: "load" });
await pagina.waitForFunction(() => window.__pronto || window.__erro, null, {
  timeout: 60_000,
});
const erro = await pagina.evaluate(() => window.__erro);
if (erro) {
  await navegador.close();
  console.error(`Mermaid falhou: ${erro}`);
  process.exit(1);
}
const renderizados = await pagina.evaluate(() => window.__diagramas);
if (renderizados !== esperados) {
  await navegador.close();
  console.error(
    `Diagramas: ${renderizados} renderizados, ${esperados} no Markdown.`,
  );
  process.exit(1);
}

const comum = {
  format: "A4",
  printBackground: true,
  preferCSSPageSize: false,
  tagged: true,
  margin: { top: "22mm", bottom: "20mm", left: "18mm", right: "18mm" },
};
const tmp = mkdtempSync(path.join(tmpdir(), "norte-pdf-"));
const capa = path.join(tmp, "capa.pdf");
const corpo = path.join(tmp, "corpo.pdf");
// A capa sai sem cabeçalho nem rodapé; o restante, numerado a partir de 2.
await pagina.pdf({
  ...comum,
  path: capa,
  pageRanges: "1",
  displayHeaderFooter: false,
});
await pagina.pdf({
  ...comum,
  path: corpo,
  pageRanges: "2-",
  displayHeaderFooter: true,
  headerTemplate: cabecalho,
  footerTemplate: rodape,
});

// A junção é feita com pdf-lib e não com uma ferramenta externa: o `gs` 10.0x
// descarta a imagem ICC da capa e o `pdfunite` escreve um /Size de trailer
// errado, que o próprio poppler recusa a reler. A mesma biblioteca grava os
// metadados, o que dispensa o exiftool.
const pdf = await PDFDocument.create();
for (const parte of [capa, corpo]) {
  const origem = await PDFDocument.load(readFileSync(parte));
  for (const p of await pdf.copyPages(origem, origem.getPageIndices()))
    pdf.addPage(p);
}
pdf.setTitle(titulo);
pdf.setAuthor("NORTE");
pdf.setSubject(meta.subtitle ?? "");
pdf.setCreator("render/render.mjs (pandoc + Chromium)");
pdf.setProducer("pdf-lib");
pdf.setLanguage("pt-BR");
writeFileSync(saida, await pdf.save());

await navegador.close();
rmSync(tmp, { recursive: true, force: true });

console.log(
  `${saida}: ${renderizados} diagramas, ${pdf.getPageCount()} páginas, ${existsSync(saida) ? "ok" : "FALHOU"}`,
);
