const GameState = {
  START: 'START',
  PLAYING: 'PLAYING',
  GAME_OVER: 'JK:Just KIdding! You cannot break it.'
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

    this.initControls();
    this.loop = this.loop.bind(this);
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.sound.init();
        if (this.currentState === GameState.START) {
          this.currentState = GameState.PLAYING;
        } else if (this.currentState === GameState.GAME_OVER) {
          this.restartGame();
          this.currentState = GameState.PLAYING;
        }
      }
    });
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
  }

  triggerShake(intensity = 4, duration = 6) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  update() {
    this.particles.update();
    this.dialogue.update();

    if (this.shakeDuration > 0) {
      this.shakeDuration--;
    }

    if (this.currentState !== GameState.PLAYING) {
      return;
    }

    this.paddle.update();
    this.ball.update();

    const wallHit = CollisionSystem.checkWallCollisions(
      this.ball,
      this.width,
      this.height
    );

    // Ball dropped below paddle (Miss / Life Loss event)
    if (wallHit.hitBottom) {
      this.lives--;
      this.dialogue.showMissMessage();
      this.triggerShake(7, 10);

      if (this.lives <= 0) {
        this.currentState = GameState.GAME_OVER;
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

      // Increment progress (hard capped at 99%)
      this.progress += 0.2;
      if (this.progress >= 99) {
        this.progress = 99;
      }

      // Dialogue hook on hit
      this.dialogue.showHitMessage();

      // Polish
      this.triggerShake(3, 5);
      this.particles.spawn(hitData.x, hitData.y, hitData.color, 12);
      this.sound.playBrickHit();
    }
  }

  render() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Screen Shake
    if (this.shakeDuration > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(offsetX, offsetY);
    }

    // World Elements
    this.ctx.fillStyle = '#0b1120';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.brickGrid.render(this.ctx);
    this.paddle.render(this.ctx);
    this.ball.render(this.ctx);
    this.particles.render(this.ctx);

    this.ctx.restore();

    // HUD and Dynamic Dialogue Area
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