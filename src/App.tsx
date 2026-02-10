import { useState, useEffect, useCallback } from 'react';
import { GameState, GAME_CONFIG } from './types';
import {
    createInitialState,
    startGameState,
    placePrisoner,
    tickTime,
    spawnPrisoner,
    checkWerewolfEscape,
    repairRoom,
    roomHasIncompatiblePair,
} from './gameLogic';

const HelpModal = ({ onClose }: { onClose: () => void }) => (
    <div className="help-modal-overlay" onClick={onClose}>
        <div className="help-modal" onClick={e => e.stopPropagation()}>
            <h2>📖 遊び方</h2>

            <div className="help-step">
                <div className="help-step-icon">🗳️</div>
                <div className="help-step-text">
                    <strong>1. 囚人を選択</strong><br />
                    待機エリアの囚人をクリックします。<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>※点滅している囚人が選べます</span>
                </div>
            </div>

            <div className="help-step">
                <div className="help-step-icon">🏠</div>
                <div className="help-step-text">
                    <strong>2. 部屋に配置</strong><br />
                    光っている部屋（空きあり）をクリックして入れます。<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>※定員は1部屋2名まで</span>
                </div>
            </div>

            <div className="help-step">
                <div className="help-step-icon">👮</div>
                <div className="help-step-text">
                    <strong>3. 巡回して鎮める</strong><br />
                    「巡回」ボタンで、1日2回まで部屋の脱獄度を0にリセットできます。<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>※脱獄寸前の部屋を鎮めましょう！</span>
                </div>
            </div>

            <div className="help-step">
                <div className="help-step-icon">🏆</div>
                <div className="help-step-text">
                    <strong>4. クリア条件</strong><br />
                    3日間、脱獄を防ぎきれば勝利です！<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>※夜の変身や相性にも注意...</span>
                </div>
            </div>

            <button className="help-close-btn" onClick={onClose}>
                閉じる
            </button>
        </div>
    </div>
);

function App() {
    const [gameState, setGameState] = useState<GameState>(createInitialState());
    const [selectedPrisonerId, setSelectedPrisonerId] = useState<string | null>(null);
    const [spawnTimer, setSpawnTimer] = useState(GAME_CONFIG.PRISONER_SPAWN_INTERVAL);
    const [repairMode, setRepairMode] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // ゲームループ（1秒ごと）
    useEffect(() => {
        if (gameState.phase !== 'playing') return;

        const interval = setInterval(() => {
            setGameState(prev => tickTime(prev));
            setSpawnTimer(prev => {
                if (prev <= 1) {
                    setGameState(prevState => spawnPrisoner(prevState));
                    return GAME_CONFIG.PRISONER_SPAWN_INTERVAL;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState.phase]);

    // 夜になった瞬間に狼男チェック
    useEffect(() => {
        if (gameState.phase === 'playing' && gameState.timeOfDay === 'night' && !gameState.isGameOver) {
            setGameState(prev => checkWerewolfEscape(prev));
        }
    }, [gameState.phase, gameState.timeOfDay, gameState.isGameOver]);

    // 部屋クリック処理
    const handleRoomClick = useCallback((roomId: number) => {
        if (gameState.phase !== 'playing') return;

        if (repairMode) {
            // 修理モード
            setGameState(prev => repairRoom(prev, roomId));
            setRepairMode(false);
        } else if (selectedPrisonerId) {
            // 配置モード
            setGameState(prev => placePrisoner(prev, selectedPrisonerId, roomId));
            setSelectedPrisonerId(null);
        }
    }, [gameState.phase, selectedPrisonerId, repairMode]);

    // 囚人を選択
    const handlePrisonerClick = useCallback((prisonerId: string) => {
        if (gameState.phase !== 'playing') return;
        setRepairMode(false);
        setSelectedPrisonerId(prev => prev === prisonerId ? null : prisonerId);
    }, [gameState.phase]);

    // 修理モード切替
    const handleRepairClick = useCallback(() => {
        if (gameState.phase !== 'playing') return;
        setSelectedPrisonerId(null);
        setRepairMode(prev => !prev);
    }, [gameState.phase]);

    // ステージ選択・ゲーム開始
    const handleStartGame = useCallback((stage: number) => {
        setGameState(startGameState(stage));
        setSelectedPrisonerId(null);
        setSpawnTimer(GAME_CONFIG.PRISONER_SPAWN_INTERVAL);
        setRepairMode(false);
    }, []);

    // タイトルに戻る
    const handleBackToTitle = useCallback(() => {
        setGameState(createInitialState());
        setSelectedPrisonerId(null);
        setRepairMode(false);
    }, []);

    // リスタート（同じステージ）
    const handleRestart = useCallback(() => {
        setGameState(startGameState(gameState.currentStage));
        setSelectedPrisonerId(null);
        setSpawnTimer(GAME_CONFIG.PRISONER_SPAWN_INTERVAL);
        setRepairMode(false);
    }, [gameState.currentStage]);

    // 囚人画像パス取得
    const getPrisonerImage = (type: string) => {
        switch (type) {
            case 'werewolf': return '/images/werewolf_prisoner.png';
            case 'vampire': return '/images/vampire_prisoner.png';
            case 'strong': return '/images/normal_prisoner.png';
            default: return '/images/normal_prisoner.png';
        }
    };

    // 囚人アイコン取得（フォールバック用）
    const getPrisonerIcon = (type: string) => {
        switch (type) {
            case 'werewolf': return '🐺';
            case 'vampire': return '🧛';
            case 'strong': return '💪';
            default: return '👤';
        }
    };

    // 囚人タイプ名取得
    const getPrisonerTypeName = (type: string) => {
        switch (type) {
            case 'werewolf': return '狼男';
            case 'vampire': return 'バンパイア';
            case 'strong': return '力持ち';
            default: return '普通';
        }
    };

    // 脱獄度の色
    const getEscapeColor = (escape: number) => {
        if (escape >= 70) return '#e74c3c';
        if (escape >= 40) return '#f39c12';
        return '#27ae60';
    };

    // タイトル画面
    if (gameState.phase === 'title') {
        return (
            <div className="game-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px', textAlign: 'center' }}>
                    🏛️ 囚人管理シミュレーター
                </h1>

                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '300px' }}>
                    <button
                        onClick={() => handleStartGame(1)}
                        style={{
                            padding: '20px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            background: '#2ecc71',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            boxShadow: '0 4px 0 #27ae60'
                        }}
                    >
                        ステージ 1 : Normal
                        <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                            基本ルール・力持ちなし
                        </div>
                    </button>

                    <button
                        disabled={true}
                        style={{
                            padding: '20px',
                            fontSize: '1.2rem',
                            cursor: 'not-allowed',
                            background: '#95a5a6',
                            color: '#bdc3c7',
                            border: 'none',
                            borderRadius: '10px',
                            boxShadow: 'none'
                        }}
                    >
                        ステージ 2 : Hard (準備中)
                        <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                            調整中のためプレイ不可
                        </div>
                    </button>
                </div>

                <button
                    onClick={() => setShowHelp(true)}
                    style={{
                        marginTop: '10px',
                        background: 'none',
                        border: '2px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1rem'
                    }}
                >
                    ❓ 遊び方を見る
                </button>

                {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            </div>
        );
    }

    return (
        <div className="game-container">
            {/* ヘッダー */}
            <header className="game-header" style={{ position: 'relative' }}>
                <div className="time-display">
                    <span className="stage-info" style={{ marginRight: '15px', fontWeight: 'bold', color: '#f1c40f' }}>
                        STAGE {gameState.currentStage}
                    </span>
                    <span className="day">Day {gameState.day} / {GAME_CONFIG.TOTAL_DAYS}</span>
                    <span className={`time-of-day ${gameState.timeOfDay}`}>
                        {gameState.timeOfDay === 'day' ? '☀️ 昼' : '🌙 夜'}
                    </span>
                    <span className="time-remaining">
                        残り {gameState.timeRemaining}秒
                    </span>
                </div>
                <button
                    className="help-toggle-btn"
                    onClick={() => setShowHelp(true)}
                    title="遊び方"
                    style={{ position: 'absolute', right: '20px', top: '20px' }}
                >
                    ?
                </button>
            </header>

            {/* 巡回ボタン (Old Repair Button) */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button
                    onClick={handleRepairClick}
                    style={{
                        background: repairMode ? '#e74c3c' : 'linear-gradient(135deg, #3498db, #2980b9)',
                        border: 'none',
                        color: 'white',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        cursor: gameState.inspectionsRemaining > 0 ? 'pointer' : 'not-allowed',
                        opacity: gameState.inspectionsRemaining > 0 ? 1 : 0.5,
                    }}
                    disabled={gameState.inspectionsRemaining <= 0}
                >
                    👮 巡回 {repairMode ? '(ON)' : ''}
                </button>
                <span style={{ color: '#95a5a6' }}>
                    残り巡回回数: {gameState.inspectionsRemaining} / {GAME_CONFIG.REPAIRS_PER_DAY}
                </span>
                {repairMode && (
                    <span style={{ color: '#f39c12' }}>
                        ← 部屋をクリックして脱獄度を0にする
                    </span>
                )}
            </div>

            {/* 待機エリア */}
            <section
                className="waiting-area"
                style={{
                    border: gameState.waitingPrisoners.length >= GAME_CONFIG.MAX_WAITING_PRISONERS ? '3px solid #e74c3c' : undefined,
                    backgroundColor: gameState.waitingPrisoners.length >= GAME_CONFIG.MAX_WAITING_PRISONERS ? 'rgba(231, 76, 60, 0.1)' : undefined,
                    boxShadow: gameState.waitingPrisoners.length >= GAME_CONFIG.MAX_WAITING_PRISONERS ? '0 0 15px rgba(231, 76, 60, 0.5)' : undefined,
                    transition: 'all 0.3s ease',
                    animation: gameState.waitingPrisoners.length >= GAME_CONFIG.MAX_WAITING_PRISONERS ? 'pulse-red 2s infinite' : undefined
                }}
            >
                <h2>
                    📥 待機エリア ({gameState.waitingPrisoners.length}/{GAME_CONFIG.MAX_WAITING_PRISONERS})
                    <span style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#95a5a6' }}>
                        次の囚人まで: {spawnTimer}秒
                    </span>
                </h2>
                <div className="waiting-prisoners">
                    {gameState.waitingPrisoners.map(prisoner => (
                        <div
                            key={prisoner.id}
                            className={`prisoner-card ${prisoner.type} ${selectedPrisonerId === prisoner.id ? 'selected' : ''} ${!selectedPrisonerId && !repairMode ? 'interactive' : ''}`}
                            onClick={() => handlePrisonerClick(prisoner.id)}
                        >
                            <div className="prisoner-icon">
                                <img src={getPrisonerImage(prisoner.type)} alt={getPrisonerIcon(prisoner.type)} className="prisoner-img" />
                            </div>
                            <div className="prisoner-name">{prisoner.name}</div>
                            <div className={`prisoner-type ${prisoner.type}`}>
                                {getPrisonerTypeName(prisoner.type)}
                            </div>
                        </div>
                    ))}
                    {gameState.waitingPrisoners.length === 0 && (
                        <div style={{ color: '#7f8c8d', padding: '20px' }}>
                            待機中の囚人はいません
                        </div>
                    )}
                </div>
            </section>

            {/* 相性警告 */}
            {selectedPrisonerId && (
                <div style={{
                    background: 'rgba(243, 156, 18, 0.2)',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    color: '#f39c12'
                }}>
                    ⚠️ 狼男🐺とバンパイア🧛を同室にすると脱獄度が急上昇します！
                </div>
            )}

            {/* 部屋グリッド */}
            <main className="prison-grid">
                {gameState.rooms.map(room => {
                    const maxEscape = Math.max(0, ...room.prisoners.map(p => p.escapeProgress));
                    const hasIncompatible = roomHasIncompatiblePair(room);
                    const isFull = room.prisoners.length >= room.capacity;
                    const isValidTarget = selectedPrisonerId && !isFull;
                    const isInvalidTarget = selectedPrisonerId && isFull;

                    return (
                        <div
                            key={room.id}
                            className={`room ${room.hasMoonlight ? 'moonlight' : ''} ${room.hasMoonlight && gameState.timeOfDay === 'night' ? 'night' : ''} ${isValidTarget ? 'valid-target' : ''} ${isInvalidTarget ? 'invalid-target' : ''}`}
                            onClick={() => handleRoomClick(room.id)}
                            style={{
                                cursor: repairMode ? 'crosshair' : (selectedPrisonerId && room.prisoners.length < room.capacity ? 'pointer' : 'default'),
                                border: repairMode ? '2px solid #3498db' : (hasIncompatible ? '2px solid #e74c3c' : undefined),
                            }}
                        >
                            <div className="room-header">
                                <span className="room-number">部屋 {room.id + 1}</span>
                                {hasIncompatible && (
                                    <span title="相性悪い組み合わせ！" style={{ color: '#e74c3c' }}>⚠️</span>
                                )}
                                {room.hasMoonlight && (
                                    <span className="moonlight-indicator" title="夜に月光が差し込む">
                                        🌙
                                    </span>
                                )}
                                <span className="room-capacity">
                                    {room.prisoners.length}/{room.capacity}
                                </span>
                            </div>

                            {/* 脱獄度バー */}
                            {room.prisoners.length > 0 && (
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '4px',
                                    height: '8px',
                                    marginBottom: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${Math.min(maxEscape, 100)}%`,
                                        height: '100%',
                                        background: getEscapeColor(maxEscape),
                                        transition: 'width 0.3s, background 0.3s'
                                    }} />
                                </div>
                            )}

                            <div className="room-prisoners">
                                {room.prisoners.map(prisoner => (
                                    <div key={prisoner.id} className={`prisoner-card ${prisoner.type}`}>
                                        <div className="prisoner-icon">
                                            <img src={getPrisonerImage(prisoner.type)} alt={getPrisonerIcon(prisoner.type)} className="prisoner-img" />
                                        </div>
                                        <div className="prisoner-name">{prisoner.name}</div>
                                        <div className={`prisoner-type ${prisoner.type}`}>
                                            {getPrisonerTypeName(prisoner.type)}
                                        </div>
                                        {gameState.currentStage !== 1 && (
                                            <div style={{
                                                fontSize: '0.7rem',
                                                color: getEscapeColor(prisoner.escapeProgress),
                                                marginTop: '4px'
                                            }}>
                                                脱獄度: {Math.min(Math.round(prisoner.escapeProgress), 100)}%
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {room.prisoners.length === 0 && (
                                    <div className="room-empty">
                                        空室
                                        {selectedPrisonerId && <div style={{ marginTop: '10px' }}>クリックで配置</div>}
                                        {repairMode && <div style={{ marginTop: '10px', color: '#3498db' }}>巡回する</div>}
                                    </div>
                                )}
                            </div>
                            {isInvalidTarget && <div className="room-full-indicator">FULL</div>}
                        </div>
                    );
                })}
            </main>

            {/* ゲームオーバー・勝利画面 */}
            {(gameState.phase === 'result') && (
                <div className="game-overlay">
                    <div className={`game-result ${gameState.isVictory ? 'victory' : 'game-over'}`}>
                        <h2>{gameState.isVictory ? '🎉 勝利！' : '💀 ゲームオーバー'}</h2>
                        <p>
                            {gameState.isVictory
                                ? '3日間、暴動を防ぎました！'
                                : gameState.gameOverReason}
                        </p>

                        {/* Tweet Button */}
                        <div style={{ marginTop: '15px' }}>
                            <button
                                onClick={() => {
                                    const text = gameState.isVictory
                                        ? `囚人管理シミュレーター(Stage ${gameState.currentStage})をクリアしました！暴動を防ぎきった！`
                                        : `囚人管理シミュレーター(Stage ${gameState.currentStage})でゲームオーバー... ${gameState.gameOverReason}`;
                                    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text + " #PrisonerManager");
                                    window.open(url, '_blank');
                                }}
                                style={{
                                    background: '#1DA1F2',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    margin: '0 auto'
                                }}
                            >
                                🐦 結果をポストする
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="restart-button" onClick={handleRestart}>
                                🔄 もう一度 ({gameState.currentStage === 1 ? 'Normal' : 'Hard'})
                            </button>
                            <button className="restart-button" onClick={handleBackToTitle} style={{ background: '#95a5a6' }}>
                                🏠 タイトルへ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </div>
    );
}

export default App;
