class CollisionSystem {
  static checkWallCollisions(ball, canvasWidth, canvasHeight) {
    let hitBottom = false;

    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.dx = -ball.dx;
    } else if (ball.x + ball.radius >= canvasWidth) {
      ball.x = canvasWidth - ball.radius;
      ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.dy = -ball.dy;
    }

    if (ball.y - ball.radius > canvasHeight) {
      hitBottom = true;
    }

    return { hitBottom };
  }

  static checkPaddleCollision(ball, paddle) {
    if (
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.height &&
      ball.x + ball.radius >= paddle.x &&
      ball.x - ball.radius <= paddle.x + paddle.width
    ) {
      if (ball.dy > 0) {
        ball.y = paddle.y - ball.radius;

        const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const maxAngle = Math.PI / 3;
        const angle = hitPoint * maxAngle;

        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
        return true;
      }
    }
    return false;
  }

  static checkBrickCollisions(ball, brickGrid) {
    for (let r = 0; r < brickGrid.rowCount; r++) {
      for (let c = 0; c < brickGrid.columnCount; c++) {
        const b = brickGrid.bricks[r][c];

        const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.width));
        const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.height));

        const diffX = ball.x - closestX;
        const diffY = ball.y - closestY;
        const distSq = diffX * diffX + diffY * diffY;

        if (distSq <= ball.radius * ball.radius) {
          const actualDamage = brickGrid.damageBrick(b, 10);

          const prevY = ball.y - ball.dy;
          if (prevY + ball.radius <= b.y || prevY - ball.radius >= b.y + b.height) {
            ball.dy = -ball.dy;
          } else {
            ball.dx = -ball.dx;
          }

          return {
            hit: true,
            x: ball.x,
            y: ball.y,
            color: b.color,
            damageDealt: actualDamage,
            points: b.points
          };
        }
      }
    }
    return { hit: false };
  }
}