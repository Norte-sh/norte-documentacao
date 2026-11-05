# Contrato de dados

Campos que toda série publicada precisa ter, para o portal e os modelos lerem a mesma coisa.

## Observação

| Campo | Exemplo | Observação |
| --- | --- | --- |
| estacao | STHA | código de 4 letras |
| variavel | ROTI | nome igual em todos os sistemas |
| unidade | TECU/min | |
| horario_utc | 2026-11-05T03:00:00Z | sempre UTC |
| agregacao | média de 1 h | janela e estatística |
| metodo | Ion_Index v? | versão do cálculo |
| qualidade | amostras válidas, satélites | ausência de dado não é zero |
| origem | arquivo RINEX, horário de chegada | |

## Previsão

Todos os campos da observação, mais:

| Campo | Observação |
| --- | --- |
| emitida_em | quando a previsão foi gerada |
| corte_dos_dados | último dado disponível na emissão |
| horario_alvo | instante previsto |
| horizonte_h | horas entre emissão e alvo |
| versao_modelo | identificador do modelo no S3 + commit |

Previsões emitidas nunca são sobrescritas; o valor observado é associado depois.
