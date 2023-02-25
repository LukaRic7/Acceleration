const game = document.getElementById("game");
const playArea = document.getElementById("playarea");
const playAreaRect = playArea.getBoundingClientRect();

const GAME_WIDTH = game.clientWidth;
const GAME_HEIGHT = game.clientHeight;
const PLAY_AREA_WIDTH = document.getElementById("playarea").clientWidth;
const PLAY_AREA_HEIGHT = document.getElementById("playarea").clientHeight;
const PLAY_AREA_LEFT = document.getElementById("playarea").offsetLeft;
const PLAY_AREA_TOP = document.getElementById("playarea").offsetTop;
const PLAY_AREA_RIGHT = PLAY_AREA_LEFT + PLAY_AREA_WIDTH;
const PLAY_AREA_BOTTOM = PLAY_AREA_TOP + PLAY_AREA_HEIGHT;

const PLAYER_RADIUS = 10;
const PLAYER_SPEED = 5;
const ENEMY_RADIUS = 10;
const ENEMY_SPEED = 3;
const FRAME_RATE = 10;
const SPAWN_INTERVAL = 3000;
const COUNTDOWN = 3;

let playerX = PLAY_AREA_WIDTH / 2;
let playerY = PLAY_AREA_HEIGHT / 2;
let gameInterval = null;
let countdownInterval = null;

let playerElement = null;
let enemyCount = 0;
let record = 0;
let enemyCounterElement = null;
let timerElement = null;
let countdownElement = null;
let intervals = [];

function insertHTML() {
	playerElement = document.createElement("div");
	playerElement.id = "player";
	playerElement.style.left = playerX + 'px';
	playerElement.style.top = playerY + 'px';
	playArea.appendChild(playerElement);

	enemyCounterElement = document.createElement("div");
	enemyCounterElement.id = "enemy-counter";
	enemyCounterElement.innerText = "Particles: " + enemyCount;
	playArea.appendChild(enemyCounterElement);

	timerElement = document.createElement("div");
	timerElement.id = "timer";
	timerElement.innerText = "00:00:00";
	playArea.appendChild(timerElement);

	recordTimerElement = document.createElement("div");
	recordTimerElement.id = "record-timer";
	recordTimerElement.innerText = "00:00:00";
	playArea.appendChild(recordTimerElement);

	countdownElement = document.createElement("div");
	countdownElement.id = "countdown";
	playArea.appendChild(countdownElement);
}

function movePlayer(event) {
	const player = document.getElementById("player");
	const mouseX = event.clientX - PLAY_AREA_LEFT - (PLAYER_RADIUS * 1.5);
	const mouseY = event.clientY - PLAY_AREA_TOP - (PLAYER_RADIUS * 1.5);
	const playerX = parseInt(player.style.left);
	const playerY = parseInt(player.style.top);
	const angle = Math.atan2(mouseY - playerY, mouseX - playerX);
	const newX = Math.min(Math.max(mouseX - Math.cos(angle) * PLAYER_RADIUS, 0), PLAY_AREA_WIDTH - 2 * PLAYER_RADIUS) + PLAYER_RADIUS;
	const newY = Math.min(Math.max(mouseY - Math.sin(angle) * PLAYER_RADIUS, 0), PLAY_AREA_HEIGHT - 2 * PLAYER_RADIUS) + PLAYER_RADIUS;
	player.style.left = newX + "px";
	player.style.top = newY + "px";
}

function startGame() {
	// Show countdown element and start countdown from x to 0
	countdownElement.style.display = "block";
	let countdown = COUNTDOWN;
	countdownElement.innerText = countdown;
	countdownInterval = setInterval(() => {
		countdown--;
		if (countdown === 0) {
			clearInterval(countdownInterval);
			countdownElement.innerText = "";

			// Start timer and spawn enemies at interval defined by SPAWN_INTERVAL
			document.addEventListener("mousemove", movePlayer);
			startTimer();
			spawnEnemy();
			intervals.push(setInterval(spawnEnemy, SPAWN_INTERVAL));
		} else {
			countdownElement.innerText = countdown;
		}
	}, 1000);
}

function startTimer() {
	let startTime = Date.now();
	gameInterval = setInterval(() => {
		let elapsedTime = Date.now() - startTime;
		let seconds = Math.floor(elapsedTime / 1000);
		let minutes = Math.floor(seconds / 60);
		seconds = seconds % 60;
		let milliseconds = elapsedTime % 1000;
		let millisecondsString = milliseconds.toString().padStart(3, "0").slice(0, 2);
		let timeString = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + ":" + millisecondsString;
		timerElement.innerText = timeString;

		if (elapsedTime > record) {
			record = elapsedTime;
			recordTimerElement.innerText = timeString;
		}
	}, 10);
}

function spawnEnemy() {
	// create a new enemy ball
	const enemy = document.createElement('div');
	enemy.classList.add('enemy');
	playArea.appendChild(enemy);

	// Increment the enemy counter
	enemyCount += 1;
	enemyCounterElement.innerText = "Particles: " + enemyCount;

	// randomly position the enemy ball within the play area
	const x = Math.floor(Math.random() * (playarea.offsetWidth - enemy.offsetWidth));
	const y = Math.floor(Math.random() * (playarea.offsetHeight - enemy.offsetHeight));
	enemy.style.left = x + 'px';
	enemy.style.top = y + 'px';

	// randomly set the initial direction of the enemy ball
	let dx = [-1, 1][Math.floor(Math.random() * 2)];
	let dy = [-1, 1][Math.floor(Math.random() * 2)];
	const speed = 2; // pixels per frame

	// move the enemy ball every frame
	const moveEnemy = () => {
		// get the current position of the enemy ball
		let x = parseInt(enemy.style.left);
		let y = parseInt(enemy.style.top);

		// check if the enemy ball is hitting the walls
		if (x - ENEMY_RADIUS <= 0 || x + (ENEMY_RADIUS * 3) - enemy.offsetWidth >= playArea.offsetWidth) {
			dx = -dx;
		}
		if (y - ENEMY_RADIUS <= 0 || y + (ENEMY_RADIUS * 3) - enemy.offsetHeight >= playArea.offsetHeight) {
			dy = -dy;
		}

		// update the position of the enemy ball
		x += dx * speed;
		y += dy * speed;
		enemy.style.left = x + 'px';
		enemy.style.top = y + 'px';

		// check if the enemy ball is touching the player ball
		const player = document.getElementById("player");
		if (checkCollision({
			x: x + ENEMY_RADIUS,
			y: y + ENEMY_RADIUS,
			radius: ENEMY_RADIUS
		}, {
			x: parseInt(player.style.left) + PLAYER_RADIUS,
			y: parseInt(player.style.top) + PLAYER_RADIUS,
			radius: PLAYER_RADIUS
		})) {
			clearInterval(enemyInterval);
			clearInterval(gameInterval);
			gameOver();
		}
	};

	// start moving the enemy ball every frame
	const enemyInterval = setInterval(moveEnemy, FRAME_RATE);
	intervals.push(enemyInterval);
}

function checkCollision(obj1, obj2) {
	let dx = obj1.x - obj2.x;
	let dy = obj1.y - obj2.y;
	let distance = Math.sqrt(dx * dx + dy * dy);
	return distance < obj1.radius + obj2.radius;
}

function gameOver() {
	// clear all intervals
	for (let i = 0; i < intervals.length; i++) {
		clearInterval(intervals[i]);
	}
	
	// delete all enemies
	const enemies = document.querySelectorAll('.enemy');
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].remove();
	}

	// reset timer
	clearInterval(gameInterval);

	countdownElement.innerText = "You Died!";

	setTimeout(function() {
		timerElement.innerText = "00:00:00";
		enemyCount = 0;
		enemyCounterElement.innerText = "Particles: 0";
		
		// start countdown
		startGame()
	}, 3000);
}

insertHTML()
startGame()