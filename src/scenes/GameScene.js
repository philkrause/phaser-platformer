import * as Config from '../config/constants';

class GameScene extends Phaser.Scene {
    constructor(config) {
        super({ key: 'GameSceneKey' });

        this.gameHeight = Config.GAME_HEIGHT
        this.gameWidth = Config.GAME_WIDTH

        this.player;
        this.playerSpeed = Config.PLAYER_SPEED;
        this.playerHit;
        this.speedText;
        this.distanceTraveled = 0;
        this.currentSpeed;
        this.car;
        this.carArray = []
        this.counterText;
        this.counter = 0;
        this.currentCharIndex = 0;
        this.introText;
        this.tweenPlayed = false;
        this.tileSpeed;
        this.particles;
        this.collide;
        this.makeFuelBar;
        this.makeSpeedBar;
        this.fuelBar;
        this.item;
        this.itemLightsArray = [];
        this.totalFuel = 100;
        this.fuelUsed;
        this.updateFuelBar;
        this.collide;
        this.gameOverStatus = false;
        this.gameOver;
        this.fuelCollected;
        this.hitCar;
    }

//PRELOAD===================================================================================


    preload() {
        this.load.image('background', '../assets/images/city_top2.png');
        this.load.image('player', '../assets/images/red_car1.png');
        this.load.image('car1', '../assets/images/car_o.png');
        this.load.image('car2', '../assets/images/player_y.png');
        this.load.image('blue', '../assets/images/blue.png');
        this.load.image('fuel_meter', '../assets/images/fuel_meter.png');
        this.load.image('fuel','../assets/images/fuel.png')
        this.load.image('speedometer', '../assets/images/new_speedometer.png');
        this.load.bitmapFont('carrier_command', '../assets/fonts/carrier_command.png', '../assets/fonts/carrier_command.xml');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.counter = 0;
        this.distanceTraveled = 0;
        this.hotpink = '#ee82ee'
    }

//CREATE===================================================================================
    create() {
        
        //background
        this.background = this.add.tileSprite(200,100,this.gameWidth/2,0, 'background').setScrollFactor(0)
            .setPipeline("Light2D")
            .setScale(.5)
            .setBlendMode(10)

        //ui
        this.add.sprite(this.gameWidth - 16,this.gameHeight - 80,'fuel_meter')
        this.speedometer = this.add.sprite(35,this.gameHeight*.8,'speedometer').setScale(.3)
        this.speedText = this.add.bitmapText(this.speedometer.x - 12 ,this.speedometer.y + 10, 'carrier_command', `${this.currentSpeed}mph`).setTint(0xff0000).setScale(.18)
        this.distanceTraveledText = this.add.bitmapText(5 ,10, 'carrier_command', `distance: ${this.distanceTraveled}`).setTint(0xFFFF).setScale(.18)
        this.counterText = this.add.bitmapText(5 ,this.distanceTraveledText.y + 10 , 'carrier_command', `counter: ${this.counter}`).setTint(0xFFFF).setScale(.18)
        
        //lighting------------------------------------------
        this.lights.enable().setAmbientColor(0x11111);

        //player--------------------------------------------
        this.player = this.physics.add.sprite(this.gameWidth * .5, this.gameHeight * .9, 'player')
            .setSize(10, 10) //sets the bounds of the sprite, doesnt change the size of the sprite
            .setPipeline("Light2D")
            .setCollideWorldBounds(true)
            .setDrag(100)
            .setOrigin(.5,1)
            .setBounce(1)
            .setScale(1.3)

        //player light---------------------------------------
        this.playerLight = this.lights.addLight(this.player.x, this.player.y, 128);
        this.tweens.add({
            targets: [this.playerLight],
            intensity: {
                value: 1,
                duration: 50,
                ease: "Elastic.easeInOut",
                repeat: -1,
                yoyo: true
            }
        }); 

        //Spawn Items----------------------------------------------
        this.spawnItem = (sprite,scale) => {
            this.item = this.physics.add.sprite(Phaser.Math.Between(0, this.gameWidth), 0, sprite)
            this.item.setSize(8,10)
            this.item.setVelocityY(Phaser.Math.Between(10,30))
            this.item.setScale(scale)
            this.itemLight = this.lights.addLight();
            this.itemLightsArray.push({item:this.item,light:this.itemLight})
        };

        //Particles----------------------------------------------
        const emitter = this.add.particles(0, 0, 'blue', {
            speed: 100,
            lifespan: {
                onEmit: (particle, key, t, value) =>
                {
                    return Phaser.Math.Percent(10, 0, 50) * 500;
                }
            },
            alpha: {
                onEmit: (particle, key, t, value) =>
                {
                    return Phaser.Math.Percent(10, 0, 50);
                }
            },
            angle: {
                onEmit: (particle, key, t, value) =>
                {
                    return Phaser.Math.Between(-10, 10) + 90
                }
            },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD'
        });

            emitter.startFollow(this.player);

        //UIBars-----------------------------
        this.makeFuelBar = (x,y,color,percentage)=> {
            let bar = this.add.graphics();
            bar.fillStyle(color,1);
            bar.fillRect(0,0,6,50);
            let newHeight = (50 * percentage) / 100;
            let newY = y + (50 - newHeight);
            bar.x = x;
            bar.y = newY;
            bar.scaleY = newHeight / 50
            return bar
        }

        this.makeSpeedBar = (x,y,color,percentage)=> {
            let bar = this.add.graphics();
            bar.fillStyle(color,1);
            bar.fillRect(0,0,20,2)
            bar.x = x;
            bar.y = y;
            bar.angle = 1.2 * percentage + 90 
            return bar
        }

        //fuel
        this.totalFuel = 100
        this.fuelUsed = this.distanceTraveled * .8
        this.fuelBar = this.makeFuelBar(this.gameWidth - 11, 107, '0x2eec71', this.fuelUsed)
        this.speedBar = this.makeSpeedBar(20, 200, '0x2eec71', this.currentSpeed)

        this.carCollision = (car1,car2) => {
            this.physics.add.collider(car1,car2)
        }
        
        this.playerHit = () => {
            //this.player.setTint(0xff0000);
            //this.gameOver();
            console.log('playerhit')
        }
        //gameover---------------------------------------------------
        this.gameOver = () => {
            this.gameOverStatus = true;
            this.gameOverText = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .4 ,'carrier_command',`GAME OVER!`).setTint(0xff0000).setOrigin(.5).setScale(.3);
            this.playerStatsText = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .6 ,'carrier_command',`Distance: ${this.distanceTraveled.toFixed(2)}mi\n\nTime: ${(this.counter/60).toFixed(2)} sec`).setTint(0xff0000).setOrigin(.5).setScale(.2);
            this.playAgainButton = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .7, 'carrier_command',`Press Enter to play again`).setTint(0xff0000).setOrigin(.5).setScale(.2);
            this.tweens.add({
                targets:[this.gameOverText],
                x:10,
                duration: 1000,
                repeat: -1,
                repeatDelay: 1000,
                ease: 'back.in',
                yoyo: true
            })
            this.player.disableBody(true,false)
        }

        this.hitCar = (player) => {
            this.tweens.add({
                targets: [player],
                y: +300
            })
            this.cameras.main.shake(200, 0.02);

        }


        //dialogue------------------------------------------------
        // Set up variables to track the displayed text and index
        // this.dialogueText = this.add.bitmapText(this.gameWidth * .25, this.gameHeight * .5, 'carrier_command').setScale(.18);

        // this.introText = 'chicago 3258 A.D.';  
       
        // this.currentCharIndex = 0;
        // this.introTextTween = this.tweens.add({
        //     targets: [this.dialogueText],
        //     y: -60,
        //     alpha: 0,
        //     duration: 6000,
        //     paused: true, // Start the tween as paused
        //     onComplete: () => {
        //         this.dialogueText.text = ''; // Clear the text once faded out
        //     }
        // });

    }
    
//UPDATE===================================================================================
    update() {

        //calculate speed
        this.currentSpeed = (1000/this.player.y) * 400;
        this.speedText.setText(`${Math.ceil(this.currentSpeed)}`)
        this.background.tilePositionY -= 1000/(this.player.y);

        //UI#EB09FE
        //create live counter
        this.counter += 1
        
        this.distanceTraveled += (this.currentSpeed/60) /60 /60
        this.distanceTraveledText.setText(`distance: ${this.distanceTraveled.toFixed(2)}mi`)
        this.counterText.setText(`time: ${(this.counter/60).toFixed(2)}`)

        //dialogue------------------------------------------------
        // if (this.currentCharIndex < this.introText.length) {
        //     this.dialogueText.text += this.introText[this.currentCharIndex];
        //     this.currentCharIndex++; 
        // }
        // if (this.currentCharIndex >= this.introText.length && this.tweenPlayed == false) {
        //     this.time.removeEvent(this.updateText);
        //     this.currentCharIndex = this.introText.length
        //     this.introTextTween.play(); 
        //     this.tweenPlayed = true
        // }

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

        //player lighting-------------------
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;

        //Fuel------------------------------
        //check multiple of %x that equals 0 //basically the lower x is, the more spawns
        if (this.counter %1000 == 0){
            this.spawnItem('car1',1)
        }

        if (this.counter %50 == 0){
            this.spawnItem('car2',1.6)
        }

        //loop through the array of fuel
        this.itemLightsArray.forEach((itemLight, index) => {
            const item = itemLight.item;
            const light = itemLight.light;

            light.x = item.x;
            light.y = item.y;

        // Define the overlap callback function
        let carCollision = (player, collectedItem) => {
            // Check if player collects fuel
            if (collectedItem === item) {
               this.hitCar(player)
                // Remove the item from the array and destroy it
                this.lights.removeLight(light);
                this.itemLightsArray.splice(index, 1);
                item.destroy();
            }
        };
            //if player collects fuel
            this.physics.add.overlap(this.player,item, carCollision) 

            //remove item from array if off screen and destroy it
            if (item.y > this.gameHeight) {
                this.lights.removeLight(light);
                this.itemLightsArray.splice(index, 1);
                item.destroy
            }
        });

        //ui updates--------------------------------
        // Calculate the percentage for the fuel bar
        this.fuelUsed = this.totalFuel - (this.distanceTraveled * .2);

        //Update the fuel bar
        if(this.fuelBar){
            this.fuelBar.clear()
            this.fuelBar = this.makeFuelBar(this.gameWidth - 11, this.gameHeight * .71, '0xff6984', this.fuelUsed)
        }

        if (this.fuelUsed <= 0 && this.gameOverStatus == false) {
            this.gameOver()
            this.gameOverStatus == true
        }
        
        let speedPercentage = 0 - (this.currentSpeed * -.02 )
        if(this.speedBar){
            this.speedBar.clear()
            this.speedBar = this.makeSpeedBar(this.speedometer.x, this.speedometer.y, '0xff0000', speedPercentage)
        }

        //Retry Prompt
        const enterJustPressed = Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))
        if (enterJustPressed && this.gameOverStatus == true) {
            this.scene.start('GameSceneKey')
        }
    }
}

export default GameScene;