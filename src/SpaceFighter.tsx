import { useEffect, useRef, useState } from "react";
import "./space-fighter.css";

type Phase = "ready" | "playing" | "paused" | "over";
type Enemy = { x: number; y: number; drift: number; age: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number };
const WIDTH = 480;
const HEIGHT = 520;

export default function SpaceFighter({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const phase = useRef<Phase>("ready");
  const restart = useRef<() => void>(() => {});
  const [screen, setScreen] = useState<Phase>("ready");
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1 });
  const [best, setBest] = useState(() => {
    try { return Number(localStorage.getItem("clerdev-flight-best")) || 0; }
    catch { return 0; }
  });
  const bestRef = useRef(best);

  const changePhase = (next: Phase) => {
    phase.current = next;
    setScreen(next);
  };

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const surface = canvas.current!;
    const ctx = surface.getContext("2d");
    if (!ctx) return;
    const tokens = getComputedStyle(document.documentElement);
    const color = (name: string) => tokens.getPropertyValue(name).trim();
    const colors = { bg: color("--bg"), cyan: color("--cyan"), gold: color("--gold"), text: color("--text"), muted: color("--muted"), violet: color("--violet") };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const keys = new Set<string>();
    let shipX = WIDTH / 2;
    let targetX: number | null = null;
    let dragging = false;
    let bullets: { x: number; y: number }[] = [];
    let enemies: Enemy[] = [];
    let particles: Particle[] = [];
    let score = 0;
    let lives = 3;
    let elapsed = 0;
    let invulnerable = 0;
    let shotTimer = 0;
    let spawnTimer = .6;
    let hudTimer = 0;
    let last = performance.now();
    let frame = 0;
    const stars = Array.from({ length: 65 }, (_, i) => ({ x: (i * 137 + 29) % WIDTH, y: (i * 79 + 43) % HEIGHT, size: i % 3 === 0 ? 1.6 : .8 }));

    restart.current = () => {
      shipX = WIDTH / 2;
      targetX = null;
      keys.clear();
      bullets = [];
      enemies = [];
      particles = [];
      score = 0;
      lives = 3;
      elapsed = 0;
      invulnerable = 0;
      shotTimer = 0;
      spawnTimer = .6;
      setHud({ score: 0, lives: 3, wave: 1 });
      changePhase("playing");
      surface.focus();
    };

    const pause = () => {
      keys.clear();
      dragging = false;
      targetX = null;
      if (phase.current === "playing") changePhase("paused");
    };
    const onVisibility = () => { if (document.hidden) pause(); };
    const keyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLButtonElement && (event.code === "Space" || event.code === "Enter")) return;
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD", "Space", "KeyP"].includes(event.code)) {
        event.preventDefault();
        if (event.code === "KeyP" && !event.repeat) {
          if (phase.current === "playing") pause();
          else if (phase.current === "paused") changePhase("playing");
        }
        keys.add(event.code);
        targetX = null;
      }
    };
    const keyUp = (event: KeyboardEvent) => keys.delete(event.code);
    const aim = (event: PointerEvent) => {
      const bounds = surface.getBoundingClientRect();
      targetX = Math.max(22, Math.min(WIDTH - 22, (event.clientX - bounds.left) / bounds.width * WIDTH));
    };
    const pointerDown = (event: PointerEvent) => {
      if (phase.current !== "playing") return;
      dragging = true;
      surface.setPointerCapture(event.pointerId);
      surface.focus();
      aim(event);
    };
    const pointerMove = (event: PointerEvent) => { if (dragging) aim(event); };
    const pointerUp = () => { dragging = false; };
    const explode = (x: number, y: number) => {
      if (reducedMotion) return;
      for (let i = 0; i < 12; i++) {
        const angle = i / 12 * Math.PI * 2;
        particles.push({ x, y, vx: Math.cos(angle) * 85, vy: Math.sin(angle) * 85, life: .45 });
      }
    };
    const damage = () => {
      if (invulnerable > 0) return;
      lives--;
      invulnerable = 1.2;
      explode(shipX, HEIGHT - 48);
      if (lives <= 0) {
        changePhase("over");
        if (score > bestRef.current) {
          bestRef.current = score;
          setBest(score);
          try { localStorage.setItem("clerdev-flight-best", String(score)); } catch { /* Storage may be unavailable in embedded previews. */ }
        }
      }
    };
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, .035);
      last = now;
      const wave = Math.floor(score / 1000) + 1;
      if (phase.current === "playing") {
        elapsed += dt;
        invulnerable = Math.max(0, invulnerable - dt);
        const direction = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
        shipX += direction * 320 * dt;
        if (targetX !== null) shipX += (targetX - shipX) * Math.min(1, dt * 18);
        shipX = Math.max(22, Math.min(WIDTH - 22, shipX));
        shotTimer -= dt;
        if (shotTimer <= 0) {
          bullets.push({ x: shipX, y: HEIGHT - 68 });
          shotTimer = .18;
        }
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          enemies.push({ x: 28 + Math.random() * (WIDTH - 56), y: -24, drift: Math.random() * Math.PI * 2, age: 0 });
          spawnTimer = Math.max(.28, .9 - wave * .06);
        }
        bullets.forEach((bullet) => { bullet.y -= 420 * dt; });
        enemies.forEach((enemy) => {
          enemy.age += dt;
          enemy.y += (65 + Math.min(wave, 15) * 12) * dt;
          enemy.x = Math.max(20, Math.min(WIDTH - 20, enemy.x + Math.sin(enemy.age * 2 + enemy.drift) * 35 * dt));
          const hit = bullets.find((bullet) => Math.abs(bullet.x - enemy.x) < 20 && Math.abs(bullet.y - enemy.y) < 23);
          if (hit) {
            hit.y = -100;
            explode(enemy.x, enemy.y);
            enemy.y = HEIGHT + 80;
            score += 100;
          } else if (Math.abs(enemy.x - shipX) < 30 && Math.abs(enemy.y - (HEIGHT - 48)) < 28) {
            enemy.y = HEIGHT + 80;
            damage();
          } else if (enemy.y > HEIGHT + 20 && enemy.y < HEIGHT + 70) {
            enemy.y = HEIGHT + 80;
            damage();
          }
        });
        bullets = bullets.filter((bullet) => bullet.y > -20);
        enemies = enemies.filter((enemy) => enemy.y < HEIGHT + 70);
        particles.forEach((particle) => { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.life -= dt; });
        particles = particles.filter((particle) => particle.life > 0);
        hudTimer += dt;
        if (hudTimer > .1 || lives <= 0) {
          hudTimer = 0;
          setHud({ score, lives, wave: Math.floor(score / 1000) + 1 });
        }
      }
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      stars.forEach((star) => {
        ctx.fillStyle = colors.muted;
        ctx.globalAlpha = .4 + star.size * .2;
        ctx.fillRect(star.x, (star.y + (reducedMotion ? 0 : elapsed * 26)) % HEIGHT, star.size, star.size);
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.cyan;
      ctx.globalAlpha = .12;
      ctx.beginPath();
      ctx.arc(WIDTH / 2, HEIGHT / 2, 160, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      bullets.forEach((bullet) => {
        ctx.fillStyle = colors.cyan;
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 14);
      });
      enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.fillStyle = colors.violet;
        ctx.strokeStyle = colors.gold;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 19); ctx.lineTo(-19, -10); ctx.lineTo(-7, -5); ctx.lineTo(0, -17); ctx.lineTo(7, -5); ctx.lineTo(19, -10);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.gold;
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      });
      particles.forEach((particle) => {
        ctx.globalAlpha = particle.life / .45;
        ctx.fillStyle = colors.gold;
        ctx.fillRect(particle.x, particle.y, 3, 3);
      });
      ctx.globalAlpha = invulnerable > 0 ? .5 : 1;
      ctx.save();
      ctx.translate(shipX, HEIGHT - 48);
      ctx.fillStyle = colors.cyan;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -23); ctx.lineTo(19, 16); ctx.lineTo(6, 10); ctx.lineTo(0, 16); ctx.lineTo(-6, 10); ctx.lineTo(-19, 16);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = colors.gold;
      ctx.beginPath(); ctx.moveTo(-4, 18); ctx.lineTo(0, 28); ctx.lineTo(4, 18); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    surface.addEventListener("pointerdown", pointerDown);
    surface.addEventListener("pointermove", pointerMove);
    surface.addEventListener("pointerup", pointerUp);
    surface.addEventListener("pointercancel", pointerUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
      surface.removeEventListener("pointerdown", pointerDown);
      surface.removeEventListener("pointermove", pointerMove);
      surface.removeEventListener("pointerup", pointerUp);
      surface.removeEventListener("pointercancel", pointerUp);
    };
  }, []);

  return (
    <dialog className="fighter-dialog" ref={dialog} aria-labelledby="fighter-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="fighter-header">
        <div><span className="fighter-kicker">SECRET SECTOR / CLERDEV ARCADE</span><h2 id="fighter-title">Starfighter<span>.</span></h2></div>
        <button className="fighter-close" type="button" onClick={onClose} aria-label="Close Starfighter">×</button>
      </div>
      <div className="fighter-hud"><span>SCORE <b>{String(hud.score).padStart(5, "0")}</b></span><span>WAVE <b>{String(hud.wave).padStart(2, "0")}</b></span><span>SHIELDS <b>{hud.lives} / 3</b></span></div>
      <div className="fighter-field">
        <canvas ref={canvas} width={WIDTH * 2} height={HEIGHT * 2} tabIndex={0} aria-label="Starfighter playfield. Move with left and right arrows, A and D, or drag. Your ship fires automatically. P pauses." />
        {screen !== "playing" && <div className="fighter-overlay">
          <span className="fighter-kicker">{screen === "ready" ? "EASTER EGG DISCOVERED" : screen === "paused" ? "FLIGHT ON HOLD" : "MISSION COMPLETE"}</span>
          <h3>{screen === "ready" ? "Ready, pilot?" : screen === "paused" ? "Take a breath." : "One more flight?"}</h3>
          <p>{screen === "ready" ? "Defend the stars. Dodge the invaders. See how far you can fly." : screen === "paused" ? "Your ship is safe. Resume when you're ready." : `You scored ${hud.score} points. The universe is waiting for your next attempt.`}</p>
          <button className="button" type="button" onClick={() => screen === "paused" ? changePhase("playing") : restart.current()}>{screen === "paused" ? "Resume flight" : screen === "over" ? "Fly again" : "Launch mission"}</button>
          <small>PERSONAL BEST / {String(best).padStart(5, "0")}</small>
        </div>}
      </div>
      <div className="fighter-controls"><p><strong>Auto-fire enabled</strong><span>← → / A D to steer · Drag on touch · P to pause</span></p><button type="button" disabled={screen !== "playing" && screen !== "paused"} onClick={() => changePhase(screen === "playing" ? "paused" : "playing")}>{screen === "paused" ? "Resume" : "Pause"}</button></div>
      <span className="fighter-status" role="status">{screen === "over" ? `Game over. Final score ${hud.score}.` : screen === "paused" ? "Game paused." : screen === "playing" ? "Mission launched." : "Ready to launch."}</span>
    </dialog>
  );
}
