# Mapa dos sistemas

Inventário levantado a partir de 02/11/2026. Linhas com "a confirmar" ainda dependem de quem mantém o sistema.

| Sistema | Repositório | Onde roda | Responsável | Situação |
| --- | --- | --- | --- | --- |
| Site de previsão | `norte-vercel` | Vercel (norte-itaipu-vercel.vercel.app) | time web | no ar |
| Site do NORTE (ferramentas GNSS) | a transferir para `norte-portal` | Vercel (projetonorte.vercel.app) | a confirmar | no ar; repositório privado na conta de um colaborador |
| Pipeline de coleta e índices | `norte-dados` | Windows Server na AWS | a confirmar | código ainda fora do git |
| Modelo de previsão do ROTI | `norte-predicao` | a confirmar | time ml | código do TCC ainda não obtido |
| Suite GNSS/RAIB (.exe) | Releases ou S3 | Google Drive | a confirmar | sem versão |

## Fluxo dos dados

Estações GNSS → `norte-dados` (coleta diária, cálculo) → armazenamento → APIs → `norte-portal` e `norte-vercel`.
`norte-predicao` lê as séries do armazenamento e grava as previsões no mesmo lugar.
