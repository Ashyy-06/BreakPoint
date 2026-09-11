class BrickGrid {
  constructor(canvasWidth) {
    this.canvasWidth = canvasWidth;
    this.rowCount = 5;
    this.columnCount = 9;
    this.brickWidth = 72;
    this.brickHeight = 20;
    this.padding = 10;
    this.offsetTop = 70;

    const totalGridWidth = this.columnCount * this.brickWidth + (this.columnCount - 1) * this.padding;
    this.offsetLeft = (this.canvasWidth - totalGridWidth) / 2;

    this.rowColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
    this.bricks = [];

    this.complaintsPool = [
      "Can you stop?",
      "I was literally minding my business.",
      "This is workplace harassment.",
      "Bro, why me?",
      "LEAVE ME ALONE 😭",
      "I have a family!",
      "Again?!",
      "That actually hurt.",
      "Why are you targeting me?",
      "Please respect the bricks."
    ];

    this.activeBubbles = [];
    this.maxConcurrentBubbles = 3;
    this.lastComplaintTime = 0;

    this.init();
  }

  init() {
    this.bricks = [];
    this.activeBubbles = [];
    this.lastComplaintTime = 0;

    for (let r = 0; r < this.rowCount; r++) {
      this.bricks[r] = [];
      for (let c = 0; c < this.columnCount; c++) {
        const brickX = this.offsetLeft + c * (this.brickWidth + this.padding);
        const brickY = this.offsetTop + r * (this.brickHeight + this.padding);

        this.bricks[r][c] = {
          x: brickX,
          y: brickY,
          width: this.brickWidth,
          height: this.brickHeight,
          health: 100,
          color: this.rowColors[r % this.rowColors.length],
          points: 10,
          shakeFrames: 0,
          shakeIntensity: 0
        };
      }
    }
  }

  reset() {
    this.init();
  }

  damageBrick(brick, amount = 10) {
    const previousHealth = brick.health;
    brick.health -= amount;

    if (brick.health <= 1) {
      brick.health = 1;
    }

    brick.shakeFrames = 7;
    brick.shakeIntensity = 2.5;

    this.triggerComplaint(brick);
    return previousHealth - brick.health;
  }

  triggerComplaint(brick, customText = null) {
    const text = customText || this.complaintsPool[Math.floor(Math.random() * this.complaintsPool.length)];
    this.lastComplaintTime = Date.now();

    if (this.activeBubbles.length >= this.maxConcurrentBubbles) {
      this.activeBubbles.shift();
    }

    this.activeBubbles.push({
      brick: brick,
      text: text,
      timer: 110,
      totalLife: 110
    });
  }

  getTimeSinceLastComplaint() {
    return Date.now() - this.lastComplaintTime;
  }

  triggerComedyResponse(text) {
    let candidate = null;
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columnCount; c++) {
        if (this.bricks[r][c].health < 100) {
          candidate = this.bricks[r][c];
          break;
        }
      }
      if (candidate) break;
    }
    if (!candidate) candidate = this.bricks[0][4];
    this.triggerComplaint(candidate, text);
  }

  update() {
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columnCount; c++) {
        const b = this.bricks[r][c];
        if (b.shakeFrames > 0) {
          b.shakeFrames--;
        }
      }
    }

    for (let i = this.activeBubbles.length - 1; i >= 0; i--) {
      const bubble = this.activeBubbles[i];
      bubble.timer--;
      if (bubble.timer <= 0) {
        this.activeBubbles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columnCount; c++) {
        const b = this.bricks[r][c];
        this.renderBrick(ctx, b);
      }
    }

    this.renderSpeechBubbles(ctx);
  }

  renderBrick(ctx, b) {
    ctx.save();

    let drawX = b.x;
    let drawY = b.y;
    if (b.shakeFrames > 0) {
      drawX += (Math.random() - 0.5) * b.shakeIntensity;
      drawY += (Math.random() - 0.5) * b.shakeIntensity;
    }

    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#070a12';
    ctx.lineWidth = 1.5;

    // Stage 5
    if (b.health <= 19) {
      ctx.globalAlpha = 0.85;

      ctx.beginPath();
      ctx.moveTo(drawX + 3, drawY + 4);
      ctx.lineTo(drawX + 16, drawY + 2);
      ctx.lineTo(drawX + 11, drawY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX + 34, drawY + 8);
      ctx.lineTo(drawX + 48, drawY + 5);
      ctx.lineTo(drawX + 44, drawY + 16);
      ctx.lineTo(drawX + 30, drawY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX + 58, drawY + 11);
      ctx.lineTo(drawX + 69, drawY + 9);
      ctx.lineTo(drawX + 66, drawY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Stage 4
    if (b.health <= 39) {
      ctx.beginPath();
      ctx.moveTo(drawX + 12, drawY);
      ctx.lineTo(drawX + b.width - 10, drawY);
      ctx.lineTo(drawX + b.width, drawY + 10);
      ctx.lineTo(drawX + b.width - 8, drawY + b.height);
      ctx.lineTo(drawX + 14, drawY + b.height);
      ctx.lineTo(drawX, drawY + b.height - 8);
      ctx.lineTo(drawX, drawY + 10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(drawX + 18, drawY + 3);
      ctx.lineTo(drawX + 38, drawY + 16);
      ctx.lineTo(drawX + 54, drawY + 6);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Stages 1 to 3
    ctx.fillRect(drawX, drawY, b.width, b.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(drawX, drawY, b.width, 3);

    // Stage 2
    if (b.health <= 79) {
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(drawX + 22, drawY + 2);
      ctx.lineTo(drawX + 30, drawY + 12);
      ctx.lineTo(drawX + 38, drawY + 8);
      ctx.stroke();
    }

    // Stage 3
    if (b.health <= 59) {
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(drawX + 46, drawY + 3);
      ctx.lineTo(drawX + 52, drawY + 15);
      ctx.lineTo(drawX + 64, drawY + 12);
      ctx.moveTo(drawX + 52, drawY + 15);
      ctx.lineTo(drawX + 48, drawY + b.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderSpeechBubbles(ctx) {
    for (const bubble of this.activeBubbles) {
      const b = bubble.brick;
      ctx.save();

      let alpha = 1;
      if (bubble.timer < 20) {
        alpha = bubble.timer / 20;
      }
      ctx.globalAlpha = alpha;

      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';

      const metrics = ctx.measureText(bubble.text);
      const bubbleW = metrics.width + 14;
      const bubbleH = 18;
      const centerX = b.x + b.width / 2;
      const bubbleY = b.y - bubbleH - 7;
      const bubbleX = Math.max(8, Math.min(this.canvasWidth - bubbleW - 8, centerX - bubbleW / 2));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - 3, bubbleY + bubbleH);
      ctx.lineTo(centerX + 3, bubbleY + bubbleH);
      ctx.lineTo(centerX, bubbleY + bubbleH + 4);
      ctx.closePath();
      ctx.fillStyle = '#f87171';
      ctx.fill();

      ctx.fillStyle = '#fef2f2';
      ctx.fillText(bubble.text, bubbleX + bubbleW / 2, bubbleY + 12.5);

      ctx.restore();
    }
  }
}