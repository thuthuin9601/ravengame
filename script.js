const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let gameOver = false;
let score = 0;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random()*0.6 +0.4;
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier;
        this.x = canvas.width
        this.y = Math.random()*(canvas.height - this.height);
        this.directionX = Math.random()*5+3;//tại sao lại là *5 +3
        this.directionY= Math.random()*5-2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random()*50 + 50;
        this.randomColors = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
        this.color = 'rgb('+this.randomColors[0]+','+this.randomColors[1]+','+this.randomColors[2]+')';//3 màu tiêu chuẩn lần lượt là red, green, blue
    }
    update(deltatime){
        if(this.y < 0 || this.y + this.height > canvas.height){
            this.directionY = -this.directionY;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x + this.width <0){
            this.markedForDeletion = true;
        }
        this.timeSinceFlap += deltatime
        if(this.timeSinceFlap > this.flapInterval){
            if (this.frame > this.maxFrame){
                this.frame = 0;
            }
            else{
                this.frame++;
            };
            this.timeSinceFlap = 0;
        };
        if(this.x < 0){
            gameOver = true;
        } 
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion{
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
    }
    update(deltatime){
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5){
                this.markedForDeletion = true;
            }
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size);
    }
}

function drawScore(){
    ctx.fillStyle = 'white';
    ctx.fillText('score: '+ score, 50, 75)
}

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if(object.randomColors[0] === pc[0] && object.randomColors[0] === pc[0] && object.randomColors[0] === pc[0]){
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
            console.log(explosions)
        }
    })
});
const raven = new Raven();

function animate(timestamp){//timestamp là automatic
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    // raven.update();
    // raven.draw();
    let deltatime = timestamp - lastTime; //khoảng cách tg giữa 2 animate();
    lastTime = timestamp;
    timeToNextRaven += deltatime;
    drawScore();
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
            return a.width - b.width; //cái nào rộng hơn sẽ lên trước
        });
    }
    [...ravens, ...explosions].forEach(object => object.update(deltatime)); //spread operator => tạo 1 mảng giống vs mảng gốc
    [...ravens, ...explosions].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion)//lọc: tạo array mới gồm các objects thỏa mãn đk trong ngoặc, dấu'!' có nghĩa là false
    explosions = explosions.filter(object => !object.markedForDeletion);

    if(!gameOver){
        requestAnimationFrame(animate);
    } 
}
animate(0);