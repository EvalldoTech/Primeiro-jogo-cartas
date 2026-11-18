# Prompt para continuar este projeto em outra IA

Copie o bloco abaixo e cole no início de uma nova conversa, junto com os arquivos
do projeto (ou apenas o conteúdo de `src/` e `docs/GAME_SPEC.md`).

---

```
Você vai continuar um projeto de jogo de cartas já existente. Não recomece do zero
e não reescreva o que já funciona.

LEIA PRIMEIRO, NESTA ORDEM:
1. docs/GAME_SPEC.md  — especificação completa das regras e do modelo de dados
2. README.md          — arquitetura, estrutura de pastas e roadmap
3. src/engine/*.js    — a engine de regras (não depende de React)
4. src/engine/*.test.mjs — 26 testes que definem o comportamento esperado

ESTADO ATUAL
- Stack: React 18 + Vite, JavaScript puro (sem TypeScript), CSS próprio.
- Engine de regras isolada em src/engine/, com estado imutável.
- Interface React consome a engine via src/hooks/useGame.js.
- Modo local (hot seat) de 2 a 4 jogadores, completo e testado.
- PWA configurado: instalável e funciona offline.
- Testes: `npm test` (node --test). Todos os 26 devem continuar passando.

REGRAS QUE NÃO PODEM SER ALTERADAS SEM AUTORIZAÇÃO
- Mesa única e compartilhada; todas as combinações são públicas.
- Toda combinação na mesa precisa manter no mínimo 3 cartas válidas em todo movimento.
- Fase travada: enquanto alguém não baixou, só se baixa combinação de 3+.
- Fase livre: quando todos baixaram, qualquer um encaixa e remaneja.
- Comprar é opcional e limitado a 1 carta por turno.
- As vale nas duas pontas (A,2,3 e J,Q,K,A).
- 104 cartas (2 baralhos de 52), 9 cartas por jogador, 2 a 4 jogadores.
- Quem começa a rodada seguinte é o jogador seguinte ao vencedor, no sentido horário.
- Toda ação da engine devolve { ok, state, error? } e nunca lança exceção.

O QUE VOCÊ DEVE FAZER AGORA
[escreva aqui a tarefa: ex. "implementar a IA de dificuldade média descrita na
seção 15 da spec, sem duplicar regras, com testes próprios"]

COMO TRABALHAR
- Antes de alterar código, diga em uma frase o que vai mudar e por quê.
- Não altere arquivos fora do escopo pedido.
- Depois de qualquer mudança na engine, rode `npm test` e reporte o resultado.
- Se uma regra estiver ambígua na spec, pergunte em vez de decidir sozinho.
- Preserve nomes, estrutura de pastas e o estilo de comentários existente.
```

---

## Dicas de uso

- **Uma tarefa por conversa.** Pedir "implemente a IA e melhore o visual" na mesma
  mensagem costuma resultar em código pior nas duas frentes.
- **Cole a spec sempre.** Modelos esquecem decisões antigas quando a conversa cresce.
- **Exija os testes.** Se a IA alterar a engine sem rodar `npm test`, o projeto
  degrada silenciosamente.
- **Guarde o histórico.** Ao final de cada etapa, atualize o roadmap do README.
