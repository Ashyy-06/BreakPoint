class DialogueManager {
  constructor(canvasWidth) {
    this.canvasWidth = canvasWidth;

    this.hitMessages = [
      "You can do it",
      "Absolute cinema",
      "OUCH! That was personal"
    ];

    this.missMessages = [
      "NOOOOOOOO!",
      "Kannu pothi adichal polum ithilum nallonam kollumallo!",
      "You had ONE job.",
      "Bhai, kya kar raha hai?",
      "Don't produce too Much !!"
    ];

    this.currentText = '';
    this.textColor = '#facc15';
    this.opacity = 0;
    this.displayTimer = 0;
    this.totalDuration = 150;
    this.fadeSpeed = 0.08;
    this.isFadingOut = false;
  }

  getRandomItem(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  showHitMessage() {
    this.currentText = this.getRandomItem(this.hitMessages);
    this.textColor = '#38bdf8';
    this.displayTimer = this.totalDuration;
    this.isFadingOut = false;
  }

  showMissMessage() {
    this.currentText = this.getRandomItem(this.missMessages);
    this.textColor = '#f87171';
    this.displayTimer = this.totalDuration;
    this.isFadingOut = false;
  }

  reset() {
    this.currentText = '';
    this.opacity = 0;
    this.displayTimer = 0;
    this.isFadingOut = false;
  }

  update() {
    if (this.displayTimer > 0) {
      this.displayTimer--;
      if (this.opacity < 1) {
        this.opacity = Math.min(1, this.opacity + this.fadeSpeed);
      }
    } else if (this.opacity > 0) {
      this.opacity = Math.max(0, this.opacity - this.fadeSpeed);
      if (this.opacity === 0) {
        this.currentText = '';
      }
    }
  }

  render(ctx) {
    if (this.opacity <= 0 || !this.currentText) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    const textWidth = ctx.measureText(this.currentText).width;
    const bannerWidth = textWidth + 38;
    const bannerHeight = 36;
    const bannerX = (this.canvasWidth - bannerWidth) / 2;
    const bannerY = 220;

    // Glass pill banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = this.textColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 18);
    ctx.fill();
    ctx.stroke();

    // Top subtle highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(bannerX + 10, bannerY + 1, bannerWidth - 20, 1.5);

    // Dialogue text
    ctx.fillStyle = this.textColor;
    ctx.shadowBlur = 4;
    ctx.fillText(this.currentText, this.canvasWidth / 2, bannerY + 24);

    ctx.restore();
  }
}