# Relatório técnico NORTE: formato canônico

<!-- pdf-meta subtitle="Estrutura, voz, evidência e renderização dos relatórios técnicos do NORTE-ITAIPU" version="1.0" date="8 de outubro de 2026" -->

Este documento define o formato dos relatórios técnicos do projeto NORTE-ITAIPU que saem de um repositório em Markdown e em PDF. O esqueleto está em [`template.md`](template.md); o script de renderização está em [`render/`](render/); a verificação automática está em [`verificar.sh`](verificar.sh).

O formato deriva do praticado no sistema interno da Minski (`docs/RELATORIO_TECNICO.md`, versão de setembro de 2026) e acrescenta o que um projeto de pesquisa aplicada exige e um relatório de engenharia não cobre: a procedência do dado, a avaliação do modelo e a reprodutibilidade do resultado (§3, seções 6, 8 e 9; §11.3).

## 0. Procedimento para agentes de código, em qualquer área

O formato não é específico de uma área. Um agente que precise produzir um relatório sobre coleta GNSS, transformação de séries, predição de ROTI, infraestrutura AWS, custo ou segurança segue os passos abaixo, nesta ordem.

1. **Ler antes de escrever uma linha:** este guia inteiro e o esqueleto em `template.md`.
2. **Localizar as fontes que governam a área.** A §11 lista as fontes de forma, de escrita, de dados e modelos e de domínio GNSS. Se a área não constar, procurar as referências de maior autoridade (norma ISO/IEC/IEEE ou ABNT, publicação do IGS, artigo com DOI, documentação oficial do fornecedor, livro de referência com edição), confirmar edição vigente e URL na data, e acrescentar a linha à §11 no mesmo commit.
3. **Levantar a evidência antes do texto.** Comandos de leitura, logs, listagens do S3, exportações do Cost Explorer, saídas de `pytest`. Cada número guarda período, fonte e método (§6). O que não foi medido é declarado como estimativa, com a premissa.
4. **Escrever o corpo, depois o sumário executivo.** O sumário é derivado das seções que o sustentam; escrito antes, inventa resultados.
5. **Desenhar o que substitui prosa** (§5): contexto, sequência, decisão, estrutura, linha do tempo. Paleta e orientação fixas.
6. **Revisão editorial integral contra §4**, com os greps de `verificar.sh`. Cada ocorrência é justificada ou removida; nenhuma passa por preguiça.
7. **Checklist de §10, passo a passo**, com o resultado registrado no corpo do commit ou do PR.
8. **Registrar a existência do documento:** linha no índice de relatórios do repositório; PDF ao lado do Markdown no mesmo commit.

O critério de pronto é único: um engenheiro ou pesquisador que não participou do trabalho lê o documento e consegue (a) decidir sobre custo, risco e validade a partir do sumário, (b) operar o sistema a partir do runbook e (c) **reproduzir o resultado** a partir das seções de dados, modelo e reprodutibilidade, sem perguntar nada a quem escreveu.

## 1. Finalidade e critério de uso

Um relatório técnico registra uma decisão de engenharia ou um resultado de pesquisa com escopo delimitado, o contexto que o motivou, a solução implantada, a evidência medida e o que ficou em aberto. É um documento de referência, não uma nota de trabalho: continua correto meses depois porque declara a data e o estado que descreve.

Escreve-se um relatório técnico quando pelo menos duas destas condições se verificam:

- a decisão altera arquitetura, custo recorrente, superfície de segurança ou a cadeia de produção do dado;
- o resultado precisa ser lido por quem não acompanhou o trabalho (o coordenador do projeto, um bolsista que entra, um parecerista do edital, a ITAIPU);
- há medição a preservar (erro do modelo, cobertura da série, custo, tempo de processamento) cuja fonte deixará de existir ou de ser consultável;
- o assunto já consumiu mais de um ciclo de trabalho e produziu lições que não cabem num commit.

O relatório técnico não substitui o relatório de prestação de contas do edital, que segue o formulário da instituição. Serve de fonte para ele: os números do relatório técnico entram na prestação de contas já com período, fonte e método declarados.

## 2. Artefatos

| Artefato     | Caminho                                      | Regra                                                                                                                    |
| ------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Fonte        | `relatorios/<ASSUNTO>.md`                    | Fonte única. Todo o conteúdo, incluindo diagramas, vive no Markdown                                                      |
| PDF          | `relatorios/<ASSUNTO>.pdf`, ao lado do `.md` | Gerado por `render/render.mjs`; versionado no repositório para que o link sirva a leitor externo sem ferramenta          |
| Metadados    | comentário `<!-- pdf-meta ... -->` no topo   | `subtitle`, `version`, `date`; o título da capa é o primeiro `# Título`                                                  |
| Dados brutos | `relatorios/dados/<ASSUNTO>/`                | O CSV, o JSON de métricas ou o log que sustenta um número do corpo, quando o apêndice não comporta. Caminho citado na §9 |
| Referência   | linha no índice de relatórios do repositório | Sem entrada no índice o documento não é encontrado por quem parte do `README.md`                                         |

O PDF é regenerado em toda alteração do Markdown que mude conteúdo. Os dois arquivos entram no mesmo commit.

## 3. Estrutura

A estrutura adapta o arc42 a um documento de ponta a ponta e acrescenta as seções que um resultado de pesquisa precisa para ser verificável. As seções obrigatórias existem em todo relatório; as opcionais entram quando há conteúdo real para elas, nunca como cabeçalho vazio.

| #   | Seção                              | Obrigatória      | Conteúdo                                                                                                                                                                                           |
| --- | ---------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —   | Identificação do documento         | sim              | Tabela: tipo, versão, data, situação, classificação, público, responsável, projeto e ciclo, fonte. Segue a tabela de histórico de versões                                                          |
| 1   | Sumário executivo                  | sim              | Situação, decisão, resultados em tabela «antes / depois» com indicadores medidos, princípios do desenho, decisões pendentes de quem decide. Lê-se sozinho                                          |
| 2   | Escopo, público e convenções       | sim              | O que o documento cobre e o que não cobre; notação, unidades (TECU, ROTI, DOY, UTC), fuso, moeda, idioma dos identificadores                                                                       |
| 3   | Contexto, restrições e requisitos  | sim              | Ambiente, requisitos de qualidade numerados e verificáveis, como reconhecer o problema que motivou o trabalho                                                                                      |
| 4   | Histórico e lições                 | opcional         | Linha do tempo, gerações anteriores, post-mortem no formato do SRE Book (impacto, causa raiz, o que funcionou, o que faltou)                                                                       |
| 5   | Arquitetura da solução             | sim              | Diagrama de contexto, componentes, alternativas consideradas com o motivo da rejeição                                                                                                              |
| 6   | Dados: origem, cobertura e preparo | sim se há dado   | Estações, período, cadência, formato de origem, volume, lacunas e o que as causou, filtros e transformações aplicados, versão do conjunto. Condensa o roteiro de _Datasheets for Datasets_ (§11.3) |
| 7   | Comportamento em execução          | sim              | O ciclo de vida de uma unidade de trabalho (uma coleta diária, uma predição, um deploy) em diagrama de sequência ou fluxograma; inventário do que existe                                           |
| 8   | Modelo e avaliação                 | sim se há modelo | Variáveis de entrada, alvo, partição **temporal**, baseline, métricas com intervalo, desempenho por horizonte e por estação, limites de uso. Condensa o roteiro de _Model Cards_ (§11.3)           |
| 9   | Reprodutibilidade                  | sim              | Versões de código, dados e dependências; sementes; ambiente de execução; comandos exatos; testes que travam o comportamento; onde estão os artefatos e os dados brutos                             |
| 10  | Operação (runbook)                 | sim              | Sintoma → verificação → ação. Comandos de leitura reproduzíveis                                                                                                                                    |
| 11  | Custo e capacidade                 | sim se há        | Preços de referência com data e fonte, modelo, medido por período declarado, projeção com as premissas explícitas                                                                                  |
| 12  | Segurança e conformidade           | sim              | Controles mapeados a uma referência nomeada, riscos residuais com probabilidade, impacto e mitigação, política de acesso ao dado                                                                   |
| 13  | Registro de decisões               | sim              | Tabela: decisão, alternativas, motivo, data                                                                                                                                                        |
| 14  | Estado, limites e evolução         | sim              | Três listas: resolvido nesta versão; em aberto, com dono e critério de conclusão; avaliado e não adotado, com o motivo                                                                             |
| 15  | Glossário e referências            | sim              | Termos do domínio (GNSS, ionosfera, AWS); referências com autor ou órgão, título, edição, ano e URL, verificadas na data do documento                                                              |
| A–  | Apêndices                          | opcional         | Trechos de configuração, checklist de replicação, comandos de diagnóstico, dados brutos de ensaio                                                                                                  |

Numeração: seções com `## N. Título`, subseções com `### N.M Título`, apêndices com `## Apêndice X — Título`. O sumário do PDF vai até a profundidade 2; um `####` não aparece no sumário e é usado apenas para dividir texto longo.

Entrega e implantação entram como subseção de 7 quando há o que dizer; os testes que impedem regressão do desenho entram em 9.4, porque travar comportamento é o que torna o resultado reproduzível.

## 4. Voz e estilo

O relatório é lido por engenheiros, por pesquisadores e por responsáveis que não acompanharam o trabalho e, eventualmente, por um parecerista. O texto reflete a maturidade do projeto. As regras abaixo são verificadas na revisão editorial de cada versão.

### 4.1 Registro

- **Impessoal e declarativo.** O sujeito é o sistema, o componente ou a equipe, nunca o autor nem o leitor. «O coletor executa de madrugada», não «nós movemos a coleta» nem «você verá que».
- **Executivo no sumário, técnico no corpo.** O sumário afirma resultados com números; o corpo mostra como se chegou a eles. O leitor que parar no sumário sai com a decisão certa.
- **Uma afirmação, uma base.** Todo número tem período, fonte e método de obtenção. Uma afirmação sem base é reescrita como hipótese ou removida. Ordem de grandeza declarada como ordem de grandeza.
- **Preciso em vez de intenso.** Sem adjetivos de avaliação («robusto», «elegante», «poderoso», «crítico» sem critério). O adjetivo é substituído pelo dado que o justificaria.
- **Português do Brasil.** Ver §8. Identificadores, nomes de serviço, rótulos e comandos ficam no idioma original, em `código`.
- **Tempo verbal.** Presente para o estado descrito; pretérito para histórico e ensaios, sempre com data.
- **Sujeito concreto, ação no verbo.** O sujeito da frase é o agente real (o coletor, o job, a estação) e a ação está no verbo, não num substantivo abstrato: «a transformação roda em 4 min», não «a execução da transformação ocorre em 4 min».
- **Conhecido antes do novo.** A frase começa pelo que o leitor já tem (o termo da frase anterior) e termina pela informação nova. O parágrafo começa pela frase-tópico.
- **Sigla definida na primeira ocorrência**, com o termo por extenso e a sigla entre parênteses; depois, só a sigla. Siglas do glossário (§15 do relatório) não dispensam a definição no corpo.
- **Figura e tabela citadas no texto antes de aparecerem** («a Figura 3 mostra…»), como prescreve a NBR 10719. Uma figura sem menção no texto é decoração.
- **Números e unidades.** Separador de milhar com ponto e decimal com vírgula (1.234,56); espaço entre número e unidade (4 GB, 45 min, 2 s, 0,5 TECU); moeda como «US$ 1,06»; percentual com espaço («17 %»). Uma regra escolhida, aplicada em todo o documento.
- **Correção técnica verificável.** Todo comando citado foi executado na data e a saída transcrita é a real; toda versão de biblioteca, formato, preço e limite tem a página oficial e a data de consulta; nenhuma afirmação sobre comportamento de plataforma vem de memória. Quando a fonte oficial e a observação divergem, o documento registra as duas e diz qual prevaleceu e por quê.

### 4.2 Construções a evitar

As construções abaixo aparecem com frequência em texto gerado por assistentes e são removidas na revisão. Cada uma tem a substituição correspondente.

| Construção                                                                                                                  | Substituição                                                                       |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Metalinguagem: «Esta seção responde…», «Vale notar que», «É importante destacar», «Em resumo», «Como vimos»                 | Apagar; o conteúdo começa na primeira frase                                        |
| Tríade anunciada: «três coisas», «por três motivos», seguida de lista de três                                               | Lista sem contagem antecipada, com o número de itens que o assunto tem             |
| Metáfora coloquial: «morreu», «matou», «custou tempo», «engasgou»                                                           | O evento técnico: «foi encerrado», «interrompeu», «consumiu N minutos», «bloqueou» |
| Pergunta retórica no corpo: «E se a estação cair?»                                                                          | A afirmação: «Se a estação parar de transmitir, …»                                 |
| Suspense: «O resultado surpreendeu», «Aqui está o problema:»                                                                | O resultado, na frase                                                              |
| Fechamento moralizante: «A lição é clara», «Nunca mais»                                                                     | A lição, formulada como regra verificável, na seção de lições ou de invariantes    |
| Hedge encadeado: «pode talvez eventualmente», «de certa forma»                                                              | Uma modalidade só, com o motivo da incerteza                                       |
| Intensificador: «muito», «extremamente», «simplesmente», «literalmente», «basicamente»                                      | Apagar ou substituir pelo dado                                                     |
| Travessão como muleta de ritmo, mais de um por parágrafo                                                                    | Ponto final, dois-pontos ou parênteses                                             |
| Segunda pessoa: «você precisa», «note que»                                                                                  | Impessoal: «é necessário», «observa-se»                                            |
| Primeira pessoa do plural fora de decisão do projeto: «fizemos», «nosso modelo»                                             | «a equipe», «o modelo», ou o agente concreto                                       |
| Emoji, negrito em frase inteira, ponto de exclamação                                                                        | Não se usam                                                                        |
| Vocabulário de marketing: «robusto», «poderoso», «crucial», «alavancar», «jornada», «desbloquear», «elevar», «mergulhar em» | O atributo mensurável ou o verbo concreto                                          |
| Contraste anunciado: «não apenas X, mas também Y», «mais do que X, é Y»                                                     | X e Y, cada um na sua frase                                                        |
| Garantia vazia: «isso garante que», «assegura que», «de forma robusta»                                                      | O mecanismo que produz o efeito, e o teste que o prova                             |
| Nominalização em cadeia: «a realização da execução da verificação»                                                          | Verbo: «verificar»                                                                 |
| Parágrafo de uma frase usado como ênfase                                                                                    | Integrar ao parágrafo vizinho                                                      |
| Causalidade inventada entre correlações medidas                                                                             | A correlação, com o coeficiente e o período; a causa, só com o ensaio que a isola  |

A verificação está em `verificar.sh`, passo 2. Um resultado do grep não é proibição absoluta: a citação literal de uma mensagem de erro pode conter «!». Cada ocorrência é lida e justificada ou removida.

### 4.3 Parágrafo, frase, lista

- Parágrafos de três a seis frases. Um parágrafo de uma frase é uma frase que devia estar noutro parágrafo.
- Frases com uma ideia. Subordinada dupla vira duas frases.
- Lista quando os itens são paralelos e independentes; tabela quando há mais de um atributo por item; prosa quando há relação causal entre os itens.
- Cada tabela tem cabeçalho e, quando o conteúdo é medido, unidade na coluna.
- Nomes de arquivos, estações, variáveis, comandos e valores de configuração em `código`. Nomes de produtos, serviços e instituições sem formatação (Amazon S3, XGBoost, ITAIPU, UTFPR).

## 5. Diagramas

Os diagramas são Mermaid no próprio Markdown e são renderizados na geração do PDF. Não se usam imagens exportadas: a fonte do diagrama é editável e passa pelo diff.

Gráfico de dados é exceção. Uma série temporal, um histograma de erro ou uma curva de aprendizado saem de um script versionado em `relatorios/dados/<ASSUNTO>/` que escreve um SVG; o script é citado na §9 do relatório, como qualquer outro método.

### 5.1 Quando desenhar

Um diagrama entra quando substitui mais de um parágrafo de prosa: contexto de sistema, sequência de uma operação, fluxo de decisão, estrutura de recursos, linha do tempo. Uma lista de quatro caixas em fila não é um diagrama, é uma lista.

### 5.2 Tipos e orientação

| Forma do conteúdo                                            | Tipo Mermaid                        | Orientação                                                                                  |
| ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| Contexto de sistema, componentes                             | `flowchart`                         | `LR` quando há até dois níveis; `TB` quando o texto dos nós é longo                         |
| Sequência de chamadas entre participantes                    | `sequenceDiagram`                   | Até seis participantes; acima disso o diagrama é dividido                                   |
| Decisão com poucos ramos                                     | `flowchart LR` com um único losango | O losango contém a checklist; cada saída é um destino. Uma cascata de losangos ocupa página |
| Fluxo com muitos passos e ramos                              | `flowchart TB`                      | Legível em A4 retrato; `LR` fica ilegível a partir de oito nós                              |
| Estrutura com grupos (camadas do data lake, contas, regiões) | `flowchart LR` com `subgraph`       | Contorno `LR`, cada `subgraph` com `direction TB`                                           |
| Linha do tempo                                               | `timeline`                          | Datas no formato do documento                                                               |
| Estados de um recurso ou de uma série                        | `stateDiagram-v2`                   | —                                                                                           |

Um diagrama cabe numa página A4 sem redução abaixo de 80 % do tamanho da fonte do corpo. Quando não cabe, divide-se o conteúdo em dois diagramas, cada um com legenda própria.

### 5.3 Paleta

A base é o Carbon Design System v11 da IBM, tema white: tipografia IBM Plex, neutros, tabelas e as famílias de cor dos diagramas. A única cor fora do Carbon é o acento, o verde da logo `norte.webp`, medido por contagem de pixels em 28 de outubro de 2026. Títulos e texto ficam em `text-primary`, como no tema padrão.

| Cor                | Hex       | Papel no documento                             | Contraste sobre branco |
| ------------------ | --------- | ---------------------------------------------- | ---------------------- |
| Verde da logo      | `#57a49a` | **Acento**: barra da capa, preenchimento       | 2,92 : 1               |
| Verde escurecido   | `#2f6f64` | Links, traço do componente NORTE nos diagramas | 5,87 : 1               |
| `text-primary`     | `#161616` | Texto e títulos; filete das seções             | 17,4 : 1               |
| `text-secondary`   | `#525252` | Subtítulo, sumário de segundo nível, legenda   | 7,8 : 1                |
| `border-strong-01` | `#8d8d8d` | Filete de tabela e de bloco de código          | 3,3 : 1                |
| `layer-01`         | `#f4f4f4` | Fundo de código e de nó de infraestrutura      | —                      |

O verde da logo falha o contraste mínimo da WCAG 2.2 para texto (4,5 : 1) e para componente gráfico (3 : 1): usa-se em superfície, nunca em letra nem em traço fino. Onde precisa de traço ou texto, entra a variante escurecida `#2f6f64`, de mesma matiz. O mesmo vale para o `yellow-30` do Carbon (`#f1c21b`, 1,7 : 1), substituído em traço pelo `yellow-60` (`#8e6a00`, 5,0 : 1).

Classes dos diagramas. Todo diagrama que distinga tipos de nó declara as classes que usa e as aplica com `class`. Preenchimento no degrau 10 e traço no degrau 60 de cada família do Carbon; a classe `norte` usa o verde da logo:

```text
classDef norte  fill:#ebf4f3,stroke:#2f6f64,color:#161616   %% componente do NORTE (verde da logo)
classDef nuvem  fill:#f4f4f4,stroke:#8d8d8d,color:#161616   %% AWS, infraestrutura, host (gray)
classDef dado   fill:#edf5ff,stroke:#0f62fe,color:#161616   %% dado, arquivo, camada do data lake (blue)
classDef portao fill:#fcf4d6,stroke:#8e6a00,color:#161616   %% decisão, elegibilidade, controle (yellow)
classDef ok     fill:#defbe6,stroke:#198038,color:#161616   %% estado saudável, sucesso (green)
classDef erro   fill:#fff1f1,stroke:#da1e28,color:#161616   %% falha, lacuna, encerramento (red)
```

Sem cores fora desta lista. Um diagrama que precise de uma sétima categoria tem categorias demais.

### 5.4 Legenda

Cada diagrama é seguido de um parágrafo em itálico, `_Figura N — Texto._`, numerado em sequência no documento. A legenda diz o que o diagrama mostra e o que o leitor deve concluir dele; não repete os rótulos dos nós. O renderizador reconhece o parágrafo em itálico imediatamente após o bloco `mermaid` como legenda.

### 5.5 Texto dentro do diagrama

Rótulos curtos, quebrados com `<br/>`; sem frase completa dentro de um nó. Identificadores de estação, caminhos do S3 e nomes de comando no idioma original. Aspas em todo rótulo que contenha caractere especial (`:`, `/`, `(`), para o Mermaid não interpretar.

## 6. Dados e evidência

- Toda medição declara **período** (datas de início e fim, em UTC), **fonte** (API, console, log, bucket, ferramenta) e **método** (o comando ou o script; se o script existir, o caminho). Dados brutos de ensaio vão para um apêndice ou para `relatorios/dados/<ASSUNTO>/`.
- Toda série declara **estação** (código de quatro letras), **cadência** (minuto, hora), **janela** e **cobertura efetiva**: quantas amostras existem sobre quantas eram esperadas no período, e o que causou a diferença. Uma métrica calculada sobre série com lacuna não declarada não é verificável.
- Índices derivados declaram a janela de cálculo. ROTI calculado em janela de 1 min e ROTI em janela de 5 min não são comparáveis, e a literatura usa as duas (§11.4).
- Preços, limites de serviço e versões de biblioteca citam a página oficial e a data da consulta. Preço muda; a citação diz de quando é.
- Comparações usam o mesmo período e a mesma unidade dos dois lados. Quando não há período comum, a comparação é declarada como ordem de grandeza e não como percentual.
- Métrica de modelo nunca aparece sozinha: vem com a baseline contra a qual se compara, a partição que a produziu e a dispersão entre execuções (§8 do relatório).
- Um número corrigido em relação à versão anterior é registrado como correção, com o valor antigo, o novo e a causa da diferença. Apagar o valor antigo esconde o erro sem corrigir a conclusão que alguém tirou dele.
- Arredondamento coerente com a precisão da fonte: minutos inteiros para tempo de processamento; duas casas para dólares e para TECU; sem casas decimais em percentuais de estimativa.

## 7. Anonimização

O relatório é interno e publicável: pode ser mostrado a um parecerista, à ITAIPU ou a um candidato sem edição. Não contém, em texto nem em diagrama nem em trecho de configuração:

| Nunca                                                     | Substituição                                          |
| --------------------------------------------------------- | ----------------------------------------------------- |
| Segredos, tokens, senhas, chaves, mesmo revogados         | Nome da variável (`NORTE_AWS_PROFILE`) ou `<segredo>` |
| Credencial de caster NTRIP ou de FTP de estação           | `<usuario-ntrip>`, `<senha-ntrip>`                    |
| Identificador de conta AWS (12 dígitos)                   | `<conta>`                                             |
| ARN completo                                              | ARN com `<conta>` ou apenas o nome do recurso         |
| Endereço IP, público ou privado                           | `<ip>` ou a descrição («o Elastic IP da coleta»)      |
| Identificador de instância, volume, snapshot, AMI         | `<instance-id>`, `<ami>`                              |
| Chave de acesso, chave `.pem`, impressão digital de chave | `<chave>`                                             |
| E-mail e nome de pessoa                                   | Papel («o coordenador do projeto», «a equipe»)        |
| URL interna com token na query                            | URL sem query                                         |

Nomes de bucket (`norte-itaipu`), de estação (`STHA`, `GUAI`) e de recurso ficam: são necessários para o runbook e não dão acesso a nada sem credencial. Coordenadas de estação ficam quando publicadas pela rede que a opera; quando não, entram como região.

A verificação está em `verificar.sh`, passos 4 e 10, e roda duas vezes: sobre o Markdown e sobre o texto extraído do PDF.

## 8. Português do Brasil

Toda a prosa é em português do Brasil. Parte do material herdado e da literatura de referência está em português europeu ou em inglês, e o vocabulário migra para o texto sem que o autor perceba.

| Europeu                                         | Brasil                                               |
| ----------------------------------------------- | ---------------------------------------------------- |
| ficheiro                                        | arquivo                                              |
| utilizador                                      | usuário                                              |
| secção                                          | seção                                                |
| equipa                                          | equipe                                               |
| registo                                         | registro                                             |
| projecto, objecto, acção                        | projeto, objeto, ação                                |
| actual, actualizar                              | atual, atualizar                                     |
| facto, contacto                                 | fato, contato                                        |
| óptimo, direcção                                | ótimo, direção                                       |
| ecrã                                            | tela                                                 |
| rato                                            | mouse                                                |
| telemóvel                                       | celular                                              |
| correr (um job, um teste)                       | executar, rodar                                      |
| a correr                                        | em execução                                          |
| gestão (de recursos)                            | gerenciamento                                        |
| colocar em produção                             | implantar                                            |
| desde há                                        | há                                                   |
| bocado                                          | trecho, parte                                        |
| pronome enclítico habitual («fez-se», «viu-se») | voz passiva ou impessoal («foi feito», «observa-se») |

Anglicismo sem equivalente firmado fica em inglês e em `código` quando é identificador (`timestamp`, `backfill`); quando é conceito com termo em português, traduz-se (`feature` → variável de entrada; `split` → partição; `baseline` → linha de base). Grafia: acordo ortográfico de 1990 na norma brasileira. Aspas curvas («») no corpo; aspas retas dentro de `código`.

## 9. Renderização

O renderizador precisa de `pandoc`, de `ghostscript` e de uma instalação do Node com as duas dependências de `render/package.json`. A primeira execução instala:

```bash
cd render && npm install && cd ..
```

Depois, de qualquer diretório:

```bash
node render/render.mjs relatorios/<ASSUNTO>.md relatorios/<ASSUNTO>.pdf
```

Cadeia: pandoc (`gfm` → `html5`, `--toc-depth=2`, `--shift-heading-level-by=-1`) → Mermaid renderizado na página → Chromium via `playwright-core` → PDF A4 com capa, sumário, cabeçalho e rodapé numerado → `ghostscript` junta a capa sem numeração ao corpo numerado. As fontes IBM Plex vêm do sistema e o Chromium as embute no PDF. O renderizador conta os blocos `mermaid` do Markdown e falha se o número de SVGs renderizados for diferente; um diagrama com erro de sintaxe não passa em silêncio.

`exiftool` grava título, autor e idioma no arquivo; sem ele o PDF sai igualmente válido, com um aviso.

## 10. Checklist de verificação

Os passos 1 a 4 e 7 a 10 estão automatizados em `verificar.sh`; os demais são leitura. A checklist roda antes de cada commit do relatório, na ordem, e o resultado de cada passo entra no corpo do commit ou do PR.

1. `npx prettier --write relatorios/<ASSUNTO>.md`. Tabelas alinhadas, sem diff de espaço.
2. Grep de construções a evitar (§4.2): cada ocorrência justificada ou removida.
3. Grep de lusitanismos (§8): zero ocorrências fora de `código` e de citações.
4. Grep de anonimização (§7) sobre o Markdown: zero ocorrências.
5. Toda afirmação numérica tem período, fonte e método (§6). Amostra: as cinco maiores do sumário executivo, rastreadas até a seção que as sustenta.
6. Toda métrica de modelo tem baseline, partição e dispersão (§6, §8 do relatório). A partição é temporal e o documento diz qual é a data de corte.
7. Tabela de identificação e histórico de versões atualizados; `pdf-meta` com `version` e `date` iguais aos da tabela.
8. Render (§9). Saída sem aviso.
9. `pdffonts`: as fontes do corpo são IBM Plex; uma fonte de sistema diferente indica glifo ausente ou HTML fora do template.
10. Número de blocos `mermaid` igual ao número de figuras relatado pelo renderizador e ao número de legendas `_Figura N —_`.
11. Grep de anonimização sobre `pdftotext relatorios/<ASSUNTO>.pdf -`: zero ocorrências.
12. Inspeção visual página a página em folha de contato (`pdftoppm -r 45 -png`, oito páginas por folha) e das páginas com diagrama em resolução de leitura (`-r 90`). Critérios: nenhum diagrama cortado ou reduzido a ponto de o texto ficar menor que a nota de rodapé; nenhuma tabela quebrada entre páginas com cabeçalho órfão; nenhuma seção que comece na última linha de uma página.
13. Os comandos da §9 do relatório foram executados num diretório limpo e reproduzem os números do corpo, ou o documento declara por que não (custo de GPU, dado não público).
14. Commit do `.md` e do `.pdf` juntos, título sem acentos, corpo em português do Brasil.

## 11. Normas e referências de excelência

As referências abaixo governam a forma, a escrita e a evidência deste formato. A coluna «Adotado» diz o que o formato toma de cada uma; «Desvio» diz onde o formato se afasta de propósito e por quê. Edições e URLs verificadas em 8 de outubro de 2026, salvo onde a linha diz o contrário.

### 11.1 Forma do documento

| Referência                                                           | Adotado                                                                                                                                                                                                                                                                                                                  | Desvio                                                                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ABNT NBR 10719:2015, relatório técnico e/ou científico, apresentação | Estrutura em partes: identificação (capa, folha de rosto, formulário de identificação → bloco «Identificação do documento»), resumo (→ sumário executivo), sumário, texto em introdução, desenvolvimento e conclusão (→ seções 1–14), referências, apêndices. Figuras e tabelas mencionadas no texto antes de aparecerem | Legenda das figuras abaixo do diagrama (a norma prescreve a identificação acima), por decisão do renderizador; sem lista de ilustrações, porque o sumário vai só até a profundidade 2 |
| ABNT NBR 6024:2012, numeração progressiva das seções                 | `## N.` e `### N.M`, apêndices com letra                                                                                                                                                                                                                                                                                 | —                                                                                                                                                                                     |
| ABNT NBR 6023:2018, referências                                      | Cada referência com autor ou órgão, título, edição, ano e URL; a data do documento vale como data de consulta de todas as fontes web                                                                                                                                                                                     | Tabela em vez de lista alfabética, para carregar a coluna «uso neste documento»                                                                                                       |
| ABNT NBR 6028:2021, resumo                                           | O sumário executivo cabe em uma página, afirma resultados com números e dispensa o leitor de ler o corpo para decidir                                                                                                                                                                                                    | Subdividido em situação, decisão, resultados, princípios e pendências, em vez de parágrafo único                                                                                      |
| ISO/IEC/IEEE 42010:2022, descrição de arquitetura                    | «Público» declarado na identificação (os interessados); as seções 5 e 7 são vistas que respondem a preocupações nomeadas; decisões com racional registrado                                                                                                                                                               | Sem formalizar pontos de vista como artefatos separados: as preocupações estão nos títulos das seções                                                                                 |
| ISO/IEC/IEEE 15289:2019, conteúdo dos itens de informação            | O relatório é um item de informação dos tipos _report_ e _description_: propósito, escopo, contexto, estado e evidência são obrigatórios                                                                                                                                                                                 | —                                                                                                                                                                                     |
| arc42 (Starke e Hruschka), <https://arc42.org/overview>              | Ordem das seções: contexto e restrições → solução → blocos → tempo de execução → implantação → conceitos transversais → decisões → qualidade → riscos → glossário                                                                                                                                                        | Dados, modelo, reprodutibilidade, custo e operação como seções próprias, porque são o que o público-alvo decide e verifica                                                            |
| C4 model (Brown), <https://c4model.com/>                             | A figura de contexto é o nível 1 (sistemas e pessoas); componentes são o nível 2; um relatório não desce ao nível 4 (código)                                                                                                                                                                                             | Notação Mermaid com a paleta de §5.3, não a notação C4 estrita                                                                                                                        |
| Diátaxis (Procida), <https://diataxis.fr/>                           | Quatro tipos que não se misturam num mesmo trecho: explicação (seções 3–6, 8, 12–13), referência (inventários, apêndices), procedimento (runbook, §9); nunca tutorial num relatório                                                                                                                                      | —                                                                                                                                                                                     |

As normas ABNT e ISO são pagas. Foram confirmadas por número, título e ano no catálogo; **quem citar cláusula ou frase exata confirma no texto integral antes**. As páginas da ISO devolvem HTTP 403 a consulta automatizada.

### 11.2 Escrita

| Referência                                                                                                                | Adotado                                                                                                                                                                                            | Desvio                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Williams e Bizup, _Style: Lessons in Clarity and Grace_, 12.ª ed. (2016)                                                  | Personagens como sujeitos e ações como verbos; conhecido antes do novo; frase-tópico; parágrafo com um ponto; concisão por corte de metadiscurso. É a fonte das regras de §4.1 e da tabela de §4.2 | —                                                                                                             |
| Google developer documentation style guide, <https://developers.google.com/style/>                                        | Voz ativa, presente, uma ideia por frase, lista de palavras a evitar, nomes de produto sem formatação, código em monoespaçada                                                                      | Segunda pessoa e tom conversacional **não** são adotados: o relatório é impessoal, como prescreve a NBR 10719 |
| Tufte, _The Visual Display of Quantitative Information_, 2.ª ed. (2001)                                                   | Tabela para poucos valores, gráfico só quando há tendência; nenhum elemento gráfico sem dado                                                                                                       | —                                                                                                             |
| Bhatti, Corleissen, Lambourne, Nunez e Waterhouse, _Docs for Developers_ (Apress, 2021), <https://docsfordevelopers.com/> | Conhecer o leitor antes de escrever; um documento, um propósito; revisão por leitor que não participou                                                                                             | —                                                                                                             |
| Google SRE Book, cap. 15, Postmortem Culture, <https://sre.google/sre-book/postmortem-culture/>                           | Formato do post-mortem: impacto, causa raiz, gatilho, o que funcionou, o que faltou, ações com dono; sem culpa                                                                                     | —                                                                                                             |
| Nygard, Documenting Architecture Decisions; MADR 4.0, <https://adr.github.io/madr/>                                       | Registro de decisões: contexto, alternativas, decisão, consequências                                                                                                                               | Tabela-índice no relatório, não uma ADR por linha                                                             |

### 11.3 Dados, modelos e reprodutibilidade

Esta é a parte que o formato de origem não tinha e que um projeto de pesquisa aplicada exige.

| Referência                                                                                                                                                                                                                    | Adotado                                                                                                                                                                                                | Desvio                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Wilkinson et al., _The FAIR Guiding Principles for scientific data management and stewardship_, Scientific Data 3:160018 (2016), doi 10.1038/sdata.2016.18; princípios mantidos em <https://www.go-fair.org/fair-principles/> | A seção 6 declara identificador, localização e licença do conjunto; a seção 9 declara em que formato e com que metadado o dado é recuperável por outra pessoa                                          | O dado bruto do NORTE não é público; o relatório declara a condição de acesso em vez de um DOI       |
| Gebru et al., _Datasheets for Datasets_ (2018, rev. 2021), <https://arxiv.org/abs/1803.09010>                                                                                                                                 | Roteiro da seção 6: motivação, composição, coleta, preparo, usos, distribuição e manutenção do conjunto                                                                                                | Condensado em tabelas; as 57 perguntas do artigo não entram uma a uma num relatório de engenharia    |
| Mitchell et al., _Model Cards for Model Reporting_ (FAT\* 2019), <https://arxiv.org/abs/1810.03993>                                                                                                                           | Roteiro da seção 8: uso pretendido, dados de treino e de avaliação, métricas, desempenho desagregado (por estação e por horizonte), limites e usos desaconselhados                                     | O eixo de desagregação é geográfico e temporal, não demográfico: o modelo não trata dados de pessoas |
| Kapoor e Narayanan, _Leakage and the Reproducibility Crisis in ML-based Science_, Patterns 4:100804 (2023), <https://arxiv.org/abs/2207.07048>                                                                                | Obriga partição **temporal** com data de corte declarada e proíbe qualquer estatística calculada sobre o conjunto inteiro antes da partição. É a causa mais comum de métrica inflada em série temporal | —                                                                                                    |
| ACM, _Artifact Review and Badging_, versão 1.1 (2020), <https://www.acm.org/publications/policies/artifact-review-and-badging-current>                                                                                        | Vocabulário da seção 9: artefato **disponível**, **avaliado** e **resultado reproduzido**. O relatório declara em qual desses degraus está                                                             | A página devolve HTTP 403 a consulta automatizada; confirmada pelo índice de políticas da ACM        |

### 11.4 Domínio: GNSS e ionosfera

| Referência                                                                                                                                                                                       | Uso                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| IGS, _RINEX: The Receiver Independent Exchange Format_, versão 4.02 (2024), <https://files.igs.org/pub/data/format/rinex_4.02.pdf>                                                               | Formato e semântica do dado de origem; a versão em uso é declarada na seção 6 do relatório                                                          |
| IGS, formatos e padrões, <https://igs.org/formats-and-standards/>                                                                                                                                | Convenção de nome de arquivo, de código de estação e de dia do ano (DOY)                                                                            |
| Pi, Mannucci, Lindqwister e Ho, _Monitoring of global ionospheric irregularities using the worldwide GPS network_, Geophysical Research Letters 24(18):2283–2286 (1997), doi 10.1029/97GL02273   | Definição do ROTI como desvio padrão do ROT. O DOI devolve HTTP 403 a consulta automatizada; confirmado pela citação na literatura secundária       |
| Jacobsen, _The impact of different sampling rates and calculation time intervals on ROTI values_, J. Space Weather Space Clim. 4:A33 (2014), <https://www.swsc-journal.org/10.1051/swsc/2014031> | Justifica a obrigação de §6: declarar a cadência da amostra e a janela de cálculo do ROTI, porque valores de janelas diferentes não são comparáveis |

Um relatório sobre uma área ausente desta tabela acrescenta as suas fontes aqui, no mesmo commit, com edição e URL verificadas na data.

### 11.5 Ferramentas

| Referência                                 | Uso                                           | URL                             |
| ------------------------------------------ | --------------------------------------------- | ------------------------------- |
| Mermaid                                    | Sintaxe dos diagramas                         | <https://mermaid.js.org/intro/> |
| WCAG 2.2                                   | Piso de contraste das cores da paleta (§5.3)  | <https://www.w3.org/TR/WCAG22/> |
| `render/render.mjs`                        | Markdown → PDF                                | nesta pasta                     |
| `verificar.sh`                             | Passos 1–4 e 7–10 da checklist de §10         | nesta pasta                     |
| Minski, `docs/RELATORIO_TECNICO.md` (2026) | Formato de origem: estrutura, voz e checklist | repositório do sistema interno  |
