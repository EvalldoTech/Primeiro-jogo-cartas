# Esmeralda — Mesa Compartilhada

Jogo de cartas original, jogável no navegador (celular, tablet e computador), com
**mesa comum**, **recombinação livre** e regra de sequências.

O nome é uma homenagem à minha mãe, Esmeralda, que teve a ideia da mesa compartilhada.
Projeto de portfólio: a lógica do jogo (engine) é isolada da interface, testada por
suíte automatizada e reaproveitável.

![Versão](https://img.shields.io/badge/versão-0.2-1c7f5e)

---

## Sumário

- [Como rodar](#como-rodar)
- [Identidade e opções](#identidade-e-opções)
- [Instalar no celular ou tablet](#instalar-no-celular-ou-tablet)
- [As regras](#as-regras)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Testes](#testes)
- [Roadmap](#roadmap)
- [Decisões técnicas e o porquê](#decisões-técnicas-e-o-porquê)

---

## Como o código está comentado

Este projeto foi escrito para ser **lido**, não só executado. Cada arquivo
começa com um bloco que explica o que ele faz e por quê; os pontos de
JavaScript e React que costumam confundir quem está começando têm comentário
na linha exata. Ordem sugerida de leitura:

1. `src/engine/deck.js` — JavaScript puro: laços, constantes, Fisher-Yates
2. `src/engine/rules.js` — `.map`, `.every`, `.some`, `Set`, `.reduce`
3. `src/engine/gameState.js` — objeto de estado e imutabilidade
4. `src/engine/engine.js` — ações com resultado `{ ok, state, error }`
5. `src/hooks/useGame.js` — `useState`, `useCallback`, `useMemo`, `useRef`
6. `src/App.jsx` — componente raiz, `useEffect`, JSX condicional
7. `src/components/Card.jsx` e `src/settings/themes.js` — props e `data-style`
8. `src/styles/global.css` — variáveis CSS, Flexbox, Grid, mobile-first

Para entender o projeto inteiro, ferramenta por ferramenta, leia o guia
`Guia-Esmeralda-Como-o-Projeto-Foi-Feito.docx` que acompanha a entrega.

---

## Como rodar

Requisitos: Node.js 20 ou superior.

```bash
npm install       # instala as dependências
npm run dev       # abre em http://127.0.0.1:5173
npm test          # roda os testes da engine
npm run build     # gera a versão final em dist/
npm run preview   # testa a versão final localmente
```

---

## Instalar no celular ou tablet

O jogo é um **PWA** (Progressive Web App): abre no navegador e pode ser instalado
na tela inicial, funcionando offline.

**Android / Samsung (Chrome)**
1. Abra o endereço do jogo no Chrome.
2. Menu (⋮) → **Instalar aplicativo** (ou “Adicionar à tela inicial”).
3. O ícone aparece na tela inicial e abre em tela cheia.

**iPad / iPhone (Safari)**
1. Abra o endereço no Safari.
2. Botão **Compartilhar** → **Adicionar à Tela de Início**.

**Para publicar de graça** (e ter um link para o portfólio): rode `npm run build`
e publique a pasta `dist/` no Netlify, Vercel ou GitHub Pages. O projeto já está
com `base: './'`, então funciona também em subpastas.

> Limitação: PWA não entra na Play Store nem na App Store. Para isso seria preciso
> empacotar com Capacitor ou reescrever em React Native.

---

## Identidade e opções

**Estilo visual.** Verde esmeralda profundo, dourado discreto e tipografia limpa.
A interface foi desenhada primeiro para o celular: cartas grandes, botões de 48px
para o dedo e uma coluna única de leitura.

**Três estilos de carta**, trocáveis a qualquer momento na partida (Menu → Opções):

| Estilo | Aparência | Quando usar |
| --- | --- | --- |
| **Esmeralda** | Fundo de pedra verde com brilho, símbolo grande em dourado | padrão, assinatura do jogo |
| **Clássico** | Papel marfim, traço fino, vermelho tradicional | leitura mais neutra |
| **Noturno** | Fundo quase preto, alto contraste | jogar à noite ou com pouca luz |

**Música de fundo.** Opcional, ligada nas Opções, com controle de volume. É gerada no
próprio navegador pela Web Audio API — sem arquivo de áudio, sem música de terceiros.
Começa suave, em loop, e começa apenas depois do primeiro toque na tela, como exigem
os navegadores móveis.

**Relógio de turno.** Opcional (30s, 60s ou 120s), definido na criação da partida.

Todas as preferências ficam salvas no aparelho.

---

## As regras

**Objetivo:** ser o primeiro a ficar **sem nenhuma carta na mão**.

**Preparação**
- 2 baralhos de 52 cartas, sem curinga (104 cartas).
- Naipes: coração, ouro, paus e espada.
- 9 cartas para cada jogador; o restante forma o monte.
- De 2 a 4 jogadores.

**Tipos de combinação** (mínimo de 3 cartas)
- **Sequência** — mesmo naipe, valores consecutivos. Ex.: `A,2,3` de espada.
- **Grupo** — mesmo valor, naipes diferentes. Ex.: `K` de ouro, `K` de paus, `K` de coração.
- O **As vale nas duas pontas**: `A,2,3` e `J,Q,K,A`.

**O turno**
1. Você pode **baixar combinações** e **encaixar cartas** na mesa quantas vezes conseguir.
2. **Comprar** é opcional, mas é **uma única carta por turno** — e ela pode ser jogada na hora.
3. Sem jogada possível, a compra é obrigatória; se ainda assim não puder jogar, passe a vez.

**A regra de abertura (fase travada)**
Enquanto **qualquer jogador ainda não tiver baixado** sua primeira combinação, todos só
podem baixar combinações de 3 ou mais cartas. Nenhuma carta solta entra na mesa.

**A mesa aberta (fase livre)**
Quando todos baixaram ao menos uma combinação, a mesa fica livre:
- qualquer um pode encaixar cartas da mão em qualquer combinação;
- qualquer um pode **remanejar cartas entre combinações**.

**A regra de ouro da mesa**
Toda combinação na mesa precisa manter **no mínimo 3 cartas válidas** a cada movimento.
Retirar uma carta que deixaria 1 ou 2 cartas — ou uma carta solta — é **proibido**.

Exemplo:
- `A,2,3,4` de espada → pode retirar o `A` (sobram `2,3,4`, válido).
- `A,2,3` de espada → **não** pode retirar o `A` (sobrariam `2,3`, inválido).

**Fim da partida**
- Quem zerar a mão vence e a partida acaba.
- Se o monte acabar e ninguém tiver zerado, vence quem tiver **menos cartas**.

**Quem começa** (rodízio)
A rodada seguinte começa com **o jogador seguinte ao vencedor, no sentido horário**.
Exemplo com a mesa `Você → Laila → Laís → Esmeralda`:
Você vence → Laila começa. Laila vence → Laís começa. Laís vence → Esmeralda começa.

**Relógio opcional**
1 minuto por turno, configurável (30 s / 60 s / 120 s). Só deve ser usado com o
consentimento de todos na mesa.

---

## Arquitetura

O ponto central do projeto: **a regra não sabe que existe tela, e a tela não sabe
jogar sozinha.**

```
engine/  ──►  hooks/  ──►  screens/ + components/
(regras)      (ponte)       (interface React)
```

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Regras puras | `src/engine/rules.js` | Sequências, grupos, validação da mesa, remoção, abertura |
| Baralho | `src/engine/deck.js` | Criação, embaralhamento, rótulos e naipes |
| Estado | `src/engine/gameState.js` | Jogadores, monte, mesa, turno, fases |
| Ações | `src/engine/engine.js` | Comprar, baixar, encaixar, recombinar, passar |
| Ponte | `src/hooks/useGame.js` | Converte ação de UI em chamada de engine |
| Interface | `src/screens/`, `src/components/` | Desenha o estado; nunca altera regra |
| Aparência | `src/settings/themes.js` | Estilos de carta e preferências do aparelho |
| Áudio | `src/settings/sound.js` | Música de fundo sintetizada no navegador |

Princípios seguidos:
1. **Estado imutável** — nenhuma função altera o objeto recebido; todas devolvem um novo.
2. **Ações devolvem resultado** — `{ ok, state, error }`. A interface nunca valida regra.
3. **Aleatoriedade injetável** — os testes passam um gerador fixo e ficam determinísticos.
4. **Sem dependência de React na engine** — dá para portar para Node, outro framework ou IA.

---

## Estrutura de pastas

```
jogo-de-cartas/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js                  # service worker (offline)
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.jsx               # bootstrap + registro do PWA
│   ├── App.jsx                # menu → lobby → mesa, opções, música
│   ├── engine/
│   │   ├── deck.js
│   │   ├── rules.js
│   │   ├── gameState.js
│   │   ├── engine.js
│   │   ├── rules.test.mjs
│   │   └── engine.test.mjs
│   ├── hooks/
│   │   └── useGame.js
│   ├── components/
│   │   ├── Card.jsx           # carta com os 3 estilos
│   │   ├── Combination.jsx
│   │   ├── PlayerBadge.jsx
│   │   └── SettingsPanel.jsx  # opções: estilo, música, volume
│   ├── settings/
│   │   ├── themes.js          # catálogo de estilos + preferências salvas
│   │   └── sound.js           # música gerada com Web Audio API
│   ├── screens/
│   │   ├── Menu.jsx
│   │   ├── Lobby.jsx
│   │   ├── Table.jsx
│   │   ├── Rules.jsx
│   │   └── About.jsx
│   └── styles/
│       └── global.css
└── docs/
    ├── GAME_SPEC.md           # especificação completa
    └── PROMPT_CONTINUACAO.md  # prompt para continuar em outra IA
```

---

## Testes

```bash
npm test
```

26 testes cobrindo:
- validação de sequência (naipe único, sem buracos, sem repetição, As nas duas pontas);
- validação de grupo (mesmo valor, naipes distintos);
- regra de ouro da mesa (mínimo 3, nenhuma carta solta);
- remoção permitida e proibida;
- distribuição de cartas e limites de jogadores;
- transição de turno no sentido horário e volta ao início;
- compra obrigatória e compra com monte vazio;
- baixada válida e inválida;
- vitória por mão zerada;
- bloqueio de encaixe durante a fase travada;
- recombinação legal e ilegal.

---

## Roadmap

Concluído nesta versão:
- [x] Engine de regras isolada e testada
- [x] Modo local (hot seat) de 2 a 4 jogadores
- [x] Regra de abertura, recombinação e validação da mesa
- [x] Relógio de turno opcional
- [x] Nomes editáveis
- [x] Instalável no celular/tablet (PWA) e funcional offline

Próximas etapas sugeridas:
- [ ] **IA de oponente** (documentada em `docs/GAME_SPEC.md`)
- [ ] Arrastar e soltar cartas com o dedo
- [ ] Histórico de jogadas e botão de desfazer
- [ ] Persistência do placar entre rodadas (localStorage)
- [ ] Som e animação de turno
- [ ] Multiplayer online (WebSocket ou Firebase)
- [ ] Modo acessível: fonte maior e alto contraste

---

## Decisões técnicas e o porquê

**Por que separar a engine da interface?**
Porque regra de jogo é o ativo mais duradouro. Ela pode ser testada, portada para
outro framework e reaproveitada por uma IA. Se a regra estivesse dentro de componentes
React, nenhuma dessas coisas seria possível e qualquer mudança visual poderia quebrar
o jogo.

**Por que estado imutável?**
O React só redesenha quando percebe um objeto novo. Mutar o estado causa bugs do tipo
“a carta saiu da mão na tela mas continua no jogo”. Além disso, imutabilidade abre
caminho para desfazer e histórico.

**Por que interação guiada (tocar) em vez de arrastar?**
Arrastar é melhor no celular, mas exige biblioteca extra e é difícil de validar em
tempo real. A interação guiada já entrega todas as regras e é acessível; arrastar
entra no roadmap como refinamento.

**Por que não colocar 8 e 9 fora do baralho?**
O projeto usa 52 cartas para chegar às 104 cartas de dois baralhos, mantendo o volume
de mesa que dilui o problema de partidas longas com poucos jogadores.

**Por que o teste injeta o gerador aleatório?**
Para que o resultado de um embaralhamento seja previsível e um teste nunca falhe
por azar.
