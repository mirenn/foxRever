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
