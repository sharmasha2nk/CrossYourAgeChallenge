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
        this.on('rollover', this.handleClick.bind(this));
    }
    handleClick() {
        this.game.handleClick(this);
    }
}

// This class controls the game data.
class GameData {
    constructor() {
        this.amountOfBox = 1;
        this.resetData();
        this.maxAge = prompt("Let's see if you can beat the #CrossYourAgeChallenge. May I know your age?", 100);
        if (this.maxAge === null) {
            this.maxAge = 100;
        }
        while (this.maxAge <= 4) {
            this.maxAge = prompt("Sorry! This challenge is not for kids! Try again in case you got older in last few minutes 😅 or come back later!", this.maxAge);
            if (this.maxAge === null) {
                this.maxAge = 100;
            }
        }
    }
    resetData() {
        var isTouchDevice = 'ontouchstart' in document.documentElement;
        var scaleScore = 4000;
        if (isTouchDevice) {
            scaleScore = 5000;
        }

        this.currentNumber = 1;
        this.score = scaleScore * this.amountOfBox * this.amountOfBox;
        var d = new Date();
        this.time = d.getTime();
        gtag('event', 'reset', {
            'maxAge': this.maxAge,
            'amountOfBox': this.amountOfBox
        });
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
        gtag('event', 'level', {
            'maxAge': this.maxAge,
            'amountOfBox': this.amountOfBox
        });
        return (this.currentNumber > this.amountOfBox);
    }
    isGameEnd() {
        gtag('event', 'win', {
            'maxAge': this.maxAge
        });
        return (this.currentNumber > this.maxAge);
    }
}

class Game {
    constructor() {
        console.log(`Welcome to the game. Version ${this.version()}`);
        this.loadSound();

        this.canvas = document.getElementById("game-canvas");
        this.stage = new createjs.Stage(this.canvas);
        this.stage.enableMouseOver(30);

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


        this.text = new createjs.Text("Ticker: " + this.gameData.score, "14px Oswald", "#ffffff");
        this.text.x = 10;
        this.text.y = 15;
        this.text.textBaseline = "alphabetic";
        this.timerstage.addChild(this.text);

        this.restartGame();
        createjs.Ticker.on("tick", this.tick);
        createjs.Ticker.setPaused(true);
        this.helpTimer = setTimeout(this.helper, 3000);
    }

    helper() {
        //alert("Click me");
    }

    tick() {
        if (!createjs.Ticker.getPaused()) {
            var d = new Date();
            game.gameData.score = game.gameData.score - d.getTime() + game.gameData.time;
            game.text.text = "Ticker: " + game.gameData.score;
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

        this.text.text = "Ticker: " + this.gameData.score;
        createjs.Ticker.setPaused(false);

        this.generateMultipleBoxes(this.gameData.amountOfBox);
        random_bg_color();
    }
    generateMultipleBoxes(amount = 10) {
        for (var i = amount; i > 0; i--) {
            var movieclip = new NumberedBox(this, i);
            movieclip.cursor = "pointer";
            this.stage.addChild(movieclip);

            // randam position
            movieclip.x = Math.random() * (this.stage.width - movieclip.getBounds().width);
            movieclip.y = Math.random() * (this.stage.height - movieclip.getBounds().height);
        }
    }
    handleClick(numberedBox) {
        clearTimeout(this.helpTimer);
        if (this.gameData.isRightNumber(numberedBox.number)) {
            createjs.Sound.play("Jump");
            this.stage.removeChild(numberedBox);
            this.gameData.nextNumber();

            // is game over?
            if (this.gameData.isGameWin()) {
                if (this.gameData.isGameEnd()) {
                    this.gameOverEnd(this);
                } else {
                    this.gameOverWin(this);
                }
            }
            random_bg_color();
        }
    }

    gameOverEnd(v) {
        v.stage.removeAllChildren();
        v.gameData.amountOfBox = 1;
        createjs.Sound.play("Game Over");
        createjs.Ticker.setPaused(true);
        v.text.text = "";
        var gameOverView = new lib.GameOverView();
        v.stage.addChild(gameOverView);
        var shape = new createjs.Shape();
        shape.graphics.beginFill("#343638").drawRect(0, 0, 300, 200);
        v.stage.addChild(shape);
        var text = new createjs.Text("Congrats you did it! You beat your age of " + v.gameData.maxAge + ". Challenge your friends now!", "28px Oswald", "#ff7700");
        //document.getElementById("social-share").setAttribute("data-title", "I just beat the #CrossYourAgeChallenge. I nominate you for the challenge.");
        text.x = v.stage.width / 2;
        text.y = 100;
        text.lineWidth = 200;
        text.textAlign = "center";
        text.textBaseline = "alphabetic";
        v.stage.addChild(text);
        gameOverView.restartButton.shape.text = "Play Again";
        var timeout = setTimeout(overlay, 3000);
        gameOverView.restartButton.on('click', (function() {
            clearTimeout(timeout);
            createjs.Sound.play("Jump");
            v.gameData.maxAge = prompt("Let's see if you can beat the #CrossYourAgeChallenge. May I know your age?", v.gameData.maxAge);
            if (v.gameData.maxAge === null) {
                v.gameData.maxAge = 100;
            }
            while (v.gameData.maxAge <= 4) {
                v.gameData.maxAge = prompt("Sorry! This challenge is not for kids! Try again in case you got older in last few minutes 😅 or come back later!", v.gameData.maxAge);
                if (v.gameData.maxAge === null) {
                    v.gameData.maxAge = 100;
                }
            }
            v.restartGame();
        }).bind(v));
    }


    gameOverWin(v) {
        v.stage.removeAllChildren();
        v.gameData.amountOfBox += 1;
        createjs.Sound.play("Game Over");
        createjs.Ticker.setPaused(true);
        v.text.text = "";
        var gameOverView = new lib.GameOverView();
        v.stage.addChild(gameOverView);
        var shape = new createjs.Shape();
        shape.graphics.beginFill("#343638").drawRect(0, 0, 300, 200);
        v.stage.addChild(shape);
        var text = new createjs.Text(messages[Math.floor((Math.random() * messages.length))], "28px Oswald", "#ff7700");
        text.x = v.stage.width / 2;
        text.y = 100;
        text.lineWidth = 200;
        text.textAlign = "center";
        text.textBaseline = "alphabetic";
        v.stage.addChild(text);
        var text1 = new createjs.Text((v.gameData.amountOfBox - 1) + ((v.gameData.amountOfBox - 1) == 1 ? " year" : " years") + " old.", "20px Oswald", "#ff7700");
        text1.x = v.stage.width / 2;
        text1.y = 40;
        text1.lineWidth = 200;
        text1.textAlign = "center";
        text1.textBaseline = "alphabetic";
        v.stage.addChild(text1);
        gameOverView.restartButton.shape.text = "Next Year";
        var timeout = setTimeout(overlay, 5000);
        gameOverView.restartButton.on('click', (function() {
            clearTimeout(timeout);
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
        shape.graphics.beginFill("#343638").drawRect(0, 0, 300, 200);
        v.stage.addChild(shape);
        var text = new createjs.Text(lostmessages[Math.floor((Math.random() * lostmessages.length))], "28px Oswald", "#ff7700");
        text.x = v.stage.width / 2;
        text.y = 100;
        text.lineWidth = 200;
        text.textAlign = "center";
        text.textBaseline = "alphabetic";
        v.stage.addChild(text);
        var text1 = new createjs.Text((v.gameData.amountOfBox - 1) + ((v.gameData.amountOfBox - 1) == 1 ? " year" : " years") + " old.", "20px Oswald", "#ff7700");
        text1.x = v.stage.width / 2;
        text1.y = 40;
        text1.lineWidth = 200;
        text1.textAlign = "center";
        text1.textBaseline = "alphabetic";
        v.stage.addChild(text1);
        gameOverView.restartButton.shape.text = "Try Again";
        var timeout = setTimeout(overlay, 5000);
        gameOverView.restartButton.on('click', (function() {
            clearTimeout(timeout);
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

var messages = ["That was easy!",
    "Eassyyyyy 🙄",
    "Way to go! 👍🏻",
    "Victory ✌️",
    "You are the champion",
    "Bravo!!",
    "Ah Ha a good old number game",
    "Never grow up",
    "At full steam! 👍🏻",
    "All the way 💪",
    "You doing great"
];
var lostmessages = [
    "Opsi!",
    "Faster Faster",
    "Never Give Up",
    "Not So Easy",
    "Too hard hah!",
    "You can do it",
    "Click all if you can",
    "1 2 3 4... easy lah",
    "You are still trying!",
    "Ah Ha looks like you forgot the counting",
    "emm too old for game",
    "last ditch",
    "The harder the battle the sweeter the victory…",
    "We never lost a game we just ran out of time.",
    "🐣 🐣 🐣"
];

function random_bg_color() {
    var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    var bgColor = "rgb(" + x + "," + y + "," + z + ")";
    document.body.style.background = bgColor;
}

function overlay() {
    el = document.getElementById("overlay");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    gtag('event', 'overlay', {
        'visibility': el.style.visibility
    });
}

random_bg_color();
