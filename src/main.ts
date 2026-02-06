import { Game } from 'phaser';
import { gameConfig } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { GameScene } from './scenes/GameScene.js';
import { BossScene } from './scenes/BossScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { ScoreManager } from './managers/ScoreManager.js';
import { SaveManager } from './managers/SaveManager.js';

const config: Phaser.Types.Core.GameConfig = {
    ...gameConfig,
    scene: [
        BootScene,
        MenuScene,
        StoryScene,
        GameScene,
        BossScene,
        PauseScene,
        GameOverScene,
        VictoryScene,
    ],
};

ScoreManager.getInstance().init();
SaveManager.getInstance();

const game = new Game(config);

window.addEventListener('resize', () => {
    game.scale.refresh();
});
