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
