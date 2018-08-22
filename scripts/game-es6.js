// logic for the Count game

class NumberedBox extends createjs.Container {
    constructor(game, number = 0) {
        super();

        this.game = game;
        this.number = number;

        var movieclip = new lib.NumberedBox();
        movieclip.numberText.text = number;

        movieclip.numberText.font = "28px Oswald";
        movieclip.numberText.textBaseline = "alphabet";
        movieclip.numberText.x += 2;
        movieclip.numberText.y = 35;

        this.addChild(movieclip);

        this.setBounds(0, 0, 50, 50);

        // handle click/tap
        this.on('click', this.handleClick.bind(this));
    }
    handleClick() {
        this.game.handleClick(this);
        createjs.Sound.play("Jump");
    }
}

// This class controls the game data.
class GameData {
    constructor() {
        this.amountOfBox = 1;
        this.resetData();
        var d = new Date();
        this.time = d.getTime();
    }
    resetData() {
        var isTouchDevice = 'ontouchstart' in document.documentElement;
        var scaleScore = 45000;
        if(isTouchDevice) {
            scaleScore = 15000;
        }
        this.currentNumber = 1;
        this.score = scaleScore * this.amountOfBox;
        var d = new Date();
        this.time = d.getTime();
    }
    nextNumber() {
        if (this.currentNumber == 1) {
            var d = new Date();
            this.time = d.getTime();
            createjs.Ticker.setPaused(false);
        }
        this.currentNumber += 1;
    }
    isRightNumber(number) {
        return (number === this.currentNumber);
    }
    isGameWin() {
        return (this.currentNumber > this.amountOfBox);
    }
}

class Game {
    constructor() {
        console.log(`Welcome to the game. Version ${this.version()}`);
        this.loadSound();

        this.canvas = document.getElementById("game-canvas");
        this.stage = new createjs.Stage(this.canvas);

        this.stage.width = this.canvas.width;
        this.stage.height = this.canvas.height;

        // enable tap on touch device
        createjs.Touch.enable(this.stage);

        this.timercanvas = document.getElementById("timer-canvas");
        this.timerstage = new createjs.Stage(this.timercanvas);

        this.timerstage.width = this.timercanvas.width;
        this.timerstage.height = this.timercanvas.height;

        // enable tap on touch device
        createjs.Touch.enable(this.timerstage);

        // enable retina screen
        this.retinalize();

        createjs.Ticker.setFPS(60);

        // game related initialization
        this.gameData = new GameData();

        // keep re-drawing the stage.
        createjs.Ticker.on("tick", this.stage);
        createjs.Ticker.on("tick", this.timerstage);


        this.text = new createjs.Text("Do it in : " + this.gameData.score, "20px Arial", "#ff7700");
        this.text.x = 70;
        this.text.y = 20;
        this.text.textBaseline = "alphabetic";
        this.timerstage.addChild(this.text);

        this.restartGame();
        createjs.Ticker.on("tick", this.tick);
        createjs.Ticker.setPaused(true);
    }

    tick() {
        if (!createjs.Ticker.getPaused()) {
            var d = new Date();
            game.gameData.score = game.gameData.score - d.getTime() + game.gameData.time;
            game.text.text = "Do it in : " + game.gameData.score;
            game.timerstage.update();
            if (game.gameData.score < 1) {
                game.gameOver(game);
                game.text.text = "";
            }
        }
    }

    version() {
        return '1.0.0';
    }
    loadSound() {
        createjs.Sound.alternateExtensions = ["ogg", "wav"];
        createjs.Sound.registerSound("soundfx/jump7.aiff", "Jump");
        createjs.Sound.registerSound("soundfx/game-over.aiff", "Game Over");
    }
    restartGame() {
        this.gameData.resetData();
        this.stage.removeAllChildren();
        this.stage.addChild(new lib.Background());

        this.text.text = "Do it in : " + this.gameData.score;
        createjs.Ticker.setPaused(false);

        this.generateMultipleBoxes(this.gameData.amountOfBox);
        random_bg_color();
    }
    generateMultipleBoxes(amount = 10) {
        for (var i = amount; i > 0; i--) {
            var movieclip = new NumberedBox(this, i);
            this.stage.addChild(movieclip);

            // randam position
            movieclip.x = Math.random() * (this.stage.width - movieclip.getBounds().width);
            movieclip.y = Math.random() * (this.stage.height - movieclip.getBounds().height);
        }
    }
    handleClick(numberedBox) {
        if (this.gameData.isRightNumber(numberedBox.number)) {
            this.stage.removeChild(numberedBox);
            this.gameData.nextNumber();

            // is game over?
            if (this.gameData.isGameWin()) {
                this.gameOverWin(this);
            }
            random_bg_color();
        }
    }

    gameOverWin(v) {
        v.stage.removeAllChildren();
        v.gameData.amountOfBox += 1;
        createjs.Sound.play("Game Over");
        createjs.Ticker.setPaused(true);
        v.text.text = "";
        var gameOverView = new lib.GameOverView();
        v.stage.addChild(gameOverView);

        gameOverView.restartButton.on('click', (function() {
            createjs.Sound.play("Jump");

            v.restartGame();
        }).bind(v));
    }

    gameOver(v) {
        v.stage.removeAllChildren();
        createjs.Sound.play("Game Over");
        createjs.Ticker.setPaused(true);
        var gameOverView = new lib.GameOverView();
        v.stage.addChild(gameOverView);
        var shape = new createjs.Shape();
        shape.graphics.beginFill("#000000").drawRect(0, 0, 300, 200);
        v.stage.addChild(shape);
        var text = new createjs.Text("You lose!", "28px Oswald", "#ff7700");
        text.x = 110;
        text.y = 100;
        text.textBaseline = "alphabetic";
        v.stage.addChild(text);

        gameOverView.restartButton.on('click', (function() {
            createjs.Sound.play("Jump");

            v.restartGame();
        }).bind(v));
    }

    retinalize() {
        this.stage.width = this.canvas.width;
        this.stage.height = this.canvas.height;
        this.timerstage.width = this.timercanvas.width;
        this.timerstage.height = this.timercanvas.height;

        let ratio = window.devicePixelRatio;
        if (ratio === undefined) {
            return;
        }

        this.canvas.setAttribute('width', Math.round(this.stage.width * ratio));
        this.canvas.setAttribute('height', Math.round(this.stage.height * ratio));

        this.stage.scaleX = this.stage.scaleY = ratio;

        // Set CSS style
        this.canvas.style.width = this.stage.width + "px";
        this.canvas.style.height = this.stage.height + "px";

        this.timercanvas.setAttribute('width', Math.round(this.timerstage.width * ratio));
        this.timercanvas.setAttribute('height', Math.round(this.timerstage.height * ratio));

        this.timerstage.scaleX = this.timerstage.scaleY = ratio;

        // Set CSS style
        this.timercanvas.style.width = this.timerstage.width + "px";
        this.timercanvas.style.height = this.timerstage.height + "px";
    }
}

// start the game
var game = new Game();

function random_bg_color() {
    var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    var bgColor = "rgb(" + x + "," + y + "," + z + ")";
    console.log(bgColor);

    document.body.style.background = bgColor;
}

random_bg_color();
