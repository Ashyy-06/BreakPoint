class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.width = 110;
    this.height = 14;
    this.speed = 8.5;
    this.color = '#38bdf8';

    this.x = (this.canvasWidth - this.width) / 2;
    this.y = this.canvasHeight - 35;

    this.moveLeft = false;
    this.moveRight = false;

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.key === 'Left') {
        this.moveLeft = true;
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.key === 'Right') {
        this.moveRight = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.key === 'Left') {
        this.moveLeft = false;
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.key === 'Right') {
        this.moveRight = false;
      }
    });
  }

  reset() {
    this.x = (this.canvasWidth - this.width) / 2;
    this.moveLeft = false;
    this.moveRight = false;
  }

  update() {
    if (this.moveLeft) {
      this.x -= this.speed;
    }
    if (this.moveRight) {
      this.x += this.speed;
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }

  render(ctx) {
    ctx.save();

    // Rounded Glass Paddle
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 6);
    ctx.fill();

    // Top reflection sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(this.x + 2, this.y + 1, this.width - 4, 3);

    ctx.restore();
  }
}