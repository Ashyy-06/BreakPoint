const GameState = {
  START: 'START',
  PLAYING: 'PLAYING',
  STOPPED: 'STOPPED',
  GAME_OVER: 'GAME_OVER'
};

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.particles.push({
        x: x,
        y: y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.restore();
  }
}

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playBrickHit() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + Math.random() * 60, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPaddleHit() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.stopBtn = document.getElementById('stop-btn');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.score = 0;
    this.lives = 3;
    this.hitsLanded = 0;
    this.totalDamage = 0;
    this.progress = 0;

    this.currentState = GameState.START;

    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.particles = new ParticleSystem();
    this.sound = new SoundSynthesizer();

    this.ui = new UI(this.width, this.height);
    this.dialogue = new DialogueManager(this.width);
    this.paddle = new Paddle(this.width, this.height);
    this.ball = new Ball(this.width, this.height);
    this.brickGrid = new BrickGrid(this.width);

    this.stopEscapeDialogues = [
      "Running away? The bricks saw that. 👀",
      "Bro really pressed stop to escape the bricks.",
      "The bricks are disappointed in you. 🧱",
      "You can stop the game, but you can't stop the bricks.",
      "Nice try. The bricks are still waiting.",
      "Escape attempt detected. 🚨"
    ];
    this.currentStopJoke = '';

    this.handleTiredInteraction = this.handleTiredInteraction.bind(this);
    this.toggleStop = this.toggleStop.bind(this);

    this.initControls();
    this.loop = this.loop.bind(this);
  }

  initControls() {
    // Keyboard controller
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.sound.init();

        if (this.currentState === GameState.START) {
          this.currentState = GameState.PLAYING;
          this.updateStopButton();
        } else if (this.currentState === GameState.STOPPED) {
          this.resumeGame();
        } else if (this.currentState === GameState.GAME_OVER) {
          this.restartGame();
          this.currentState = GameState.PLAYING;
          this.updateStopButton();
        }
      }
    });

    // UI Stop Button Listener
    this.stopBtn.addEventListener('click', () => {
      this.toggleStop();
    });
  }

  toggleStop() {
    this.sound.init();

    if (this.currentState === GameState.PLAYING) {
      this.currentState = GameState.STOPPED;
      this.currentStopJoke = this.stopEscapeDialogues[
        Math.floor(Math.random() * this.stopEscapeDialogues.length)
      ];
      this.updateStopButton();
    } else if (this.currentState === GameState.STOPPED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.currentState = GameState.PLAYING;
    this.updateStopButton();
  }

  updateStopButton() {
    if (this.currentState === GameState.PLAYING) {
      this.stopBtn.disabled = false;
      this.stopBtn.innerText = '🛑 STOP';
      this.stopBtn.style.backgroundColor = '#ef4444';
    } else if (this.currentState === GameState.STOPPED) {
      this.stopBtn.disabled = false;
      this.stopBtn.innerText = '▶️ RESUME';
      this.stopBtn.style.backgroundColor = '#22c55e';
    } else {
      this.stopBtn.disabled = true;
      this.stopBtn.innerText = '🛑 STOP';
      this.stopBtn.style.backgroundColor = '#ef4444';
    }
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.hitsLanded = 0;
    this.totalDamage = 0;
    this.progress = 0;
    this.paddle.reset();
    this.ball.reset();
    this.brickGrid.reset();
    this.dialogue.reset();
    this.ui.resetPranks();
    this.updateStopButton();
  }

  triggerShake(intensity = 4, duration = 6) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  handleTiredInteraction() {
    const timeSinceHit = this.brickGrid.getTimeSinceLastComplaint();
    if (timeSinceHit < 1800) {
      if (Math.random() > 0.5) {
        return { ballReply: "Don't blame me, bro. 🥱" };
      } else {
        this.brickGrid.triggerComedyResponse("FINALLY.");
        return { ballReply: "Bro... can we take a break?" };
      }
    }
    return null;
  }

  update() {
    // If stopped or in menus, pause physics, active ball velocity, and timers
    if (this.currentState !== GameState.PLAYING) {
      return;
    }

    this.particles.update();
    this.dialogue.update();

    if (this.shakeDuration > 0) {
      this.shakeDuration--;
    }

    this.paddle.update();
    this.ball.update(this.handleTiredInteraction);
    this.brickGrid.update();

    const wallHit = CollisionSystem.checkWallCollisions(
      this.ball,
      this.width,
      this.height
    );

    if (wallHit.hitBottom) {
      this.lives--;
      this.dialogue.showMissMessage();
      this.triggerShake(7, 10);

      if (this.lives <= 0) {
        this.currentState = GameState.GAME_OVER;
        this.ui.resetPranks();
        this.updateStopButton();
      } else {
        this.paddle.reset();
        this.ball.reset();
      }
      return;
    }

    if (CollisionSystem.checkPaddleCollision(this.ball, this.paddle)) {
      this.sound.playPaddleHit();
    }

    const hitData = CollisionSystem.checkBrickCollisions(this.ball, this.brickGrid);
    if (hitData.hit) {
      this.hitsLanded++;
      this.score += hitData.points;
      this.totalDamage += hitData.damageDealt;

      this.progress += 0.2;
      if (this.progress >= 99) {
        this.progress = 99;
      }

      this.dialogue.showHitMessage();
      this.triggerShake(3, 5);
      this.particles.spawn(hitData.x, hitData.y, hitData.color, 12);
      this.sound.playBrickHit();
    }
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.shakeDuration > 0 && this.currentState === GameState.PLAYING) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(offsetX, offsetY);
    }

    this.ctx.fillStyle = '#0b1120';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.brickGrid.render(this.ctx);
    this.paddle.render(this.ctx);
    this.ball.render(this.ctx);
    this.particles.render(this.ctx);

    this.ctx.restore();

    this.ui.renderHUD(
      this.ctx,
      this.score,
      this.lives,
      this.hitsLanded,
      this.totalDamage,
      this.progress
    );

    if (this.currentState === GameState.PLAYING) {
      this.dialogue.render(this.ctx);
    } else if (this.currentState === GameState.STOPPED) {
      this.ui.renderStoppedScreen(this.ctx, this.currentStopJoke);
    } else if (this.currentState === GameState.START) {
      this.ui.renderStartScreen(this.ctx);
    } else if (this.currentState === GameState.GAME_OVER) {
      this.ui.renderGameOverScreen(
        this.ctx,
        this.score,
        this.hitsLanded,
        this.totalDamage
      );
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(this.loop);
  }

  start() {
    this.updateStopButton();
    requestAnimationFrame(this.loop);
  }
}

function run() {
  const game = new Game();
  game.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}