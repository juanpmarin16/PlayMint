import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, AudioLines, Flame, Heart, HelpCircle, RotateCcw, Share2, Sparkles, Trophy, Zap } from "lucide-react";

const SIZE = 5;
type Cell = { x: number; y: number };
type GameState = "ready" | "playing" | "over";
type Direction = "up" | "down" | "left" | "right";

const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;
const keyOf = (c: Cell) => `${c.x},${c.y}`;
const inside = (c: Cell) => c.x >= 0 && c.x < SIZE && c.y >= 0 && c.y < SIZE;

function randomCell(excluded: Cell[] = []): Cell {
  const options: Cell[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = { x, y };
      if (!excluded.some((other) => same(other, cell))) options.push(cell);
    }
  }
  return options[Math.floor(Math.random() * options.length)] ?? { x: 4, y: 4 };
}

function App() {
  const [status, setStatus] = useState<GameState>("ready");
  const [player, setPlayer] = useState<Cell>({ x: 2, y: 2 });
  const [mint, setMint] = useState<Cell>({ x: 3, y: 2 });
  const [hazards, setHazards] = useState<Cell[]>([{ x: 0, y: 0 }, { x: 4, y: 4 }]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("playmint-best") || 0));
  const [turn, setTurn] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState("Collect Mints. Don't get caught.");
  const [showHelp, setShowHelp] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const startGame = useCallback(() => {
    const p = { x: 2, y: 2 };
    const h1 = { x: 0, y: 0 };
    const h2 = { x: 4, y: 4 };
    setPlayer(p);
    setHazards([h1, h2]);
    setMint(randomCell([p, h1, h2]));
    setScore(0);
    setStreak(0);
    setTurn(0);
    setToast("Make your move.");
    setStatus("playing");
  }, []);

  const move = useCallback((direction: Direction) => {
    if (status !== "playing") return;
    const delta: Record<Direction, Cell> = {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
    };
    const d = delta[direction];
    const next = { x: player.x + d.x, y: player.y + d.y };
    if (!inside(next)) {
      setToast("The edge is a wall. Try another move.");
      return;
    }

    const nextTurn = turn + 1;
    const collected = same(next, mint);
    const nextScore = score + (collected ? 10 + Math.min(streak, 5) * 2 : 0);
    const nextStreak = collected ? streak + 1 : 0;

    // Every third turn, the hazards move one step closer to the player's last position.
    const movedHazards = hazards.map((hazard, index) => {
      if (nextTurn % 3 !== 0) return hazard;
      const options = [
        { x: hazard.x + (player.x > hazard.x ? 1 : player.x < hazard.x ? -1 : 0), y: hazard.y },
        { x: hazard.x, y: hazard.y + (player.y > hazard.y ? 1 : player.y < hazard.y ? -1 : 0) },
      ].filter((c) => inside(c) && !same(c, next) && !same(c, player));
      return options.length ? options[index % options.length] : hazard;
    });

    setPlayer(next);
    setTurn(nextTurn);
    setHazards(movedHazards);
    setScore(nextScore);
    setStreak(nextStreak);

    const hitHazard = movedHazards.some((h) => same(h, next));
    if (hitHazard) {
      setStatus("over");
      setToast("Oof. The chaos got you.");
      if (nextScore > best) {
        setBest(nextScore);
        localStorage.setItem("playmint-best", String(nextScore));
      }
      return;
    }

    if (collected) {
      setMint(randomCell([next, ...movedHazards]));
      setToast(nextStreak > 1 ? `Mint collected! ${nextStreak}× streak!` : "Mint collected! +10");
    } else {
      setToast(nextTurn % 3 === 0 ? "Watch out. The hazards are moving." : "Nice. Keep going.");
    }
  }, [status, player, turn, mint, score, streak, hazards, best]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys: Record<string, Direction> = {
        ArrowUp: "up", w: "up", W: "up",
        ArrowDown: "down", s: "down", S: "down",
        ArrowLeft: "left", a: "left", A: "left",
        ArrowRight: "right", d: "right", D: "right",
      };
      const direction = keys[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
      }
      if (event.key === "Enter" && status !== "playing") startGame();
      if (event.key === "Escape") setShowHelp(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move, startGame, status]);

  const shareScore = async () => {
    const text = `I scored ${score} on PlayMint: One More Move. Think you can beat me? ${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: "PlayMint — One More Move", text, url: window.location.href });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setToast("Challenge copied. Send it to a friend!");
      } else setToast(text);
    } catch {
      setToast("Your challenge is ready to share.");
    }
  };

  const onBoardTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onBoardTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  };

  const cells = Array.from({ length: SIZE * SIZE }, (_, i) => ({ x: i % SIZE, y: Math.floor(i / SIZE) }));

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="PlayMint home">
          <span className="brand-mark"><Sparkles size={18} strokeWidth={2.6} /></span>
          <span>play<span className="brand-mint">mint</span></span>
        </a>
        <div className="top-actions">
          <button className="icon-button" aria-label="Toggle sound" onClick={() => { setSoundOn(!soundOn); setToast(soundOn ? "Sound off." : "Sound effects coming soon."); }}>
            <AudioLines size={18} className={soundOn ? "active-icon" : ""} />
          </button>
          <button className="icon-button" aria-label="How to play" onClick={() => setShowHelp(!showHelp)}><HelpCircle size={19} /></button>
        </div>
      </header>

      <section className="game-layout">
        <div className="intro">
          <div className="eyebrow"><span className="live-dot" /> QUICK PLAY <span className="eyebrow-divider">/</span> DAILY ARCADE</div>
          <h1>One more<br /><span>move.</span></h1>
          <p className="subtitle">One tiny grid. A growing mess.<br className="desktop-break" /> How long can you stay in the game?</p>
          <div className="stat-row">
            <div className="stat-card">
              <span className="stat-label"><Zap size={13} /> SCORE</span>
              <strong>{score.toString().padStart(3, "0")}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label"><Trophy size={13} /> PERSONAL BEST</span>
              <strong>{best.toString().padStart(3, "0")}</strong>
            </div>
            <div className="stat-card stat-streak">
              <span className="stat-label"><Flame size={13} /> STREAK</span>
              <strong>{streak}<small>×</small></strong>
            </div>
          </div>
        </div>

        <div className="play-panel">
          <div className="board-topline">
            <div><span className="board-label">THE GRID</span><span className="turn-label">TURN {String(turn).padStart(2, "0")}</span></div>
            <span className="status-pill"><span className={status === "playing" ? "status-dot pulse" : "status-dot"} />{status === "playing" ? "IN PLAY" : status === "over" ? "GAME OVER" : "READY?"}</span>
          </div>

          <div className={`board-wrap ${status === "over" ? "board-over" : ""}`} onTouchStart={onBoardTouchStart} onTouchEnd={onBoardTouchEnd}>
            <div className="board" role="grid" aria-label="Game board">
              {cells.map((cell) => {
                const isPlayer = same(cell, player);
                const isMint = same(cell, mint);
                const hazardIndex = hazards.findIndex((h) => same(h, cell));
                const isHazard = hazardIndex >= 0;
                return (
                  <div key={keyOf(cell)} role="gridcell" className={`cell ${isPlayer ? "cell-player" : ""} ${isMint && status !== "over" ? "cell-mint" : ""} ${isHazard ? "cell-hazard" : ""}`}>
                    {isPlayer && <span className="player-token"><span /></span>}
                    {isMint && status !== "over" && <span className="mint-token"><Sparkles size={19} strokeWidth={2.7} /></span>}
                    {isHazard && <span className="hazard-token"><span /></span>}
                  </div>
                );
              })}
              {status !== "playing" && (
                <div className="board-overlay">
                  {status === "over" ? <><div className="overlay-icon danger-icon"><Flame size={25} /></div><h2>Run over.</h2><p>You scored <b>{score}</b> points.</p><button className="primary-button overlay-button" onClick={startGame}><RotateCcw size={16} /> PLAY AGAIN</button></> : <><div className="overlay-icon"><Sparkles size={25} /></div><h2>Ready when you are.</h2><p>Collect the mint. Dodge the red.</p><button className="primary-button overlay-button" onClick={startGame}><span>START RUN</span><ArrowRight size={16} /></button></>}
                </div>
              )}
            </div>
          </div>

          <div className="controls">
            <span className="controls-hint">MOVE</span>
            <div className="dpad" aria-label="Movement controls">
              <button className="dpad-button dpad-up" aria-label="Move up" onClick={() => move("up")} disabled={status !== "playing"}><ArrowUp size={18} /></button>
              <button className="dpad-button dpad-left" aria-label="Move left" onClick={() => move("left")} disabled={status !== "playing"}><ArrowLeft size={18} /></button>
              <button className="dpad-button dpad-down" aria-label="Move down" onClick={() => move("down")} disabled={status !== "playing"}><ArrowDown size={18} /></button>
              <button className="dpad-button dpad-right" aria-label="Move right" onClick={() => move("right")} disabled={status !== "playing"}><ArrowRight size={18} /></button>
            </div>
            <span className="keyboard-hint">OR USE <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
          </div>
          <div className="toast-line"><span className="toast-spark">✳</span>{toast}</div>
        </div>
      </section>

      <section className="bottom-strip">
        <div className="how-item"><span className="legend-icon mint-legend"><Sparkles size={14} /></span><span><b>Collect Mints</b><small>+10 points per mint</small></span></div>
        <div className="how-item"><span className="legend-icon hazard-legend"><span /></span><span><b>Avoid the chaos</b><small>Hazards move every 3 turns</small></span></div>
        <div className="how-item"><span className="legend-icon streak-legend"><Flame size={15} /></span><span><b>Build a streak</b><small>Keep collecting for bonus points</small></span></div>
        <button className="share-button" onClick={shareScore}><Share2 size={16} /> CHALLENGE A FRIEND</button>
      </section>

      {showHelp && <div className="modal-backdrop" onClick={() => setShowHelp(false)}><section className="help-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowHelp(false)}>×</button><div className="eyebrow">THE RULES</div><h2>Easy to learn.<br /><span>Hard to survive.</span></h2><ul><li><Sparkles size={17} /><span>Move around the grid and collect the glowing mint for points.</span></li><li><Flame size={17} /><span>Red hazards move every three turns. Don't step on them.</span></li><li><Heart size={17} /><span>Keep collecting mints to build a streak and earn bonus points.</span></li><li><Trophy size={17} /><span>Your personal best is saved on this device.</span></li></ul><button className="primary-button modal-play" onClick={() => { setShowHelp(false); if (status !== "playing") startGame(); }}>GOT IT <ArrowRight size={16} /></button></section></div>}

      <footer><span>PLAYMINT ARCADE <span className="footer-dot">•</span> BUILD YOUR STREAK</span><span>MADE FOR <b>ONE MORE MOVE.</b></span></footer>
    </main>
  );
}

export default App;
