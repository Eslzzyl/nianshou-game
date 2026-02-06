import type { Scene } from 'phaser';
import { ScoreManager } from '../managers/ScoreManager.js';
import { COLORS, REDPACKET_THRESHOLD, STYLE, UI_RESOLUTION } from '../utils/constants.js';

export class HUD {
    private scene: Scene;
    private scoreText!: Phaser.GameObjects.Text;
    private livesContainer!: Phaser.GameObjects.Container;
    private redPacketText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private energyBar!: Phaser.GameObjects.Graphics;
    private energyBg!: Phaser.GameObjects.Graphics;
    private energyGlow!: Phaser.GameObjects.Graphics;
    private panelBg!: Phaser.GameObjects.Graphics;
    private fpsText?: Phaser.GameObjects.Text;
    private shimmerLight?: Phaser.GameObjects.Graphics;

    constructor(scene: Scene) {
        this.scene = scene;
        this.create();
    }

    private create(): void {
        this.createPanel();
        this.createLives();
        this.createScore();
        this.createRedPackets();
        this.createDistance();
        this.createEnergyBar();
        this.createFPSCounter();
    }

    private createFPSCounter(): void {
        this.fpsText = this.scene.add.text(this.scene.scale.width - 10, this.scene.scale.height - 10, '60 FPS', {
            fontSize: '12px',
            color: '#00FF00',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(1, 1).setDepth(1000);
    }

    private updateFPS(): void {
        if (this.fpsText) {
            const fps = Math.round(this.scene.game.loop.actualFps);
            this.fpsText.setText(`${fps} FPS`);
            if (fps < 30) this.fpsText.setColor('#FF0000');
            else if (fps < 50) this.fpsText.setColor('#FFFF00');
            else this.fpsText.setColor('#00FF00');
        }
    }

    private createPanel(): void {
        // 主面板背景 - 半透明深色
        this.panelBg = this.scene.add.graphics();
        this.panelBg.fillStyle(COLORS.BG_WARM, 0.85);
        this.panelBg.fillRoundedRect(10, 10, 300, 140, 12);
        this.panelBg.lineStyle(2, COLORS.GOLD_PRIMARY);
        this.panelBg.strokeRoundedRect(10, 10, 300, 140, 12);

        // 右上角面板
        const rightPanel = this.scene.add.graphics();
        rightPanel.fillStyle(COLORS.BG_WARM, 0.85);
        rightPanel.fillRoundedRect(this.scene.scale.width - 200, 10, 190, 80, 12);
        rightPanel.lineStyle(2, COLORS.GOLD_PRIMARY);
        rightPanel.strokeRoundedRect(this.scene.scale.width - 200, 10, 190, 80, 12);
    }

    private createLives(): void {
        this.livesContainer = this.scene.add.container(30, 30);
        this.updateLives(3);
    }

    private createScore(): void {
        this.scoreText = this.scene.add.text(30, 80, '福气值: 0', {
            fontSize: '22px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
    }

    private createRedPackets(): void {
        const x = this.scene.scale.width - 180;

        // 红包图标
        this.scene.add.text(x, 25, '🧧', {
            fontSize: '32px',
            resolution: UI_RESOLUTION,
        });

        this.redPacketText = this.scene.add.text(x + 45, 32, 'x0', {
            fontSize: '24px',
            color: '#FF4444',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });

        // 提示文字
        this.scene.add.text(x, 65, `收集${REDPACKET_THRESHOLD}个激活护盾`, {
            fontSize: '12px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        });
    }

    private createDistance(): void {
        this.distanceText = this.scene.add.text(this.scene.scale.width / 2, 25, '0m / 1000m', {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5, 0);
    }

    private createEnergyBar(): void {
        const x = this.scene.scale.width / 2 - 150;
        const y = this.scene.scale.height - 50;
        const width = 300;
        const height = 24;

        // 背景
        this.energyBg = this.scene.add.graphics();
        this.energyBg.fillStyle(0x2a1a1a, 0.9);
        this.energyBg.fillRoundedRect(x, y, width, height, 6);
        this.energyBg.lineStyle(2, COLORS.GOLD_PRIMARY);
        this.energyBg.strokeRoundedRect(x, y, width, height, 6);

        // 能量条
        this.energyBar = this.scene.add.graphics();

        // 流光效果
        this.energyGlow = this.scene.add.graphics();

        // 标签
        this.scene.add.text(this.scene.scale.width / 2, y - 28, '✨ 福气护体能量', {
            fontSize: '14px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
    }

    update(score: number, lives: number, redPackets: number, distance: number, maxDistance: number): void {
        this.scoreText.text = `福气值: ${score}`;
        this.redPacketText.text = `x${redPackets}`;
        this.distanceText.text = `${distance}m / ${maxDistance}m`;

        this.updateLives(lives);
        const scoreManager = ScoreManager.getInstance();
        const energy = scoreManager.isInvincibleStateActive() ? scoreManager.getInvincibleEnergy() : redPackets;
        this.updateEnergyBar(energy);
        this.updateFPS();
    }

    private updateLives(lives: number): void {
        this.livesContainer.removeAll(true);

        for (let i = 0; i < 3; i++) {
            const isActive = i < lives;
            const heartContainer = this.scene.add.container(i * 45, 0);

            // 灯笼背景
            const lantern = this.scene.add.graphics();
            if (isActive) {
                lantern.fillStyle(COLORS.RED_PRIMARY, 1);
                lantern.fillEllipse(0, 5, 28, 34);
                lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.6);
                lantern.fillEllipse(0, 5, 18, 24);
                lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
                lantern.fillRect(-3, -18, 6, 12);
            } else {
                // 灰掉的灯笼
                lantern.fillStyle(0x444444, 1);
                lantern.fillEllipse(0, 5, 28, 34);
                lantern.fillStyle(0x666666, 1);
                lantern.fillRect(-3, -18, 6, 12);
            }

            heartContainer.add(lantern);
            this.livesContainer.add(heartContainer);
        }
    }

    private updateEnergyBar(redPackets: number): void {
        const x = this.scene.scale.width / 2 - 150;
        const y = this.scene.scale.height - 50;
        const width = 300;
        const height = 24;

        const progress = Math.min(redPackets / REDPACKET_THRESHOLD, 1);
        const fillWidth = (width - 8) * progress;

        this.energyBar.clear();
        this.energyGlow.clear();

        if (fillWidth > 0) {
            // 确定颜色
            let color: number = COLORS.RED_PRIMARY;
            let glowColor: number = COLORS.RED_LIGHT;

            if (progress >= 1) {
                color = COLORS.GOLD_PRIMARY;
                glowColor = COLORS.GOLD_LIGHT;
            } else if (progress >= 0.5) {
                color = COLORS.CORAL;
                glowColor = COLORS.CORAL_LIGHT;
            }

            // 主填充
            this.energyBar.fillStyle(color, 1);
            this.energyBar.fillRoundedRect(x + 4, y + 4, fillWidth, height - 8, 4);

            // 高光
            this.energyBar.fillStyle(0xFFFFFF, 0.3);
            this.energyBar.fillRoundedRect(x + 4, y + 4, fillWidth, (height - 8) / 2, 4);

            // 流光效果（满能量时）
            if (progress >= 1) {
                if (!this.shimmerLight) {
                    this.shimmerLight = this.scene.add.graphics();
                    this.shimmerLight.fillStyle(COLORS.GOLD_LIGHT, 0.6);
                    this.shimmerLight.fillRoundedRect(0, 0, 40, height - 8, 4);
                    this.shimmerLight.setPosition(x + 4, y + 4);

                    // 流光动画
                    this.scene.tweens.add({
                        targets: this.shimmerLight,
                        x: x + width - 44,
                        duration: 1200,
                        repeat: -1,
                        ease: 'Linear',
                        onRepeat: () => {
                            this.shimmerLight?.setPosition(x + 4, y + 4);
                        },
                    });
                }
            } else {
                if (this.shimmerLight) {
                    this.shimmerLight.destroy();
                    this.shimmerLight = undefined;
                }
            }

            // 发光效果
            this.energyGlow.fillStyle(glowColor, 0.3);
            this.energyGlow.fillRoundedRect(x + 4, y + 4, fillWidth, height - 8, 4);
        } else {
            if (this.shimmerLight) {
                this.shimmerLight.destroy();
                this.shimmerLight = undefined;
            }
        }
    }

    destroy(): void {
        this.livesContainer.destroy();
        this.scoreText.destroy();
        this.redPacketText.destroy();
        this.distanceText.destroy();
        this.energyBar.destroy();
        this.energyBg.destroy();
        this.energyGlow.destroy();
        this.panelBg.destroy();
        if (this.shimmerLight) {
            this.shimmerLight.destroy();
        }
    }
}
