// 囚人の種類
export type PrisonerType = 'normal' | 'werewolf' | 'strong' | 'vampire';

// 囚人
export interface Prisoner {
  id: string;
  type: PrisonerType;
  name: string;
  stress: number; // ストレスゲージ（0-100）
}

// 部屋
export interface Room {
  id: number;
  capacity: number; // 最大収容人数（通常2）
  prisoners: Prisoner[];
  hasMoonlight: boolean; // 月光が差し込む部屋かどうか
  lastInspected: number; // 最後に検査した日
}

// 時間帯
export type TimeOfDay = 'day' | 'night';

// ゲーム状態
export interface GameState {
  rooms: Room[];
  waitingPrisoners: Prisoner[]; // 配置待ちの囚人
  day: number; // 現在の日数（1-3）
  timeOfDay: TimeOfDay;
  timeRemaining: number; // 現在の時間帯の残り秒数
  isGameOver: boolean;
  isVictory: boolean;
  gameOverReason?: string;
  inspectionsRemaining: number; // 残り検査回数
}

// ゲーム設定
export const GAME_CONFIG = {
  TOTAL_DAYS: 3,
  DAY_DURATION: 15, // 昼の秒数
  NIGHT_DURATION: 15, // 夜の秒数
  PRISONER_SPAWN_INTERVAL: 6, // 秒ごとに囚人到着
  MAX_WAITING_PRISONERS: 3, // 待機エリア上限
  TOTAL_ROOMS: 8,
  ROOM_CAPACITY: 2,
  // 月光が差す部屋（夜のみ有効）
  MOONLIGHT_ROOMS: [1, 3, 5, 7], // 0-indexed: 部屋2, 4, 6, 8
  // ストレス関連
  STRESS_PER_TICK: 3, // 毎秒のストレス上昇（基本）
  STRESS_INCOMPATIBLE_BONUS: 5, // 相性悪い同室の追加ストレス
  STRESS_THRESHOLD: 100, // この値に達すると暴動
  REPAIRS_PER_DAY: 2, // 1日あたりの修理回数
};

// 相性悪い組み合わせ（ストレス増加）
export const INCOMPATIBLE_PAIRS: [PrisonerType, PrisonerType][] = [
  ['werewolf', 'vampire'],
];
