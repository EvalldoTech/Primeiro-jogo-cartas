/**
 * sound.js — música de fundo gerada no próprio navegador (Web Audio API).
 *
 * Por que gerada e não um arquivo .mp3?
 * 1. Sem arquivo para baixar: abre mais rápido no celular e não pesa no repositório.
 * 2. Sem direito autoral: nada de música de terceiros no seu portfólio.
 * 3. Web Audio API é um recurso do navegador — bom item para conversar em entrevista.
 *
 * A música é um padrão lento de acordes, discreto, em loop, com volume suave.
 *
 * OS TRÊS ELEMENTOS DA WEB AUDIO QUE VOCÊ VAI VER AQUI
 * 1. AudioContext — "a mesa de som" do navegador. Só uma por página.
 * 2. Oscillator   — "o instrumento": gera uma onda (som) numa frequência.
 * 3. GainNode     — "o volume": multiplica o som por um fator (0 = mudo).
 * Ligamos os nós em cadeia: oscilador -> volume -> filtro -> alto-falante.
 */

const NOTES = {
  // Frequências (Hz) de um acorde menor suave, em duas oitavas.
  C3: 130.81, Eb3: 155.56, G3: 196.00, Bb3: 233.08,
  C4: 261.63, Eb4: 311.13, G4: 392.00, Bb4: 466.16,
  F3: 174.61, Ab3: 207.65, D4: 293.66,
};

/** Progressão de 4 acordes, cada um com 4 notas e duração própria. */
const PROGRESSION = [
  [{ note: 'C3', dur: 2 }, { note: 'Eb3', dur: 2 }, { note: 'G3', dur: 2 }, { note: 'Bb3', dur: 2 }],
  [{ note: 'F3', dur: 2 }, { note: 'Ab3', dur: 2 }, { note: 'C4', dur: 2 }, { note: 'Eb4', dur: 2 }],
  [{ note: 'C3', dur: 2 }, { note: 'G3', dur: 2 }, { note: 'C4', dur: 2 }, { note: 'Eb4', dur: 2 }],
  [{ note: 'Eb3', dur: 2 }, { note: 'Bb3', dur: 2 }, { note: 'Eb4', dur: 2 }, { note: 'G4', dur: 2 }],
];

// Duração base de um "passo" musical, em segundos.
const STEP_SECONDS = 0.55;

class BackgroundMusic {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.timer = null;
    this.playing = false;
    this.volume = 0.35;
    this.step = 0;
  }

  /**
   * Cria o contexto de áudio. Só pode ser chamado após um gesto do usuário
   * (clique/toque) — é uma regra dos navegadores para bloquear som automático.
   */
  ensureContext() {
    if (this.ctx) return this.ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;

    // Filtro passa-baixa: deixa o som abafado e confortável, tipo música de fundo.
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    filter.Q.value = 0.4;

    this.master.connect(filter);
    filter.connect(this.ctx.destination);
    return this.ctx;
  }

  /**
   * Toca uma nota com "envelope": volume sobe devagar, fica, e cai devagar.
   * Sem isso o som começa e termina com um "TEC" seco. Esse é um conceito
   * clássico de áudio (attack / sustain / release) e vale quebrar a cabeça.
   *
   * `when` é momento no relógio do áudio (não é segundos do relógio comum):
   * assim agendamos várias notas com precisão de milissegundo.
   */
  playNote(freq, duration, when, gainValue) {
    const { ctx, master } = this;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const attack = 0.35;
    const release = 0.9;
    const end = when + duration;

    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(gainValue, when + attack);
    gain.gain.setValueAtTime(gainValue, Math.max(when + attack, end - release));
    gain.gain.linearRampToValueAtTime(0, end);

    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(end + 0.05);
  }

  /**
   * Agenda um compasso da progressão.
   * Repare em `ctx.currentTime` — o "agora" do áudio. Todo agendamento é
   * feito a partir dele mais um pequeno atraso de segurança.
   */
  scheduleBar() {
    const { ctx } = this;
    const chord = PROGRESSION[this.step % PROGRESSION.length];
    const now = ctx.currentTime + 0.05;
    let offset = 0;

    chord.forEach(({ note, dur }, index) => {
      const freq = NOTES[note];
      if (freq) {
        // A nota mais grave fica um pouco mais forte; as demais, discretas.
        const gain = index === 0 ? 0.16 : 0.075;
        this.playNote(freq, dur * STEP_SECONDS, now + offset, gain);
      }
      offset += dur * STEP_SECONDS;
    });

    this.step += 1;
  }

  /** Liga a música, com subida suave de volume em 1,4 s. */
  start() {
    if (this.playing) return true; // proteção: não ligar duas vezes
    const ctx = this.ensureContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') ctx.resume();
    this.playing = true;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(0, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 1.4);

    this.scheduleBar();
    // setInterval repete a função a cada X milissegundos.
    // Aqui: um compasso (8 passos) depois do outro, em loop infinito.
    // É por isso que o clearInterval do stop() é obrigatório — sem ele a
    // música continuaria sendo agendada para sempre em segundo plano.
    this.timer = setInterval(() => this.scheduleBar(), STEP_SECONDS * 8 * 1000);
    return true;
  }

  stop() {
    if (!this.playing || !this.ctx) return;
    this.playing = false;
    const { ctx } = this;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    clearInterval(this.timer);
    this.timer = null;
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.master && this.playing) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.2);
    }
  }

  /** Estado atual, útil para depuração e para a interface. */
  isPlaying() { return this.playing; }

  getState() {
    return {
      playing: this.playing,
      contextState: this.ctx ? this.ctx.state : 'none',
      volume: this.volume,
    };
  }
}

export const music = new BackgroundMusic();
