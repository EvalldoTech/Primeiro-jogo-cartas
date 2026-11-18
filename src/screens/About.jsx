/**
 * About.jsx — a história do projeto.
 * Espaço curto e honesto: de onde veio a ideia e o que o projeto é.
 */
export default function About({ onBack }) {
  return (
    <div className="screen screen--about">
      <header className="page-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar">←</button>
        <h2>Sobre</h2>
      </header>

      <section className="panel prose">
        <p className="prose__lead">
          Este jogo nasceu de uma ideia da minha mãe, Esmeralda. A mesa compartilhada,
          onde qualquer jogador pode reorganizar as cartas já baixadas, é dela.
        </p>
        <p>
          O que começou como uma conversa em casa virou um projeto de estudo:
          regras escritas, motor de jogo separado da interface, testes automatizados
          e um aplicativo que roda no celular.
        </p>
        <p>
          A paleta verde, o símbolo da pedra e o nome do jogo são uma homenagem.
        </p>
        <ul className="about-list">
          <li><strong>Regras e motor:</strong> JavaScript puro, sem dependência de framework</li>
          <li><strong>Interface:</strong> React + CSS próprio</li>
          <li><strong>Instalação:</strong> PWA — funciona offline no celular e no tablet</li>
          <li><strong>Testes:</strong> 26 casos automatizados cobrindo as regras</li>
        </ul>
      </section>

      <button type="button" className="btn btn--primary btn--block" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
