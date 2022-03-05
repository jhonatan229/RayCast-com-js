const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const FOV_ANG = 60 * (Math.PI / 180);

const COLUMNS_PER_PIXEL = 1;
const NUM_RAYS = WINDOW_WIDTH / COLUMNS_PER_PIXEL;
const SCALE_MINIMAP = 0.2

const DISTANCE_PROJ_PLANE = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANG / 2)

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
		fill("rgba(226, 205, 200, 1)")
		rect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT / 2)
		fill("#686261")
		rect(0, WINDOW_HEIGHT / 2, WINDOW_WIDTH, WINDOW_HEIGHT )
		for (var i = 0; i < MAP_NUM_ROWS; i++) {
			for (var j = 0; j < MAP_NUM_COLS; j++) {
				var tileX = j * TILE_SIZE;
				var tileY = i * TILE_SIZE;
				var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(SCALE_MINIMAP * tileX, SCALE_MINIMAP * tileY, SCALE_MINIMAP * TILE_SIZE, SCALE_MINIMAP * TILE_SIZE);
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
	//serve para, dependendo do angulo, setar a direção do x e y
	//x = -1 o player ta olhando para a esquerda; 1 ele ta olhando para a direita
	//y = -1 o player ta olhando para cima; 1 ele ta olhando para baixo
	updateDirections(posAngle) {
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
		fill("yellow");
		circle(SCALE_MINIMAP * this.x, SCALE_MINIMAP * this.y, SCALE_MINIMAP * this.radius);

	}
}

class Ray {
	constructor(angle, columId) {
		this.columId = columId
		this.rayAngle = normalizeAngle(angle);//o angulo do raio, ja calibrado, caso ele passe de pi * 2 ou 0
		this.intersectionHY = 0; //Onde é guardado a posição da primeira parede horizontal na posição x
		this.intersectionHX = 0; //Onde é guardado a posição da primeira parede horizontal na posição y
		this.intersectionVY = 0; //Onde é guardado a posição da primeira parede vertical na posição x
		this.intersectionVX = 0; //Onde é guardado a posição da primeira parede vertical na posição y
		this.wallPosx = 0; // quarda a posição x da primeira ocorrencia de parede (horizontal ou vertical)
		this.wallPosy = 0; // quarda a posição y da primeira ocorrencia de parede (horizontal ou vertical)
		this.distance = 0; // guarda a distancia da primeira ocorrencia da parede entre o player
		this.wallVertHit = false
	}
	//printa uma linha com base no angulo do ray que ta sendo verificado (rayAngle).
	render() {
		var linelengh = (TILE_SIZE / this.distance) * DISTANCE_PROJ_PLANE
		stroke("#8EF5BF");
		line(SCALE_MINIMAP * player.x, SCALE_MINIMAP * player.y,
			SCALE_MINIMAP * this.wallPosx, SCALE_MINIMAP * this.wallPosy);
		line(this.columId, (WINDOW_HEIGHT / 2) - (linelengh / 2), this.columId, (WINDOW_HEIGHT / 2) + (linelengh / 2))
	}
	castHorizontal(wallLocation) {
		let ystep; // sera a quantidade de espaço que cada intersecção faz entre uma e outra, esse espaço é sempre o mesmo
		let xstep; // sera a quantidade de espaço que cada intersecção faz entre uma e outra, esse espaço é sempre o mesmo
		this.intersectionHY = (player.y / TILE_SIZE | 0) * TILE_SIZE; // serve para pegarmos a intersecção que esta acima do player
		//se o player estiver olhando para baixo, acrescentamos mais 32 (TILE_SIZE) ao intersection
		//o ystep vai valer +32 se ele estiver olhando para baixo e -32 se ele estiver olhando para cima, isso serve para irmos acrescentando ou diminuindo o intersectionHY mais para frente
		if (player.directionY == 1) {
			this.intersectionHY += TILE_SIZE
			ystep = TILE_SIZE
		} else {
			ystep = TILE_SIZE * -1
		}
		// a linhade baixo serve para pegarmos o cateto adjacente do nosso triangulo, é com ele que conseguitemos a posição x da nossa intersecção
		this.intersectionHX = player.x + (this.intersectionHY - player.y) / Math.tan(this.rayAngle);
		//xstep vai ser sempre acrescentado ou decrementado do intersextionHX dependendo da direção do nosso player
		xstep = TILE_SIZE / Math.tan(this.rayAngle); // é o distanciamento entre as intersecções, ele sempre é o mesmo 
		xstep *= (player.directionX == -1 && xstep > 0) ? -1 : 1
		xstep *= (player.directionX == 1 && xstep < 0) ? -1 : 1
		//a cada interesecção que ele passa, acrescenta mais um ou menos um pixel no intersectionHY para entrarmos na box, e a função "isWall"
		//verificar se essa box é uma uma parede ou não, se não for, ele vai acrescentar mais ou menos (depende para onde o player estiver olhando)
		//até nossa proxima intersecção
		while (!grid.isWall(this.intersectionHY + player.directionY, this.intersectionHX)) {
			this.intersectionHX += xstep;
			this.intersectionHY += ystep;
		}
	}
	//a função faz a mesma coisa da de cima, entretanto, ele ta olhando para as paredes verticais
	//logo o calculo não é mais para achar o cateto adjacente, mas sim o cateto oposto, e sempre usamos ele para acrescentarmos ou diminuitmos o
	//intersectionVX com o xstep
	castVertical() {
		let ystep;
		let xstep;
		this.intersectionVX = (player.x / TILE_SIZE | 0) * TILE_SIZE; // achando o cateto oposto do nosso triangulo
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
	}
	cast() {
		player.updateDirections(this.rayAngle); // atualizamos, a cada raio, a direção de x e y
		var difHorizontal
		var difVertical;
		this.castHorizontal() // achamos a parede horizontal mais proxima
		this.castVertical() //achamos a parede vertical mais proxima
		difHorizontal = catDifBetween(player.x, player.y, this.intersectionHX, this.intersectionHY); // achamos o tamanho do nosso raio até a parede horizontal usando o teorema de pitagoras
		difVertical = catDifBetween(player.x, player.y, this.intersectionVX, this.intersectionVY); // achamos o tamanho do nosso raio até a parede vertical usando o teorema de pitagoras
		//verificamos qual a parede esta mais proxima do player, se é a horizontal ou a vertical, dependendo do resultado
		//sera armazenado no wallPosx e y para podermos printar na tela
		if (difHorizontal > difVertical) {
			this.wallPosx = this.intersectionVX
			this.wallPosy = this.intersectionVY
			this.distance = difVertical
			this.wallVertHit = true
		}
		else {
			this.wallPosx = this.intersectionHX
			this.wallPosy = this.intersectionHY
			this.distance = difHorizontal
		}
	}
}

var player = new Player();
var grid = new Map();
var raysLst = [];

//isso é para resetarmos o angulo, caso ele ultrapasse os limites (PI * 2 OU 0)
function normalizeAngle(angle) {
	angle = angle % (Math.PI * 2)
	if (angle < 0)
		angle = (2 * Math.PI) + angle
	return angle
}

function catDifBetween(x1, y1, x2, y2) {
	return (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)))
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

	//aqui reseta a lista para vazio novamente;
	raysLst = [];
	for (let i = 0; i < NUM_RAYS; i++) {
		var rayPoint = new Ray(posAngle, columsId);
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

	console.log(DISTANCE_PROJ_PLANE)
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
