import * as Config from '../config/constants';

export default class GameScene extends Phaser.Scene {
    handlerScene = null

    constructor(config) {
        super({ key: 'GameSceneKey' });

        this.dialogueGen;;
        this.dialogues = [];
        this.dCount = 0;
        this.textCount = 0;
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
        this.timer = 0;
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
        this.boostPlayer;
        this.createPoints;
        this.emitter;

    }

//PRELOAD===================================================================================


    preload() {
        this.load.image('background', '../assets/images/city_top5.png');
        this.load.image('player', '../assets/images/red_car1.png');
        this.load.image('car1', '../assets/images/player_y.png');
        this.load.image('car2', '../assets/images/car_b.png');
        this.load.image('blue', '../assets/images/blue.png');
        this.load.image('fuel_meter', '../assets/images/fuel_meter.png');
        this.load.image('fuel','../assets/images/fuel3.png')
        this.load.image('speedometer', '../assets/images/new_speedometer.png');
        this.load.bitmapFont('carrier_command', '../assets/fonts/carrier_command.png', '../assets/fonts/carrier_command.xml');
        this.load.audio('song1',['../assets/audio/summit.mp3'])
        this.load.atlas('flares', '../assets/images/flares.png', '../assets/images/flares.json');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.counter = 0;
        this.timer = 0;
        this.outofTime = 60;
        this.distanceTraveled = 0;
        this.dCount = 0;2
        this.explosionCounter = 0;
        this.exploded= false;
        this.gameOverStatus = false;
        this.gameWidth = this.game.screenBaseSize.width
        this.gameHeight = this.game.screenBaseSize.height
        this.handlerScene = this.scene.get('handler')
    }

//CREATE===================================================================================
    create() {
        //audio
        this.song1 = this.sound.add('song1');
        this.song1.play();
    
        
        //background
        this.background = this.add.tileSprite(0,this.gameHeight*.5,0,0, 'background').setScrollFactor(0)
        .setPipeline("Light2D")
        .setBlendMode(10)
        
        this.handlerScene.updateResize(this)
        //ui
        this.add.sprite(this.gameWidth * .9,this.gameHeight * .65,'fuel_meter').setScale(4).setDepth(5);
        this.speedometer = this.add.sprite(this.gameWidth *.159,this.gameHeight*.9,'speedometer').setScale(.8)
        this.speedText = this.add.bitmapText(this.speedometer.x - 20 ,this.speedometer.y + 20, 'carrier_command', `${this.currentSpeed}mph`).setTint(0xff0000).setScale(.4).setDepth(4)
        
        this.counterText = this.add.bitmapText(5 ,this.gameHeight*.05, 'carrier_command', `Time: ${this.counter}`).setTint(0xff0000).setScale(.6).setDepth(4)
        this.distanceTraveledText = this.add.bitmapText(5 ,this.counterText.y+30, 'carrier_command', `dst: ${this.distanceTraveled}`).setTint(0xff0000).setScale(.6).setDepth(4)
        
        //lighting------------------------------------------
        this.lights.enable().setAmbientColor(0x33333);

        //player--------------------------------------------
        this.player = this.physics.add.sprite(this.gameWidth * .5, this.gameHeight * .9, 'player')
            .setSize(10, 10) //sets the bounds of the sprite, doesnt change the size of the sprite
            .setPipeline("Light2D")
            .setDrag(0)
            .setOrigin(.5,1)
            .setBounce(1)
            .setScale(4.5)
            .setFriction(0)
            //(0,0,this.gameWidth, this.gameHeight);
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


        //Particles----------------------------------------------
        this.emitter = this.add.particles(0, 0, 'blue', {
            speed: 100,
            lifespan: {
                onEmit: (particle, key, t, value) =>
                {
                    return Phaser.Math.Percent(60, 0, 50) * 500;
                }
            },
            alpha: {
                onEmit: (particle, key, t, value) =>
                {
                    return Phaser.Math.Percent(20, 0, 50);
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

            this.emitter.startFollow(this.player);


        //UIBars-----------------------------
        this.makeFuelBar = (x, y, color, percentage) => {
            let bar = this.add.graphics();
            bar.fillStyle(color, 1);
            
            const totalHeight = 202;
            bar.fillRect(0, 0, 25, totalHeight);
            let newHeight = totalHeight * (percentage / 100);
            let newY = y + (totalHeight - newHeight);
            bar.x = x;
            bar.y = newY;
            bar.scaleY = newHeight / totalHeight; // Scale based on the new height
        
            return bar;
        };
        

        this.makeSpeedBar = (x,y,color,percentage)=> {
            let bar = this.add.graphics();
            bar.fillStyle(color,1);
            bar.fillRect(0,0,60,8)
            bar.x = x;
            bar.y = y;
            bar.angle = (percentage * 7)-1000 
            return bar
        }

        //fuel
        this.totalFuel = 100
        this.fuelBar = this.makeFuelBar(this.gameWidth * .8, 107, '0xb1ff47', this.fuelUsed)
        this.speedBar = this.makeSpeedBar(this.speedometer.x, this.speedometer.y, '0x2eec71', this.currentSpeed)

        this.carCollision = (car1,car2) => {
            this.physics.add.collider(car1,car2)
        }
    

        //Collisions
        this.hitCar = (player) => {
            this.tweens.add({
                targets: [player],
                y: + 800
            })
            this.cameras.main.shake(200, 0.02);
        }

        this.boostPlayer = (speed, background) => {
            speed * 10
            background * 10
        }

        //explosions
        this.playerExplode = (x,y) => {
            
            const explode = this.add.particles(x, y, 'flares', {
                frame: [ 'red', 'yellow', 'green' ],
                lifespan: 4000,
                speed: { min: 150, max: 250 },
                scale: { start: 0.8, end: 0 },
                gravityY: 150,
                blendMode: 'ADD',
                emitting: false
            });
            explode.explode(16);
        }


        //Spawn Items----------------------------------------------
        this.spawnItem = (sprite,scale,xSize,ySize) => {
            this.itemLight = this.lights.addLight();
            let item = this.physics.add.sprite(Phaser.Math.Between(0, this.gameWidth), 0, sprite)
            item.setSize(xSize,ySize)
            item.setVelocityY(Phaser.Math.Between(30,500))
            item.setScale(scale)
            this.itemLightsArray.push({allItems:item,light:this.itemLight})
        };

        this.createPoints = (points,itemx,itemy) => {
            // Create the text at a specific position (adjust x and y coordinates)
            let text = this.add.bitmapText(itemx,itemy, 'carrier_command',`${points}`).setTint('0xb1ff47').setOrigin(.5).setScale(.6);

            text.setOrigin(0.5);

            // Create a tween to move the text upwards and fade it out
            let textTween = this.tweens.add({
                targets: text,
                y: -100, // Move the text upward (adjust the value based on desired distance)
                alpha: 0, // Fade out the text
                duration: 2000, // Duration of the tween in milliseconds
                ease: 'Linear', // Easing function (e.g., Linear, Quad, etc.)
                onComplete: () => {
                    text.destroy(); // Destroy the text after the tween completes
                }
            });
        }
        this.dialogueGen = (scene, text, durat,ypos) => {
            // Set up variables to track the displayed text and index
            if(scene){
                scene.dialogueText = scene.add.bitmapText(scene.gameWidth * 0.5, ypos, 'carrier_command')
                    .setScale(.5)
                    .setOrigin(0.5);
        
                scene.introText = text;
                scene.currentCharIndex = 0;
        
                // Start the typing animation
                typeText(scene,durat);
            }
        }
        
        // Function to type the text character by character
        function typeText(scene,durat) {
        
            // Create a tween to add characters one by one
            scene.introTextTween = scene.tweens.addCounter({
                from: 0,
                to: scene.introText.length,
                duration:1000, // Total duration of the typing animation in milliseconds
                onUpdate: (tween) => {
                    let index = Math.floor(tween.getValue());
                    if (index > scene.currentCharIndex) {
                        scene.dialogueText.text += scene.introText[scene.currentCharIndex];
                        scene.currentCharIndex++;
                    }
                },
                onComplete: () => {
                    //moveOutText(scene);
                    fadeOutText(scene)
                }
            });
        }
        
        // Function to fade out the text
        function fadeOutText(scene) {
            scene.tweens.add({
                targets: scene.dialogueText,
                alpha: 0,
                duration: 4000, // Duration of the fade-out animation in milliseconds
                onComplete: () => {
                    // Fade-out animation completed
                    // You can add additional logic here if needed
                    // scene.dialogueText.destroy(); // Optionally destroy the text after fading out
                }
            });
        }
        // Create an instance of DialogueManager
        let randomAddress = Phaser.Math.Between(1,9998)
        // Adding dialogues to the queue
        this.dialogueGen(this,"Chicago 5285 A.D.", 3000, this.gameHeight/2);
        this.dialogues = [
                        `mtry1 report in`,
                        "this is your final mission",
                        `get to your computer`,
                        "before it explodes",
                        "there is no time to waste"
        ];

        //gameover---------------------------------------------------
        this.gameOver = (status) => {
            this.gameOverStatus = true;
            this.gameOverText = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .4 ,'carrier_command',status).setTint(0xff0000).setOrigin(.5).setScale(.8);
            this.playerStatsText = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .5 ,'carrier_command',`Distance: ${this.distanceTraveled.toFixed(2)}mi\n\nTime: 60.00 sec`).setTint(0xff0000).setOrigin(.5).setScale(.5);
            this.playAgainButton = this.add.bitmapText(this.gameWidth * .5, this.gameHeight * .6, 'carrier_command',`Press Enter to play again`).setTint(0xff0000).setOrigin(.5).setScale(.5).setInteractive();
            this.tweens.add({
                targets:[this.gameOverText],
                scale: {
                    from: 1,
                    to: 1.2,
                    },
                duration: 1000,
                repeat: -1,
                repeatDelay: 1000,
                ease: 'back.in',
                yoyo: true
            })
            this.player.disableBody(true,false)

            this.playAgainButton.on('pointerdown', () => {
                this.song1.stop();
                this.scene.start('GameSceneKey');

            });
        }


        // Create two touch zone rectangles
        const leftZone = new Phaser.Geom.Rectangle(0, 0, this.gameWidth / 2, this.gameHeight);
        const rightZone = new Phaser.Geom.Rectangle(this.gameWidth/2,  0, this.gameWidth/2, this.gameHeight);

        const topZone = new Phaser.Geom.Rectangle(0, 0, this.gameWidth, this.gameHeight/2);
        const botZone = new Phaser.Geom.Rectangle(0, this.gameHeight/2, this.gameWidth, this.gameHeight);
        // // Set up touch input handling
        this.input.on('pointermove', (pointer) => {
            if (Phaser.Geom.Rectangle.Contains(leftZone, pointer.x, pointer.y)) {
                this.player.setVelocityX(Config.PLAYER_SPEED * -1);
            } else if (Phaser.Geom.Rectangle.Contains(rightZone, pointer.x, pointer.y)) {
                this.player.setVelocityX(Config.PLAYER_SPEED * 1);
            }
        });
        this.input.on('pointerdown', (pointer) => {
            if (Phaser.Geom.Rectangle.Contains(leftZone, pointer.x, pointer.y)) {
                this.player.setVelocityX(Config.PLAYER_SPEED * -1);
            } else if (Phaser.Geom.Rectangle.Contains(rightZone, pointer.x, pointer.y)) {
                this.player.setVelocityX(Config.PLAYER_SPEED * 1);
            }
        });
        this.input.on('pointermove', (pointer) => {
            if (Phaser.Geom.Rectangle.Contains(topZone, pointer.x, pointer.y)) {
                this.player.setVelocityY(Config.PLAYER_SPEED * -1);
            } else if (Phaser.Geom.Rectangle.Contains(botZone, pointer.x, pointer.y)) {
                this.player.setVelocityY(Config.PLAYER_SPEED * 1);
            }
        });
        this.input.on('pointerdown', (pointer) => {
            if (Phaser.Geom.Rectangle.Contains(topZone, pointer.x, pointer.y)) {
                this.player.setVelocityY(Config.PLAYER_SPEED * -1);
            } else if (Phaser.Geom.Rectangle.Contains(botZone, pointer.x, pointer.y)) {
                this.player.setVelocityY(Config.PLAYER_SPEED * 1);
            }
        });

        
    }
    
//UPDATE===================================================================================
    update() {
        //create live counter
        this.counter += 1
        this.textCount += 1
        if (this.textCount >= 400 && this.dCount <= this.dialogues.length -1) {
                this.dialogueGen(this,`${this.dialogues[this.dCount]}`,1000,this.gameHeight*.5)
                this.dCount += 1
                this.textCount = 0
            }


        //calculate speed
        this.currentSpeed = (1000/this.player.y) * 2200;
        this.speedText.setText(`${Math.ceil(this.currentSpeed)}`)
        this.background.tilePositionY -= 1300/(this.player.y)*10;
        
        
        
        if(this.dCount >= this.dialogues.length && !this.gameOverStatus){
            this.timer += 1
            this.totalFuel -= .05
            let realTime = (this.timer/60)
            this.distanceTraveled = (realTime * this.currentSpeed) / 3600; 
            this.distanceTraveledText.setText(`dst: ${this.distanceTraveled.toFixed(2)}mi`)
            this.counterText.setText(`time: ${(this.timer/60).toFixed(2)}`)
        }
        //player lighting-------------------
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;

        //world bounds
        this.player.y >= 165 ? true : this.player.y = 165;
        this.player.y <= this.gameHeight ? true : this.player.y = this.gameHeight;
        if(this.player.x >= 500){
            this.player.x = 500;
        }
        if(this.player.x <= 19){
            this.player.x = 19;
        }
        
        

        
        //Fuel------------------------------
        //check multiple of %x that equals 0 //basically the lower x is, the more spawns
        if (this.counter %200 == 0){
            this.spawnItem('fuel',.2,110,200)
        }

        //Spawn Traffic
        if (this.counter %50 == 0){
            this.spawnItem('car1',5,8,10)
        }
        this.currentSpeed = (1000/this.player.y) * 400;


        //COLLISIONS WITH ITEMS ---------------------------------------------------
        this.itemLightsArray.forEach((eachItem, index) => {
            const item = eachItem.allItems;
            const light = eachItem.light;

            light.x = item.x;
            light.y = item.y;
            let collectItem;
            if(this.dCount >= this.dialogues.length && this.gameOverStatus === false){
                
                //Collisions-----------------------------------------------------
                collectItem = (player, collectedItem) => {
                    
                    // Check if player hits car
                    if (collectedItem === eachItem.allItems && eachItem.allItems.texture.key === "car1") {
                        this.hitCar(player)
                        // Remove the item from the array and destroy it
                        //this.lights.removeLight(light);
                        this.itemLightsArray.splice(index, 1);
                        item.destroy();
                    }
                    
                    //Check if player hits fuel
                    if (collectedItem === eachItem.allItems && eachItem.allItems.texture.key === "fuel") {
                            
                        this.totalFuel += 20;
                        this.createPoints(100,eachItem.allItems.x,eachItem.allItems.y)
                        this.tweens.add({
                            targets: this.background.tilePosition,
                            tilePositionY: -2000, // Set the target Y position
                            duration: 1000, // Duration of the tween in milliseconds
                            ease: 'Linear', // Easing function (e.g., Linear, Quad, etc.)
                            repeat: -1, // Repeat indefinitely (-1 means repeat forever)
                        });
                        //this.lights.removeLight(light);   
                        this.itemLightsArray.splice(index, 1);
                        item.destroy();
                    }
                };
            }
                this.physics.add.overlap(this.player,eachItem.allItems, collectItem) 

                //remove item from array if off screen and destroy it
                if (item.y > this.gameHeight) {
                    this.lights.removeLight(light);
                    this.itemLightsArray.splice(index, 1);
                    item.destroy
                }
        });

        //Update the fuel bar
        if(this.fuelBar && this.player.alpha === 1){
            this.fuelBar.clear()
            this.fuelBar = this.makeFuelBar(this.gameWidth *.936, this.gameHeight * .763, '0xb1ff47', this.totalFuel)
            this.fuelBar.setDepth(7);

        }
        //fuelCap
        if (this.totalFuel<= 0 && this.gameOverStatus == false) {
            this.gameOver("Mission Failed")
            this.gameOverStatus == true
        }
        if (this.totalFuel >= 100) {
            this.totalFuel = 100;
        }
        //1 minute explosion
        if (this.timer/60 >= this.outofTime && this.gameOverStatus == false && this.exploded === false) {
            this.explosionCounter += 1/60;
            this.playerExplode(this.player.x,this.player.y)
            this.player.alpha = 0
            this.emitter.destroy();
            if(this.explosionCounter >= 5){
                this.gameOver('Mission Complete')
                this.exploded = true;
                this.gameOverStatus == true

            }
        }

        if (this.distanceTraveled < this.distanceObjective &&  this.gameOverStatus == false) {
            this.gameOver()
            this.gameOverStatus == true
        }


        //speedometer
        let speedPercentage = 0 - (this.currentSpeed * -.02 )
        if(this.speedBar){
            this.speedBar.clear()
            this.speedBar = this.makeSpeedBar(this.speedometer.x+5, this.speedometer.y, '0xff0000', speedPercentage)
        }

        //Retry Prompt
        const enterJustPressed = Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))
        if (enterJustPressed && this.gameOverStatus == true) {
            this.scene.start('GameSceneKey')
            this.song1.stop();
        }

        //player movement-----------------------------------------
        if(!this.gameOverStatus){
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
        }
    }
}