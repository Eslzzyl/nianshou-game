import { Scene } from 'phaser';
import { UIComponents } from '../ui/UIComponents.js';
import { UI_RESOLUTION } from '../utils/constants.js';

export class PauseScene extends Scene {
    private uiContainer?: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'PauseScene' });
    }

    create(): void {
        this.scale.off('resize', this.onResize, this);
        this.scale.on('resize', this.onResize, this);

        this.buildLayout();

        this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
    }

    private buildLayout(): void {
        this.uiContainer?.destroy(true);
        this.uiContainer = this.add.container(0, 0);

        this.createOverlay();
        this.createMenu();
    }

    private onResize(): void {
        this.buildLayout();
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
        this.uiContainer?.add(overlay);
    }

    private createMenu(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // 使用卷轴面板
        const panel = UIComponents.createScrollPanel(this, centerX, centerY, 420, 400);
        this.uiContainer?.add(panel);

        // 标题
        const title = this.add.text(centerX, centerY - 160, '⏸️ 游戏暂停', {
            fontSize: '36px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // 按钮
        const resumeBtn = UIComponents.createModernButton(
            this,
            centerX,
            centerY - 60,
            '▶️ 继续游戏',
            () => this.resumeGame()
        );

        const restartBtn = UIComponents.createModernButton(
            this,
            centerX,
            centerY + 40,
            '🔄 重新开始',
            () => this.restartGame()
        );

        const menuBtn = UIComponents.createModernButton(
            this,
            centerX,
            centerY + 140,
            '🏠 返回菜单',
            () => this.returnToMenu()
        );

        // 提示文字
        const hint = this.add.text(centerX, centerY + 200, '按 ESC 继续游戏', {
            fontSize: '14px',
            color: '#666666',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.uiContainer?.add([title, resumeBtn, restartBtn, menuBtn, hint]);
    }

    private resumeGame(): void {
        const gameScene = this.scene.get('GameScene') as unknown as { isPaused?: boolean };
        const bossScene = this.scene.get('BossScene') as unknown as { isPaused?: boolean };
        gameScene.isPaused = false;
        bossScene.isPaused = false;

        this.scene.stop();
        this.scene.resume('GameScene');
        this.scene.resume('BossScene');
    }

    private restartGame(): void {
        this.scene.stop();
        const gameScene = this.scene.get('GameScene');
        const bossScene = this.scene.get('BossScene');

        if (gameScene.scene.isActive() || gameScene.scene.isPaused()) {
            const currentLevel = (gameScene as unknown as { level?: number }).level || 1;
            this.scene.stop('GameScene');
            this.scene.start('GameScene', { level: currentLevel });
            return;
        }

        if (bossScene.scene.isActive() || bossScene.scene.isPaused()) {
            const currentLevel = (bossScene as unknown as { level?: number }).level || 1;
            this.scene.stop('BossScene');
            this.scene.start('BossScene', { level: currentLevel });
        }
    }

    private returnToMenu(): void {
        this.scene.stop('GameScene');
        this.scene.stop('BossScene');
        this.scene.stop();
        this.scene.start('MenuScene');
    }
}
