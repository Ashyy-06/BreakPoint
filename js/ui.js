class UI {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.overlayContainer = document.getElementById('overlay-container');
    this.startModal = document.getElementById('start-modal');
    this.stopModal = document.getElementById('stop-modal');
    this.gameoverModal = document.getElementById('gameover-modal');

    this.gameoverPrankBox = document.getElementById('gameover-prank-box');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalStatsEl = document.getElementById('final-stats');
    this.stopJokeEl = document.getElementById('stop-joke-text');

    this.gameOverTimer = 0;
    this.showGameOverPrank = false;
  }

  showScreen(screen) {
    this.startModal.classList.remove('active');
    this.stopModal.classList.remove('active');
    this.gameoverModal.classList.remove('active');

    if (screen === 'START') {
      this.overlayContainer.classList.add('active');
      this.startModal.classList.add('active');
    } else if (screen === 'STOPPED') {
      this.overlayContainer.classList.add('active');
      this.stopModal.classList.add('active');
    } else if (screen === 'GAME_OVER') {
      this.overlayContainer.classList.add('active');
      this.gameoverModal.classList.add('active');
    } else {
      this.overlayContainer.classList.remove('active');
    }
  }

  setStopJoke(joke) {
    if (this.stopJokeEl) {
      this.stopJokeEl.innerText = `"${joke}"`;
    }
  }

  setGameOverStats(score, hits, damage) {
    if (this.finalScoreEl) this.finalScoreEl.innerText = `Final Score: ${score}`;
    if (this.finalStatsEl) this.finalStatsEl.innerText = `Hits Landed: ${hits} | Damage Dealt: ${damage}`;
  }

  resetPranks() {
    this.gameOverTimer = 0;
    this.showGameOverPrank = false;
    if (this.gameoverPrankBox) {
      this.gameoverPrankBox.classList.remove('revealed');
      this.gameoverPrankBox.classList.add('prank-hidden');
    }
  }

  updateGameOverPrank() {
    if (!this.showGameOverPrank) {
      this.gameOverTimer++;
      if (this.gameOverTimer > 85) { // ~1.4s delay
        this.showGameOverPrank = true;
        if (this.gameoverPrankBox) {
          this.gameoverPrankBox.classList.remove('prank-hidden');
          this.gameoverPrankBox.classList.add('revealed');
        }
      }
    }
  }

  renderGlassHUD(ctx, score, lives, hitsLanded, totalDamage, progress) {
    ctx.save();

    // Floating Glass HUD Panel Bar at top
    const hudX = 14;
    const hudY = 12;
    const hudW = this.canvasWidth - 140; // Leaves space for Stop button
    const hudH = 50;

    // Translucent glass fill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, hudH, 12);
    ctx.fill();
    ctx.stroke();

    // Subtle glass top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(hudX + 12, hudY + 1, hudW - 24, 1.5);

    // Text & Stats Rendering
    ctx.shadowBlur = 0;
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';

    ctx.fillText(`SCORE: ${score}`, hudX + 16, hudY + 20);
    ctx.fillText(`HITS: ${hitsLanded}`, hudX + 120, hudY + 20);
    ctx.fillText(`DAMAGE: ${totalDamage}`, hudX + 210, hudY + 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`❤️ LIVES: ${lives}`, hudX + hudW - 18, hudY + 20);

    // Glassmorphic Wall Destruction Progress Bar
    const barWidth = 260;
    const barHeight = 8;
    const barX = (hudW - barWidth) / 2 + hudX - 10;
    const barY = hudY + 32;

    ctx.textAlign = 'center';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`PROGRESS: ${Math.floor(progress)}%`, hudX + (hudW / 2) - 10, hudY + 28);

    // Progress Track
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 4);
    ctx.fill();

    // Progress Fill (Capped visibly at 99%)
    const fillWidth = (barWidth * Math.min(progress, 99)) / 100;
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 4);
    ctx.fill();

    ctx.restore();
  }
}