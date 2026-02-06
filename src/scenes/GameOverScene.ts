import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';

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
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.85
        );
    }

    private createGameOverText(): void {
        const text = this.add.text(this.scale.width / 2, 150, '游戏结束', {
            fontSize: '64px',
            color: '#FF0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });
        
        this.add.text(this.scale.width / 2, 230, '年兽被打败了...', {
            fontSize: '24px',
            color: '#AAAAAA',
        }).setOrigin(0.5);
    }

    private createStats(): void {
        const yOffset = 320;
        
        this.add.text(this.scale.width / 2, yOffset, `本局分数: ${this.score}`, {
            fontSize: '28px',
            color: '#FFD700',
        }).setOrigin(0.5);
        
        this.add.text(this.scale.width / 2, yOffset + 50, `奔跑距离: ${this.distance}m`, {
            fontSize: '28px',
            color: '#FFFFFF',
        }).setOrigin(0.5);
        
        const highScore = SaveManager.getInstance().getHighScore();
        this.add.text(this.scale.width / 2, yOffset + 100, `最高分数: ${highScore}`, {
            fontSize: '24px',
            color: '#888888',
        }).setOrigin(0.5);
    }

    private createButtons(): void {
        const buttonY = 500;
        
        this.createButton(this.scale.width / 2 - 150, buttonY, '再试一次', () => this.restartGame());
        this.createButton(this.scale.width / 2 + 150, buttonY, '返回菜单', () => this.returnToMenu());
    }

    private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 200, 60, 0x8B0000);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        
        bg.on('pointerover', () => {
            bg.setFillStyle(0xA52A2A);
            container.setScale(1.05);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x8B0000);
            container.setScale(1);
        });
        
        bg.on('pointerdown', () => {
            AudioManager.getInstance().play('collect_fu');
            callback();
        });
        
        return container;
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
