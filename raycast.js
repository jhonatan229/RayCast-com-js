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
		if (colum < 0 || line < 0)
			return true;
		//console.log(line, colum);
		if (this.grid[line / TILE_SIZE | 0][colum / TILE_SIZE | 0] == 1)
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
		this.rotationAngle = (Math.PI * 3)/ 2; // onde o personagem começa aprontando;
		this.moveSpeed = 3 //quantity of pixels the player move of each movemente
		this.rotationSpeed = 2 * (Math.PI / 180); //rotation speed in degres, so we need to convert by radian
		this.directionX = 1; //1 add x, -1 decrease
		this.directionY = 1; //1 add y, -1 decrease
	}
	updateDirections(posAngle){
		if (posAngle > 0 && posAngle < Math.PI)
			this.directionY = 1;
		else
			this.directionY = -1;
		if (posAngle > Math.PI / 2 && posAngle < (Math.PI * 3) / 2)
			this.directionX = 1
		else
			this.directionX = -1;
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
		this.intersectionY = 0;
		this.intersectionX = 0;
	}
	//printa uma linha com base no angulo do ray que ta sendo verificado (rayAngle).
	render() {
		stroke("purple")
		line(player.x, player.y,
			player.x + Math.cos(this.rayAngle) * 30,
			player.y + Math.sin(this.rayAngle) * 30);
		stroke("green");
		line(player.x, player.y,
			// player.x + Math.cos(this.rayAngle) * (this.intersectionX) ,
			// player.y + Math.sin(this.rayAngle) * (this.intersectionY) );
		 	this.intersectionX + Math.cos(this.rayAngle), this.intersectionY + Math.sin(this.rayAngle)); 
			
	}
	cast(){
		if(this.rayAngle < Math.PI * 2 && this.rayAngle > Math.PI){
			this.intersectionY = (player.y / TILE_SIZE | 0) * TILE_SIZE;
			this.intersectionX = player.x + (player.y - this.intersectionY) / Math.tan(this.rayAngle);
			while(!grid.isWall(this.intersectionY - 0.4, this.intersectionX)){
				this.intersectionY -= TILE_SIZE;
				if (this.rayAngle < Math.PI * 3 / 2)
				//console.log(TILE_SIZE / Math.tan(this.rayAngle))
					this.intersectionX -= TILE_SIZE / Math.tan(this.rayAngle)
				else
					this.intersectionX += TILE_SIZE / Math.tan(this.rayAngle) * -1
			}
			console.log(this.intersectionX, this.intersectionY, player.x, player.y + "dir x" + player.directionX)
		}
		else{
			//todo
		}
	}
}

var player = new Player();
var grid = new Map();
var raysLst = [];

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

	//aqui reseta a lista para vazio novamente;
	raysLst = [];
	for (let i = 0; i < 1; i++) {
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
