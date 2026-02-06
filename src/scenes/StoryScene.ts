import { Scene } from 'phaser';
import { ParticleManager } from '../managers/ParticleManager.js';
import type { LevelType } from '../types/index.js';
import { UIComponents } from '../ui/UIComponents.js';
import { COLORS, STYLE, UI_RESOLUTION } from '../utils/constants.js';

interface StoryData {
    level: LevelType;
}

const STORY_TEXTS: Record<LevelType, string[]> = {
    1: [
        '春节将至，年兽决定给人类送福。',
        '但人们不知道年兽已经改邪归正，',
        '仍然用爆竹驱赶它...',
        '',
        '帮助年兽躲避爆竹，收集福气吧！',
    ],
    2: [
        '年兽成功通过了乡村，',
        '来到了繁华的城市。',
        '这里的爆竹更加密集，',
        '灯笼也挂得更高...',
        '',
        '小心那些摇摆的灯笼！',
    ],
    3: [
        '最后一关！年兽来到了皇宫附近。',
        '这里正在进行盛大的烟花表演，',
        '爆竹如雨点般落下...',
        '',
        '坚持到最后，福气就会送达！',
    ],
};

const LEVEL_ICONS: Record<LevelType, string> = {
    1: '🏘️',
    2: '🌃',
    3: '🏯',
};

const LEVEL_NAMES: Record<LevelType, string> = {
    1: '乡村街道',
    2: '城市夜景',
    3: '皇宫大殿',
};

export class StoryScene extends Scene {
    private level!: LevelType;

    constructor() {
        super({ key: 'StoryScene' });
    }

    init(data: StoryData): void {
        this.level = data.level;
    }

    create(): void {
        ParticleManager.getInstance().init(this);

        this.createBackground();
        this.createStoryPanel();
        this.createContinueHint();

        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
    }

    update(_time: number, delta: number): void {
        ParticleManager.getInstance().update(delta);
    }

    private createBackground(): void {
        const bgKeys = ['bg_village', 'bg_city', 'bg_palace'];

        // 渐变背景
        const bg = this.add.graphics();
        for (let y = 0; y < this.scale.height; y++) {
            const ratio = y / this.scale.height;
            const r = Math.floor(30 + ratio * 30);
            const g = Math.floor(15 + ratio * 20);
            const b = Math.floor(20 + ratio * 30);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            bg.fillRect(0, y, this.scale.width, 1);
        }

        // 背景图片
        if (this.textures.exists(bgKeys[this.level - 1])) {
            const bgImage = this.add.image(this.scale.width / 2, this.scale.height / 2, bgKeys[this.level - 1]);
            bgImage.setDisplaySize(this.scale.width, this.scale.height);
            bgImage.setAlpha(0.35);
        }

        // 装饰灯笼
        this.createDecorations();
    }

    private createDecorations(): void {
        // 两侧灯笼
        this.createLantern(80, 100);
        this.createLantern(this.scale.width - 80, 100);
        this.createLantern(80, 250);
        this.createLantern(this.scale.width - 80, 250);
    }

    private createLantern(x: number, y: number): void {
        const container = this.add.container(x, y);

        const lantern = this.add.graphics();
        lantern.fillStyle(COLORS.RED_PRIMARY, 0.8);
        lantern.fillEllipse(0, 15, 35, 45);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.4);
        lantern.fillEllipse(0, 15, 22, 30);
        lantern.fillStyle(COLORS.GOLD_PRIMARY, 0.8);
        lantern.fillRect(-2, -18, 4, 15);

        container.add(lantern);

        // 摇摆动画
        this.tweens.add({
            targets: container,
            angle: { from: -4, to: 4 },
            duration: 2200 + Math.random() * 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createStoryPanel(): void {
        const centerX = this.scale.width / 2;
        const panelY = this.scale.height / 2;

        // 卷轴面板
        UIComponents.createScrollPanel(this, centerX, panelY, 700, 450);

        // 关卡标题
        const titleContainer = this.add.container(centerX, 130);

        const icon = this.add.text(0, 0, LEVEL_ICONS[this.level], {
            fontSize: '56px',
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        const title = this.add.text(0, 50, `第 ${this.level} 关：${LEVEL_NAMES[this.level]}`, {
            fontSize: '40px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        title.setStroke('#8B0000', 4);

        // 发光效果
        const glow = this.add.text(0, 50, `第 ${this.level} 关：${LEVEL_NAMES[this.level]}`, {
            fontSize: '40px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        glow.setStroke('#FFD700', 8);
        glow.setAlpha(0.25);

        titleContainer.add([glow, icon, title]);

        // 脉冲动画
        this.tweens.add({
            targets: [glow, title],
            scale: 1.03,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 故事文字
        const texts = STORY_TEXTS[this.level];
        let yOffset = panelY - 80;

        for (const text of texts) {
            if (text === '') {
                yOffset += 25;
                continue;
            }

            const txt = this.add.text(centerX, yOffset, text, {
                fontSize: '24px',
                color: '#FFFFFF',
                align: 'center',
                fontFamily: STYLE.FONT.FAMILY,
                resolution: UI_RESOLUTION,
            }).setOrigin(0.5);

            txt.setAlpha(0);

            this.tweens.add({
                targets: txt,
                alpha: 1,
                duration: 600,
                delay: (yOffset - (panelY - 80)) * 3,
            });

            yOffset += 45;
        }
    }

    private createContinueHint(): void {
        const hint = this.add.text(this.scale.width / 2, this.scale.height - 80, '点击或按空格键继续', {
            fontSize: '18px',
            color: '#FFD700',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: hint,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private startGame(): void {
        if (this.level === 3) {
            this.scene.start('BossScene', { level: this.level });
        } else {
            this.scene.start('GameScene', { level: this.level });
        }
    }
}
