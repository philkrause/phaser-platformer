import { Scene } from 'phaser';

class TitleScene extends Scene {
    constructor() {
        super({ key: 'TitleSceneKey' });

        this.startGameButton;
        this.cursors;
        this.allButtons = [];
        this.allButtonText = [];
        this.selectedButtonIndex = 0;
        this.buttonSelect;
        this.handCursor;
        this.titleImage;
        this.titleD = 0;
        this.playText;
        this.infoText;
        this.starAmount = 0;
        this.currentButtonTween;
        this.currentTextTween;
    }

    init()
    {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    preload() 
    {
        console.log("Preload Created");
        this.load.image('title', '../assets/images/title2.png');
        this.load.image('panel', '../assets/images/glassPanel.png');
        this.load.image('cursor', '../assets/images/cursor_hand.png');
        this.load.bitmapFont('carrier_command', '../assets/fonts/carrier_command.png', '../assets/fonts/carrier_command.xml');
    }

    create() 
    {   
        const width = this.scale.width;
        const height = this.scale.height;

        //title image
        this.titleImage = this.add.image(width*.5,height*.3,'title').setDisplaySize(width * .5,height * .5)

        //cursor image
		this.handCursor = this.add.image(0, 0, 'cursor').setScale(.5)

        // Play button
        const playButton = this.add.image(width * 0.5, height * 0.7, 'panel').setDisplaySize(32, 32).setScale(.45,.25);
        const playText = this.add.bitmapText(playButton.x, playButton.y,'carrier_command','Play').setOrigin(0.5).setScale(.2,.2)

	    // About button
	    const aboutButton = this.add.image(playButton.x, playButton.y + playButton.displayHeight + 10, 'panel').setDisplaySize(220, 100).setScale(.45,.2);
        const aboutText = this.add.bitmapText(playButton.x, playButton.y + playButton.displayHeight + 10,'carrier_command' ,'About').setOrigin(0.5).setScale(.2,.2);
        
        //add buttons and text to arrays we can use later
        this.allButtons.push(playButton,aboutButton);
        this.allButtonText.push(playText,aboutText)

        //second camera for buttons 
        // const UICam = this.cameras.add(0, 0, width, height);
        // this.cameras.main.ignore([this.allButtons, this.handCursor, playText, aboutText, this.titleText, this.titleTextT]);
        // UICam.ignore(this.titleImage);

        // Initialize the selected button index
        this.selectButtonIndex = 0
        this.selectButton(this.selectButtonIndex)

        //event listeners for selecting 
        playButton.on('selected', () => {
            this.allButtons = []
            this.scene.start('GameSceneKey')
        })

        aboutButton.on('selected', () => {
            this.add.bitmapText(width * .5, height * .5,'carrier_command','Made with Phaser 3 and Parcel 2 by philkrause').setOrigin(0.5).setScale(.1)
        })

        //clean up events
        this.events.once('shutdown', () => {
            playButton.off('pointerdown');
            aboutButton.off('pointerdown');
        });
    }

    lightUp(obj)
    {
        
    }

    //tinting the button
	selectButton(index)
	{   
        const currentButton = this.allButtons[this.selectedButtonIndex]
        const currentText = this.allButtonText[this.selectButtonIndex]
        currentButton.clearTint();

        // set the current selected button to a white tint
        currentButton.setTint(0xffffff)
    
        const button = this.allButtons[index]
        const text = this.allButtonText[index];

        //set the newly selected button to a green tint
        button.setTint(0x66ff7f)
    
        // move the hand cursor to the right edge
        this.handCursor.x = button.x + button.displayWidth * 0.7
        this.handCursor.y = button.y + 10
    
        // store the new selected index
        this.selectedButtonIndex = index
	}

    //wrap the button index
    selectNextButton(change = 1)
    {
        let index = this.selectedButtonIndex + change
        if (index >= this.allButtons.length){index = 0}
        else if (index < 0) { index = this.allButtons.length - 1 }
        
        if (this.currentTextTween) {
            this.currentTextTween.stop();
            this.currentTextTween = null;
        }

        this.selectButton(index)
    }

    //create an event listener on the button called selected
	confirmSelection()
	{
		const button = this.allButtons[this.selectedButtonIndex]
        const text = this.allButtonText[this.selectedButtonIndex]
        button.emit('selected')
        text.emit('text')
	}

    update() {

        //title Screen Camera
        // this.cameras.main.rotation += 0.01;
        // this.cameras.main.setZoom(Math.abs(Math.sin(this.cameras.main.rotation)) * 0.5 + 1);
        //key inputs
        const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
		const downJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down)
		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))
    
        if (upJustPressed)
		{
			this.selectNextButton(-1)
		}
		else if (downJustPressed)
		{
			this.selectNextButton(1)
		}
        else if (spaceJustPressed)
		{
			this.confirmSelection()
		}
    }
}

export default TitleScene;
