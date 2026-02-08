import { Scene } from 'phaser';
import { GAME_OVER_TEXTS } from '../data/NarrativeData.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import type { LevelType } from '../types/index.js';
import { UIComponents } from '../ui/UIComponents.js';
import { STYLE, UI_RESOLUTION } from '../utils/constants.js';

interface GameOverData {
    score: number;
    distance: number;
    level?: LevelType;
    fromSceneKey?: string;
    failReason?: 'firecracker' | 'lantern' | 'default';
}

export class GameOverScene extends Scene {
    private score = 0;
    private distance = 0;
    private level?: LevelType;
    private fromSceneKey?: string;
    private failReason: 'firecracker' | 'lantern' | 'default' = 'default';
    private uiContainer?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: GameOverData): void {
        this.score = data.score;
        this.distance = data.distance;
        this.level = data.level;
        this.fromSceneKey = data.fromSceneKey;
        this.failReason = data.failReason || 'default';
    }

    create(): void {
        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        this.buildLayout();

        SaveManager.getInstance().setHighScore(this.score);

        this.input.keyboard?.on('keydown-SPACE', () => this.restartGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.restartGame());
    }

    private buildLayout(): void {
        this.uiContainer?.destroy(true);
        this.uiContainer = this.add.container(0, 0);

        this.createBackground();
        this.createGameOverText();
        this.createStats();
        this.createButtons();
    }

    private onResize(): void {
        this.buildLayout();
    }

    private createBackground(): void {
        // 暗色渐变背景
        const bg = this.add.graphics();
        for (let y = 0; y < this.scale.height; y++) {
            const ratio = y / this.scale.height;
            const r = Math.floor(20 + ratio * 20);
            const g = Math.floor(10 + ratio * 15);
            const b = Math.floor(15 + ratio * 20);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.scale.width, 1);
        }

        this.uiContainer?.add(bg);

        // 暗角效果
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 0.6);
        // 简单的暗角模拟
        for (let i = 0; i < 100; i++) {
            const alpha = (i / 100) * 0.6;
            vignette.fillStyle(0x000000, alpha);
            vignette.fillRect(0, 0, this.scale.width, i);
            vignette.fillRect(0, this.scale.height - i, this.scale.width, i);
            vignette.fillRect(0, 0, i, this.scale.height);
            vignette.fillRect(this.scale.width - i, 0, i, this.scale.height);
        }

        this.uiContainer?.add(vignette);
    }

    private createGameOverText(): void {
        const centerX = this.scale.width / 2;
        const gameOverText = GAME_OVER_TEXTS.find((t) => t.condition === this.failReason) || GAME_OVER_TEXTS[0];

        // 发光层
        const glow = this.add.text(centerX, 120, gameOverText.title, {
            fontSize: '52px',
            color: '#FF4444',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FF0000', 8);
        glow.setAlpha(0.3);

        // 主文字
        const text = this.add.text(centerX, 120, gameOverText.title, {
            fontSize: '52px',
            color: '#FF4444',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        text.setStroke('#8B0000', 5);

        // 脉冲动画
        this.tweens.add({
            targets: [glow, text],
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 消息
        const message = this.add.text(centerX, 190, gameOverText.message, {
            fontSize: '20px',
            color: '#CCCCCC',
            align: 'center',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // 鼓励语
        const encouragement = this.add.text(centerX, 225, gameOverText.encouragement, {
            fontSize: '18px',
            color: '#FFD700',
            fontStyle: 'bold',
            align: 'center',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // 提示
        const hint = this.add.text(centerX, 260, gameOverText.hint, {
            fontSize: '14px',
            color: '#888888',
            fontStyle: 'italic',
            align: 'center',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add([glow, text, message, encouragement, hint]);
    }

    private createStats(): void {
        const centerX = this.scale.width / 2;
        const yOffset = 320;

        // 统计面板
        const panel = UIComponents.createScrollPanel(this, centerX, yOffset + 50, 400, 180);
        this.uiContainer?.add(panel);

        const scoreText = this.add.text(centerX, yOffset, `📊 本局分数: ${this.score}`, {
            fontSize: '28px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        const distanceText = this.add.text(centerX, yOffset + 50, `🏃 奔跑距离: ${this.distance}m`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        const highScore = SaveManager.getInstance().getHighScore();
        const highScoreText = this.add.text(centerX, yOffset + 100, `🏆 最高分数: ${highScore}`, {
            fontSize: '20px',
            color: '#888888',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add([scoreText, distanceText, highScoreText]);
    }

    private createButtons(): void {
        const buttonY = 520;

        const retryBtn = UIComponents.createModernButton(
            this,
            this.scale.width / 2 - 160,
            buttonY,
            '🔄 再试一次',
            () => this.restartGame(),
            { width: 240 }
        );

        const menuBtn = UIComponents.createModernButton(
            this,
            this.scale.width / 2 + 160,
            buttonY,
            '🏠 返回菜单',
            () => this.returnToMenu(),
            { width: 240 }
        );

        this.uiContainer?.add([retryBtn, menuBtn]);
    }

    private restartGame(): void {
        const currentLevel = (this.level ?? ScoreManager.getInstance().getCurrentLevel()) as LevelType;
        const sceneKey = this.fromSceneKey === 'BossScene' ? 'BossScene' : 'GameScene';
        this.scene.start(sceneKey, { level: currentLevel });
    }

    private returnToMenu(): void {
        this.scene.start('MenuScene');
    }
}
