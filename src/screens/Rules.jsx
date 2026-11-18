/**
 * Rules.jsx — regras em uma tela, para consultar no meio da partida.
 */
export default function Rules({ onBack }) {
  return (
    <div className="screen screen--rules">
      <header className="page-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">←</button>
        <h2>Como jogar</h2>
      </header>

      <section className="panel prose">
        <h3>Objetivo</h3>
        <p>Ser o primeiro a ficar <strong>sem nenhuma carta na mão</strong>.</p>

        <h3>Preparação</h3>
        <p>
          Dois baralhos de 52 cartas (104 no total), sem curinga. Naipes: coração, ouro,
          paus e espada. Cada jogador recebe <strong>9 cartas</strong>. De 2 a 4 jogadores.
        </p>

        <h3>Combinações válidas (mínimo 3 cartas)</h3>
        <ul>
          <li><strong>Sequência:</strong> mesmo naipe, valores seguidos. Ex.: A, 2, 3 de espada.</li>
          <li><strong>Grupo:</strong> mesmo valor, naipes diferentes. Ex.: três reis.</li>
          <li>O <strong>As vale nas duas pontas</strong>: A, 2, 3 e J, Q, K, A.</li>
        </ul>

        <h3>O turno</h3>
        <ol>
          <li>Você pode baixar combinações e encaixar cartas quantas vezes conseguir.</li>
          <li>Comprar é opcional, mas <strong>uma única carta por turno</strong>.</li>
          <li>Sem jogada possível, a compra é obrigatória. Se ainda não puder jogar, passe a vez.</li>
        </ol>

        <h3>Abertura e mesa livre</h3>
        <p>
          Enquanto algum jogador não tiver baixado sua primeira combinação, todos só podem
          baixar combinações de 3 ou mais. Quando todos baixaram, a mesa fica livre: qualquer
          um encaixa e reorganiza cartas de qualquer combinação.
        </p>

        <h3>A regra de ouro</h3>
        <p>
          Toda combinação na mesa precisa manter <strong>no mínimo 3 cartas válidas</strong> em
          cada movimento. Retirar uma carta que deixaria uma ou duas na mesa é proibido.
        </p>

        <h3>Fim e nova rodada</h3>
        <p>
          Quem zerar a mão vence. Se o monte acabar, vence quem tiver menos cartas.
          A rodada seguinte começa com o jogador seguinte ao vencedor, no sentido horário.
        </p>

        <h3>Relógio e música</h3>
        <p>
          O relógio de turno é opcional e deve ser usado só se todos concordarem.
          A música de fundo também é opcional e fica nas Opções.
        </p>
      </section>

      <button type="button" className="btn btn--primary btn--block" onClick={onBack}>
        Entendi
      </button>
    </div>
  );
}
