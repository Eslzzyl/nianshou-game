import type { Scene } from 'phaser';

export class HealthBar {
    private scene: Scene;
    private maxHealth: number;
    private currentHealth: number;
    private hearts: Phaser.GameObjects.Text[] = [];

    constructor(scene: Scene, maxHealth: number) {
        this.scene = scene;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }

    create(x: number, y: number): void {
        for (let i = 0; i < this.maxHealth; i++) {
            const heart = this.scene.add.text(x + i * 35, y, '❤️', {
                fontSize: '28px',
            });
            this.hearts.push(heart);
        }
    }

    update(health: number): void {
        this.currentHealth = health;
        
        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].text = i < this.currentHealth ? '❤️' : '🖤';
        }
    }

    destroy(): void {
        for (const heart of this.hearts) {
            heart.destroy();
        }
        this.hearts = [];
    }
}
