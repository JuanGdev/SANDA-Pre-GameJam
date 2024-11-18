let paddle;
let balls = [];
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
let extraBallSound;

let specialMessages = [];
let powerUps = [];
let particles = [];
let contributors = [];
let tail = [];
let activeMessages = [];

function preload() {
    wallHitSound = loadSound('sounds/wall-hit.mp3');
    powerUpSound = loadSound('sounds/power-up.mp3');
    brickHitSound = loadSound('sounds/brick-hit.mp3');
    gameOverSound = loadSound('sounds/game-over.wav');
    loadJSON('words.json', (data) => {
        specialMessages = data.specialMessages;
    });
    extraBallSound = loadSound('sounds/wall-hit.mp3', 
        () => console.log('extra-ball.mp3 loaded successfully'), 
        () => console.error('Failed to load extra-ball.mp3')
    ); // Load sound for extra ball power-up
    loadJSON('contributors.json', (data) => {
        contributors = data;
    });
}

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('game-container');
    noLoop(); // Don't start the game until the user clicks the start button
    canvas.elt.addEventListener('wheel', handleMouseWheel);
    initializeBricks(); // Initialize bricks on setup
    paddle = new Paddle();
    balls = [new Ball()]; // Initialize with one ball
    brickWidth = width / cols;
    powerUps = []; // Clear existing power-ups
    particles = []; // Clear existing particles
}

function initializeBricks() {
    bricks = []; // Clear existing bricks
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let isSpecial = random() < 0.1; // 10% chance to be a special brick
            let powerUp = isSpecial ? createExtraBallPowerUp : null;
            bricks.push(new Brick(j * brickWidth, i * brickHeight, isSpecial, powerUp));
        }
    }
}

function startGame() {
    getAudioContext().resume(); // Resume the AudioContext after a user gesture
    document.getElementById('start-button').style.display = 'none'; // Hide the start button
    document.getElementById('retry-button').style.display = 'none'; // Hide the retry button
    document.getElementById('message-container').innerHTML = ''; // Clear message container
    score = 0; // Reset the score
    initializeBricks(); // Ensure bricks are loaded when the game starts
    balls = [new Ball()]; // Reset the balls array to ensure a new ball is created
    powerUps = []; // Reset the powerUps array to ensure no power-ups are active
    particles = []; // Reset the particles array to ensure no particles are active
    loop(); // Start the game loop
}

function draw() {
    background(0);
    if (paddle && balls.length > 0) {
        paddle.show();
        paddle.update();
        balls.forEach(ball => {
            ball.show();
            ball.update();
            ball.checkPaddle(paddle);
            for (let i = bricks.length - 1; i >= 0; i--) {
                bricks[i].show();
                if (ball.hits(bricks[i])) {
                    ball.reverse();
                    if (bricks[i].special) {
                        showSpecialMessage();
                        if (bricks[i].powerUp) {
                            bricks[i].powerUp(bricks[i].x, bricks[i].y, ball.xspeed, ball.yspeed);
                        }
                    }
                    bricks.splice(i, 1);
                    score++;
                    brickHitSound.play();
                }
            }
        });
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].show();
        powerUps[i].update();
        if (powerUps[i].hits(paddle)) {
            powerUps[i].activate();
            createParticleEffect(powerUps[i].x, powerUps[i].y);
            powerUps.splice(i, 1);
        }
    }
    particles.forEach((particle, index) => {
        particle.update();
        particle.show();
        if (particle.isFinished()) {
            particles.splice(index, 1);
        }
    });
    tail.forEach((t, index) => {
        t.update();
        t.show();
        if (t.isFinished()) {
            tail.splice(index, 1);
        }
    });
    activeMessages.forEach((message, index) => {
        fill(message.color);
        textSize(message.fontSize);
        textStyle(message.style);
        text(message.text, message.x, message.y);
        message.duration -= deltaTime;
        if (message.duration <= 0) {
            activeMessages.splice(index, 1);
        }
    });
    fill(255);
    textSize(24);
    text('Score: ' + score, 10, height - 10);
    if (balls.length === 0) {
        noLoop();
        textSize(32);
        textAlign(CENTER);
        fill(255);
        text('Game Over', width / 2, height / 2);
        gameOverSound.play();
        document.getElementById('retry-button').style.display = 'block'; // Show the retry button
        document.getElementById('retry-button').style.top = (height / 2 + 40) + 'px'; // Position below "Game Over"
    }
    if (bricks.length === 0 && balls.length > 0) {
        showCredits();
        noLoop();
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
    if ((keyCode === LEFT_ARROW && paddle.xdir === -1) || (keyCode === RIGHT_ARROW && paddle.xdir === 1)) {
        paddle.move(0);
    }
}

function handleMouseWheel(event) {
    if (event.deltaY < 0) {
        paddle.move(-1); // Scroll up
    } else {
        paddle.move(1); // Scroll down
    }
    setTimeout(() => paddle.move(0), 100); // Stop movement after a short delay
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
        this.x += this.xdir * 20; // Increase the speed for faster movement
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
        this.xspeed = random([-5, 5]); // Random initial horizontal direction
        this.yspeed = 5; // Initial downward direction
    }

    show() {
        fill(255);
        ellipse(this.x, this.y, this.r * 2);
    }

    update() {
        this.x += this.xspeed;
        this.y += this.yspeed;
        tail.push(new Tail(this.x, this.y, this.r));
        if (tail.length > 10) { // Limit the tail length
            tail.shift();
        }
        if (this.x > width || this.x < 0) {
            this.xspeed *= -1;
            wallHitSound.play();
        }
        if (this.y < 0) {
            this.yspeed *= -1;
            wallHitSound.play();
        }
        if (this.y > height) {
            balls.splice(balls.indexOf(this), 1);
            if (balls.length === 0) {
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
        this.xspeed *= 1.02; // Reduce speed increase to 2%
        this.yspeed *= 1.02; // Reduce speed increase to 2%
    }
}

class Brick {
    constructor(x, y, special = false, powerUp = null) {
        this.x = x;
        this.y = y;
        this.special = special;
        this.powerUp = powerUp;
        const colors = ['#F21616', '#F26A1B', '#F29D35', '#F2E1AC', '#547326'];
        this.color = special ? '#FFD700' : random(colors); // Gold color for special bricks
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

class PowerUp {
    constructor(x, y, color, sound, logic) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.sound = sound;
        this.logic = logic;
        this.size = 20;
        this.yspeed = 2;
    }

    show() {
        fill(this.color);
        ellipse(this.x, this.y, this.size);
    }

    update() {
        this.y += this.yspeed;
    }

    hits(paddle) {
        return (this.y + this.size / 2 > paddle.y && this.x > paddle.x && this.x < paddle.x + paddle.width);
    }

    activate() {
        powerUpSound.play(); // Play the power-up sound
        this.sound.play();
        this.logic();
    }
}

function createExtraBallPowerUp(x, y, xspeed, yspeed) {
    const color = '#00FF00'; // Green color
    const sound = extraBallSound;
    const logic = () => {
        let newBall = new Ball();
        newBall.x = x;
        newBall.y = y;
        newBall.xspeed = xspeed;
        newBall.yspeed = yspeed;
        balls.push(newBall);
    };
    powerUps.push(new PowerUp(x, y, color, sound, logic));
}

function showSpecialMessage() {
    if (specialMessages.length > 0) {
        let message = specialMessages.splice(floor(random(specialMessages.length)), 1)[0];
        activeMessages.push({
            text: message.text,
            fontSize: message.fontSize,
            duration: message.duration,
            color: message.color,
            style: message.style,
            x: message.x,
            y: message.y
        });
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.alpha = 255;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 5;
    }

    show() {
        noStroke();
        fill(255, this.alpha);
        ellipse(this.x, this.y, 8);
    }

    isFinished() {
        return this.alpha < 0;
    }
}

function createParticleEffect(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y));
    }
}

class Tail {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.alpha = 255;
    }

    update() {
        this.alpha -= 25; // Fade out more gradually
    }

    show() {
        noStroke();
        fill(255, 255, 0, this.alpha); // Yellow color
        ellipse(this.x, this.y, this.r * 2);
    }

    isFinished() {
        return this.alpha < 0;
    }
}

function showCredits() {
    background(0);
    let y = height;
    let creditsContainer = createDiv('').id('credits-container').parent('game-container');
    createDiv('Credits').parent(creditsContainer).style('font-size', '32px').style('margin-bottom', '20px');
    contributors.forEach(contributor => {
        let item = createDiv('').class('credits-item').parent(creditsContainer);
        createImg(contributor.avatar_url, 'avatar').size(50, 50).parent(item);
        createDiv(contributor.name).parent(item);
    });
    creditsContainer.position(0, y);
    creditsContainer.style('width', '100%');
    creditsContainer.style('text-align', 'center');
    creditsContainer.style('color', 'white');
    creditsContainer.style('font-size', '24px');
    creditsContainer.style('animation', 'scroll-up 10s linear forwards');
}
