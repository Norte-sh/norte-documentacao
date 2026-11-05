#!/usr/bin/env bash
# Passos automatizáveis da checklist do GUIA.md §10, na ordem.
#
#   ./verificar.sh relatorios/ASSUNTO.md
#
# Sai com 1 se um passo que não admite exceção falhar (anonimização,
# contagem de figuras, render). Os greps de voz e de lusitanismo apenas
# listam: cada ocorrência é lida e justificada ou removida por quem escreve.
set -uo pipefail

DOC=${1:?uso: ./verificar.sh relatorios/ASSUNTO.md}
PDF=${DOC%.md}.pdf
AQUI=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
FALHOU=0

titulo() { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  ok — %s\n' "$*"; }
erro() {
  printf '  FALHOU — %s\n' "$*"
  FALHOU=1
}

VOZ='esta seção|vale (notar|ressaltar|lembrar|a pena)|é importante (destacar|notar)|em resumo|como vimos|três (coisas|motivos|razões)|morreu|matou|custou tempo|engasg|a lição é|nunca mais|literalmente|basicamente|simplesmente|extremamente|\bvocê\b|\bnote que\b|robust|poderos|crucial|alavanc|jornada|desbloque|mergulh|não apenas .* mas também|isso garante|assegura que|sem dúvida|no final do dia|!'
LUSO='\b(ficheiro|utilizador|secç|equipa|registo|projecto|objecto|acção|actual|facto|contacto|óptimo|direcção|ecrã|rato|telemóvel|desde há|bocado|ao pé de)'
SEGREDO='[0-9]{12}|arn:aws:[a-z0-9-]+:[a-z0-9-]*:[0-9]{12}|\b([0-9]{1,3}\.){3}[0-9]{1,3}\b|\bi-0[0-9a-f]{8,}|\bami-[0-9a-f]{8,}|\bvol-[0-9a-f]{8,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}'

titulo "1. prettier"
if command -v npx >/dev/null; then
  npx --yes prettier --write "$DOC" >/dev/null 2>&1 && ok "tabelas alinhadas" ||
    printf '  aviso — prettier não rodou\n'
else
  printf '  aviso — npx ausente, passo pulado\n'
fi

titulo "2. construções a evitar (GUIA §4.2) — ler e justificar cada linha"
# Comentários HTML fora: o `<!--` do pdf-meta casaria com o «!» da lista.
grep -nEi "$VOZ" "$DOC" | grep -v '<!--' || ok "nenhuma ocorrência"

titulo "3. lusitanismos (GUIA §8)"
grep -nEi "$LUSO" "$DOC" || ok "nenhuma ocorrência"

titulo "4. anonimização no Markdown (GUIA §7)"
if grep -nE "$SEGREDO" "$DOC"; then erro "o Markdown expõe dado sensível"; else ok "limpo"; fi

titulo "7. pdf-meta coerente com a tabela de identificação"
VER_META=$(sed -n 's/.*pdf-meta[^>]*version="\([^"]*\)".*/\1/p' "$DOC" | head -1)
VER_TAB=$(sed -n 's/^| *Versão *| *\([0-9][^ |]*\).*/\1/p' "$DOC" | head -1)
if [[ -z $VER_TAB ]]; then
  ok "sem tabela de identificação (documento curto)"
elif [[ -n $VER_META && $VER_META == "$VER_TAB" ]]; then
  ok "versão $VER_META nos dois lugares"
else
  erro "pdf-meta version='$VER_META' difere da tabela '$VER_TAB'"
fi

titulo "8. render (GUIA §9)"
if node "$AQUI/render/render.mjs" "$DOC" "$PDF"; then ok "PDF gerado"; else erro "render"; fi

titulo "9. fontes embutidas"
if command -v pdffonts >/dev/null && [[ -f $PDF ]]; then
  pdffonts "$PDF" | sed -n '1,3p;$p'
  pdffonts "$PDF" | grep -qi plex && ok "IBM Plex presente" ||
    erro "IBM Plex ausente: glifo faltando ou HTML fora do template"
fi

titulo "10. diagramas × legendas"
N_MMD=$(grep -c '^```mermaid' "$DOC" || true)
N_FIG=$(grep -c '^_Figura' "$DOC" || true)
if [[ $N_MMD -eq $N_FIG ]]; then
  ok "$N_MMD diagramas, $N_FIG legendas"
else
  erro "$N_MMD diagramas para $N_FIG legendas"
fi

titulo "11. anonimização no texto extraído do PDF"
if command -v pdftotext >/dev/null && [[ -f $PDF ]]; then
  if pdftotext "$PDF" - | grep -nE "$SEGREDO"; then
    erro "o PDF expõe dado sensível"
  else
    ok "limpo"
  fi
fi

titulo "12. folha de contato para inspeção visual"
if command -v pdftoppm >/dev/null && [[ -f $PDF ]]; then
  OUT=${SCRATCH:-$(mktemp -d)}/contato
  mkdir -p "$OUT" && pdftoppm -r 45 -png "$PDF" "$OUT/pg"
  ok "páginas em $OUT — ler todas (GUIA §10, passo 12)"
fi

printf '\n'
[[ $FALHOU -eq 0 ]] && printf 'Passos automáticos: ok. Faltam os manuais: 5, 6, 12, 13, 14.\n' ||
  printf 'Há passo reprovado acima.\n'
exit $FALHOU
