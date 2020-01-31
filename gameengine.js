var mainMenu = true;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.timer = new Timer();
    this.startInput();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1440) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;

    // event listeners are added here

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
        console.log(e);
        // console.log("Left Click Event - X,Y " + e.clientX + ", " + e.clientY);
        debugger;
        that.menu = getSelectedThing(e, that);
        // console.log(that.menu.id);
        that.lane = getSelectedLane(e, that);
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = {x : e.clientX, y : e.clientY};
        // console.log("X,Y " + e.clientX, e.clientY);
    }, false);



    console.log('Input started');
}
function getSelectedThing(e, that){
    if ((e.clientX >= 610 && e.clientX <= 765) && (e.clientY >= 502 && e.clientY <= 555) && mainMenu) {
        that.menu = { clicked: true, id: "easy" };
        mainMenu = false;
    } else if ((e.clientX >= 602 && e.clientX <= 863) && (e.clientY >= 579 && e.clientY <= 629) && mainMenu) {
        that.menu = { clicked: true, id: "medium" };
        mainMenu = false;
    } else if ((e.clientX >= 603 && e.clientX <= 777) && (e.clientY >= 649 && e.clientY <= 699) & mainMenu) {
        that.menu = { clicked: true, id: "hard" };
        mainMenu = false;
    } else if ((e.clientX >= 614 && e.clientX <= 881) && (e.clientY >= 711 && e.clientY <= 771) & mainMenu) {
        that.menu = { clicked: true, id: "tutorial" };
        mainMenu = false;
    } else if ((e.clientX >= 904 && e.clientX <= 1010) && (e.clientY >= 647 && e.clientY <= 747)) {
        that.menu = { clicked: true, id: "Fireball" };
    } else if ((e.clientX >= 20 && e.clientX <= 182) && (e.clientY >= 12 && e.clientY <= 64)) {
        that.menu = { clicked: true, id: "back" };
        mainMenu = true;
    } else if ((e.clientX >= 421 && e.clientX <= 526) && (e.clientY >= 650 && e.clientY <= 751)) {
        that.menu = { clicked: true, id: "Knight" };
    } else if ((e.clientX >= 539 && e.clientX <= 644) && (e.clientY >= 648 && e.clientY <= 749)) {
        that.menu = { clicked: true, id: "Bandit" };
    } else if ((e.clientX >= 660 && e.clientX <= 764) && (e.clientY >= 647 && e.clientY <= 748)) {
        that.menu = { clicked: true, id: "Samurai" };
    } else if ((e.clientX >= 782 && e.clientX <= 884) && (e.clientY >= 646 && e.clientY <= 747)) {
        that.menu = { clicked: true, id: "Goblin" };
    }
    return that.menu;
}

function getSelectedLane(e, that){
    if ((e.clientX >= 305 && e.clientX <= 1135) && (e.clientY >= 385 && e.clientY <= 467)){
        that.lane = 1;
    } else if((e.clientX >= 305 && e.clientX <= 1135) && (e.clientY >= 468 && e.clientY <= 550)){
        that.lane = 2;
    } else if ((e.clientX >= 305 && e.clientX <= 1135) && (e.clientY >= 551 && e.clientY <= 620)){
        that.lane = 3;
    }
    return that.lane;
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.reset = function(){
    this.entities.splice(2);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        entity.update();
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    
    this.menu = {clicked: false, id: null};
    this.lane = 0;
    this.mouse = null;
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}