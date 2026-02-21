/**
 * Web Audio API を使ったサウンドユーティリティ
 * 外部ファイル不要でプログラムで音を生成します
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

/**
 * ステージ1開始音
 * レトロゲーム風の上昇アルペジオ
 */
export function playStageStartSound(): void {
    try {
        const ctx = getAudioContext();

        // 和音を構成する周波数（Cメジャースケール: C4, E4, G4, C5）
        const notes = [261.63, 329.63, 392.00, 523.25];
        const startTime = ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square'; // レトロゲーム風の矩形波
            osc.frequency.value = freq;

            const noteStart = startTime + i * 0.1;
            const noteDuration = 0.15;

            // エンベロープ（音の立ち上がりと減衰）
            gain.gain.setValueAtTime(0, noteStart);
            gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

            osc.start(noteStart);
            osc.stop(noteStart + noteDuration);
        });
    } catch (e) {
        // AudioContextが利用できない場合は無音で続行
        console.warn('Sound playback failed:', e);
    }
}

/**
 * 囚人配置音（ピコッという短い音）
 */
export function playDropSound(): void {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine'; // 少し丸みのある音
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1); // ピッチダウン

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.warn('Sound playback failed:', e);
    }
}

/**
 * 警報音（ビーッビーッという警告音）
 */
export function playWarningSound(): void {
    try {
        const ctx = getAudioContext();
        
        // 2回のビープ音を鳴らす
        for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth'; // 鋭角なノコギリ波
            osc.frequency.setValueAtTime(440, ctx.currentTime + i * 0.3); // A4
            
            // ビブラート効果（少し揺らす）
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 8;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 20;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(ctx.currentTime + i * 0.3);
            lfo.stop(ctx.currentTime + i * 0.3 + 0.2);

            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.3);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.3 + 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.3 + 0.2);

            osc.start(ctx.currentTime + i * 0.3);
            osc.stop(ctx.currentTime + i * 0.3 + 0.2);
        }
    } catch (e) {
        console.warn('Sound playback failed:', e);
    }
}

/**
 * ゲームオーバー音（デロデロデロンという下降音）
 */
export function playGameOverSound(): void {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle'; // 少しこもった音
        
        // 周波数を段階的に下げる
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.0);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.warn('Sound playback failed:', e);
    }
}

/**
 * 修理音（カキンッという金属っぽい音）
 */
export function playRepairSound(): void {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        // 高い音から素早く下がる
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.warn('Sound playback failed:', e);
    }
}

/**
 * BGMの管理
 */
let bgmOscillators: OscillatorNode[] = [];
let bgmInterval: number | null = null;
let currentBGMType: 'day' | 'night' | null = null;

export function stopBGM(): void {
    if (bgmInterval !== null) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
    bgmOscillators.forEach(osc => {
        try {
            osc.stop();
            osc.disconnect();
        } catch (e) {
            // すでに停止している場合は無視
        }
    });
    bgmOscillators = [];
    currentBGMType = null;
}

function playSequence(sequence: { freq: number, duration: number, type: OscillatorType, vol: number }[], tempo: number): void {
    const ctx = getAudioContext();
    const beatDuration = 60 / tempo; // 1拍の秒数（四分音符）
    const stepDuration = beatDuration / 4; // 1ステップ（十六分音符）

    // より安定するAudioContextベースのスケジューリング（一定周期で先読み予約するルーパー）
    if (bgmInterval !== null) clearInterval(bgmInterval);
    
    let nextNoteTime = ctx.currentTime + 0.1;
    let currentNoteIndex = 0;
    const lookahead = 25.0; // ミリ秒
    const scheduleAheadTime = 0.1; // 秒
    
    function nextNote() {
        const note = sequence[currentNoteIndex];
        // durationはステップ数（16分音符単位）
        nextNoteTime += stepDuration * note.duration;
        currentNoteIndex++;
        if (currentNoteIndex >= sequence.length) {
            currentNoteIndex = 0;
        }
    }

    function scheduleNote(noteIndex: number, time: number) {
        const note = sequence[noteIndex];
        if (note.freq <= 0) return; // 休符

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = note.type;
        osc.frequency.value = note.freq;

        osc.connect(gain);
        gain.connect(ctx.destination);

        // レトロ風のアタックとディケイ
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(note.vol, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + (stepDuration * note.duration) - 0.02);

        osc.start(time);
        osc.stop(time + (stepDuration * note.duration));

        bgmOscillators.push(osc);
        
        // 古いオシレーターを定期的に掃除
        if (bgmOscillators.length > 20) {
            bgmOscillators.shift();
        }
    }

    function scheduler() {
        while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
            scheduleNote(currentNoteIndex, nextNoteTime);
            nextNote();
        }
    }

    bgmInterval = window.setInterval(scheduler, lookahead);
}

export function startDayBGM(): void {
    if (currentBGMType === 'day') return;
    stopBGM();
    currentBGMType = 'day';

    // Cメジャースケールのベースライン（ドドララソソドード・休符入り）
    const freqC2 = 65.41;
    const freqG2 = 98.00;
    const freqA2 = 110.00;
    // メロディ用（ドレミファソ）
    const freqC4 = 261.63;
    const freqE4 = 329.63;
    const freqG4 = 392.00;

    const sequence: { freq: number, duration: number, type: OscillatorType, vol: number }[] = [
        { freq: freqC2, duration: 2, type: 'square', vol: 0.1 },
        { freq: 0,      duration: 2, type: 'square', vol: 0.0 }, // 休符
        { freq: freqG2, duration: 2, type: 'square', vol: 0.1 },
        { freq: 0,      duration: 2, type: 'square', vol: 0.0 },
        { freq: freqA2, duration: 2, type: 'square', vol: 0.1 },
        { freq: freqG2, duration: 2, type: 'square', vol: 0.1 },
        { freq: freqC2, duration: 4, type: 'square', vol: 0.1 },

        // 変化をつける
        { freq: freqC2, duration: 2, type: 'square', vol: 0.1 },
        { freq: freqC4, duration: 2, type: 'triangle', vol: 0.05 }, // ポン
        { freq: freqG2, duration: 2, type: 'square', vol: 0.1 },
        { freq: freqG4, duration: 2, type: 'triangle', vol: 0.05 }, // ポン
        { freq: freqA2, duration: 2, type: 'square', vol: 0.1 },
        { freq: freqE4, duration: 2, type: 'triangle', vol: 0.05 }, // ポン
        { freq: freqC2, duration: 4, type: 'square', vol: 0.1 },
    ];

    playSequence(sequence, 130); // テンポ少し早め
}

export function startNightBGM(): void {
    if (currentBGMType === 'night') return;
    stopBGM();
    currentBGMType = 'night';

    // 暗いマイナースケール（Aマイナー）
    const freqA1 = 55.00;
    const freqE2 = 82.41;
    const freqF2 = 87.31;
    const freqA3 = 220.00;
    const freqC4 = 261.63;
    const freqE4 = 329.63;

    // 低くゆっくりとしたベースと、時折鳴る不気味な高音
    const sequence: { freq: number, duration: number, type: OscillatorType, vol: number }[] = [
        { freq: freqA1, duration: 8, type: 'triangle', vol: 0.2 },
        { freq: freqE2, duration: 8, type: 'triangle', vol: 0.15 },
        { freq: freqF2, duration: 8, type: 'triangle', vol: 0.15 },
        { freq: freqE2, duration: 8, type: 'triangle', vol: 0.15 },
        
        { freq: freqA1, duration: 8, type: 'triangle', vol: 0.2 },
        { freq: freqA3, duration: 2, type: 'sine', vol: 0.05 }, // キン
        { freq: freqC4, duration: 2, type: 'sine', vol: 0.05 }, // コン
        { freq: freqE4, duration: 4, type: 'sine', vol: 0.05 }, // カン
        
        { freq: freqF2, duration: 8, type: 'triangle', vol: 0.15 },
        { freq: freqE2, duration: 8, type: 'triangle', vol: 0.15 },
    ];

    playSequence(sequence, 90); // テンポ遅め
}
