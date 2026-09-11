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
    this.totalDuration = 150; // ~2.5 seconds at 60 FPS
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
      // Fade in smoothly
      if (this.opacity < 1) {
        this.opacity = Math.min(1, this.opacity + this.fadeSpeed);
      }
    } else if (this.opacity > 0) {
      // Fade out smoothly
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
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    // Dialogue banner styling
    const textWidth = ctx.measureText(this.currentText).width;
    const bannerWidth = textWidth + 36;
    const bannerHeight = 36;
    const bannerX = (this.canvasWidth - bannerWidth) / 2;
    const bannerY = 205; // Placed right below the brick area

    // Pill backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = this.textColor;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 18);
    ctx.fill();
    ctx.stroke();

    // Dialogue text
    ctx.fillStyle = this.textColor;
    ctx.shadowColor = this.textColor;
    ctx.shadowBlur = 6;
    ctx.fillText(this.currentText, this.canvasWidth / 2, bannerY + 25);

    ctx.restore();
  }
}