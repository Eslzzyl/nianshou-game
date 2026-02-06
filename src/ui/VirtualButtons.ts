import type { Scene } from 'phaser';
import { isMobile } from '../utils/helpers.js';

export class VirtualButtons {
    private scene: Scene;
    private jumpBtn!: Phaser.GameObjects.Container;
    private duckBtn!: Phaser.GameObjects.Container;
    private activateBtn!: Phaser.GameObjects.Container;

    constructor(scene: Scene) {
        this.scene = scene;
        
        if (isMobile()) {
            this.create();
        }
    }

    private create(): void {
        this.createJumpButton();
        this.createDuckButton();
        this.createActivateButton();
    }

    private createJumpButton(): void {
        const x = 100;
        const y = this.scene.scale.height - 100;
        
        this.jumpBtn = this.scene.add.container(x, y);
        
        const bg = this.scene.add.circle(0, 0, 60, 0xFFFFFF, 0.3);
        bg.setStrokeStyle(3, 0xFFFFFF);
        
        const icon = this.scene.add.text(0, 0, '⬆️', {
            fontSize: '36px',
        }).setOrigin(0.5);
        
        this.jumpBtn.add([bg, icon]);
        
        const hitArea = new Phaser.Geom.Circle(0, 0, 60);
        bg.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
        
        bg.on('pointerdown', () => {
            bg.setFillStyle(0xFFFFFF, 0.5);
        });
        
        bg.on('pointerup', () => {
            bg.setFillStyle(0xFFFFFF, 0.3);
        });
    }

    private createDuckButton(): void {
        const x = this.scene.scale.width - 100;
        const y = this.scene.scale.height - 100;
        
        this.duckBtn = this.scene.add.container(x, y);
        
        const bg = this.scene.add.circle(0, 0, 60, 0xFFFFFF, 0.3);
        bg.setStrokeStyle(3, 0xFFFFFF);
        
        const icon = this.scene.add.text(0, 0, '⬇️', {
            fontSize: '36px',
        }).setOrigin(0.5);
        
        this.duckBtn.add([bg, icon]);
        
        const hitArea = new Phaser.Geom.Circle(0, 0, 60);
        bg.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
        
        bg.on('pointerdown', () => {
            bg.setFillStyle(0xFFFFFF, 0.5);
        });
        
        bg.on('pointerup', () => {
            bg.setFillStyle(0xFFFFFF, 0.3);
        });
    }

    private createActivateButton(): void {
        const x = this.scene.scale.width / 2;
        const y = this.scene.scale.height - 180;
        
        this.activateBtn = this.scene.add.container(x, y);
        this.activateBtn.setVisible(false);
        
        const bg = this.scene.add.circle(0, 0, 50, 0xFFD700, 0.5);
        bg.setStrokeStyle(3, 0xFFD700);
        
        const icon = this.scene.add.text(0, 0, '✨', {
            fontSize: '32px',
        }).setOrigin(0.5);
        
        this.activateBtn.add([bg, icon]);
        
        const hitArea = new Phaser.Geom.Circle(0, 0, 50);
        bg.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    }

    showActivateButton(show: boolean): void {
        this.activateBtn.setVisible(show);
    }

    destroy(): void {
        this.jumpBtn?.destroy();
        this.duckBtn?.destroy();
        this.activateBtn?.destroy();
    }
}
