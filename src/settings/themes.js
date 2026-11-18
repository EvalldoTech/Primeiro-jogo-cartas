/**
 * themes.js — catálogo de estilos de carta e preferências salvas.
 *
 * Cada estilo muda apenas a APARÊNCIA da carta. As regras do jogo não sabem
 * que isso existe — é independência de verdade entre visual e lógica.
 *
 * O catálogo é uma LISTA DE OBJETOS. Para adicionar um quarto estilo:
 * 1. acrescente o objeto abaixo;
 * 2. crie o bloco .card[data-style="seu-id"] no CSS.
 * A tela de opções se atualiza sozinha, porque ela percorre esta lista.
 * Isso se chama "separar dados de interface".
 */

export const CARD_STYLES = [
  {
    id: 'esmeralda',
    name: 'Esmeralda',
    description: 'Fundo de pedra esmeralda, símbolo grande e dourado.',
  },
  {
    id: 'classico',
    name: 'Clássico',
    description: 'Papel claro, traço fino, leitura tradicional.',
  },
  {
    id: 'noturno',
    name: 'Noturno',
    description: 'Fundo escuro, alto contraste, ideal para jogar à noite.',
  },
];

export const DEFAULT_CARD_STYLE = 'esmeralda';
export const DEFAULT_SOUND = false;
export const DEFAULT_VOLUME = 0.35;

// Preferências ficam no localStorage: um "caderninho" do navegador que
// guarda texto e sobrevive ao fechar aba, reiniciar e trocar de página.
// Só funciona com STRING, por isso usamos JSON.stringify / JSON.parse.
const KEY = 'jogo-cartas:prefs';

export const DEFAULT_PREFS = {
  cardStyle: DEFAULT_CARD_STYLE,
  soundOn: DEFAULT_SOUND,
  volume: DEFAULT_VOLUME,
  timerOn: false,
  turnSeconds: 60,
};

/**
 * Lê as preferências salvas no aparelho.
 * O try/catch é necessário porque o navegador pode bloquear o localStorage
 * (modo privado) ou o texto salvo pode estar corrompido. Se algo falhar,
 * o jogo abre com os valores padrão em vez de quebrar na cara do jogador.
 */
export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    // Junta os padrões com o que foi salvo: se uma opção nova for criada no
    // futuro, ela já vem com valor padrão em aparelhos antigos.
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/** Salva as preferências no aparelho. */
export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Modo privado do navegador pode bloquear; o jogo segue sem salvar.
  }
}
