import { Scene } from 'phaser';
import { SaveManager } from '../managers/SaveManager.js';
import { UIComponents } from '../ui/UIComponents.js';
import { STYLE, UI_RESOLUTION } from '../utils/constants.js';

interface GameOverData {
    score: number;
    distance: number;
}

export class GameOverScene extends Scene {
    private score = 0;
    private distance = 0;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: GameOverData): void {
        this.score = data.score;
        this.distance = data.distance;
    }

    create(): void {
        this.createBackground();
        this.createGameOverText();
        this.createStats();
        this.createButtons();

        SaveManager.getInstance().setHighScore(this.score);

        this.input.keyboard?.on('keydown-SPACE', () => this.restartGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.restartGame());
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
    }

    private createGameOverText(): void {
        const centerX = this.scale.width / 2;

        // 发光层
        const glow = this.add.text(centerX, 140, '💔 游戏结束', {
            fontSize: '60px',
            color: '#FF4444',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FF0000', 8);
        glow.setAlpha(0.3);

        // 主文字
        const text = this.add.text(centerX, 140, '💔 游戏结束', {
            fontSize: '60px',
            color: '#FF4444',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        text.setStroke('#8B0000', 5);

        // 脉冲动画
        this.tweens.add({
            targets: [glow, text],
            scale: 1.06,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 副标题
        this.add.text(centerX, 220, '年兽被打败了，但勇气永存...', {
            fontSize: '20px',
            color: '#888888',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
    }

    private createStats(): void {
        const centerX = this.scale.width / 2;
        const yOffset = 320;

        // 统计面板
        UIComponents.createScrollPanel(this, centerX, yOffset + 50, 400, 180);

        this.add.text(centerX, yOffset, `📊 本局分数: ${this.score}`, {
            fontSize: '28px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.add.text(centerX, yOffset + 50, `🏃 奔跑距离: ${this.distance}m`, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        const highScore = SaveManager.getInstance().getHighScore();
        this.add.text(centerX, yOffset + 100, `🏆 最高分数: ${highScore}`, {
            fontSize: '20px',
            color: '#888888',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
    }

    private createButtons(): void {
        const buttonY = 520;

        UIComponents.createModernButton(
            this,
            this.scale.width / 2 - 160,
            buttonY,
            '🔄 再试一次',
            () => this.restartGame(),
            { width: 240 }
        );

        UIComponents.createModernButton(
            this,
            this.scale.width / 2 + 160,
            buttonY,
            '🏠 返回菜单',
            () => this.returnToMenu(),
            { width: 240 }
        );
    }

    private restartGame(): void {
        const gameScene = this.scene.get('GameScene');
        if (gameScene) {
            const currentLevel = (gameScene as unknown as { level?: number }).level || 1;
            this.scene.start('GameScene', { level: currentLevel });
        } else {
            this.scene.start('MenuScene');
        }
    }

    private returnToMenu(): void {
        this.scene.start('MenuScene');
    }
}
