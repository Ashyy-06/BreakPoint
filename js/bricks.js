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
    this.init();
  }

  init() {
    this.bricks = [];
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
          points: 10
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

    return previousHealth - brick.health;
  }

  render(ctx) {
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columnCount; c++) {
        const b = this.bricks[r][c];
        this.renderBrick(ctx, b);
      }
    }
  }

  renderBrick(ctx, b) {
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#070a12';
    ctx.lineWidth = 1.5;

    // Stage 5: Nearly destroyed, tiny persistent fragments
    if (b.health <= 19) {
      ctx.globalAlpha = 0.85;

      ctx.beginPath();
      ctx.moveTo(b.x + 3, b.y + 4);
      ctx.lineTo(b.x + 16, b.y + 2);
      ctx.lineTo(b.x + 11, b.y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(b.x + 34, b.y + 8);
      ctx.lineTo(b.x + 48, b.y + 5);
      ctx.lineTo(b.x + 44, b.y + 16);
      ctx.lineTo(b.x + 30, b.y + 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(b.x + 58, b.y + 11);
      ctx.lineTo(b.x + 69, b.y + 9);
      ctx.lineTo(b.x + 66, b.y + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Stage 4: Heavy damage with missing corners
    if (b.health <= 39) {
      ctx.beginPath();
      ctx.moveTo(b.x + 12, b.y);
      ctx.lineTo(b.x + b.width - 10, b.y);
      ctx.lineTo(b.x + b.width, b.y + 10);
      ctx.lineTo(b.x + b.width - 8, b.y + b.height);
      ctx.lineTo(b.x + 14, b.y + b.height);
      ctx.lineTo(b.x, b.y + b.height - 8);
      ctx.lineTo(b.x, b.y + 10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(b.x + 18, b.y + 3);
      ctx.lineTo(b.x + 38, b.y + 16);
      ctx.lineTo(b.x + 54, b.y + 6);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Stages 1 to 3
    ctx.fillRect(b.x, b.y, b.width, b.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(b.x, b.y, b.width, 3);

    // Stage 2: Small crack
    if (b.health <= 79) {
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(b.x + 22, b.y + 2);
      ctx.lineTo(b.x + 30, b.y + 12);
      ctx.lineTo(b.x + 38, b.y + 8);
      ctx.stroke();
    }

    // Stage 3: Branching cracks
    if (b.health <= 59) {
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(b.x + 46, b.y + 3);
      ctx.lineTo(b.x + 52, b.y + 15);
      ctx.lineTo(b.x + 64, b.y + 12);
      ctx.moveTo(b.x + 52, b.y + 15);
      ctx.lineTo(b.x + 48, b.y + b.height);
      ctx.stroke();
    }

    ctx.restore();
  }
}