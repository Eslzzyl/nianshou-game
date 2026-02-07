import type { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { UI_RESOLUTION } from '../utils/constants.js';
import { Item } from './Item.js';

export class FuCharacter extends Item {
    constructor(scene: Scene, x: number, y: number, type: 'fu_copper' | 'fu_silver' | 'fu_gold') {
        super(scene, x, y, type, type);
    }

    reset(x: number, y: number, type: 'fu_copper' | 'fu_silver' | 'fu_gold'): void {
        this.itemType = type;
        this.config = this.getConfig();
        this.setupForReuse(x, y);
        
        // Update texture to match type
        this.setTexture(type);
    }

    protected onCollect(): void {
        const score = this.getScore();
        ScoreManager.getInstance().addScore(score);
        SaveManager.getInstance().addStat('totalFuCollected', 1);

        AudioManager.getInstance().play('collect_fu');

        this.showScorePopup(score);
    }

    private getScore(): number {
        switch (this.itemType) {
            case 'fu_copper':
                return 10;
            case 'fu_silver':
                return 25;
            case 'fu_gold':
                return 50;
            default:
                return 10;
        }
    }

    private showScorePopup(score: number): void {
        const text = this.scene.add.text(this.x, this.y, `+${score}`, {
            fontSize: '24px',
            color: '#FFD700',
            fontStyle: 'bold',
            resolution: UI_RESOLUTION,
        });

        this.scene.tweens.add({
            targets: text,
            y: this.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy(),
        });
    }
}
