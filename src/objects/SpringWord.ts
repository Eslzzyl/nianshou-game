import type { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { UI_RESOLUTION } from '../utils/constants.js';
import { Item } from './Item.js';

export class SpringWord extends Item {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'spring_word', 'spring_word');
        this.init();
    }

    reset(x: number, y: number): void {
        this.itemType = 'spring_word';
        this.config = this.getConfig();
        this.setupForReuse(x, y);
        this.init();
    }

    private init(): void {
        this.createAnimation();
    }

    private createAnimation(): void {
        if (!this.scene) {
            console.warn('SpringWord: scene is undefined in createAnimation');
            return;
        }
        const anims = this.scene.anims;
        const textures = this.scene.textures;

        if (!anims.exists('spring_spin') && textures.exists('spring_word')) {
            try {
                anims.create({
                    key: 'spring_spin',
                    frames: [{ key: 'spring_word', frame: 0 }],
                    frameRate: 10,
                    repeat: -1,
                });
            } catch (e) {
                console.warn('无法创建春字动画:', e);
            }
        }

        if (anims.exists('spring_spin')) {
            this.play('spring_spin');
        }
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
            resolution: UI_RESOLUTION,
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
