import type { Scene } from 'phaser';
import { Item } from './Item.js';
import { AudioManager } from '../managers/AudioManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { SaveManager } from '../managers/SaveManager.js';

export class RedPacket extends Item {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'redpacket', 'redpacket');
        this.createAnimation();
    }

    private createAnimation(): void {
        if (!this.scene.anims.exists('redpacket_glow')) {
            this.scene.anims.create({
                key: 'redpacket_glow',
                frames: [{ key: 'redpacket', frame: 0 }],
                frameRate: 4,
                repeat: -1,
            });
        }
        
        this.play('redpacket_glow');
    }

    protected onCollect(): void {
        ScoreManager.getInstance().addRedPacket();
        SaveManager.getInstance().addStat('totalRedPackets', 1);
        
        AudioManager.getInstance().play('collect_packet');
        
        this.showPacketPopup();
    }

    private showPacketPopup(): void {
        const text = this.scene.add.text(this.x, this.y, '🧧 +1', {
            fontSize: '24px',
            color: '#FF0000',
            fontStyle: 'bold',
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
