import type { Scene } from 'phaser';
import { Item } from './Item.js';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';

export class SpringWord extends Item {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'spring_word', 'spring_word');
        this.createAnimation();
    }

    private createAnimation(): void {
        if (!this.scene.anims.exists('spring_spin')) {
            this.scene.anims.create({
                key: 'spring_spin',
                frames: [{ key: 'spring_word', frame: 0 }],
                frameRate: 10,
                repeat: -1,
            });
        }
        
        this.play('spring_spin');
    }

    protected onCollect(): void {
        SaveManager.getInstance().addStat('totalFlyTime', 5);
        AudioManager.getInstance().play('powerup');
        
        const gameScene = this.scene as unknown as { player?: { activateFly: () => void } };
        if (gameScene.player?.activateFly) {
            gameScene.player.activateFly();
        }
        
        this.showFlyPopup();
    }

    private showFlyPopup(): void {
        const text = this.scene.add.text(this.x, this.y, '飞行模式!', {
            fontSize: '28px',
            color: '#00FF00',
            fontStyle: 'bold',
        });
        
        this.scene.tweens.add({
            targets: text,
            y: this.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy(),
        });
    }
}
