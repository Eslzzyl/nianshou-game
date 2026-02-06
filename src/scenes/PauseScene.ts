import { Scene } from 'phaser';
import { UIComponents } from '../ui/UIComponents.js';
import { UI_RESOLUTION } from '../utils/constants.js';

export class PauseScene extends Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create(): void {
        this.createOverlay();
        this.createMenu();
    }

    private createOverlay(): void {
        // 半透明遮罩
        const overlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.75
        );

        overlay.setInteractive();
    }

    private createMenu(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // 使用卷轴面板
        UIComponents.createScrollPanel(this, centerX, centerY, 420, 400);

        // 标题
        this.add.text(centerX, centerY - 160, '⏸️ 游戏暂停', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // 按钮
        UIComponents.createModernButton(
            this,
            centerX,
            centerY - 60,
            '▶️ 继续游戏',
            () => this.resumeGame()
        );

        UIComponents.createModernButton(
            this,
            centerX,
            centerY + 40,
            '🔄 重新开始',
            () => this.restartGame()
        );

        UIComponents.createModernButton(
            this,
            centerX,
            centerY + 140,
            '🏠 返回菜单',
            () => this.returnToMenu()
        );

        // 提示文字
        this.add.text(centerX, centerY + 200, '按 ESC 继续游戏', {
            fontSize: '14px',
            color: '#666666',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
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
