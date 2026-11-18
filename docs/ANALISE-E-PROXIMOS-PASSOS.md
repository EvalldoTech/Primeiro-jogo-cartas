# Esmeralda — análise do estado atual e o que ainda pode ser feito

Documento de apoio à conversa sobre o projeto. Escrito em novembro de 2026,
referente à versão 0.2.

---

## 1. O que foi construído, em uma linha por peça

| Peça | O que é | Existe para quê |
|---|---|---|
| Regras (`rules.js`) | valida sequências, grupos, mesa inteira | garantir que jogada ilegal nunca entre no jogo |
| Baralho (`deck.js`) | monta e embaralha 104 cartas | ter base correta e reproduzível |
| Estado (`gameState.js`) | retrato da partida | permitir leitura segura e React previsível |
| Ações (`engine.js`) | comprar, baixar, encaixar, recombinar, passar | ser o único lugar que muda o jogo |
| Ponte (`useGame.js`) | liga engine e React | evitar que tela decida regra |
| Telas | menu, criação, mesa, regras, sobre | dar um caminho claro ao jogador |
| Opções | estilo de carta, música, relógio | conforto e identidade |
| Carta (`Card.jsx`) | componente visual com 3 estilos | leitura rápida no celular |
| Música (`sound.js`) | Web Audio, sem arquivo | som opcional sem peso e sem direito autoral |
| PWA | manifest + service worker | instalar e abrir offline |
| Testes | 26 casos de regra + teste de interface | mudar o código sem quebrar o jogo |
| Documentação | README, GAME_SPEC, guia em Word | permitir que outra pessoa continue |

---

## 2. Onde ele roda hoje

Roda como site, em qualquer navegador moderno, e é instalável na tela inicial.

| Ambiente | Situação |
|---|---|
| Chrome, Edge, Firefox, Safari (desktop) | funciona |
| Android (Chrome, Samsung Internet) | funciona, instala como app |
| iPhone e iPad (Safari) | funciona; instala pelo menu Compartilhar |
| Offline | funciona depois do primeiro acesso, com o service worker |
| Servidor / banco de dados | não usa: partida é local, no aparelho |
| Loja de aplicativos | não está: PWA não entra em Play Store nem App Store |

---

## 3. Análise honesta: pontos fortes e fracos

### Fortes
1. **Regra separada da tela.** É o maior diferencial do projeto para portfólio e o que permite testar.
2. **Testes reais**, não decorativos: cobrem As nas duas pontas, mesa fechada, remoção inválida.
3. **Visual com identidade** e mobile-first, não um layout que encolhe.
4. **Sem dependências desnecessárias:** nem biblioteca de CSS, nem de estado, nem de som.
5. **Documentação que outra pessoa consegue seguir.**

### Fracos ou incompletos
1. **Não há oponente controlado pela computação.** Só se joga com pessoas presentes, no mesmo aparelho.
2. **Não há multiplayer em aparelhos diferentes.** É a limitação que mais pesa na percepção do jogo.
3. **Sem desfazer jogada.** Um toque errado na mesa é definitivo.
4. **Sem arrastar e soltar.** Tudo é toque-para-selecionar; funciona, mas é menos natural.
5. **Sem acessibilidade plena.** Contraste e tamanho de toque foram cuidados, mas falta navegação por teclado e leitor de tela testado.
6. **Sem tradução.** Só português.
7. **Sem histórico de partidas nem placar entre rodadas.**
8. **A pasta de testes de tela não faz parte do repositório** — a validação visual foi feita na esteira, não versionada.

---

## 4. O que ainda pode ser feito — em ordem de impacto

### Prioridade 1 — fecha o jogo como experiência completa

**1. Oponente de computador (a "IA").**
A especificação já existe em `docs/GAME_SPEC.md`, seção 15. O contrato é
`chooseMove(state, playerId) → Action`: o robô olha o estado e devolve a mesma
ação que um jogador humano devolveria. Como ele usa a engine real, não há
regra duplicada. Três níveis: fácil (primeira combinação que encontra), médio
(encaixa e baixa na hora) e difícil (testa 2–3 jogadas à frente).

Esforço: médio. Valor: alto. É o que permite jogar sozinho — sozinho é como
95% das pessoas abrem um jogo pela primeira vez.

**2. Desfazer jogada.**
Guardar o estado anterior numa pilha, antes de cada ação. A engine já é
imutável, então basta guardar referência; sem gambiarra.
Esforço: baixo. Valor: alto no conforto.

**3. Placar entre rodadas.**
Contador de vitórias por jogador, exibido na mesa e no fim. Ajusta a regra de
rodízio que já existe.
Esforço: baixo. Valor: médio-alto para o uso em família.

### Prioridade 2 — alcance

**4. Multiplayer em aparelhos diferentes.**
Servidor em Node com WebSocket, transportando só as ações (não o estado), e a
engine rodando nos dois lados. A arquitetura já permite, porque a engine não
depende do navegador. Exige: sala com código, reconexão, e regra de mão oculta
para cada jogador.
Esforço: alto. Valor: alto para portfólio de Full Stack — é aqui que o projeto
deixa de ser front end e passa a ser sistema.

**5. Instalar na App Store e Play Store.**
Empacotar com Capacitor. O código React é reaproveitado quase inteiro.
Esforço: médio, mas exige conta de desenvolvedor paga (US$ 99/ano na Apple).

### Prioridade 3 — qualidade de engenharia

**6. Testes de tela no repositório.**
Incluir o Playwright com script de caminho feliz: criar partida, baixar, comprar,
passar a vez. Esforço: baixo. Valor: alto — vira requisito de entrevista.

**7. Teste de acessibilidade.** Roda automatizado com axe; aponta contraste,
rótulo e ordem de foco que ninguém vê a olho nu.

**8. Arrastar e soltar com o dedo.** Pointer Events, com a mesma validação da
engine. É conforto, não regra.

### Prioridade 4 — conteúdo e produto

**9. Modos de jogo alternativos.** Partida rápida com 5 cartas na mão; modo
treino sem compra obrigatória; modo cooperativo.

**10. Estatísticas do jogador.** Sequências mais usadas, vitórias por naipe,
tempo médio de turno. Guardado no aparelho.

**11. Trilha sonora com variação.** Mais duas progressões harmônicas, escolhidas
pelo estilo de carta ou pela hora do dia.

**12. Tradução pt-BR / en-US.** Um dicionário de textos e um contexto de idioma.

**13. Áudio de interface.** Som curto ao comprar, ao vencer, ao errar — sempre
respeitando a opção de som.

---

## 5. Manutenção: o que cuidar a cada atualização

1. Rodar `npm test` antes de qualquer entrega.
2. Trocar o número da versão em `package.json`.
3. Trocar o nome do cache em `public/sw.js` (`esmeralda-v2` → `v3`). **Sem isso,
   quem já instalou o app continua vendo a versão antiga.**
4. Rodar `npm run build` e publicar a pasta `dist/`.
5. Ao mudar regra: primeiro o teste, depois o código.

---

## 6. Se for publicar — o caminho curto

1. Criar conta no Netlify ou Vercel (gratuito).
2. Arrastar a pasta `dist/` na interface do serviço.
3. O link já sai com HTTPS, que é o requisito para instalar no celular.
4. Opcional: ligar um domínio próprio.

Para testar no iPad, iPhone e Samsung: abrir o link, usar "Adicionar à tela
inicial". Em seguida, desligar o Wi-Fi e abrir de novo — o jogo deve abrir,
porque o service worker já guardou os arquivos.
