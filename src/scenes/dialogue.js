export default dialogue = (scene, text, durat,ypos) => {
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

function moveOutText(scene) {
    scene.tweens.add({
        targets: scene.dialogueText,
        x: -1000 ,
        duration: 8000, // Duration of the fade-out animation in milliseconds
        onComplete: () => {
            // Fade-out animation completed
            // You can add additional logic here if needed
            scene.dialogueText.destroy(); // Optionally destroy the text after fading out
        }
    });
}
