class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.radius = 6.5;
    this.color = '#ffffff';
    this.baseSpeed = 6;

    // Tiredness system attributes
    this.activePlayTimer = 0;
    this.tiredTargetTime = this.getRandomInterval(20, 40); // 20–40 seconds
    this.isTired = false;
    this.tiredDuration = 0;
    this.speedScale = 1.0;

    // Speech bubble for ball
    this.bubbleText = '';
    this.bubbleTimer = 0;
    this.bubbleOpacity = 0;

    this.recoveryMessages = [
      "Okay, I'm good.",
      "That nap fixed nothing. 😭"
    ];

    this.reset();
  }

  getRandomInterval(minSec, maxSec) {
    return (minSec + Math.random() * (maxSec - minSec)) * 60; // Frames at ~60fps
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2 + 60;

    const angle = (Math.random() * 0.6 + 0.2) * Math.PI;
    this.speedScale = 1.0;
    this.isTired = false;
    this.tiredDuration = 0;
    this.activePlayTimer = 0;
    this.tiredTargetTime = this.getRandomInterval(20, 40);
    this.bubbleText = '';
    this.bubbleTimer = 0;
    this.bubbleOpacity = 0;

    this.dx = this.baseSpeed * Math.cos(angle);
    this.dy = -Math.abs(this.baseSpeed * Math.sin(angle));
  }

  showBallBubble(text, frames = 150) {
    this.bubbleText = text;
    this.bubbleTimer = frames;
    this.bubbleOpacity = 1;
  }

  update(onTiredCallback) {
    // Increment fatigue timer if ball is actively in play
    if (!this.isTired) {
      this.activePlayTimer++;
      if (this.activePlayTimer >= this.tiredTargetTime) {
        this.triggerTiredState(onTiredCallback);
      }
    } else {
      this.tiredDuration--;
      if (this.tiredDuration <= 0) {
        this.recoverFromTired();
      }
    }

    // Apply movement with current speed scale
    this.x += this.dx * this.speedScale;
    this.y += this.dy * this.speedScale;

    // Bubble lifecycle
    if (this.bubbleTimer > 0) {
      this.bubbleTimer--;
      if (this.bubbleTimer < 20) {
        this.bubbleOpacity = this.bubbleTimer / 20;
      }
    } else {
      this.bubbleOpacity = 0;
    }
  }

  triggerTiredState(onTiredCallback) {
    this.isTired = true;
    this.speedScale = 0.45; // ~55% speed reduction
    this.tiredDuration = Math.floor((3.5 + Math.random() * 1.5) * 60); // 3.5 to 5.0 seconds

    let dialog = "🥱 Bro... can we take a break?";
    if (onTiredCallback) {
      const response = onTiredCallback();
      if (response && response.ballReply) {
        dialog = response.ballReply;
      }
    }

    this.showBallBubble(dialog, this.tiredDuration);
  }

  recoverFromTired() {
    this.isTired = false;
    this.speedScale = 1.0;
    this.activePlayTimer = 0;
    this.tiredTargetTime = this.getRandomInterval(25, 45); // Cooldown buffer

    const chosenRecovery = this.recoveryMessages[Math.floor(Math.random() * this.recoveryMessages.length)];
    this.showBallBubble(chosenRecovery, 120);
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.isTired ? '#93c5fd' : '#ffffff';
    ctx.shadowBlur = this.isTired ? 14 : 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    this.renderBubble(ctx);
  }

  renderBubble(ctx) {
    if (this.bubbleOpacity <= 0 || !this.bubbleText) return;

    ctx.save();
    ctx.globalAlpha = this.bubbleOpacity;
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    const textMetrics = ctx.measureText(this.bubbleText);
    const boxWidth = textMetrics.width + 16;
    const boxHeight = 22;
    const boxX = this.x - boxWidth / 2;
    const boxY = this.y - 34;

    // Speech bubble background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
    ctx.fill();
    ctx.stroke();

    // Downward pointer tip
    ctx.beginPath();
    ctx.moveTo(this.x - 4, boxY + boxHeight);
    ctx.lineTo(this.x + 4, boxY + boxHeight);
    ctx.lineTo(this.x, boxY + boxHeight + 4);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Bubble Text
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(this.bubbleText, this.x, boxY + 15);

    ctx.restore();
  }
}