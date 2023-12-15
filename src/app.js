// src/app.js
import 'phaser'; 
import phaserConfig from './config/config';


const game = new Phaser.Game(phaserConfig);
game.scene.start('GameSceneKey');
