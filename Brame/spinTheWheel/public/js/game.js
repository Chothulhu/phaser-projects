
var game;
 
var gameOptions = {
 
    slices: 8,
    slicePrizes: ["A KEY!!!", "50 STARS", "500 STARS", "BAD LUCK!!!", "200 STARS", "100 STARS", "150 STARS", "BAD LUCK!!!"],
    rotationTime: 3000
}
 
window.onload = function() {
 
    var gameConfig = {
       type: Phaser.AUTO,
       width: 550,
       height: 550,
       backgroundColor: 0x880044,
       scene: [playGame]
    };
 
    game = new Phaser.Game(gameConfig);
 
    window.focus()
    resize();
    window.addEventListener("resize", resize, false);
}
 
class playGame extends Phaser.Scene{
 
    constructor(){
        super("PlayGame");
    }
 
    preload(){
        this.load.image("wheel", "/public/assets/wheel.png");
        this.load.image("pin", "/public/assets/pin.png");
    }
 
    create(){
        this.wheel = this.add.sprite(game.config.width / 2, game.config.height / 2, "wheel");
        this.pin = this.add.sprite(game.config.width / 2, game.config.height / 2, "pin");

        this.prizeText = this.add.text(game.config.width / 2, game.config.height - 20, "Spin the wheel", {
            font: "bold 32px Arial",
            align: "center",
            color: "white"
        });
        this.prizeText.setOrigin(0.5);

        this.canSpin = true;
        this.input.on("pointerdown", this.spinWheel, this);
    }
 
    spinWheel(){

        if(this.canSpin){
 
            this.prizeText.setText("");
            var rounds = Phaser.Math.Between(2, 4);
            var degrees = Phaser.Math.Between(0, 360);
            var prize = gameOptions.slices - 1 - Math.floor(degrees / (360 / gameOptions.slices));
            this.canSpin = false;

            this.tweens.add({
                targets: [this.wheel],
                angle: 360 * rounds + degrees,
                duration: gameOptions.rotationTime,
                ease: "Cubic.easeOut",
                callbackScope: this,
 
                onComplete: function(tween){
                    this.prizeText.setText(gameOptions.slicePrizes[prize]);
                    this.canSpin = true;
                }
            });
        }
    }
}

function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
