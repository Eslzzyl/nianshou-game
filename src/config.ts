import { GAME_HEIGHT, GAME_WIDTH } from './utils/constants.js';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'phaser-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 1000 },
            debug: false,
        },
    },
    scale: {
        // Fill the window without letterboxing (no dark bars).
        // With RESIZE the game size follows the container, so scenes must respond to resize.
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
        roundPixels: true,
        powerPreference: 'high-performance',
    },
};
