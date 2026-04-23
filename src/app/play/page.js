"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

export default function Play() {
  const { data: session } = useSession();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const requestRef = useRef();

  // Game state refs (to avoid stale closures in requestAnimationFrame)
  const state = useRef({
    player: { x: 175, y: 450, width: 30, height: 30, speed: 5, dx: 0 },
    obstacles: [],
    score: 0,
    speedMultiplier: 1,
    frameCount: 0,
    isGameOver: false,
    keys: { ArrowLeft: false, ArrowRight: false }
  });

  const startGame = () => {
    state.current = {
      player: { x: 185, y: 450, width: 30, height: 30, speed: 6, dx: 0 },
      obstacles: [],
      score: 0,
      speedMultiplier: 1,
      frameCount: 0,
      isGameOver: false,
      keys: { ArrowLeft: false, ArrowRight: false }
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setSubmitted(false);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    if (state.current.isGameOver) return;

    const ctx = canvasRef.current.getContext('2d');
    const { player, obstacles } = state.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, 400, 500);

    // Update Player position
    if (state.current.keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed;
    }
    if (state.current.keys.ArrowRight && player.x < 400 - player.width) {
      player.x += player.speed;
    }
    
    // Add touch movement logic (dx is set by touch events)
    if (player.dx !== 0) {
      player.x += player.dx;
      // boundary checks
      if (player.x < 0) player.x = 0;
      if (player.x > 400 - player.width) player.x = 400 - player.width;
    }

    // Draw Player
    ctx.fillStyle = '#5cb85c'; // Primary Green
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#5cb85c';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Obstacle logic
    state.current.frameCount++;
    
    // Increase difficulty
    if (state.current.frameCount % 300 === 0) {
      state.current.speedMultiplier += 0.2;
    }

    // Spawn obstacles
    if (state.current.frameCount % Math.max(20, Math.floor(60 / state.current.speedMultiplier)) === 0) {
      const width = Math.random() * 40 + 20;
      const x = Math.random() * (400 - width);
      obstacles.push({ x, y: -50, width, height: 20, speed: (Math.random() * 2 + 3) * state.current.speedMultiplier });
    }

    // Update and draw obstacles
    ctx.fillStyle = '#d9534f'; // Danger Red
    for (let i = 0; i < obstacles.length; i++) {
      let obs = obstacles[i];
      obs.y += obs.speed;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      // Collision detection
      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        state.current.isGameOver = true;
        setGameOver(true);
      }
    }

    // Remove off-screen obstacles and increase score
    state.current.obstacles = obstacles.filter(obs => {
      if (obs.y > 500) {
        state.current.score += 10;
        setScore(state.current.score);
        return false;
      }
      return true;
    });

    if (!state.current.isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state.current.keys.hasOwnProperty(e.key)) {
        state.current.keys[e.key] = true;
      }
    };
    const handleKeyUp = (e) => {
      if (state.current.keys.hasOwnProperty(e.key)) {
        state.current.keys[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Touch controls logic
  const handleTouchStart = (e) => {
    const touchX = e.touches[0].clientX;
    const screenWidth = window.innerWidth;
    if (touchX < screenWidth / 2) {
      state.current.player.dx = -state.current.player.speed;
    } else {
      state.current.player.dx = state.current.player.speed;
    }
  };

  const handleTouchEnd = () => {
    state.current.player.dx = 0;
  };

  const submitScore = async () => {
    if (!session) {
      alert("Please login to submit your score!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit score", error);
      alert("Failed to submit score.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.main}>
      <div className={styles.topOptions}>
        <div className={`${styles.optionTab} ${styles.activeTab}`}>Play</div>
        <Link href="/leaderboard" className={styles.optionTab}>Leaderboard</Link>
      </div>

      <div className={styles.topBar}>
        <Link href="/" className="btn" style={{ padding: '8px 16px', backgroundColor: '#f0f0f0' }}>Back</Link>
        <div className={styles.score}>Score: {score}</div>
      </div>

      <div 
        className={styles.gameContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={500} 
          className={styles.canvas}
        />

        {!gameStarted && !gameOver && (
          <div className={styles.overlay}>
            <button className="btn btn-primary" onClick={startGame} style={{ fontSize: '1.5rem', padding: '16px 32px' }}>
              Tap to Start
            </button>
          </div>
        )}

        {gameOver && (
          <div className={styles.overlay}>
            <h2 className={styles.gameOverTitle}>Game Over</h2>
            <div className={styles.finalScore}>Final Score: {score}</div>
            <div className={styles.btnGroup}>
              <button className="btn btn-primary" onClick={startGame}>Restart</button>
              
              {!submitted ? (
                <button 
                  className="btn btn-primary" 
                  style={{ backgroundColor: session ? '#f0ad4e' : '#ccc', color: '#fff' }} 
                  onClick={submitScore}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : (session ? 'Submit Score' : 'Login to Submit')}
                </button>
              ) : (
                <button className="btn" style={{ backgroundColor: '#5cb85c', color: '#fff' }} disabled>
                  Submitted! ✓
                </button>
              )}
            </div>
            
            {!session && (
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#fff', textAlign: 'center' }}>
                <Link href="/profile" style={{ color: '#f0ad4e', textDecoration: 'underline' }}>Login</Link> to save your score
              </div>
            )}
          </div>
        )}
      </div>

      <p className={styles.controlsHint}>
        Desktop: Use ⬅️ ➡️ arrows<br/>
        Mobile: Tap Left/Right sides of screen
      </p>
    </div>
  );
}
