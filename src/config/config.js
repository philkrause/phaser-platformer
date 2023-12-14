import { GAME_HEIGHT, GAME_WIDTH, DEBUG_MODE, GRAVITY } from "./constants";
import TitleScene from '../scenes/TitleScene';
import GameScene from '../scenes/GameScene';

var startSceneConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [TitleScene,GameScene],
    pixelArt: true,
    zoom: 3,
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 50 },
            debug: DEBUG_MODE
        }
    }
};


export default startSceneConfig