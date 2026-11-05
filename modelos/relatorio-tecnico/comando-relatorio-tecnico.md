---
description: "Escreve ou revisa um relatorio tecnico do NORTE no formato canonico (md + PDF): guia, template, greps de voz/anonimizacao/PT-BR, render e inspecao visual"
argument-hint: "<relatorios/ASSUNTO.md> [novo|revisao]"
allowed-tools: "Read, Grep, Glob, WebSearch, WebFetch, Bash(git:*), Bash(node:*), Bash(npx:*), Bash(pdffonts:*), Bash(pdftotext:*), Bash(pdftoppm:*), Bash(python3:*), Bash(grep:*), Bash(ls:*), Bash(aws:*), Bash(uv:*)"
effort: high
---

<!-- Copiar para `.claude/commands/relatorio-tecnico.md` do repositório onde os
     relatórios vivem. Ajustar os caminhos de `template-relatorio/` abaixo. -->

## Contexto (injetado)

- Guia (procedimento §0, voz §4, paleta §5.3, evidência §6, checklist §10, normas §11): !`cat template-relatorio/GUIA.md`
- Esqueleto: !`cat template-relatorio/template.md`
- Relatórios existentes: !`ls relatorios/*.md relatorios/*.pdf 2>/dev/null`
- Render instalado: !`ls template-relatorio/render/node_modules/.package-lock.json >/dev/null 2>&1 && echo ok || echo "rodar: cd template-relatorio/render && npm install"`

## Entrada

`$ARGUMENTS` = caminho do relatório e, opcionalmente, `novo` ou `revisao`. Sem
argumento: perguntar o assunto, o público e o período dos dados antes de
escrever uma linha.

## Fluxo

### Novo relatório

1. Confirmar com o dono, numa mensagem só: escopo (o que entra e o que fica de fora), público (interno, coordenação, parecerista, ITAIPU), período e estações das medições, e o que já existe no repositório sobre o assunto.
2. Localizar as fontes que governam a área no guia §11. Área ausente: buscar as referências de maior autoridade (ISO/IEC/IEEE, ABNT, IGS, artigo com DOI, documentação oficial do fornecedor) com WebSearch, confirmar edição e URL — a página tem de resolver; `iso.org`, `acm.org` e `doi.org` devolvem 403 a consulta automatizada e confirmam-se pelo índice — e acrescentar a linha à §11 do guia **no mesmo commit**.
3. Copiar `template-relatorio/template.md` para `relatorios/<ASSUNTO>.md`. Preencher a tabela de identificação e o `pdf-meta`.
4. Levantar a evidência antes do texto: comandos de leitura, listagens do S3, logs, Cost Explorer, saídas de `pytest`, métricas do modelo. Cada número guarda período, fonte e método (guia §6). Dados brutos vão para o Apêndice D ou para `relatorios/dados/<ASSUNTO>/`.
5. Escrever as seções na ordem do esqueleto; apagar as opcionais sem conteúdo real. Sumário executivo por último, a partir do corpo.
6. Seções 6, 8 e 9 preenchidas antes de qualquer afirmação sobre resultado: cobertura da série com a lacuna declarada, partição temporal com a data de corte, versões e comandos que reproduzem os números.
7. Diagramas em Mermaid com as classes da paleta (guia §5.3), orientação pela forma do conteúdo (guia §5.2), legenda `_Figura N — …_` numerada.
8. Revisão editorial integral contra o guia §4: registro impessoal, executivo no sumário e técnico no corpo, sujeito concreto e ação no verbo, sem as construções da tabela §4.2; cada afirmação técnica conferida na fonte.
9. `./template-relatorio/verificar.sh relatorios/<ASSUNTO>.md`, e os passos manuais 5, 6, 12, 13 e 14 da checklist, com o resultado de cada um registrado para o corpo do commit.
10. Linha no índice de relatórios do repositório.
11. Commit do `.md` e do `.pdf` juntos: título sem acentos, corpo em português do Brasil.

### Revisão de relatório existente

1. Nova linha na tabela de versões; `version` e `date` do `pdf-meta` iguais aos da tabela; «Situação» da identificação revista.
2. Alterações de conteúdo primeiro. Um número corrigido em relação à versão anterior é registrado como correção, com o valor antigo e a causa (guia §6).
3. Seção 14 atualizada: o que a versão resolve sai de «em aberto» para «resolvido nesta versão».
4. Passos 8 a 11 do fluxo de novo relatório.

## Verificação

```bash
./template-relatorio/verificar.sh relatorios/<ASSUNTO>.md
```

Os passos manuais, que o script não cobre:

- **5.** Toda afirmação numérica tem período, fonte e método. Amostra: as cinco maiores do sumário executivo, rastreadas até a seção que as sustenta.
- **6.** Toda métrica de modelo tem linha de base, partição e dispersão; a partição é temporal e a data de corte está declarada.
- **12.** Inspeção visual da folha de contato que o script gera: nenhum diagrama cortado, nenhuma tabela com cabeçalho órfão, nenhuma seção começando na última linha de uma página. Páginas com diagrama, reler a `-r 90`.
- **13.** Os comandos da §9 reproduzem os números do corpo num diretório limpo, ou o documento declara por que não.
- **14.** `.md` e `.pdf` no mesmo commit.

## Proibido

- Afirmar número sem período, fonte e método
- Métrica de modelo sem linha de base, sem partição temporal declarada ou calculada sobre série com lacuna não declarada
- Citar norma, artigo ou página sem edição e URL verificadas na data; área fora do guia §11 sem a entrada acrescentada no mesmo commit
- Segredo, credencial NTRIP ou FTP, ID de conta, ARN completo, IP, instance ID, e-mail: nem no `.md`, nem no PDF, nem no diagrama
- Imagem exportada no lugar de Mermaid; gráfico de dados sem o script que o gera versionado
- Commitar o `.md` sem o `.pdf` regenerado, ou o inverso
- Português europeu na prosa
- Texto na voz de assistente (tabela §4.2 do guia)
