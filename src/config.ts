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
        // Always fill the available browser window while preserving aspect ratio.
        // This may crop a little on non-16:9 screens (e.g. 16:10), but avoids letterboxing.
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
