import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';

export class PauseScene extends Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create(): void {
        this.createOverlay();
        this.createMenu();
    }

    private createOverlay(): void {
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.7
        );
        
        overlay.setInteractive();
    }

    private createMenu(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        this.add.rectangle(centerX, centerY, 400, 350, 0x333333, 0.95);
        this.add.rectangle(centerX, centerY, 400, 350, 0x000000, 0).setStrokeStyle(3, 0xFFD700);
        
        this.add.text(centerX, centerY - 130, '游戏暂停', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        this.createButton(centerX, centerY - 50, '继续游戏', () => {
            this.resumeGame();
        });
        
        this.createButton(centerX, centerY + 30, '重新开始', () => {
            this.restartGame();
        });
        
        this.createButton(centerX, centerY + 110, '返回菜单', () => {
            this.returnToMenu();
        });
    }

    private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 250, 50, 0x8B0000);
        bg.setStrokeStyle(2, 0xFFD700);
        bg.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#FFFFFF',
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

    private resumeGame(): void {
        this.scene.stop();
        this.scene.resume('GameScene');
        this.scene.resume('BossScene');
    }

    private restartGame(): void {
        this.scene.stop();
        const gameScene = this.scene.get('GameScene');
        const bossScene = this.scene.get('BossScene');
        
        if (gameScene.scene.isActive()) {
            gameScene.scene.restart();
        } else if (bossScene.scene.isActive()) {
            bossScene.scene.restart();
        }
    }

    private returnToMenu(): void {
        this.scene.stop('GameScene');
        this.scene.stop('BossScene');
        this.scene.stop();
        this.scene.start('MenuScene');
    }
}
