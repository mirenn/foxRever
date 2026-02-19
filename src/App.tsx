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
import { t, getLanguage, setLanguage, Language } from './i18n';

const HelpModal = ({ onClose }: { onClose: () => void }) => (
    <div className="help-modal-overlay" onClick={onClose}>
        <div className="help-modal" onClick={e => e.stopPropagation()}>
            <h2>{t('helpTitle')}</h2>

            <div className="help-step">
                <div className="help-step-icon">🗳️</div>
                <div className="help-step-text">
                    <strong>{t('helpStep1Title')}</strong><br />
                    {t('helpStep1Desc')}<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>{t('helpStep1Note')}</span>
                </div>
            </div>

            <div className="help-step">
                <div className="help-step-icon">🏠</div>
                <div className="help-step-text">
                    <strong>{t('helpStep2Title')}</strong><br />
                    {t('helpStep2Desc')}<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>{t('helpStep2Note')}</span>
                </div>
            </div>

            <div className="help-step">
                <div className="help-step-icon">👮</div>
                <div className="help-step-text">
                    <strong>{t('helpStep3Title')}</strong><br />
                    {t('helpStep3Desc')}<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>{t('helpStep3Note')}</span>
                </div>
            </div>

            <div className="help-step">
                <div className="help-step-icon">🏆</div>
                <div className="help-step-text">
                    <strong>{t('helpStep4Title')}</strong><br />
                    {t('helpStep4Desc')}<br />
                    <span style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>{t('helpStep4Note')}</span>
                </div>
            </div>

            <button className="help-close-btn" onClick={onClose}>
                {t('closeBtn')}
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
    const [lang, setLang] = useState<Language>(getLanguage());

    // 言語切替
    const toggleLanguage = useCallback(() => {
        const newLang = lang === 'ja' ? 'en' : 'ja';
        setLanguage(newLang);
        setLang(newLang);
    }, [lang]);

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
            setGameState(prev => repairRoom(prev, roomId));
            setRepairMode(false);
        } else if (selectedPrisonerId) {
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
    const base = import.meta.env.BASE_URL;
    const getPrisonerImage = (type: string) => {
        switch (type) {
            case 'werewolf': return `${base}images/werewolf_prisoner.png`;
            case 'vampire': return `${base}images/vampire_prisoner.png`;
            case 'strong': return `${base}images/normal_prisoner.png`;
            default: return `${base}images/normal_prisoner.png`;
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
            case 'werewolf': return t('typeWerewolf');
            case 'vampire': return t('typeVampire');
            case 'strong': return t('typeStrong');
            default: return t('typeNormal');
        }
    };

    // 脱獄度の色
    const getEscapeColor = (escape: number) => {
        if (escape >= 70) return '#e74c3c';
        if (escape >= 40) return '#f39c12';
        return '#27ae60';
    };

    // 言語切替ボタン
    const langToggle = (
        <button
            onClick={toggleLanguage}
            style={{
                background: 'none',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 'bold',
            }}
            title={lang === 'ja' ? 'Switch to English' : '日本語に切替'}
        >
            {lang === 'ja' ? 'EN' : 'JA'}
        </button>
    );

    // タイトル画面
    if (gameState.phase === 'title') {
        return (
            <div className="game-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                    {langToggle}
                </div>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px', textAlign: 'center' }}>
                    {t('gameTitle')}
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
                        {t('stage1Label')}
                        <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                            {t('stage1Desc')}
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
                        {t('stage2Label')}
                        <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                            {t('stage2Desc')}
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
                    {t('howToPlayBtn')}
                </button>

                {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            </div>
        );
    }

    return (
        <div className="game-container">
            {/* ヘッダー（巡回ボタン統合） */}
            <header className="game-header">
                <div className="header-left">
                    <button
                        className={`patrol-btn ${repairMode ? 'active' : ''}`}
                        onClick={handleRepairClick}
                        disabled={gameState.inspectionsRemaining <= 0}
                        title={repairMode ? t('patrolHintOn') : `${t('patrolsRemaining')}: ${gameState.inspectionsRemaining}`}
                    >
                        👮 {t('patrolLabel')}{repairMode ? ' ON' : ''} ({gameState.inspectionsRemaining}/{GAME_CONFIG.REPAIRS_PER_DAY})
                    </button>
                    <span className="stage-info" style={{ fontWeight: 'bold', color: '#f1c40f' }}>
                        STAGE {gameState.currentStage}
                    </span>
                    <span className="day">Day {gameState.day} / {GAME_CONFIG.TOTAL_DAYS}</span>
                    <span className={`time-of-day ${gameState.timeOfDay}`}>
                        {gameState.timeOfDay === 'day' ? `☀️ ${t('dayLabel')}` : `🌙 ${t('nightLabel')}`}
                    </span>
                    <span className="time-remaining">
                        {t('timeRemaining')(gameState.timeRemaining)}
                    </span>
                </div>
                <div className="header-right">
                    {langToggle}
                    <button
                        className="help-toggle-btn"
                        onClick={() => setShowHelp(true)}
                        title={t('howToPlayTooltip')}
                    >
                        ?
                    </button>
                </div>
            </header>
            {repairMode && (
                <div className="patrol-hint">
                    {t('patrolModeHint')}
                </div>
            )}

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
                    {t('waitingAreaTitle')} ({gameState.waitingPrisoners.length}/{GAME_CONFIG.MAX_WAITING_PRISONERS})
                    <span style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#95a5a6' }}>
                        {t('nextPrisoner')(spawnTimer)}
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
                            {t('noPrisoners')}
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
                    {t('compatWarning')}
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
                                <span className="room-number">{t('roomLabel')(room.id + 1)}</span>
                                {hasIncompatible && (
                                    <span title={t('incompatiblePair')} style={{ color: '#e74c3c' }}>⚠️</span>
                                )}
                                {room.hasMoonlight && (
                                    <span className="moonlight-indicator" title={t('moonlightTooltip')}>
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
                                                {t('escapeLabel')(Math.min(Math.round(prisoner.escapeProgress), 100))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {room.prisoners.length === 0 && (
                                    <div className="room-empty">
                                        {t('emptyRoom')}
                                        {selectedPrisonerId && <div style={{ marginTop: '10px' }}>{t('clickToAssign')}</div>}
                                        {repairMode && <div style={{ marginTop: '10px', color: '#3498db' }}>{t('patrolRoom')}</div>}
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
                        <h2>{gameState.isVictory ? t('victoryTitle') : t('gameOverTitle')}</h2>
                        <p>
                            {gameState.isVictory
                                ? t('victoryMsg')
                                : gameState.gameOverReason}
                        </p>

                        {/* Tweet Button */}
                        <div style={{ marginTop: '15px' }}>
                            <button
                                onClick={() => {
                                    const text = gameState.isVictory
                                        ? t('tweetVictory')(gameState.currentStage)
                                        : t('tweetDefeat')(gameState.currentStage, gameState.gameOverReason || '');
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
                                {t('postResult')}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="restart-button" onClick={handleRestart}>
                                {t('retryBtn')(gameState.currentStage === 1 ? 'Normal' : 'Hard')}
                            </button>
                            <button className="restart-button" onClick={handleBackToTitle} style={{ background: '#95a5a6' }}>
                                {t('titleBtn')}
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
