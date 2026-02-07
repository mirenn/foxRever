import { GameState, Prisoner, PrisonerType, Room, GAME_CONFIG, INCOMPATIBLE_PAIRS } from './types';

// ユニークID生成
let nextId = 0;
function generateId(): string {
  return `prisoner-${nextId++}`;
}

// 種族別の囚人名
const PRISONER_NAMES: Record<PrisonerType, string[]> = {
  normal: [
    'ジャック', 'トム', 'ビル', 'マイク', 'ジョン',
    'ボブ', 'チャーリー', 'デイブ', 'エド', 'フランク',
  ],
  werewolf: [
    'ニコラス', 'フェンリル', 'ルーカス', 'セバスチャン', 'グレイソン',
    'ウルリッヒ', 'ヴォルフガング', 'ロムルス', 'レムス', 'ライカン',
  ],
  vampire: [
    'ドラキュラ', 'ヴィクター', 'カシウス', 'アルカード', 'デミトリ',
    'ノスフェラトゥ', 'カーミラ', 'レスタト', 'ルシアン', 'ヴラド',
  ],
  strong: [
    'グロッグ', 'ブルータス', 'タイタン', 'ゴリアテ', 'アトラス',
    'ヘラクレス', 'サムソン', 'マグナス', 'コロッサス', 'オーガ',
  ],
};

// ランダムな囚人タイプ
function randomPrisonerType(): PrisonerType {
  const rand = Math.random();
  if (rand < 0.12) return 'werewolf';
  if (rand < 0.24) return 'vampire';
  if (rand < 0.32) return 'strong';
  return 'normal';
}

// 新しい囚人を生成
export function createPrisoner(): Prisoner {
  const type = randomPrisonerType();
  const names = PRISONER_NAMES[type];
  const name = names[Math.floor(Math.random() * names.length)];
  return {
    id: generateId(),
    type,
    name,
    escapeProgress: 0,
  };
}

// 初期ゲーム状態
export function createInitialState(): GameState {
  const rooms: Room[] = [];
  for (let i = 0; i < GAME_CONFIG.TOTAL_ROOMS; i++) {
    rooms.push({
      id: i,
      capacity: GAME_CONFIG.ROOM_CAPACITY,
      prisoners: [],
      hasMoonlight: GAME_CONFIG.MOONLIGHT_ROOMS.includes(i),
      lastInspected: 0,
    });
  }

  return {
    rooms,
    waitingPrisoners: [createPrisoner()],
    day: 1,
    timeOfDay: 'day',
    timeRemaining: GAME_CONFIG.DAY_DURATION,
    isGameOver: false,
    isVictory: false,
    inspectionsRemaining: GAME_CONFIG.REPAIRS_PER_DAY,
  };
}

// 相性悪いかチェック
export function hasIncompatibleRoommate(room: Room, prisoner: Prisoner): boolean {
  for (const other of room.prisoners) {
    if (other.id === prisoner.id) continue;
    for (const [type1, type2] of INCOMPATIBLE_PAIRS) {
      if ((prisoner.type === type1 && other.type === type2) ||
          (prisoner.type === type2 && other.type === type1)) {
        return true;
      }
    }
  }
  return false;
}

// 部屋に相性悪い組み合わせがあるかチェック
export function roomHasIncompatiblePair(room: Room): boolean {
  for (let i = 0; i < room.prisoners.length; i++) {
    for (let j = i + 1; j < room.prisoners.length; j++) {
      const p1 = room.prisoners[i];
      const p2 = room.prisoners[j];
      for (const [type1, type2] of INCOMPATIBLE_PAIRS) {
        if ((p1.type === type1 && p2.type === type2) ||
            (p1.type === type2 && p2.type === type1)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 囚人を部屋に配置（相性悪くても配置可能）
export function placePrisoner(
  state: GameState,
  prisonerId: string,
  roomId: number
): GameState {
  const prisoner = state.waitingPrisoners.find(p => p.id === prisonerId);
  const room = state.rooms.find(r => r.id === roomId);

  if (!prisoner || !room) return state;
  if (room.prisoners.length >= room.capacity) return state;

  return {
    ...state,
    waitingPrisoners: state.waitingPrisoners.filter(p => p.id !== prisonerId),
    rooms: state.rooms.map(r =>
      r.id === roomId
        ? { ...r, prisoners: [...r.prisoners, prisoner] }
        : r
    ),
  };
}

// 狼男チェック（夜×月光部屋に狼男がいたらゲームオーバー）
export function checkWerewolfEscape(state: GameState): GameState {
  if (state.timeOfDay !== 'night') return state;

  for (const room of state.rooms) {
    if (room.hasMoonlight) {
      const hasWerewolf = room.prisoners.some(p => p.type === 'werewolf');
      if (hasWerewolf) {
        return {
          ...state,
          isGameOver: true,
          gameOverReason: `部屋${room.id + 1}で狼男が暴走！月光で変身してしまった！`,
        };
      }
    }
  }
  return state;
}

// 脱獄チェック
export function checkEscapeOverflow(state: GameState): GameState {
  for (const room of state.rooms) {
    for (const prisoner of room.prisoners) {
      if (prisoner.escapeProgress >= GAME_CONFIG.ESCAPE_THRESHOLD) {
        return {
          ...state,
          isGameOver: true,
          gameOverReason: `${prisoner.name}（部屋${room.id + 1}）が脱獄！見回りが足りなかった！`,
        };
      }
    }
  }
  return state;
}

// 部屋を巡回（脱獄度リセット）
export function repairRoom(state: GameState, roomId: number): GameState {
  if (state.inspectionsRemaining <= 0) return state;

  return {
    ...state,
    inspectionsRemaining: state.inspectionsRemaining - 1,
    rooms: state.rooms.map(r =>
      r.id === roomId
        ? {
            ...r,
            lastInspected: state.day,
            prisoners: r.prisoners.map(p => ({ ...p, escapeProgress: 0 })),
          }
        : r
    ),
  };
}

// 待機囚人が多すぎるかチェック
export function checkWaitingOverflow(state: GameState): GameState {
  if (state.waitingPrisoners.length > GAME_CONFIG.MAX_WAITING_PRISONERS) {
    return {
      ...state,
      isGameOver: true,
      gameOverReason: '待機エリアが溢れた！囚人たちが暴動を起こした！',
    };
  }
  return state;
}

// 脱獄度増加処理
export function progressEscape(state: GameState): GameState {
  return {
    ...state,
    rooms: state.rooms.map(room => {
      const hasIncompatible = roomHasIncompatiblePair(room);
      const escapeIncrease = GAME_CONFIG.ESCAPE_PER_TICK + 
        (hasIncompatible ? GAME_CONFIG.ESCAPE_INCOMPATIBLE_BONUS : 0);
      
      return {
        ...room,
        prisoners: room.prisoners.map(prisoner => ({
          ...prisoner,
          escapeProgress: prisoner.escapeProgress + escapeIncrease,
        })),
      };
    }),
  };
}

// 時間経過処理
export function tickTime(state: GameState): GameState {
  if (state.isGameOver || state.isVictory) return state;

  // 脱獄度増加
  let newState = progressEscape(state);
  
  // 脱獄チェック
  newState = checkEscapeOverflow(newState);
  if (newState.isGameOver) return newState;

  newState = { ...newState, timeRemaining: newState.timeRemaining - 1 };

  // 時間帯切り替え
  if (newState.timeRemaining <= 0) {
    if (newState.timeOfDay === 'day') {
      // 昼→夜
      newState = {
        ...newState,
        timeOfDay: 'night',
        timeRemaining: GAME_CONFIG.NIGHT_DURATION,
      };
      // 夜になったら狼男チェック
      newState = checkWerewolfEscape(newState);
    } else {
      // 夜→翌日の昼
      if (newState.day >= GAME_CONFIG.TOTAL_DAYS) {
        // 3日目の夜が終わった→勝利！
        return {
          ...newState,
          isVictory: true,
        };
      }
      newState = {
        ...newState,
        day: newState.day + 1,
        timeOfDay: 'day',
        timeRemaining: GAME_CONFIG.DAY_DURATION,
        inspectionsRemaining: GAME_CONFIG.REPAIRS_PER_DAY,
      };
    }
  }

  return newState;
}

// 囚人追加（スポーン）
export function spawnPrisoner(state: GameState): GameState {
  if (state.isGameOver || state.isVictory) return state;

  const newState = {
    ...state,
    waitingPrisoners: [...state.waitingPrisoners, createPrisoner()],
  };

  return checkWaitingOverflow(newState);
}

// 旧関数名のエクスポート（互換性のため）
export const inspectRoom = repairRoom;
export const checkIncompatiblePrisoners = () => false; // 配置制限なし
