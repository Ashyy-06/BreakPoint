class UI {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Prank tracking
    this.gameOverTimer = 0;
    this.showGameOverPrank = false;
  }

  resetPranks() {
    this.gameOverTimer = 0;
    this.showGameOverPrank = false;
  }

  updatePrankTimers() {
    this.gameOverTimer++;
    if (this.gameOverTimer > 90) { // ~1.5s delay
      this.showGameOverPrank = true;
    }
  }

  renderHUD(ctx, score, lives, hitsLanded, totalDamage, progress) {
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#94a3b8';

    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 24);
    ctx.fillText(`HITS: ${hitsLanded}`, 140, 24);
    ctx.fillText(`DAMAGE: ${totalDamage}`, 240, 24);

    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${lives}`, this.canvasWidth - 110, 24); // Spaced from stop button

    // Wall Destruction Progress Bar
    const barWidth = 300;
    const barHeight = 10;
    const barX = (this.canvasWidth - barWidth) / 2;
    const barY = 42;

    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`WALL DESTRUCTION PROGRESS: ${Math.floor(progress)}%`, this.canvasWidth / 2, 38);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const fillWidth = (barWidth * Math.min(progress, 99)) / 100;
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 6;
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    ctx.restore();
  }

  renderStartScreen(ctx) {
    this.drawOverlay(ctx);
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText('BREAKPOINT', this.canvasWidth / 2, this.canvasHeight / 2 - 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText('Use Left & Right Arrow keys to control the paddle', this.canvasWidth / 2, this.canvasHeight / 2 - 12);

    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.fillText('"Inn Aayi Kazhinjaal Pinne Bhayankara Thrill Aanu.."', this.canvasWidth / 2, this.canvasHeight / 2 + 32);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('PRESS SPACE TO START', this.canvasWidth / 2, this.canvasHeight / 2 + 84);
    ctx.restore();
  }

  renderGameOverScreen(ctx, score, hitsLanded, totalDamage) {
    this.drawOverlay(ctx);
    this.updatePrankTimers();

    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('GAME OVER 💀', this.canvasWidth / 2, this.canvasHeight / 2 - 60);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Final Score: ${score}`, this.canvasWidth / 2, this.canvasHeight / 2 - 20);
    ctx.fillText(`Hits Landed: ${hitsLanded} | Damage Dealt: ${totalDamage}`, this.canvasWidth / 2, this.canvasHeight / 2 + 8);

    // Prank transition pop-in after 1.5s
    if (this.showGameOverPrank) {
      const shake = (Math.random() - 0.5) * 2.5;
      ctx.save();
      ctx.translate(shake, shake);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px sans-serif';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillText('JUST KIDDING 😂', this.canvasWidth / 2, this.canvasHeight / 2 + 56);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillText("You can't escape the bricks. 🧱", this.canvasWidth / 2, this.canvasHeight / 2 + 84);

      ctx.restore();
    }

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('PRESS SPACE TO TRY AGAIN 🔄', this.canvasWidth / 2, this.canvasHeight / 2 + 130);
    ctx.restore();
  }

  renderStoppedScreen(ctx, escapeJoke) {
    this.drawOverlay(ctx);
    ctx.save();
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('GAME STOPPED 🛑', this.canvasWidth / 2, this.canvasHeight / 2 - 65);

    // Prank announcement
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px sans-serif';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.fillText('JUST KIDDING 😂', this.canvasWidth / 2, this.canvasHeight / 2 - 15);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillText("You can't escape the bricks. 🧱", this.canvasWidth / 2, this.canvasHeight / 2 + 18);

    // Randomized comedy flavor
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText(`"${escapeJoke}"`, this.canvasWidth / 2, this.canvasHeight / 2 + 55);

    // Resume button indicator
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText('PRESS SPACE OR CLICK RESUME ▶️', this.canvasWidth / 2, this.canvasHeight / 2 + 105);
    ctx.restore();
  }

  drawOverlay(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(7, 10, 18, 0.88)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.restore();
  }
}