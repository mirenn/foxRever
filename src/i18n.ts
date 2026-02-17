export type Language = 'ja' | 'en';

const translations = {
  // Title screen
  gameTitle: { ja: '🏛️ 囚人管理シミュレーター', en: '🏛️ Prisoner Manager' },
  stage1Label: { ja: 'ステージ 1 : Normal', en: 'Stage 1: Normal' },
  stage1Desc: { ja: '基本ルール・力持ちなし', en: 'Basic rules, no Strong type' },
  stage2Label: { ja: 'ステージ 2 : Hard (準備中)', en: 'Stage 2: Hard (Coming Soon)' },
  stage2Desc: { ja: '調整中のためプレイ不可', en: 'Currently unavailable' },
  howToPlayBtn: { ja: '❓ 遊び方を見る', en: '❓ How to Play' },

  // Help modal
  helpTitle: { ja: '📖 遊び方', en: '📖 How to Play' },
  helpStep1Title: { ja: '1. 囚人を選択', en: '1. Select a Prisoner' },
  helpStep1Desc: { ja: '待機エリアの囚人をクリックします。', en: 'Click a prisoner in the waiting area.' },
  helpStep1Note: { ja: '※点滅している囚人が選べます', en: 'Blinking prisoners can be selected' },
  helpStep2Title: { ja: '2. 部屋に配置', en: '2. Assign to Room' },
  helpStep2Desc: { ja: '光っている部屋（空きあり）をクリックして入れます。', en: 'Click a highlighted room (with vacancy) to place them.' },
  helpStep2Note: { ja: '※定員は1部屋2名まで', en: 'Max 2 prisoners per room' },
  helpStep3Title: { ja: '3. 巡回して鎮める', en: '3. Patrol to Calm' },
  helpStep3Desc: { ja: '「巡回」ボタンで、1日2回まで部屋の脱獄度を0にリセットできます。', en: 'Use the "Patrol" button to reset escape progress to 0 (2x per day).' },
  helpStep3Note: { ja: '※脱獄寸前の部屋を鎮めましょう！', en: 'Calm down rooms before they escape!' },
  helpStep4Title: { ja: '4. クリア条件', en: '4. Victory Condition' },
  helpStep4Desc: { ja: '3日間、脱獄を防ぎきれば勝利です！', en: 'Survive 3 days without any escapes to win!' },
  helpStep4Note: { ja: '※夜の変身や相性にも注意...', en: 'Watch out for night transformations and compatibility...' },
  closeBtn: { ja: '閉じる', en: 'Close' },

  // Header / Play screen
  patrolLabel: { ja: '巡回', en: 'Patrol' },
  patrolHintOn: { ja: '部屋をクリックして脱獄度を0にする', en: 'Click a room to reset escape progress to 0' },
  patrolsRemaining: { ja: '残り巡回回数', en: 'Patrols remaining' },
  dayLabel: { ja: '昼', en: 'Day' },
  nightLabel: { ja: '夜', en: 'Night' },
  timeRemaining: { ja: (s: number) => `残り ${s}秒`, en: (s: number) => `${s}s left` },
  howToPlayTooltip: { ja: '遊び方', en: 'How to Play' },
  patrolModeHint: { ja: '⚠️ 巡回モード: 部屋をクリックして脱獄度を0にする', en: '⚠️ Patrol Mode: Click a room to reset escape progress to 0' },

  // Waiting area
  waitingAreaTitle: { ja: '📥 待機エリア', en: '📥 Waiting Area' },
  nextPrisoner: { ja: (s: number) => `次の囚人まで: ${s}秒`, en: (s: number) => `Next prisoner in: ${s}s` },
  noPrisoners: { ja: '待機中の囚人はいません', en: 'No prisoners waiting' },
  compatWarning: { ja: '⚠️ 狼男🐺とバンパイア🧛を同室にすると脱獄度が急上昇します！', en: '⚠️ Putting Werewolf 🐺 and Vampire 🧛 together will rapidly increase escape progress!' },

  // Prisoner types
  typeNormal: { ja: '普通', en: 'Normal' },
  typeWerewolf: { ja: '狼男', en: 'Werewolf' },
  typeVampire: { ja: 'バンパイア', en: 'Vampire' },
  typeStrong: { ja: '力持ち', en: 'Strong' },

  // Rooms
  roomLabel: { ja: (n: number) => `部屋 ${n}`, en: (n: number) => `Room ${n}` },
  incompatiblePair: { ja: '相性悪い組み合わせ！', en: 'Incompatible pair!' },
  moonlightTooltip: { ja: '夜に月光が差し込む', en: 'Moonlight shines in at night' },
  escapeLabel: { ja: (pct: number) => `脱獄度: ${pct}%`, en: (pct: number) => `Escape: ${pct}%` },
  emptyRoom: { ja: '空室', en: 'Empty' },
  clickToAssign: { ja: 'クリックで配置', en: 'Click to assign' },
  patrolRoom: { ja: '巡回する', en: 'Patrol' },

  // Result screen
  victoryTitle: { ja: '🎉 勝利！', en: '🎉 Victory!' },
  gameOverTitle: { ja: '💀 ゲームオーバー', en: '💀 Game Over' },
  victoryMsg: { ja: '3日間、暴動を防ぎました！', en: 'You prevented riots for 3 days!' },
  postResult: { ja: '🐦 結果をポストする', en: '🐦 Post Result' },
  retryBtn: { ja: (mode: string) => `🔄 もう一度 (${mode})`, en: (mode: string) => `🔄 Retry (${mode})` },
  titleBtn: { ja: '🏠 タイトルへ', en: '🏠 Title' },
  tweetVictory: {
    ja: (stage: number) => `囚人管理シミュレーター(Stage ${stage})をクリアしました！暴動を防ぎきった！`,
    en: (stage: number) => `Cleared Prisoner Manager (Stage ${stage})! Prevented all riots!`,
  },
  tweetDefeat: {
    ja: (stage: number, reason: string) => `囚人管理シミュレーター(Stage ${stage})でゲームオーバー... ${reason}`,
    en: (stage: number, reason: string) => `Game Over in Prisoner Manager (Stage ${stage})... ${reason}`,
  },

  // Game over reasons
  werewolfBerserk: {
    ja: (roomNum: number) => `部屋${roomNum}で狼男が暴走！月光で変身してしまった！`,
    en: (roomNum: number) => `Werewolf went berserk in Room ${roomNum}! Transformed under moonlight!`,
  },
  prisonerEscaped: {
    ja: (name: string, roomNum: number) => `${name}（部屋${roomNum}）が脱獄！見回りが足りなかった！`,
    en: (name: string, roomNum: number) => `${name} (Room ${roomNum}) escaped! Not enough patrols!`,
  },
  waitingOverflow: {
    ja: '待機エリアが溢れた！囚人たちが暴動を起こした！',
    en: 'Waiting area overflowed! Prisoners rioted!',
  },
} as const;

// Detect browser language: Japanese if navigator.language starts with 'ja', otherwise English
function detectLanguage(): Language {
  if (typeof navigator !== 'undefined') {
    return navigator.language.startsWith('ja') ? 'ja' : 'en';
  }
  return 'en';
}

// Current language state
let currentLang: Language = detectLanguage();

export function setLanguage(lang: Language) {
  currentLang = lang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function t(key: keyof typeof translations): any {
  return (translations[key] as any)[currentLang];
}
