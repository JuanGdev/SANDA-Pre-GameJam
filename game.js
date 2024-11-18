let paddle;
let ball;
let bricks = [];
let rows = 5;
let cols = 10;
let brickWidth;
let brickHeight = 20;
let score = 0;

let wallHitSound;
let powerUpSound;
let brickHitSound;
let gameOverSound;

function preload() {
    wallHitSound = loadSound('sounds/wall-hit.mp3');
    powerUpSound = loadSound('sounds/power-up.mp3');
    brickHitSound = loadSound('sounds/brick-hit.mp3');
    gameOverSound = loadSound('sounds/game-over.wav');
}

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('game-container');
    noLoop(); // Don't start the game until the user clicks the start button
}

function startGame() {
    getAudioContext().resume(); // Resume the AudioContext after a user gesture
    document.getElementById('start-button').style.display = 'none'; // Hide the start button
    document.getElementById('retry-button').style.display = 'none'; // Hide the retry button
    score = 0; // Reset the score
    paddle = new Paddle();
    ball = new Ball();
    brickWidth = width / cols;
    bricks = []; // Clear existing bricks
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            bricks.push(new Brick(j * brickWidth, i * brickHeight));
        }
    }
    loop(); // Start the game loop
}

function draw() {
    background(0);
    if (paddle && ball) {
        paddle.show();
        paddle.update();
        ball.show();
        ball.update();
        ball.checkPaddle(paddle);
        for (let i = bricks.length - 1; i >= 0; i--) {
            bricks[i].show();
            if (ball.hits(bricks[i])) {
                ball.reverse();
                bricks.splice(i, 1);
                score++;
                brickHitSound.play();
            }
        }
    }
    fill(255);
    textSize(24);
    text('Score: ' + score, 10, height - 10);
    if (ball && ball.y > height) {
        noLoop();
        textSize(32);
        textAlign(CENTER);
        fill(255);
        text('Game Over', width / 2, height / 2);
        gameOverSound.play();
        document.getElementById('retry-button').style.display = 'block'; // Show the retry button
        document.getElementById('retry-button').style.top = (height / 2 + 40) + 'px'; // Position below "Game Over"
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        paddle.move(-1);
    } else if (keyCode === RIGHT_ARROW) {
        paddle.move(1);
    }
}

function keyReleased() {
    paddle.move(0);
}

class Paddle {
    constructor() {
        this.width = 120;
        this.height = 20;
        this.x = width / 2 - this.width / 2;
        this.y = height - this.height - 10;
        this.xdir = 0;
    }

    show() {
        fill(255);
        rect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.xdir * 10; // Increase the speed multiplier from 5 to 10
        this.x = constrain(this.x, 0, width - this.width);
    }

    move(dir) {
        this.xdir = dir;
    }
}

class Ball {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.r = 12;
        this.xspeed = 5;
        this.yspeed = 5;
    }

    show() {
        fill(255);
        ellipse(this.x, this.y, this.r * 2);
    }

    update() {
        this.x += this.xspeed;
        this.y += this.yspeed;
        if (this.x > width || this.x < 0) {
            this.xspeed *= -1;
            wallHitSound.play();
        }
        if (this.y < 0) {
            this.yspeed *= -1;
            wallHitSound.play();
        }
        if (this.y > height) {
            noLoop();
            textSize(32);
            textAlign(CENTER);
            fill(255);
            text('Game Over', width / 2, height / 2);
            gameOverSound.play();
            document.getElementById('retry-button').style.display = 'block'; // Show the retry button
            document.getElementById('retry-button').style.top = (height / 2 + 40) + 'px'; // Position below "Game Over"
        }
    }

    checkPaddle(paddle) {
        if (this.y + this.r > paddle.y && this.x > paddle.x && this.x < paddle.x + paddle.width) {
            this.yspeed *= -1;
            this.y = paddle.y - this.r;
            this.increaseSpeed();
            wallHitSound.play();
        }
    }

    hits(brick) {
        return (this.x > brick.x && this.x < brick.x + brickWidth && this.y - this.r < brick.y + brickHeight && this.y + this.r > brick.y);
    }

    reverse() {
        this.yspeed *= -1;
        this.increaseSpeed();
    }

    increaseSpeed() {
        this.xspeed *= 1.05; // Increase speed by 5%
        this.yspeed *= 1.05; // Increase speed by 5%
    }
}

class Brick {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const colors = ['#F21616', '#F26A1B', '#F29D35', '#F2E1AC', '#547326'];
        this.color = random(colors);
    }

    show() {
        fill(this.color);
        stroke(0, 0, 0, 100); // Transparent black border
        strokeWeight(2);
        rect(this.x, this.y, brickWidth, brickHeight);
        noStroke();
        fill(255, 255, 255, 50);
        beginShape();
        vertex(this.x, this.y);
        vertex(this.x + brickWidth, this.y);
        vertex(this.x + brickWidth - 10, this.y + 10);
        vertex(this.x + 10, this.y + 10);
        endShape(CLOSE);
    }
}
