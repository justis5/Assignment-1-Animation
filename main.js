var AM = new AssetManager();

// Copy of Animation class from Lecture 5 for player controlled units
class MyAnimation {
    constructor(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
        this.spriteSheet = spriteSheet;
        this.startX = startX;
        this.startY = startY;
        this.frameWidth = frameWidth;
        this.frameDuration = frameDuration;
        this.frameHeight = frameHeight;
        this.frames = frames;
        this.totalTime = frameDuration * frames;
        this.elapsedTime = 0;
        this.loop = loop;
        this.reverse = reverse;
    }

    drawFrame(tick, ctx, x, y, scaleBy) {
        var scaleBy = scaleBy || 1;
        this.elapsedTime += tick;
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
            }
        } else if (this.isDone()) {
            return;
        }
        var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
        var vindex = 0;
        if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
            index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
            vindex++;
        }
        while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
            index -= Math.floor(this.spriteSheet.width / this.frameWidth);
            vindex++;
        }
        
        var locX = x;
        var locY = y;
        var offset = vindex === 0 ? this.startX : 0;
        ctx.drawImage(this.spriteSheet,
            index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
            this.frameWidth, this.frameHeight,
            locX, locY,
            this.frameWidth * scaleBy,
            this.frameHeight * scaleBy);

    }

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }

    isDone() {
        return (this.elapsedTime >= this.totalTime);

    }
}


function getLaneEnd(yValue) {
    if (yValue === 385) { // lane 1
        return 1080;
    } else if (yValue === 468) { // lane 2
        return 1109;
    } else if (yValue === 551) { // lane 3
        return 1200;
    }


}
// spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale

// Player controlled unit archer
function Archer(game, spritesheet, X, Y) {
    // scale 0.125
    // this.moveAnimation = new MyAnimation(AM.getAsset("./img/Archer_Walk.png"), 0, 0, 900, 900, 0.1, 24, true, false);
    this.moveAnimation = new Animation(spritesheet, 900, 900, 12, 0.15, 24, true, 0.125);
    this.attackAnimation = new MyAnimation(spritesheet, 0, 1800, 900, 900, 0.2, 8, true, false);
    this.idleAnimation = new Animation(AM.getAsset("./img/Archer_Idle.png"), 900, 900, 12, 0.15, 18, true, 0.125);
    this.deathAnimation = new MyAnimation(spritesheet, 0, 2700, 900, 900, 0.2, 16, true, false);
    this.jumpAnimation = new MyAnimation(AM.getAsset("./img/Archer_Jump.png"), 0, 0, 900, 900, 0.2, 5, true, false);
    this.kickAnimation = new MyAnimation(AM.getAsset("./img/Archer_Jump.png"), 0, 2700, 900, 900, 0.2, 6, true, false);
    this.idle = false;
    this.moving = true;
    this.attacking = false;
    this.kick = false;
    this.death = false;
    this.jump = false;
    this.hp = 20;
    this.speed = 75;
    this.ctx = game.ctx;
    this.laneEnd = getLaneEnd(Y);
    this.quiver = 3;
    this.arrowFire = false;
    this.animationEnd = false;
    this.game = game;
    // Entity.call(this, game, 248, 469);
    Entity.call(this, game, X, Y);
}

Archer.prototype = new Entity();
Archer.prototype.constructor = Archer;

Archer.prototype.update = function () {
    if (this.moving) {
        this.x += this.game.clockTick * this.speed;
        if (this.x > 700) {
            this.moving = false;
            this.attacking = true;
        }

    }

    Entity.prototype.update.call(this);
}

Archer.prototype.draw = function () {
    if (this.moving) {


        this.moveAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);



    } else if (this.attacking) {
        if (this.attackAnimation.currentFrame() === 4 && !this.arrowFire) {

            this.arrowFire = true;
            this.quiver--;
            gameEngine.addEntity(new Arrow(gameEngine, AM.getAsset("./img/Arrow.png"), this.x + (390 * 0.125), this.y + (530 * 0.125)));

        }
        this.attackAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);

        if (this.attackAnimation.currentFrame() === 7) {
            this.arrowFire = false;
        }


        if (this.quiver === 0) {
            this.attacking = false;
            this.idle = true;
            this.animationEnd = false;
        }

    } else if (this.idle) {

        this.idleAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
        if (this.idleAnimation.currentFrame() === 11 && !this.animationEnd) {
            this.animationEnd = false;
            this.idle = false;
            this.kick = true;
        }

    } else if (this.kick) {
        this.kickAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
        if (this.kickAnimation.currentFrame() === 5 && !this.animationEnd) {
            this.animationEnd = false;
            this.kick = false;
            this.jump = true;
        }

    } else if (this.jump) {
        this.jumpAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);

        if (this.jumpAnimation.currentFrame() === 4 && !this.animationEnd) {
            this.animationEnd = true;
            this.hp -= 10;
        }


        if (this.hp <= 0) {
            this.animationEnd = false;
            this.jump = false;
            this.death = true;
        } else {
            if (this.jumpAnimation.currentFrame() === 0 && this.animationEnd) {
                this.animationEnd = false;
            }

        }



    } else if (this.death) {
        this.deathAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
        if (this.deathAnimation.currentFrame() === 15 && !this.animationEnd) {
            this.animationEnd = true;
            this.death = false;
        }
    }
    Entity.prototype.draw.call(this);
}


// Player controlled unit bandit
function Bandit(game, spritesheet, X, Y) {
    // scale 0.125
    this.animation = new MyAnimation(spritesheet, 0, 0, 621, 569, 0.4, 8, true, false);
    this.attackAnimation = new MyAnimation(spritesheet, 0, 625, 621, 569, 0.2, 8, true, false);
    this.moving = true;
    this.attacking = false;
    this.speed = 100;
    this.ctx = game.ctx;
    this.laneEnd = getLaneEnd(Y);
    // Entity.call(this, game, 248, 469);
    Entity.call(this, game, X, Y);
}

Bandit.prototype = new Entity();
Bandit.prototype.constructor = Bandit;

Bandit.prototype.update = function () {
    if (this.moving) {
        this.x += this.game.clockTick * this.speed;
        if (this.x > this.laneEnd) {
            this.moving = false;
            this.attacking = true;
        }

    }

    Entity.prototype.update.call(this);
}

Bandit.prototype.draw = function () {
    if (this.moving) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    } else {
        this.attackAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
        
    }
    Entity.prototype.draw.call(this);
}

// Player controlled unit bandit
function Knight(game, spritesheet, X, Y) {
    // scale 0.125
    this.animation = new MyAnimation(spritesheet, 0, 0, 550, 598, 0.4, 8, true, false);
    this.attackAnimation = new MyAnimation(spritesheet, 0, 600, 550, 598, 0.2, 8, true, false);
    this.moving = true;
    this.attacking = false;
    this.speed = 100;
    this.ctx = game.ctx;
    this.laneEnd = getLaneEnd(Y);

    // Entity.call(this, game, 248, 469);
    Entity.call(this, game, X, Y);
}

Knight.prototype = new Entity();
Knight.prototype.constructor = Knight;

Knight.prototype.update = function () {
    if (this.moving) {
        this.x += this.game.clockTick * this.speed;
        if (this.x > this.laneEnd + 10) {
            this.moving = false;
            this.attacking = true;
        }

    }

    Entity.prototype.update.call(this);
}

Knight.prototype.draw = function () {
    if (this.moving) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    } else {
        this.attackAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    }
    Entity.prototype.draw.call(this);
}

// Player controlled unit bandit
function Samurai(game, spritesheet, X, Y) {
    // scale 0.125
    this.animation = new MyAnimation(spritesheet, 0, 0, 738, 611, 0.4, 8, true, false);
    this.attackAnimation = new MyAnimation(spritesheet, 0, 738, 738, 611, 0.2, 8, true, false);
    this.moving = true;
    this.attacking = false;
    this.speed = 100;
    this.ctx = game.ctx;
    this.laneEnd = getLaneEnd(Y);

    // Entity.call(this, game, 248, 469);
    Entity.call(this, game, X, Y);
}

Samurai.prototype = new Entity();
Samurai.prototype.constructor = Samurai;

Samurai.prototype.update = function () {
    if (this.moving) {
        this.x += this.game.clockTick * this.speed;
        if (this.x > this.laneEnd) {
            this.moving = false;
            this.attacking = true;
        }

    }

    Entity.prototype.update.call(this);
}

Samurai.prototype.draw = function () {
    if (this.moving) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    } else {
        this.attackAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    }
    Entity.prototype.draw.call(this);
}

// Player controlled unit goblin
function Goblin(game, spritesheet, X, Y) {
    // scale 0.125
    this.animation = new MyAnimation(spritesheet, 0, 0, 524, 591, 0.4, 8, true, false);
    this.attackAnimation = new MyAnimation(spritesheet, 0, 600, 524, 591, 0.2, 8, true, false);
    this.moving = true;
    this.attacking = false;
    this.speed = 100;
    this.ctx = game.ctx;
    this.laneEnd = getLaneEnd(Y);

    // Entity.call(this, game, 248, 469);
    Entity.call(this, game, X, Y);
}

Goblin.prototype = new Entity();
Goblin.prototype.constructor = Goblin;

Goblin.prototype.update = function () {
    if (this.moving) {
        this.x += this.game.clockTick * this.speed;
        if (this.x > this.laneEnd) {
            this.moving = false;
            this.attacking = true;
        }

    }

    Entity.prototype.update.call(this);
}

Goblin.prototype.draw = function () {
    if (this.moving) {
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    } else {
        this.attackAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.125);
    }
    Entity.prototype.draw.call(this);
}



function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.start = true;
    this.startBackground = AM.getAsset("./img/Background/Start.png");
    this.level1 = AM.getAsset("./img/Background/Map 1/NoDamage.png");
    this.level2 =  AM.getAsset("./img/Background/Map 2/NoDamage.png");
    this.level3 =  AM.getAsset("./img/Background/Map 3/NoDamage.png");
    this.tutorial = AM.getAsset("./img/Background/Tutorial.png");
};

Background.prototype.draw = function () {
    /*
    if(this.game.menu.clicked && this.game.menu.id === "easy") {
        this.spritesheet = this.level1;
        this.start = false;
    } else if(this.game.menu.clicked && this.game.menu.id === "medium") {
        this.spritesheet = this.level2;
        this.start = false;
    } else if(this.game.menu.clicked && this.game.menu.id === "hard") {
        this.spritesheet = this.level3;
        this.start = false;
    } else if(this.game.menu.clicked && this.game.menu.id === "tutorial") {
        this.spritesheet = this.tutorial;
        this.start = false;
    } else if(this.game.menu.clicked && this.game.menu.id === "back") {
        this.start = true;
        this.game.reset();
    } 
    if (this.start) {
        this.spritesheet = this.startBackground;
        this.start = true;
    }
    */
    this.spritesheet = this.level1;
    this.start = false;
    this.ctx.drawImage(this.spritesheet,this.x, this.y);
};

Background.prototype.update = function () {
};

// inheritance 
function Arrow(game, spritesheet, X, Y) {
    this.animation = new Animation(spritesheet, 320, 128, 1, 0.05, 1, true, 0.125);
    this.speed = 100;
    this.ctx = game.ctx;
    Entity.call(this, game, X, Y);
}

Arrow.prototype = new Entity();
Arrow.prototype.constructor = Arrow;

Arrow.prototype.update = function () {
    if (this.x < 1135 ) {
        this.x += this.game.clockTick * this.speed;
        Entity.prototype.update.call(this);
    }


}

Arrow.prototype.draw = function () {
    if (this.x < 1135) {
        
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        Entity.prototype.draw.call(this);
    }
}

// inheritance 
function Fireball(game, spritesheet, X, Y) {
    this.animation = new Animation(spritesheet, 160, 160, 5, 0.15, 12, true, 0.5);
    this.speed = 100;
    this.ctx = game.ctx;
    Entity.call(this, game, X, Y);
}

Fireball.prototype = new Entity();
Fireball.prototype.constructor = Fireball;

Fireball.prototype.update = function () {
    if (this.x < 1135){
        this.x += this.game.clockTick * this.speed;
        Entity.prototype.update.call(this);
    } 
}

Fireball.prototype.draw = function () {
    if (this.x < 1135){
        this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        Entity.prototype.draw.call(this);
    }
}

function UnitsControl (game){
    this.game = game;
    this.unitName = null;
    this.lane = null;
    this.ctx = game.ctx;
    this.shadow = false;
}

UnitsControl.prototype = new Entity();
UnitsControl.prototype.constructor = UnitsControl;

UnitsControl.prototype.update = function () {
    
}

UnitsControl.prototype.draw = function () {
    if (this.game.menu.clicked && this.game.menu.id === "Fireball") {
        this.unitName = "Fireball";
        this.shadow = true;
    } else if (this.game.menu.clicked && this.game.menu.id === "Knight") {
        this.unitName = "Knight";
        this.shadow = true;
    } else if (this.game.menu.clicked && this.game.menu.id === "Bandit") {
        this.unitName = "Bandit";
        this.shadow = true;
    } else if (this.game.menu.clicked && this.game.menu.id === "Samurai") {
        this.unitName = "Samurai";
        this.shadow = true;
    } else if (this.game.menu.clicked && this.game.menu.id === "Goblin") {
        this.unitName = "Goblin";
        this.shadow = true;
    }
    if (this.unitName === "Fireball" && this.shadow && this.game.mouse){
        this.ctx.globalAlpha = 0.5;
        //console.log(this.game.mouse.x);
        this.ctx.drawImage(AM.getAsset("./img/Fireball_icon.png"), this.game.mouse.x - 50, this.game.mouse.y - 50, 85.5, 80);
    } else if (this.unitName === "Knight" && this.shadow && this.game.mouse){
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(AM.getAsset("./img/Knight_icon.png"), this.game.mouse.x - 50, this.game.mouse.y - 50, 85.5, 80);
    } else if (this.unitName === "Bandit" && this.shadow && this.game.mouse){
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(AM.getAsset("./img/Bandit_icon.png"), this.game.mouse.x - 50, this.game.mouse.y - 50, 85.5, 80);
    } else if (this.unitName === "Samurai" && this.shadow && this.game.mouse){
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(AM.getAsset("./img/Samurai_icon.png"), this.game.mouse.x - 50, this.game.mouse.y - 50, 85.5, 80);
    } else if (this.unitName === "Goblin" && this.shadow && this.game.mouse){
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(AM.getAsset("./img/Goblin_icon.png"), this.game.mouse.x - 50, this.game.mouse.y - 50, 85.5, 80);
    }
    if (this.game.lane != null){
        this.lane = this.game.lane;
    }
    if (this.unitName != null && this.lane != null) {
        var laneY;
        if (this.lane === 1) {
            laneY = 385;
        } else if (this.lane === 2) {
            laneY = 468
        } else if (this.lane === 3) {
            laneY = 551;
        }


        if (laneY && this.unitName === "Fireball") {
            this.game.addEntity(new Fireball(this.game, AM.getAsset("./img/Fireball.png"), 305, laneY));
            this.unitName = null;
            this.lane = null;
        } else if (laneY && this.unitName === "Knight") {
            this.game.addEntity(new Knight(this.game, AM.getAsset("./img/Knight.png"), 305, laneY));
            this.unitName = null;
            this.lane = null;
        } else if (laneY && this.unitName === "Bandit") {
            this.game.addEntity(new Bandit(this.game, AM.getAsset("./img/Bandit.png"), 305, laneY));
            this.unitName = null;
            this.lane = null;

        } else if (laneY && this.unitName === "Samurai") {
            this.game.addEntity(new Samurai(this.game, AM.getAsset("./img/Samurai.png"), 305, laneY));
            this.unitName = null;
            this.lane = null;

        } else if (laneY && this.unitName === "Goblin") {
            this.game.addEntity(new Goblin(this.game, AM.getAsset("./img/Goblin.png"), 305, laneY));
            this.unitName = null;
            this.lane = null;

        }



    }
}

AM.queueDownload("./img/Arrow.png");
AM.queueDownload("./img/Archer_1.png");
AM.queueDownload("./img/Archer_Idle.png");
AM.queueDownload("./img/Archer_Walk.png");
AM.queueDownload("./img/Archer_Jump.png");
AM.queueDownload("./img/Archer_Kick.png");
AM.queueDownload("./img/Fireball.png");
AM.queueDownload("./img/Fireball_icon.png");
AM.queueDownload("./img/Knight_icon.png");
AM.queueDownload("./img/Samurai_icon.png");
AM.queueDownload("./img/Goblin_icon.png");
AM.queueDownload("./img/Bandit_icon.png");
AM.queueDownload("./img/Knight.png");
AM.queueDownload("./img/Samurai.png");
AM.queueDownload("./img/Goblin.png");
AM.queueDownload("./img/Bandit.png");
AM.queueDownload("./img/Background/Start.png");
AM.queueDownload("./img/Background/Tutorial.png");
AM.queueDownload("./img/Background/Map 1/NoDamage.png");
AM.queueDownload("./img/Background/Map 2/NoDamage.png");
AM.queueDownload("./img/Background/Map 3/NoDamage.png");
var gameEngine;
AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/Background/Start.png")));
    gameEngine.addEntity(new UnitsControl(gameEngine));
    gameEngine.addEntity(new Archer(gameEngine, AM.getAsset("./img/Archer_1.png"), 305, 468));

    console.log("All Done!");
});
