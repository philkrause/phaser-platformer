import { GAME_HEIGHT, GAME_WIDTH, DEBUG_MODE, GRAVITY } from "./constants";
import GameScene from '../scenes/GameScene';

var startSceneConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [GameScene],
    pixelArt: true,
    zoom: 3,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: DEBUG_MODE
        }
    }
};


export default startSceneConfig