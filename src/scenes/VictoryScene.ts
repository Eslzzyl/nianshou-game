import { Scene } from 'phaser';
import { ParticleManager } from '../managers/ParticleManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import type { Achievement } from '../types/index.js';
import { UIComponents } from '../ui/UIComponents.js';
import { COLORS, STYLE, UI_RESOLUTION } from '../utils/constants.js';

interface VictoryData {
    achievements?: Achievement[];
}

export class VictoryScene extends Scene {
    private newAchievements: Achievement[] = [];

    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data: VictoryData): void {
        this.newAchievements = data.achievements || [];
    }

    create(): void {
        ParticleManager.getInstance().init(this);

        this.createBackground();
        this.createVictoryText();
        this.createStats();
        this.createAchievements();
        this.createButtons();
        this.createDecorations();

        this.input.keyboard?.on('keydown-SPACE', () => this.returnToMenu());
        this.input.keyboard?.on('keydown-ENTER', () => this.returnToMenu());
    }

    update(_time: number, delta: number): void {
        ParticleManager.getInstance().update(delta);
    }

    private createBackground(): void {
        // 渐变背景
        const bg = this.add.graphics();
        for (let y = 0; y < this.scale.height; y++) {
            const ratio = y / this.scale.height;
            const r = Math.floor(40 + ratio * 40);
            const g = Math.floor(20 + ratio * 20);
            const b = Math.floor(60 + ratio * 40);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.scale.width, 1);
        }

        // 背景图片
        if (this.textures.exists('bg_palace')) {
            const bgImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg_palace');
            bgImage.setDisplaySize(this.scale.width, this.scale.height);
            bgImage.setAlpha(0.4);
        }

        // 庆祝烟花
        this.createFireworks();
    }

    private createFireworks(): void {
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 400, () => {
                const x = 150 + Math.random() * (this.scale.width - 300);
                const y = 80 + Math.random() * 250;
                ParticleManager.getInstance().spawnFirework(x, y);
            });
        }

        this.time.addEvent({
            delay: 1800,
            callback: () => {
                const x = 150 + Math.random() * (this.scale.width - 300);
                const y = 80 + Math.random() * 250;
                ParticleManager.getInstance().spawnFirework(x, y);
            },
            callbackScope: this,
            loop: true,
        });
    }

    private createVictoryText(): void {
        const centerX = this.scale.width / 2;

        // 发光层
        const glow = this.add.text(centerX, 130, '🎉 通关成功! 🎉', {
            fontSize: '64px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 10);
        glow.setAlpha(0.3);

        // 主文字
        const text = this.add.text(centerX, 130, '🎉 通关成功! 🎉', {
            fontSize: '64px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        text.setStroke('#8B0000', 6);

        // 脉冲动画
        this.tweens.add({
            targets: [glow, text],
            scale: 1.08,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 副标题
        this.add.text(centerX, 210, '福气已成功送达！', {
            fontSize: '26px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
    }

    private createStats(): void {
        const centerX = this.scale.width / 2;
        const yOffset = 300;
        const score = ScoreManager.getInstance().getScore();

        // 分数面板
        UIComponents.createScrollPanel(this, centerX, yOffset + 30, 350, 120);

        this.add.text(centerX, yOffset, `🏆 最终分数: ${score}`, {
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        const highScore = SaveManager.getInstance().getHighScore();
        if (score >= highScore) {
            this.add.text(centerX, yOffset + 55, '⭐ 新纪录! ⭐', {
                fontSize: '24px',
                color: '#FF6B35',
                fontStyle: 'bold',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);
        }
    }

    private createAchievements(): void {
        if (this.newAchievements.length === 0) return;

        const centerX = this.scale.width / 2;
        const yOffset = 430;

        this.add.text(centerX, yOffset, '✨ 新解锁成就', {
            fontSize: '22px',
            color: '#AAAAAA',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        let achievementY = yOffset + 40;
        for (const achievement of this.newAchievements) {
            this.add.text(centerX, achievementY, `🏅 ${achievement.name}`, {
                fontSize: '18px',
                color: '#FFD700',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);
            achievementY += 32;
        }
    }

    private createButtons(): void {
        UIComponents.createModernButton(
            this,
            this.scale.width / 2,
            580,
            '🏠 返回主菜单',
            () => this.returnToMenu(),
            { width: 300 }
        );
    }

    private createDecorations(): void {
        // 两侧灯笼
        this.createLantern(100, 120);
        this.createLantern(this.scale.width - 100, 120);
    }

    private createLantern(x: number, y: number): void {
        const container = this.add.container(x, y);

        const lantern = this.add.graphics();
        lantern.fillStyle(COLORS.RED_PRIMARY, 1);
        lantern.fillEllipse(0, 20, 45, 55);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.5);
        lantern.fillEllipse(0, 20, 30, 38);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 1);
        lantern.fillRect(-3, -15, 6, 12);

        container.add(lantern);

        // 摇摆动画
        this.tweens.add({
            targets: container,
            angle: { from: -5, to: 5 },
            duration: 2000 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private returnToMenu(): void {
        this.scene.start('MenuScene');
    }
}
