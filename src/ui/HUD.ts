import type { Scene } from 'phaser';
import { REDPACKET_THRESHOLD } from '../utils/constants.js';

export class HUD {
    private scene: Scene;
    private scoreText!: Phaser.GameObjects.Text;
    private livesContainer!: Phaser.GameObjects.Container;
    private redPacketText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private energyBar!: Phaser.GameObjects.Graphics;
    private energyBg!: Phaser.GameObjects.Graphics;

    constructor(scene: Scene) {
        this.scene = scene;
        this.create();
    }

    private create(): void {
        this.createLives();
        this.createScore();
        this.createRedPackets();
        this.createDistance();
        this.createEnergyBar();
    }

    private createLives(): void {
        this.livesContainer = this.scene.add.container(20, 20);
        this.updateLives(3);
    }

    private createScore(): void {
        this.scoreText = this.scene.add.text(20, 70, '福气值: 0', {
            fontSize: '24px',
            color: '#FFD700',
            fontStyle: 'bold',
        });
    }

    private createRedPackets(): void {
        const x = this.scene.scale.width - 150;
        
        this.scene.add.text(x, 20, '🧧', {
            fontSize: '32px',
        });
        
        this.redPacketText = this.scene.add.text(x + 40, 25, 'x0', {
            fontSize: '24px',
            color: '#FF0000',
            fontStyle: 'bold',
        });
    }

    private createDistance(): void {
        this.distanceText = this.scene.add.text(this.scene.scale.width / 2, 20, '0m / 1000m', {
            fontSize: '20px',
            color: '#FFFFFF',
        }).setOrigin(0.5, 0);
    }

    private createEnergyBar(): void {
        const x = this.scene.scale.width / 2 - 150;
        const y = this.scene.scale.height - 40;
        const width = 300;
        const height = 20;
        
        this.energyBg = this.scene.add.graphics();
        this.energyBg.fillStyle(0x333333, 0.8);
        this.energyBg.fillRect(x, y, width, height);
        
        this.energyBar = this.scene.add.graphics();
        
        this.scene.add.text(this.scene.scale.width / 2, y - 25, '福气护体能量', {
            fontSize: '16px',
            color: '#AAAAAA',
        }).setOrigin(0.5);
    }

    update(score: number, lives: number, redPackets: number, distance: number, maxDistance: number): void {
        this.scoreText.text = `福气值: ${score}`;
        this.redPacketText.text = `x${redPackets}`;
        this.distanceText.text = `${distance}m / ${maxDistance}m`;
        
        this.updateLives(lives);
        this.updateEnergyBar(redPackets);
    }

    private updateLives(lives: number): void {
        this.livesContainer.removeAll(true);
        
        for (let i = 0; i < 3; i++) {
            const heart = this.scene.add.text(i * 35, 0, i < lives ? '❤️' : '🖤', {
                fontSize: '28px',
            });
            this.livesContainer.add(heart);
        }
    }

    private updateEnergyBar(redPackets: number): void {
        const x = this.scene.scale.width / 2 - 150;
        const y = this.scene.scale.height - 40;
        const width = 300;
        const height = 20;
        
        const progress = Math.min(redPackets / REDPACKET_THRESHOLD, 1);
        const fillWidth = width * progress;
        
        this.energyBar.clear();
        
        if (progress >= 1) {
            this.energyBar.fillStyle(0xFFD700, 1);
        } else if (progress >= 0.5) {
            this.energyBar.fillStyle(0xFFA500, 1);
        } else {
            this.energyBar.fillStyle(0xFF0000, 1);
        }
        
        this.energyBar.fillRect(x, y, fillWidth, height);
    }

    destroy(): void {
        this.livesContainer.destroy();
        this.scoreText.destroy();
        this.redPacketText.destroy();
        this.distanceText.destroy();
        this.energyBar.destroy();
        this.energyBg.destroy();
    }
}
