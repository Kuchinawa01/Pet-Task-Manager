import { colors } from '../../theme';

/**
 * Catálogo de mascotes — 100% DADOS, zero lógica de UI.
 */
const pendentes = (n) => `${n} ${n === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`;

export const PETS = {
  sifu: {
    id: 'sifu',
    name: 'Sifú',
    species: 'cat',
    personality: 'Enérgico e maluco',
    accent: colors.peachDeep,
    tint: colors.peach,
    progressIcon: '🧶',
    motion: { idleAmp: 10, idlePeriod: 380, wobbleDeg: 8, hops: 4, hopHeight: 46 },
    sprites: { 
      idle: require('../../../assets/sifu_idle.png'), 
      reward: require('../../../assets/sifu_reward.png'), 
      cozy: require('../../../assets/sifu_cozy.png') 
    },
    lines: {
      empty: () => 'Zero tarefas?! Bora inventar uma aventura! 🌀',
      idle: (n) => `${pendentes(n)}! Corre, corre, corre! ⚡`,
      reward: () => 'MIAAAU! Mais uma! Zoom zoom zoom! 🎉',
      cozy: () => 'Tudo feito... agora é soneca épica. zzz',
    },
  },
  maria: {
    id: 'maria',
    name: 'Maria',
    species: 'cat',
    personality: 'Doidinha e brincalhona',
    accent: colors.roseDeep,
    tint: colors.rose,
    progressIcon: '🧶',
    motion: { idleAmp: 7, idlePeriod: 520, wobbleDeg: 12, hops: 3, hopHeight: 40 },
    sprites: { 
      idle: require('../../../assets/maria_idle.png'), 
      reward: require('../../../assets/maria_reward.png'), 
      cozy: require('../../../assets/maria_cozy.png') 
    },
    lines: {
      empty: () => 'Cadê as tarefas? Vamos brincar de organizar! 🎀',
      idle: (n) => `Psiu! ${pendentes(n)}… brinca comigo e resolve? 🐾`,
      reward: () => 'Hihi! Você arrasou! 💖',
      cozy: () => 'Dia concluído! Vou sonhar com bolinhas de lã… 🧶',
    },
  },
  fuzzy: {
    id: 'fuzzy',
    name: 'Antônio Fuzzy',
    species: 'cat',
    personality: 'Calminho e fofo',
    accent: colors.mintDeep,
    tint: colors.mint,
    progressIcon: '🧶',
    motion: { idleAmp: 3, idlePeriod: 1200, wobbleDeg: 2, hops: 2, hopHeight: 22 },
    sprites: { 
      idle: require('../../../assets/fuzzy_idle.png'), 
      reward: require('../../../assets/fuzzy_reward.png'), 
      cozy: require('../../../assets/fuzzy_cozy.png') 
    },
    lines: {
      empty: () => 'Sem pressa. Quando quiser, anota a primeira tarefa. ☁️',
      idle: (n) => `${pendentes(n)}. Um passinho de cada vez, tá? 🌷`,
      reward: () => 'Aww, que orgulho. Muito bem. 🤍',
      cozy: () => 'Lista zerada. Vem cá, vamos tirar uma sonequinha. 🌙',
    },
  },
  adam: {
    id: 'adam',
    name: 'Adam',
    species: 'dog',
    personality: 'Leal e animado',
    accent: colors.lilacDeep,
    tint: colors.lilac,
    progressIcon: '🦴',
    motion: { idleAmp: 8, idlePeriod: 450, wobbleDeg: 5, hops: 3, hopHeight: 38 },
    sprites: { 
      idle: require('../../../assets/adam_idle.png'), 
      reward: require('../../../assets/adam_reward.png'), 
      cozy: require('../../../assets/adam_cozy.png') 
    },
    lines: {
      empty: () => 'Vamos lá! Qual é a primeira missão? 🦴',
      idle: (n) => `${pendentes(n)}! Eu tô com você! 🐾`,
      reward: () => 'ISSO! Bom trabalho! Posso abanar o rabo? 🎾',
      cozy: () => 'Missão cumprida! Vou vigiar o seu descanso. 💤',
    },
  },
  bento: {
    id: 'bento',
    name: 'Bento',
    species: 'dog',
    personality: 'Atento e curioso',
    accent: colors.orangeDeep || '#d97706',
    tint: colors.orange || '#fcd34d',
    progressIcon: '🦴',
    motion: { idleAmp: 9, idlePeriod: 400, wobbleDeg: 6, hops: 4, hopHeight: 42 },
    sprites: { 
      idle: require('../../../assets/bento_idle.png'), 
      reward: require('../../../assets/bento_reward.png'), 
      cozy: require('../../../assets/bento_cozy.png') 
    },
    lines: {
      empty: () => 'Nenhuma tarefa? Posso farejar algumas pra você! 🐕',
      idle: (n) => `${pendentes(n)} no faro! Vamos pegar! 🐾`,
      reward: () => 'Auuu! Pegamos mais uma! 🎾',
      cozy: () => 'Ufa, gastamos toda a energia. Hora da caminha. 💤',
    },
  },
  isadora: {
    id: 'isadora',
    name: 'Isadora',
    species: 'dog',
    personality: 'A preguiçosa oficial',
    accent: colors.blueDeep || '#1d4ed8',
    tint: colors.blue || '#93c5fd',
    progressIcon: '🦴',
    motion: { idleAmp: 2, idlePeriod: 1500, wobbleDeg: 1, hops: 1, hopHeight: 15 },
    sprites: { 
      idle: require('../../../assets/isadora_idle.png'), 
      reward: require('../../../assets/isadora_reward.png'), 
      cozy: require('../../../assets/isadora_cozy.png') 
    },
    lines: {
      empty: () => 'Zero tarefas. Perfeito para voltar pra rede... 🥱',
      idle: (n) => `Tem ${pendentes(n)}... faz rapidinho pra gente poder deitar. 🛋️`,
      reward: () => 'Muito bem. Agora já merecemos um petisco, né? 🥓',
      cozy: () => 'Finalmente... barriga pra cima e modo soneca ativado. 💤',
    },
  },
};

export const PET_IDS = Object.keys(PETS);
export const DEFAULT_PET_ID = 'sifu';