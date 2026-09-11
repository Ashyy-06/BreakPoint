class Ball {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.radius = 6.5;
    this.color = '#ffffff';
    this.baseSpeed = 6;

    this.reset();
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2 + 60;

    const angle = (Math.random() * 0.6 + 0.2) * Math.PI;
    this.dx = this.baseSpeed * Math.cos(angle);
    this.dy = -Math.abs(this.baseSpeed * Math.sin(angle));
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}