import { useEffect, useMemo, useRef, useState } from "react";

const randomCell = (occupied: number[] = []) => {
  const choices = Array.from({ length: 256 }, (_, index) => index).filter((cell) => !occupied.includes(cell));
  return choices[Math.floor(Math.random() * choices.length)] ?? 0;
};

export function SnakeGame() {
  const [snake, setSnake] = useState([136, 135, 134]);
  const [food, setFood] = useState(72);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Press start, then swipe or use the arrows.");
  const direction = useRef(1);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const turn = (next: number) => {
    if (next === -direction.current) return;
    direction.current = next;
  };

  const start = () => {
    const body = [136, 135, 134];
    direction.current = 1;
    setSnake(body);
    setFood(randomCell(body));
    setScore(0);
    setMessage("Signal acquired.");
    setRunning(true);
  };

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const turns: Record<string, number> = { ArrowUp: -16, KeyW: -16, ArrowDown: 16, KeyS: 16, ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 };
      if (turns[event.code]) { event.preventDefault(); turn(turns[event.code]); }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const next = head + direction.current;
        const crossedEdge = (direction.current === 1 && head % 16 === 15) || (direction.current === -1 && head % 16 === 0);
        if (next < 0 || next >= 256 || crossedEdge || current.includes(next)) {
          setRunning(false);
          setMessage(`Game over. Score ${score}.`);
          return current;
        }
        const grew = next === food;
        const body = [next, ...current];
        if (grew) {
          setScore((value) => value + 10);
          setFood(randomCell(body));
        } else body.pop();
        return body;
      });
    }, Math.max(82, 145 - score * 1.2));
    return () => window.clearInterval(timer);
  }, [running, food, score]);

  return (
    <div className="retro-layout snake-game">
      <div
        className="snake-board"
        tabIndex={0}
        onPointerDown={(event) => { touch.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={(event) => {
          if (!touch.current) return;
          const dx = event.clientX - touch.current.x;
          const dy = event.clientY - touch.current.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : (dy > 0 ? 16 : -16));
          touch.current = null;
        }}
        aria-label="Snake board. Swipe or use arrow keys to move."
      >
        {Array.from({ length: 256 }, (_, index) => <i className={snake.includes(index) ? (index === snake[0] ? "snake-head" : "snake-body") : index === food ? "snake-food" : ""} key={index} />)}
      </div>
      <div className="retro-sidebar">
        <div className="retro-score"><span>SCORE</span><strong>{String(score).padStart(4, "0")}</strong></div>
        <p>{message}</p>
        <button className="retro-primary" type="button" onClick={start}>{running ? "Restart" : "Start game"}</button>
        <div className="snake-pad" aria-label="Snake directional controls">
          <button type="button" onClick={() => turn(-16)} aria-label="Move up">↑</button>
          <button type="button" onClick={() => turn(-1)} aria-label="Move left">←</button>
          <button type="button" onClick={() => turn(16)} aria-label="Move down">↓</button>
          <button type="button" onClick={() => turn(1)} aria-label="Move right">→</button>
        </div>
      </div>
    </div>
  );
}

export function PongGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const startGame = useRef<() => void>(() => {});
  const running = useRef(false);
  const [score, setScore] = useState([0, 0]);
  const [message, setMessage] = useState("Move your paddle. First to five.");

  useEffect(() => {
    const surface = canvas.current!;
    const ctx = surface.getContext("2d");
    if (!ctx) return;
    const width = 480;
    const height = 320;
    let playerX = width / 2;
    let cpuX = width / 2;
    let ball = { x: width / 2, y: height / 2, vx: 190, vy: 170 };
    let points = [0, 0];
    let last = performance.now();
    let frame = 0;

    const resetBall = (direction: number) => { ball = { x: width / 2, y: height / 2, vx: (Math.random() > .5 ? 1 : -1) * 190, vy: direction * 170 }; };
    startGame.current = () => {
      points = [0, 0];
      setScore([0, 0]);
      setMessage("Match in progress.");
      resetBall(Math.random() > .5 ? 1 : -1);
      running.current = true;
      surface.focus();
    };
    const move = (clientX: number) => {
      const bounds = surface.getBoundingClientRect();
      playerX = Math.max(48, Math.min(width - 48, (clientX - bounds.left) / bounds.width * width));
    };
    const pointer = (event: PointerEvent) => move(event.clientX);
    const keyboard = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") playerX -= 30;
      if (event.code === "ArrowRight" || event.code === "KeyD") playerX += 30;
    };
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, .035);
      last = now;
      if (running.current) {
        playerX = Math.max(48, Math.min(width - 48, playerX));
        cpuX += (ball.x - cpuX) * Math.min(1, dt * 3.2);
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.x < 8 || ball.x > width - 8) ball.vx *= -1;
        if (ball.vy > 0 && ball.y > height - 33 && ball.y < height - 18 && Math.abs(ball.x - playerX) < 58) { ball.vy = -Math.abs(ball.vy) * 1.035; ball.vx += (ball.x - playerX) * 2.2; }
        if (ball.vy < 0 && ball.y < 33 && ball.y > 18 && Math.abs(ball.x - cpuX) < 58) { ball.vy = Math.abs(ball.vy) * 1.025; ball.vx += (ball.x - cpuX) * 1.8; }
        if (ball.y > height + 10 || ball.y < -10) {
          const winner = ball.y < 0 ? 0 : 1;
          points[winner]++;
          setScore([...points]);
          if (points[winner] >= 5) {
            running.current = false;
            setMessage(winner === 0 ? "You win the match." : "CPU wins. Try again.");
          } else resetBall(winner === 0 ? 1 : -1);
        }
      }
      const styles = getComputedStyle(document.documentElement);
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.fillStyle = styles.getPropertyValue("--bg");
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = styles.getPropertyValue("--line-bright");
      ctx.setLineDash([7, 8]);
      ctx.beginPath(); ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = styles.getPropertyValue("--cyan");
      ctx.fillRect(playerX - 48, height - 24, 96, 7);
      ctx.fillStyle = styles.getPropertyValue("--gold");
      ctx.fillRect(cpuX - 48, 17, 96, 7);
      ctx.fillStyle = styles.getPropertyValue("--text");
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2); ctx.fill();
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    surface.addEventListener("pointerdown", pointer);
    surface.addEventListener("pointermove", pointer);
    window.addEventListener("keydown", keyboard);
    return () => {
      running.current = false;
      cancelAnimationFrame(frame);
      surface.removeEventListener("pointerdown", pointer);
      surface.removeEventListener("pointermove", pointer);
      window.removeEventListener("keydown", keyboard);
    };
  }, []);

  return (
    <div className="pong-game">
      <div className="pong-score"><span>YOU <b>{score[0]}</b></span><span>CPU <b>{score[1]}</b></span></div>
      <canvas ref={canvas} width={960} height={640} tabIndex={0} aria-label="Pong game. Move the lower paddle by dragging or using left and right arrows." />
      <div className="retro-action-row"><p>{message}</p><button className="retro-primary" type="button" onClick={() => startGame.current()}>New match</button></div>
    </div>
  );
}

const memorySymbols = ["SYS", "NET", "HEX", "RAM", "VPN", "DNS", "SSH", "CPU"];
const makeMemoryDeck = () => [...memorySymbols, ...memorySymbols].sort(() => Math.random() - .5).map((symbol, index) => ({ id: `${symbol}-${index}`, symbol }));

export function MemoryGame() {
  const [deck, setDeck] = useState(makeMemoryDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const reset = () => { setDeck(makeMemoryDeck()); setOpen([]); setMatched([]); setMoves(0); };
  const flip = (index: number) => {
    if (open.length === 2 || open.includes(index) || matched.includes(deck[index].symbol)) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      setMoves((value) => value + 1);
      if (deck[next[0]].symbol === deck[next[1]].symbol) {
        setMatched((current) => [...current, deck[index].symbol]);
        window.setTimeout(() => setOpen([]), 300);
      } else window.setTimeout(() => setOpen([]), 650);
    }
  };

  return (
    <div className="memory-game">
      <div className="memory-grid">
        {deck.map((card, index) => {
          const visible = open.includes(index) || matched.includes(card.symbol);
          return <button type="button" className={visible ? "is-visible" : ""} onClick={() => flip(index)} aria-label={visible ? card.symbol : "Hidden memory card"} key={card.id}><span>{visible ? card.symbol : "?"}</span></button>;
        })}
      </div>
      <div className="retro-action-row"><p>{matched.length === memorySymbols.length ? `Archive cleared in ${moves} moves.` : `${matched.length} / ${memorySymbols.length} pairs · ${moves} moves`}</p><button className="retro-primary" type="button" onClick={reset}>Shuffle</button></div>
    </div>
  );
}

export function SimonGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [showing, setShowing] = useState(false);
  const [status, setStatus] = useState("Start and memorize the signal.");
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  const begin = () => {
    clearTimers();
    setInput(0);
    setStatus("Watch closely.");
    setSequence([Math.floor(Math.random() * 4)]);
    setShowing(true);
  };

  useEffect(() => {
    if (!showing || sequence.length === 0) return;
    clearTimers();
    sequence.forEach((value, index) => {
      timers.current.push(window.setTimeout(() => setActive(value), 320 + index * 650));
      timers.current.push(window.setTimeout(() => setActive(null), 690 + index * 650));
    });
    timers.current.push(window.setTimeout(() => { setShowing(false); setStatus("Repeat the sequence."); }, 780 + sequence.length * 650));
    return clearTimers;
  }, [sequence, showing]);

  const press = (value: number) => {
    if (showing || sequence.length === 0) return;
    setActive(value);
    window.setTimeout(() => setActive(null), 150);
    if (sequence[input] !== value) {
      setStatus(`Signal lost at level ${sequence.length}.`);
      setSequence([]);
      setInput(0);
      return;
    }
    if (input === sequence.length - 1) {
      setStatus("Correct. Next level.");
      setInput(0);
      timers.current.push(window.setTimeout(() => {
        setSequence((current) => [...current, Math.floor(Math.random() * 4)]);
        setShowing(true);
      }, 600));
    } else setInput((current) => current + 1);
  };

  return (
    <div className="simon-game">
      <div className="simon-console">
        {[0, 1, 2, 3].map((value) => <button type="button" className={active === value ? "is-active" : ""} onClick={() => press(value)} aria-label={`Signal ${value + 1}`} key={value}><span>{value + 1}</span></button>)}
        <div><strong>{String(sequence.length).padStart(2, "0")}</strong><span>LEVEL</span></div>
      </div>
      <div className="retro-action-row"><p>{status}</p><button className="retro-primary" type="button" onClick={begin}>Start sequence</button></div>
    </div>
  );
}

const findWinner = (board: string[]) => {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return lines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c])?.map((index) => board[index])[0] ?? "";
};

export function TicTacToeGame() {
  const [board, setBoard] = useState(Array<string>(9).fill(""));
  const [thinking, setThinking] = useState(false);
  const winner = findWinner(board);
  const full = board.every(Boolean);

  const reset = () => { setBoard(Array<string>(9).fill("")); setThinking(false); };
  const play = (index: number) => {
    if (board[index] || winner || thinking) return;
    const next = [...board];
    next[index] = "X";
    setBoard(next);
    if (!findWinner(next) && next.some((cell) => !cell)) setThinking(true);
  };

  useEffect(() => {
    if (!thinking) return;
    const timer = window.setTimeout(() => {
      setBoard((current) => {
        const empty = current.map((cell, index) => cell ? -1 : index).filter((index) => index >= 0);
        const next = [...current];
        const preferred = [4, 0, 2, 6, 8].find((index) => empty.includes(index));
        next[preferred ?? empty[Math.floor(Math.random() * empty.length)]] = "O";
        return next;
      });
      setThinking(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [thinking]);

  return (
    <div className="tic-game">
      <div className="tic-board">{board.map((cell, index) => <button type="button" onClick={() => play(index)} aria-label={`Cell ${index + 1}${cell ? `: ${cell}` : ""}`} key={index}>{cell}</button>)}</div>
      <div className="retro-action-row"><p>{winner ? `${winner === "X" ? "You win" : "CPU wins"}.` : full ? "Draw game." : thinking ? "CPU is thinking." : "You are X. Make your move."}</p><button className="retro-primary" type="button" onClick={reset}>New board</button></div>
    </div>
  );
}

export function QuickTapGame() {
  const [phase, setPhase] = useState<"idle" | "waiting" | "ready" | "result">("idle");
  const [result, setResult] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const readyAt = useRef(0);
  const best = useMemo(() => {
    try { return Number(localStorage.getItem("clerdev-reaction-best")) || 0; }
    catch { return 0; }
  }, [result]);

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  const arm = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setResult(null);
    setPhase("waiting");
    timer.current = window.setTimeout(() => {
      readyAt.current = performance.now();
      setPhase("ready");
    }, 1200 + Math.random() * 2200);
  };
  const tap = () => {
    if (phase === "waiting") {
      if (timer.current !== null) window.clearTimeout(timer.current);
      setPhase("result");
      setResult(-1);
    } else if (phase === "ready") {
      const elapsed = Math.round(performance.now() - readyAt.current);
      setResult(elapsed);
      setPhase("result");
      if (!best || elapsed < best) {
        try { localStorage.setItem("clerdev-reaction-best", String(elapsed)); } catch { /* Embedded previews may block storage. */ }
      }
    } else arm();
  };

  return (
    <div className="quick-game">
      <button type="button" className={`quick-screen is-${phase}`} onClick={tap}>
        <span>{phase === "idle" ? "READY?" : phase === "waiting" ? "WAIT…" : phase === "ready" ? "TAP!" : result === -1 ? "TOO SOON" : `${result} MS`}</span>
        <small>{phase === "idle" || phase === "result" ? "Tap to begin" : phase === "waiting" ? "Hold your nerve" : "Now"}</small>
      </button>
      <div className="retro-action-row"><p>{best ? `Personal best: ${best} ms` : "No personal best yet."}</p><button className="retro-primary" type="button" onClick={arm}>New attempt</button></div>
    </div>
  );
}
