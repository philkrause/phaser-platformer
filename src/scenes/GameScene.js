// scenes/StartScene.js
import * as Config from '../config/constants';
import spawnCar from '../util/spawnCar'

class GameScene extends Phaser.Scene {
    constructor(config) {
        super({ key: 'GameSceneKey' });
        
        this.player;
        this.redCar;
        this.traffic;
        this.widthText;
        this.laser;
        this.createLaser;
        this.spawnCloud;
        this.fired = false;
        this.stars;
        this.sparkle;
        this.platforms;
        this.cursors;
        this.score = 0;
        this.points = 100;
        this.gameOver = false;
        this.scoreText;
        this.gameOverText;
        this.playAgainButton;
        this.playerJumpV = Config.PLAYER_JUMPV;
        this.playerSpeed = Config.PLAYER_SPEED;
        this.gameWidth = Config.GAME_WIDTH;
        this.gameHeight = Config.GAME_HEIGHT
        this.width;
        this.height;
        this.distanceText;
    }
    
    init()
    {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    preload() 
    {
        this.load.image('background', '../assets/images/city_top2.png');
        this.load.image('ground', '../assets/images/platform.png');
        this.load.image('star', '../assets/images/star.png');
        this.load.image('laser', '../assets/images/laser.png');
        this.load.image('player', '../assets/images/player_y.png');
        this.load.image('red_car', '../assets/images/red_car1.png');
        this.load.image('cloud', '../assets/images/cloud.png');

        this.load.spritesheet('cat_idle','../assets/images/cat_idle.png', { frameWidth: 50, frameHeight: 40 });
        this.load.spritesheet('cat_walk','../assets/images/cat_walk.png', { frameWidth: 50, frameHeight: 40 });
        this.load.spritesheet('cat_jump','../assets/images/cat_jump.png', { frameWidth: 50, frameHeight: 40 });
        this.load.spritesheet('sparkle', '../assets/images/mr_sparkle.png', { frameWidth: 100, frameHeight:183});
        this.load.bitmapFont('carrier_command', '../assets/fonts/carrier_command.png', '../assets/fonts/carrier_command.xml');
        
        this.gameOver = false;
        this.starsAmount = 0;
    }
    
    create() 
    {   
        //background-----------------------------------------
        this.width = this.scale.width;
        this.height = this.scale.height;

         //lighting------------------------------------------
         this.lights.enable().setAmbientColor(0x111111);
 
         this.background = this.add.tileSprite(100, 100, this.gameWidth * 2.5, this.gameHeight * 2.5, 'background')
             .setPipeline("Light2D")
             .setScale(.5)
     

        //player-----------------------------------------
        this.player = this.physics.add.sprite(this.width * .5, this.height, 'player').setSize(16, 16).setPipeline("Light2D");
        this.playerLight = this.lights.addLight(this.player.x, this.player.y, 300);
        this.tweens.add({
          targets: [this.playerLight],
          intensity: {
            value: 1.0,
            duration: 500,
            ease: "Elastic.easeInOut",
            repeat: -1,
            yoyo: true
          }
        });

        //this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);


                //Traffic
        this.spawnPlayer = () => { 
            console.log("Spawning Car")
            this.car = this.physics.add.sprite(Phaser.Math.Between(0,this.gameWidth), 0, 'red_car')
            this.car.setVelocityY(30)
            this.car.setSize(16,16)
            this.carLight = this.lights.addLight(this.car.x, this.car.y, 300);
            this.tweens.add({
                targets: [this.car],
                intensity: {
                  value: 1.0,
                  duration: 500,
                  ease: "Elastic.easeInOut",
                  repeat: -1,
                  yoyo: true
                }
              });
        };
        
        this.spawnPlayer();
        // Create a timer event to spawn cars every 2 seconds, 10 times
        const spawnCarEvent = this.time.addEvent({
            delay: 2000,
            repeat: 9, // This will execute the callback 10 times (0 to 9)
            callbackScope: this // Maintain the scope of 'this' inside the callback
        });


        //laser------------------------------------------
        this.lasers = this.physics.add.group();
        this.createLaser = (player) => {
            const laser = this.lasers.create(player.x, player.y, 'cat_idle')
            const laserSpeed = Math.sign(this.player.body.velocity.x)
            laser.setCollideWorldBounds(true,1,1)
            laser.setVelocityX(200);
            if (laser.x == 0 || laser.x > 600) 
            {
                laser.disableBody(true,true)
            }
        }
        //score
        // this.scoreText = this.add.bitmapText(15, 15, 'carrier_command', 'Score: 0').setTint(0xFFFF).setScale(.25)
        // this.widthText= this.add.bitmapText(15, 35,'carrier_command',`Width: ${this.width}`).setScale(.2,.2).setTint(0xFFFF).setScale(.25)
        // this.heightText = this.add.bitmapText(15, 45, 'carrier_command', `Height: ${this.height}`).setTint(0xFFFF).setScale(.25)

        //stars-----------------------------------------
        // this.stars = this.physics.add.group({
        //     key: 'red_car',
        //     repeat: 0,
        //     setXY: { x: Phaser.Math.Between(0, this.gameWidth), y: 0, stepX: 10 }
        // });

        //star movement
        // this.stars.children.iterate(function (child) {
        //     child.x = Phaser.Math.Between(0, 600);
        //     child.setBounce(1)
        //     child.setCollideWorldBounds(true,1,1);
        //     child.setVelocity(Phaser.Math.Between(-200, 400), 20);
        // });



        
        //player death
        const playerHit = () => {
            this.player.setTint(0xff0000);
            this.player.anims.play('idle');
            this.player.setVelocityX(0);
            this.gameOver = true;
            gameOver();
        }

        //enemy death
        const enemyHit = (laser,sparkle) => {
            console.log(laser)
            laser.disableBody(true,true)
            sparkle.disableBody(true,true)
            // this.stars = this.physics.add.group({
            //     key: 'star',
            //     repeat: 10,
            //     setXY: { x: Phaser.Math.Between(0, this.gameWidth), y: 0, stepX: 10 }
            // });
        }

        //gameover text and replay button
        const gameOver = () => {
            this.gameOverText = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .5 ,'carrier_command',`GAME OVER!`).setTint(0xff0000).setOrigin(.5);
            this.playAgainButton = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .6, 'carrier_command',`Click to play again`).setTint(0xff0000).setOrigin(.5);
            this.tweens.add({
                targets:[this.gameOverText],
                x:10,
                duration: 1000,
                repeat: -1,
                repeatDelay: 1000,
                ease: 'back.in'
            })
            this.playAgainButton.setInteractive().on('pointerdown', ()=> {
                this.scene.start('GameSceneKey');
            })
            this.starsAmount = 0
        }

        //collision-----------------------------------------
        // this.physics.add.collider(this.player, this.platforms);
        // this.physics.add.collider(this.stars, this.platforms,null,null,this);
        // this.physics.add.collider(this.sparkle, this.platforms,);
 
        //this.physics.add.collider(this.laser, this.platforms,);
        

        //player star collision
        //this.physics.add.overlap(this.player, this.stars, collectStar, null, this);
        
        //player hit
        //this.physics.add.overlap(this.player, this.sparkle, playerHit)

        //enemy hit
        if(this.laser)
        {
        this.physics.add.overlap(this.laser, this.sparkle, enemyHit)
        }

        this.distanceText = this.add.bitmapText(15, 45, 'carrier_command', `Distance: `).setTint(0xFFFF).setScale(.25)

    }

    update() 
    {   
        let count = 1000
        count += 1
        let playerPosition = this.player.y
        this.distanceText.setText(`Distance: ${Math.round(count * 100)}`).setTint(0xFFFF).setScale(.25)

        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;
        this.carLight.x = this.car.x;
        this.carLight.y = this.car.y;

        //remove controls if game over
        if (this.gameOver == true)
        {
            this.scoreText.setText('Score: ' + this.score);
            return;
        }

        //player movement-----------------------------------------
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(Config.PLAYER_SPEED * -1);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(Config.PLAYER_SPEED);
        }
  
        else if (this.cursors.up.isDown)
        {
            this.player.setVelocityY(Config.PLAYER_SPEED * -1);
        }

        else if (this.cursors.down.isDown) 
        {   
            this.player.setVelocityY(Config.PLAYER_SPEED )
        }
        else
        {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }
        this.background.tilePositionY -= 1000/(this.player.y);
    }
}


export default GameScene;
