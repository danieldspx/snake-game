class Square {
    constructor(x,y,direction){
        this.x = x;
        this.y = y;
        this.speed = 1;
        this.rectX = 30;
        this.rectY = 30;
        this.direction = direction;
        this.canvas = document.getElementById('snakeCanvas');
        this.c = this.canvas.getContext('2d');
        this.pointChange = [];//Coordanate that it must change direction
        this.part = 'body';//body or head
    }

    outY(){
        if((this.y+this.speed) > this.canvas.height || (this.y+this.rectY-this.speed) < 0){
            return true;
        } else {
            return false;
        }
    }

    outX(){
        if((this.x+this.speed) > this.canvas.width || (this.x+this.rectX-this.speed) < 0){
            return true;
        } else {
            return false;
        }
    }

    move(){
        if (typeof this.pointChange[0] !== "undefined") {//Change direction
            if(this.x == this.pointChange[0].x && this.y == this.pointChange[0].y){
                this.setDirection(this.pointChange[0].direction);
                this.pointChange.shift();
            }
        }

        //Move
        if((this.direction=='up' || this.direction=='down')){//Y
            if(this.direction=='down'){
                this.y += this.speed;
            } else {
                this.y -= this.speed;
            }
        } else {//X
            if(this.direction=='right'){
                this.x += this.speed;
            } else {
                this.x -= this.speed;
            }
        }

        this.c.fillRect(this.x,this.y,this.rectX,this.rectY);

        if (this.outX() || this.outY()) {
            if(this.outY()){
                if(this.direction == 'up'){
                    this.y = this.canvas.height-this.speed;
                } else {
                    this.y = 0;
                }
            }

            if(this.outX()){
                if(this.direction == 'left'){
                    this.x = this.canvas.width-this.speed;
                } else {
                    this.x = 0;
                }
            }
        }
    }

    setDirection(direction){
        if ((this.direction == 'right' && direction != 'left') || (this.direction == 'left' && direction != 'right')) {
            this.direction = direction;
        } else if ((this.direction == 'down' && direction != 'up') || (this.direction == 'up' && direction != 'down')) {
            this.direction = direction;
        }
    }
}

var canvas = document.getElementById('snakeCanvas');
var c = canvas.getContext('2d');

{
    var stopGame = false;

    var rectX = 30;
    var rectY = 30;
    var speed = 1;

    var x = Math.floor((Math.random() * 500) + 1);
    var y = Math.floor((Math.random() * 500) + 1);
    var fps = 1;
    var gap = 5; //Gap between the squares
    var directions = ["left","up","right","down"];
    var random = Math.random()*3;
    random = random == 0 ? 0 : Math.floor(random+1);

    var squares = [];
    var snakeHead = new Square(x,y,'right');
    snakeHead.part = 'head';
    squares.push(snakeHead);

    var appleRadius = 5;
    var appleX,appleY;
}

function generateApple(){//Apple Variables
    appleX = Math.floor((Math.random() * 450) + 1);
    appleY = Math.floor((Math.random() * 450) + 1);
}

function propagateDirection(e){
    e.preventDefault();
    e.stopPropagation();
    var directionNumber = e.keyCode-37; //Directions goes from 37 to 40
    if(snakeHead.direction != directions[directionNumber]){
        for (let square of squares) {
            square.pointChange.push({
                x:snakeHead.x,
                y:snakeHead.y,
                direction:directions[directionNumber]
            });
        }
        snakeHead.setDirection(directions[directionNumber]);//changes the direction of the head
    }
}

document.body.addEventListener('keydown',function(e){
    propagateDirection(e);
});

function createSquare(){
    var lastIndex = squares.length-1;
    var lastX = squares[lastIndex].x;
    var lastY = squares[lastIndex].y;

    switch (squares[lastIndex].direction) {
        case 'up':
            lastY = squares[lastIndex].y + squares[lastIndex].rectY + gap;
            break;

        case 'down':
            lastY = squares[lastIndex].y - squares[lastIndex].rectY - gap;
            break;
        case 'right':
            lastX = squares[lastIndex].x - squares[lastIndex].rectX - gap;
            break;
        case 'left':
            lastX = squares[lastIndex].x + squares[lastIndex].rectX + gap;
            break;
    }
    var square = new Square(lastX,lastY,squares[lastIndex].direction);
    square.pointChange = squares[lastIndex].pointChange.slice(0);
    squares.push(square);
}

function clearFrame(){
    c.clearRect(0,0,canvas.width,canvas.height);
}

function updateScreen(){
    clearFrame();

    c.beginPath(); //Draw apple
    c.arc(appleX, appleY, appleRadius, 0, 2 * Math.PI);
    c.fillStyle = "red";
    c.fill();

    c.fillStyle = "black";

    let headX = snakeHead.x;
    let headY = snakeHead.y;

    for (let square of squares) {
        square.move();
        if(square.part != 'head'){
            if((headX+rectX>(square.x+rectX/2)) && (headY+rectY>(square.y+rectX/2)) && (headX<(square.x+rectX/2)) && (headY<(square.y+rectX/2))){
                resetGame();//I've Hit my tail
            }
        }
    }

    if((headX+rectX>appleX) && (headY+rectY>appleY) && (headX<appleX) && (headY<appleY)){//Ate apple
        generateApple();//New apple
        createSquare();//New snake square
        setPoint(1);//Add point to score
    }

    if(!stopGame){
        setTimeout(updateScreen,fps);
    }
}

function start(){
    stopGame = false;
    M.toast({html: 'Game started.', classes: 'rounded green lighten-1'});
    generateApple();
    updateScreen();
}

function stop(){
    stopGame = true;
    M.toast({html: 'Game stopped.', classes: 'rounded red lighten-1'});
}

function setPoint(condition){
    var element = document.getElementById('regularScore');
    var points = parseInt(element.innerHTML);
    if(condition == 1){
        points++;
    } else {
        points = 1;
    }
    element.innerHTML = points;
}

function setHigherScore(){
    var regular = document.getElementById('regularScore');
    var regularPoints = parseInt(regular.innerHTML);
    var higher = document.getElementById('higherScore');
    var higherPoints = parseInt(higher.innerHTML);
    if(higherPoints<regularPoints){
        higher.innerHTML = regularPoints;
    }
}

function resetGame(){
    squares = squares.slice(0,1);//Remove everything but head
    setHigherScore();
    setPoint(0);//Reset scores
    M.toast({html: 'Game reseted.', classes: 'rounded teal lighten-1'});
}

start();
