class BrickGrid {
  constructor(canvasWidth) {
    this.canvasWidth = canvasWidth;
    this.rowCount = 5;
    this.columnCount = 9;
    this.brickWidth = 72;
    this.brickHeight = 20;
    this.padding = 10;
    this.offsetTop = 76; // Accommodates Glass HUD

    const totalGridWidth = this.columnCount * this.brickWidth + (this.columnCount - 1) * this.padding;
    this.offsetLeft = (this.canvasWidth - totalGridWidth) / 2;

    this.rowColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];
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

    this.renderGlassSpeechBubbles(ctx);
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    // Stage 5: Fragment preservation
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

    // Stage 4: Heavy damage
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
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, b.width, b.height, 4);
    ctx.fill();
    ctx.stroke();

    // Glass sheen on brick
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(drawX + 2, drawY + 1, b.width - 4, 3);

    // Stage 2 Crack
    if (b.health <= 79) {
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drawX + 22, drawY + 2);
      ctx.lineTo(drawX + 30, drawY + 12);
      ctx.lineTo(drawX + 38, drawY + 8);
      ctx.stroke();
    }

    // Stage 3 Crack
    if (b.health <= 59) {
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = 1.5;
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

  renderGlassSpeechBubbles(ctx) {
    for (const bubble of this.activeBubbles) {
      const b = bubble.brick;
      ctx.save();

      let alpha = 1;
      let scale = 1;
      const lifeRatio = bubble.timer / bubble.totalLife;

      // Pop-in and Fade-out scale
      if (lifeRatio > 0.9) {
        scale = 0.7 + (1 - (lifeRatio - 0.9) * 10) * 0.3;
      }
      if (bubble.timer < 20) {
        alpha = bubble.timer / 20;
      }

      ctx.globalAlpha = alpha;
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';

      const metrics = ctx.measureText(bubble.text);
      const bubbleW = metrics.width + 18;
      const bubbleH = 22;
      const centerX = b.x + b.width / 2;
      const bubbleY = b.y - bubbleH - 8;
      const bubbleX = Math.max(8, Math.min(this.canvasWidth - bubbleW - 8, centerX - bubbleW / 2));

      // Pop transformation
      ctx.translate(centerX, bubbleY + bubbleH / 2);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -(bubbleY + bubbleH / 2));

      // Glass bubble container
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.3)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 7);
      ctx.fill();
      ctx.stroke();

      // Translucent pointer
      ctx.beginPath();
      ctx.moveTo(centerX - 3, bubbleY + bubbleH);
      ctx.lineTo(centerX + 3, bubbleY + bubbleH);
      ctx.lineTo(centerX, bubbleY + bubbleH + 4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(248, 113, 113, 0.6)';
      ctx.fill();

      // Text
      ctx.fillStyle = '#fee2e2';
      ctx.shadowBlur = 0;
      ctx.fillText(bubble.text, bubbleX + bubbleW / 2, bubbleY + 15);

      ctx.restore();
    }
  }
}