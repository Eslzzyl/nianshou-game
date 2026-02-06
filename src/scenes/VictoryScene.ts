import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import type { Achievement } from '../types/index.js';

interface VictoryData {
    achievements?: Achievement[];
}

export class VictoryScene extends Scene {
    private newAchievements: Achievement[] = [];

    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data: VictoryData): void {
        this.newAchievements = data.achievements || [];
    }

    create(): void {
        this.createBackground();
        this.createVictoryText();
        this.createStats();
        this.createAchievements();
        this.createButtons();
        
        this.input.keyboard?.on('keydown-SPACE', () => this.returnToMenu());
        this.input.keyboard?.on('keydown-ENTER', () => this.returnToMenu());
    }

    private createBackground(): void {
        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_palace');
        bg.setDisplaySize(this.scale.width, this.scale.height);
        
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.5
        );
        
        this.createFireworks();
    }

    private createFireworks(): void {
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 500, () => {
                this.spawnFirework();
            });
        }
        
        this.time.addEvent({
            delay: 2000,
            callback: () => this.spawnFirework(),
            callbackScope: this,
            loop: true,
        });
    }

    private spawnFirework(): void {
        const x = 200 + Math.random() * (this.scale.width - 400);
        const y = 100 + Math.random() * 300;
        
        const colors = [0xFF0000, 0xFFD700, 0x00FF00, 0x00FFFF, 0xFF00FF];
        
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(x, y, 4, colors[Math.floor(Math.random() * colors.length)]);
            
            const angle = (i / 20) * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 1000,
                onComplete: () => particle.destroy(),
            });
        }
    }

    private createVictoryText(): void {
        const text = this.add.text(this.scale.width / 2, 120, '🎉 通关成功! 🎉', {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#8B0000',
            strokeThickness: 8,
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            scale: 1.1,
            duration: 600,
            yoyo: true,
            repeat: -1,
        });
        
        this.add.text(this.scale.width / 2, 200, '福气已成功送达！', {
            fontSize: '28px',
            color: '#FFFFFF',
        }).setOrigin(0.5);
    }

    private createStats(): void {
        const yOffset = 280;
        const score = ScoreManager.getInstance().getScore();
        
        this.add.text(this.scale.width / 2, yOffset, `最终分数: ${score}`, {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        const highScore = SaveManager.getInstance().getHighScore();
        if (score >= highScore) {
            this.add.text(this.scale.width / 2, yOffset + 45, '⭐ 新纪录! ⭐', {
                fontSize: '24px',
                color: '#FFD700',
            }).setOrigin(0.5);
        }
    }

    private createAchievements(): void {
        if (this.newAchievements.length === 0) return;
        
        const yOffset = 380;
        
        this.add.text(this.scale.width / 2, yOffset, '新解锁成就:', {
            fontSize: '24px',
            color: '#AAAAAA',
        }).setOrigin(0.5);
        
        let achievementY = yOffset + 40;
        for (const achievement of this.newAchievements) {
            this.add.text(this.scale.width / 2, achievementY, `🏆 ${achievement.name}`, {
                fontSize: '20px',
                color: '#FFD700',
            }).setOrigin(0.5);
            achievementY += 30;
        }
    }

    private createButtons(): void {
        this.createButton(this.scale.width / 2, 550, '返回主菜单', () => this.returnToMenu());
    }

    private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 250, 60, 0xFFD700);
        bg.setStrokeStyle(3, 0x8B0000);
        bg.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '26px',
            color: '#8B0000',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        
        bg.on('pointerover', () => {
            bg.setFillStyle(0xFFE135);
            container.setScale(1.05);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0xFFD700);
            container.setScale(1);
        });
        
        bg.on('pointerdown', () => {
            AudioManager.getInstance().play('collect_fu');
            callback();
        });
        
        return container;
    }

    private returnToMenu(): void {
        this.scene.start('MenuScene');
    }
}
