import Phaser from '../lib/phaser.js'

import Carrot from '../game/Carrot.js'


export default class Game extends Phaser.Scene
{

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    player;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors;

    /** @type {Phaser.Physics.Arcade.Group} */
    carrots;

    /** @type {Phaser.GameObjects.Text} */
    carrotsCollectedText;

    carrotsCollected;

    constructor(){
        super('game');
    }

    init(){
        this.carrotsCollected = 0;
    }

    preload()
    {
        this.load.image('background', 'assets/bg_layer1.png');
        this.load.image('platform', 'assets/ground_grass.png');
        this.load.image('bunny-stand', 'assets/bunny1_stand.png');
        this.load.image('carrot', 'assets/carrot.png');
        this.load.image('bunny-jump', 'assets/bunny1_jump.png');
        this.load.audio('jump', 'assets/sfx/phaseJump1.ogg');


        this.cursors = this.input.keyboard.createCursorKeys();    
        
        
    }

    create()
    {
        // bg
        this.add.image(240, 320, 'background').setScrollFactor(1, 0);
        
        //display score
        const style = {color: '#000', fontSize: 24 }
        this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style).setScrollFactor(0).setOrigin(0.5, 0);

        // create platforms
        this.platforms = this.physics.add.staticGroup();

        for (let i = 0; i < 5; ++i){
            const x = Phaser.Math.Between(80, 400);
            const y = 150 * i;

            const platform = this.platforms.create(x, y, 'platform');
            platform.scale = 0.5;

            const body = platform.body;
            body.updateFromGameObject();
        }

        //player
        this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);
        this.player.body.checkCollision.up = false;
        this.player.body.checkCollision.left = false;
        this.player.body.checkCollision.right = false;

        //camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setDeadzone(this.scale.width * 1.5);

        //create a carrot
        this.carrots = this.physics.add.group({
            classType: Carrot
        })

        //add colliders
        this.physics.add.collider(this.platforms, this.player);
        this.physics.add.collider(this.platforms, this.carrots);

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )
    }

    update(t, dt)
    {
        //movement
        const touchingDown = this.player.body.touching.down;

        if (touchingDown) {
            this.player.setVelocityY(-300);

            this.player.setTexture('bunny-jump');

            this.sound.play('jump');
        }

        const vy = this.player.body.velocity.y;
        if (vy > 0 && this.player.texture.key !== 'bunny-stand'){
            this.player.setTexture('bunny-stand');
        }

        if(this.cursors.left.isDown && !touchingDown){
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        //check and update platforms that scroll through screen
        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child;

            const scrollY = this.cameras.main.scrollY;
            if (platform.y >= scrollY + 700){
                platform.y = scrollY + Phaser.Math.Between(50, 100);
                platform.x = Phaser.Math.Between(80, 400);
                platform.body.updateFromGameObject();

                this.addCarrotAboveSprite(platform);
            }
        })

        this.carrots.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const carrot = child;

            const scrollY = this.cameras.main.scrollY;
            if (child.y >= scrollY + 700){
                
                this.carrots.killAndHide(carrot);

                this.physics.world.disableBody(carrot.body);
            }
        })

        this.horizontalWrap(this.player);

        //check for gameover

        const bottomPlatform = this.findBottomMostPlatform();
        if (this.player.y > bottomPlatform.y + 200){
            console.log('game over');
            this.scene.start('game-over');
        }

    }

    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    horizontalWrap(sprite){
        const halfWidth = sprite.displayWidth * 0.5;
        const gameWidth = this.scale.width;

        if (sprite.x < -halfWidth){
            sprite.x = gameWidth + halfWidth;
        } else if (sprite.x > gameWidth + halfWidth){
            sprite.x = -halfWidth;
        }
    }

    /**
     * 
     * @param {Phaser.GameObjects.Sprite} sprite 
     */
    addCarrotAboveSprite(sprite){
        const y = sprite.y - sprite.displayHeight;

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot');

        carrot.setActive(true);
        carrot.setVisible(true);

        this.add.existing(carrot);

        carrot.body.setSize(carrot.width, carrot.height);

        this.physics.world.enable(carrot);

        return carrot;
    }

    /**
     * 
     * @param {Phaser.Physics.Arcade.Sprite} player 
     * @param {Carrot} carrot 
     */
    handleCollectCarrot(player, carrot){
        console.log("karot is kill");
        this.carrots.killAndHide(carrot);

        this.physics.world.disableBody(carrot.body);

        this.carrotsCollected++;

        const value = `Carrots: ${this.carrotsCollected}`;

        this.carrotsCollectedText.text = value;
    }

    findBottomMostPlatform(){
        const platforms = this.platforms.getChildren();
        let bottomPlatform = platforms[0];

        for(let i = 1; i < platforms.length; ++i){
            const platform = platforms[i];

            if (platform.y < bottomPlatform.y){
                continue;
            }
            bottomPlatform = platform;
        }

        return bottomPlatform;
    }
}