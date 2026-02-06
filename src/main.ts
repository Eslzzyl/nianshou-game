import { Game } from 'phaser';
import { gameConfig } from './config.js';
import { SaveManager } from './managers/SaveManager.js';
import { ScoreManager } from './managers/ScoreManager.js';
import { BootScene } from './scenes/BootScene.js';
import { BossScene } from './scenes/BossScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

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

let pendingResizeRaf = 0;
window.addEventListener('resize', () => {
    if (pendingResizeRaf) return;
    pendingResizeRaf = window.requestAnimationFrame(() => {
        pendingResizeRaf = 0;
        game.scale.refresh();
    });
});
