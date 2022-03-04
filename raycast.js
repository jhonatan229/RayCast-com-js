const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const FOV_ANG = 60 * (Math.PI / 180);

const COLUMNS_PER_PIXEL = 1;
const NUM_RAYS = WINDOW_WIDTH / COLUMNS_PER_PIXEL;

class Map {
	//o construtor da classe map, onde tem a prototipagem do mapa
	constructor() {
		this.grid = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		];
	}
	//passa por cada quadradinho do mapa e printa na tela com o tamanho de cada quadrado (TILE_SIZE)
	render() {
		for (var i = 0; i < MAP_NUM_ROWS; i++) {
			for (var j = 0; j < MAP_NUM_COLS; j++) {
				var tileX = j * TILE_SIZE;
				var tileY = i * TILE_SIZE;
				var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
			}
		}
	}
	//serve para verificar se onde o personagem esta é uma parede ou não
	//o  | 0 serve para arredondar os valores para eu verificar no mapa
	// line == y, colum  == x
	isWall(line, colum) {
		if (colum < 0 || line < 0 || line > WINDOW_HEIGHT || colum > WINDOW_WIDTH)
			return true;
		line = line / TILE_SIZE | 0
		colum = colum / TILE_SIZE | 0
		//console.log(line, colum);
		if (this.grid[line][colum] == 1)
			return true;
		return false;
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3; //size os player in pixels
		this.directionPlayer = 0; //-1 left, 1 right
		this.walkPlayer = 0; //-1 back, 1 front
		this.rotationAngle = (Math.PI * 3) / 2; // onde o personagem começa aprontando;
		this.moveSpeed = 3 //quantity of pixels the player move of each movemente
		this.rotationSpeed = 2 * (Math.PI / 180); //rotation speed in degres, so we need to convert by radian
		this.directionX = 1; //1 add x, -1 decrease
		this.directionY = 1; //1 add y, -1 decrease
	}
	updateDirections(posAngle) {
		//console.log("caius: " + posAngle)
		if (posAngle > 0 && posAngle < Math.PI)
			this.directionY = 1;
		else
			this.directionY = -1;
		if (posAngle >= Math.PI * 0.5 && posAngle <= Math.PI * 1.5)
			this.directionX = -1
		else
			this.directionX = 1;
	}
	//atualiza a posição do personagem com base no angulo (rotationAngle), achando o coseno para o X, e o seno para o Y
	update() {
		var nextX = (this.walkPlayer * this.moveSpeed) * Math.cos(this.rotationAngle)
		var nextY = (this.walkPlayer * this.moveSpeed) * Math.sin(this.rotationAngle)
		if (!grid.isWall(nextY + this.y, nextX + this.x)) {
			this.x += nextX;
			this.y += nextY;
		}
		//atualio o angulo do meu player, caso o usuario tenha apertado as teclas da direita e esquerda
		this.rotationAngle += this.directionPlayer * this.rotationSpeed;
	}
	//printa uma lina mostrando para onde o player ta olhando e printa o player tbm 
	render() {
		noStroke();
		fill("red");
		circle(this.x, this.y, this.radius);
		stroke("red");
		line(this.x, this.y, this.x + Math.cos(this.rotationAngle) * 15, this.y + Math.sin(this.rotationAngle) * 15);
	}
}

class Ray {
	constructor(rayAngle) {
		this.rayAngle = rayAngle;
		this.intersectionHY = 0;
		this.intersectionHX = 0;
		this.intersectionVY = 0;
		this.intersectionVX = 0;
		this.wallPosx = 0;
		this.wallPosy = 0;
	}
	//printa uma linha com base no angulo do ray que ta sendo verificado (rayAngle).
	render() {
		//stroke("purple")
		// line(player.x, player.y,
		// 	player.x + Math.cos(this.rayAngle) * 30,
		// 	player.y + Math.sin(this.rayAngle) * 30);
		// stroke("green");
		// line(player.x, player.y,
		// 	this.intersectionHX, this.intersectionHY);
		// stroke("yellow");
		// line(player.x, player.y,
		// 	this.intersectionVX, this.intersectionVY);
		// stroke("yellow");
		line(player.x, player.y,
			this.wallPosx, this.wallPosy);

	}
	castHorizontal(wallLocation) {
		let ystep;
		let xstep;
		this.intersectionHY = (player.y / TILE_SIZE | 0) * TILE_SIZE;
		if (player.directionY == 1) {
			this.intersectionHY += TILE_SIZE
			ystep = TILE_SIZE
		} else {
			ystep = TILE_SIZE * -1
		}
		this.intersectionHX = player.x + (this.intersectionHY - player.y) / Math.tan(this.rayAngle);
		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= (player.directionX == -1 && xstep > 0) ? -1 : 1
		xstep *= (player.directionX == 1 && xstep < 0) ? -1 : 1
		while (!grid.isWall(this.intersectionHY + player.directionY, this.intersectionHX)) {
			this.intersectionHX += xstep;
			this.intersectionHY += ystep;
		}
	}
	castVertical() {
		let ystep;
		let xstep;
		this.intersectionVX = (player.x / TILE_SIZE | 0) * TILE_SIZE;
		if (player.directionX == 1) {
			this.intersectionVX += TILE_SIZE
			xstep = TILE_SIZE
		} else {
			xstep = TILE_SIZE * -1
		}
		this.intersectionVY = player.y + (this.intersectionVX - player.x) * Math.tan(this.rayAngle);
		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= (player.directionY == -1 && ystep > 0) ? -1 : 1
		ystep *= (player.directionY == 1 && ystep < 0) ? -1 : 1
		while (!grid.isWall(this.intersectionVY, this.intersectionVX + player.directionX)) {
			this.intersectionVX += xstep;
			this.intersectionVY += ystep;
		}
		console.log(this.intersectionVX, this.intersectionVY)
	}
	cast() {
		this.wallPosx = 0
		this.wallPosy = 0
		this.castHorizontal()
		this.castVertical()
		console.log("horizontal: " + this.intersectionHX, this.intersectionHY + "vertical: " + this.intersectionVX, this.intersectionVY)
		if ((this.intersectionHX + this.intersectionHY ) > (this.intersectionVX + this.intersectionVY)) {
			if (this.intersectionVX > 0 && this.intersectionVY > 0) {
				this.wallPosx = this.intersectionVX
				this.wallPosy = this.intersectionVY
			}
		}
		else {
			if (this.intersectionHX > 0 && this.intersectionHY > 0) {
				this.wallPosx = this.intersectionHX
				this.wallPosy = this.intersectionHY
			}
		}

	}
}

var player = new Player();
var grid = new Map();
var raysLst = [];

function normalizeAngle(angle) {
	angle % Math.PI * 2
	if (angle < 0)
		angle = (2 * Math.PI) + angle
	return angle
}

function keyPressed() {
	if (keyCode == UP_ARROW)
		player.walkPlayer = 1;
	if (keyCode == DOWN_ARROW)
		player.walkPlayer = -1;
	if (keyCode == LEFT_ARROW)
		player.directionPlayer = -1;
	if (keyCode == RIGHT_ARROW)
		player.directionPlayer = 1;
}

function keyReleased() {
	if (keyCode == UP_ARROW)
		player.walkPlayer = 0;
	if (keyCode == DOWN_ARROW)
		player.walkPlayer = 0;
	if (keyCode == LEFT_ARROW)
		player.directionPlayer = 0;
	if (keyCode == RIGHT_ARROW)
		player.directionPlayer = 0;
}

//estamos criando uma lista da classe Ray, e cada um com um angulo diferente (posAngle)
function castAllRays() {
	var columsId = 0;
	var posAngle = player.rotationAngle - (FOV_ANG / 2);
	posAngle = normalizeAngle(posAngle)

	//aqui reseta a lista para vazio novamente;
	raysLst = [];
	for (let i = 0; i < NUM_RAYS; i++) {
		var rayPoint = new Ray(posAngle);
		player.updateDirections(posAngle);
		rayPoint.cast();
		raysLst.push(rayPoint);
		columsId++;
		//esse calculo serve para mudar um pouco o angulo para o proximo ray
		posAngle += FOV_ANG / NUM_RAYS;
	}
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

//atualiza de segundo em segundo algumas informações, isso acontece antes do "draw"
function update() {
	player.update();
	castAllRays();
}

//printa as coisas na tela 
function draw() {
	update();

	grid.render();
	for (ray of raysLst) {
		ray.render();
	}
	player.render();
}
