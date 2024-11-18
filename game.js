let paddle;
let balls = [];
let bricks = [];
let rows = 5;
let cols = 10;
let brickWidth;
let brickHeight = 20;
let score = 0;
let highScore = 0;

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
let leaderboard = [];
let stars = [];

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
    loadHighScore();
    loadLeaderboard(); // Load leaderboard data
}

function setup() {
    let canvas = createCanvas(800, 600);
    let gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        canvas.parent('game-container');
    } else {
        console.error('game-container element not found');
    }
    noLoop(); // Don't start the game until the user clicks the start button
    initializeBricks(); // Initialize bricks on setup
    paddle = new Paddle();
    balls = [new Ball()]; // Initialize with one ball
    brickWidth = width / cols;
    powerUps = []; // Clear existing power-ups
    particles = []; // Clear existing particles
    initializeStars(); // Initialize stars for the background
    updateScoreboard();
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
    document.getElementById('game-over-text').style.display = 'none'; // Hide the Game Over text
    score = 0; // Reset the score
    initializeBricks(); // Ensure bricks are loaded when the game starts
    balls = [new Ball()]; // Reset the balls array to ensure a new ball is created
    powerUps = []; // Reset the powerUps array to ensure no power-ups are active
    particles = []; // Reset the particles array to ensure no particles are active
    updateScoreboard(); // Update the scoreboard with the reset score
    loop(); // Start the game loop
}

function draw() {
    drawStars(); // Draw stars on the background
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
        textFont('Press Start 2P'); // Change font to "Press Start 2P"
        text(message.text, message.x, message.y);
        message.duration -= deltaTime;
        if (message.duration <= 0) {
            activeMessages.splice(index, 1);
        }
    });
    updateScoreboard(); // Update the scoreboard with the current score
    if (balls.length === 0) {
        noLoop();
        document.getElementById('game-over-text').style.display = 'block'; // Show the Game Over text
        document.getElementById('retry-button').style.display = 'block'; // Show the retry button
        if (score > highScore) {
            updateLeaderboard();
        }
        saveHighScore();
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
    // Disable scroll wheel inputs
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
                gameOverSound.play();
                document.getElementById('game-over-text').style.display = 'block'; // Show the Game Over text
                document.getElementById('retry-button').style.display = 'block'; // Show the retry button
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
        const colors = ['#F00901', '#08F01C', '#DB00F0', '#F27127', '#0114F0'];
        this.color = special ? '#EFE100' : random(colors); // Gold color for special bricks
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

function updateLeaderboard() {
    if (score > highScore) {
        fetch('contributors.json')
            .then(response => response.json())
            .then(data => {
                contributors = data;
                let playerMessage = prompt("Enter a message (max 50 characters):");
                playerMessage = playerMessage.substring(0, 50); // Limit message length

                let contributorOptions = contributors.map((contributor, index) => `${index + 1}. ${contributor.name}`).join('\n');
                let selectedOption = prompt(`Select your profile:\n${contributorOptions}`);
                let selectedContributor = contributors[selectedOption - 1];

                if (selectedContributor) {
                    let date = new Date();
                    let newEntry = {
                        name: selectedContributor.name,
                        score: score,
                        message: playerMessage,
                        avatar_url: selectedContributor.avatar_url,
                        date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                        time: millis() // Time in milliseconds
                    };
                    leaderboard.push(newEntry);
                    leaderboard.sort((a, b) => {
                        if (b.score === a.score) {
                            return a.time - b.time; // Sort by time ascending if scores are equal
                        }
                        return b.score - a.score; // Sort by score descending
                    });

                    updateLeaderboardDisplay();
                    saveLeaderboard(); // Save leaderboard data
                    updateScoreboard();

                    // Save new entry to localStorage
                    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

                    // Add new entry to leaderboard.json locally
                    fetch('leaderboard.json')
                        .then(response => response.json())
                        .then(leaderboardData => {
                            leaderboardData.push(newEntry);
                            localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
                        })
                        .catch(error => console.error('Error updating local leaderboard.json:', error));
                } else {
                    alert("Invalid selection. Please try again.");
                }
            })
            .catch(error => console.error('Error loading contributors:', error));
    }
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function loadHighScore() {
    highScore = localStorage.getItem('highScore') || 0;
}

function updateScoreboard() {
    let scoreboardContainer = document.getElementById('scoreboard-container');
    scoreboardContainer.innerHTML = `<h2>High Score: ${highScore}</h2><h2>Score: ${score}</h2>`;
}

function saveLeaderboard() {
    const leaderboardData = JSON.stringify(leaderboard);
    localStorage.setItem('leaderboard', leaderboardData);
}

function loadLeaderboard() {
    const leaderboardData = localStorage.getItem('leaderboardData');
    if (leaderboardData) {
        leaderboard = JSON.parse(leaderboardData);
        updateLeaderboardDisplay();
    } else {
        fetch('leaderboard.json')
            .then(response => response.json())
            .then(data => {
                leaderboard = data;
                localStorage.setItem('leaderboardData', JSON.stringify(leaderboard));
                updateLeaderboardDisplay();
            })
            .catch(error => console.error('Error loading leaderboard:', error));
    }
}

function updateLeaderboardDisplay() {
    let leaderboardContainer = document.getElementById('leaderboard-container');
    leaderboardContainer.innerHTML = `
        <h2 class="leaderboard-header">🏅🏆Leaderboard🏆🏅</h2>
        <div class="leaderboard-titles">
            <div class="name">Name</div>
            <div class="score">Score</div>
            <div class="message">Message</div>
            <div class="date">Date</div>
            <div class="time">Time</div>
        </div>
        <ol id="leaderboard-list"></ol>
    `;
    let leaderboardList = document.getElementById('leaderboard-list');
    leaderboard.forEach(player => {
        let timeInMinutes = (player.time / 60000).toFixed(2); // Convert time to minutes and format to 2 decimal places
        let item = document.createElement('li');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <img src="${player.avatar_url}" alt="avatar" width="50" height="50">
            <div class="name">${player.name}</div>
            <div class="score">${player.score}</div>
            <div class="message">${player.message}</div>
            <div class="date">${player.date}</div>
            <div class="time">${timeInMinutes} min</div>
        `;
        leaderboardList.appendChild(item);
    });

    // Update the content of the json-copy-container div with the updated leaderboard JSON
    let leaderboardJsonContainer = document.getElementById('leaderboard-json');
    leaderboardJsonContainer.textContent = JSON.stringify(leaderboard, null, 2);
    Prism.highlightElement(leaderboardJsonContainer); // Highlight the JSON code using Prism.js
}

function copyToClipboard() {
    const jsonText = document.getElementById('leaderboard-json').textContent;
    navigator.clipboard.writeText(jsonText).then(() => {
        alert('Leaderboard JSON copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function initializeStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            size: random(1, 3)
        });
    }
}

function drawStars() {
    background(0);
    noStroke();
    fill(255);
    stars.forEach(star => {
        ellipse(star.x, star.y, star.size);
    });
}
