import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';
import { COLORS, STYLE, UI_RESOLUTION } from '../utils/constants.js';

export class BootScene extends Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        this.load.setPath('assets');

        this.createLoadingUI();

        this.load.on('progress', (value: number) => {
            this.updateLoadingBar(value);
        });

        this.load.on('complete', () => {
            this.loadingBar?.destroy();
            this.loadingText?.destroy();
            this.loadingBg?.destroy();
            this.logoText?.destroy();
            this.glowEffect?.destroy();
        });

        this.load.on('loaderror', (file: Phaser.Loader.File) => {
            console.warn(`资源加载失败: ${file.key}，将使用占位纹理`);
        });

        this.loadAssets();
        this.createParticleTextures();
    }

    private createParticleTextures(): void {
        // 创建通用的粒子纹理
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // 白色圆点（雪花）
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('p_white', 16, 16);
        graphics.clear();

        // 金色圆点
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('p_gold', 16, 16);
        graphics.clear();

        graphics.destroy();
    }

    private loadingBar?: Phaser.GameObjects.Graphics;
    private loadingBg?: Phaser.GameObjects.Graphics;
    private loadingText?: Phaser.GameObjects.Text;
    private logoText?: Phaser.GameObjects.Text;
    private glowEffect?: Phaser.GameObjects.Graphics;

    private createLoadingUI(): void {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // 渐变背景
        const bg = this.add.graphics();
        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Math.floor(26 + ratio * 30);
            const gVal = Math.floor(10 + ratio * 15);
            const b = Math.floor(10 + ratio * 10);
            bg.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b), 1);
            bg.fillRect(0, y, width, 1);
        }

        // 装饰性祥云
        this.createDecorations();

        // 发光效果
        this.glowEffect = this.add.graphics();
        this.glowEffect.fillStyle(COLORS.GOLD_PRIMARY, 0.15);
        this.glowEffect.fillCircle(centerX, centerY - 50, 150);

        // Logo文字
        this.logoText = this.add.text(centerX, centerY - 80, '🧧 年兽送福', {
            fontSize: '56px',
            color: '#FFD700',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);
        this.logoText.setStroke('#8B0000', 6);

        // 加载条背景
        this.loadingBg = this.add.graphics();
        this.loadingBg.fillStyle(0x2a1a1a, 0.8);
        this.drawRoundedRect(this.loadingBg, centerX - 220, centerY + 20, 440, 50, 8);
        this.loadingBg.lineStyle(2, COLORS.GOLD_PRIMARY);
        this.drawRoundedRectStroke(this.loadingBg, centerX - 220, centerY + 20, 440, 50, 8);

        // 加载条
        this.loadingBar = this.add.graphics();

        // 加载文字
        this.loadingText = this.add.text(centerX, centerY + 90, '正在加载资源... 0%', {
            fontSize: '20px',
            color: '#FFFFFF',
            fontFamily: STYLE.FONT.FAMILY,
            resolution: UI_RESOLUTION,
        }).setOrigin(0.5);

        // Logo呼吸动画
        this.tweens.add({
            targets: this.logoText,
            scale: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 发光脉冲动画
        this.tweens.add({
            targets: this.glowEffect,
            scale: 1.2,
            alpha: 0.25,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    private createDecorations(): void {
        const { width, height } = this.scale;

        // 底部祥云
        const cloudGraphics = this.add.graphics();
        cloudGraphics.fillStyle(COLORS.GOLD_PRIMARY, 0.15);

        for (let x = 0; x < width; x += 150) {
            const y = height - 80 + Math.sin(x * 0.01) * 20;
            cloudGraphics.fillCircle(x, y, 30);
            cloudGraphics.fillCircle(x - 25, y + 10, 25);
            cloudGraphics.fillCircle(x + 25, y + 10, 25);
        }

        // 角落装饰
        // 左上
        this.createCornerDecoration(20, 20, 0);
        // 右上
        this.createCornerDecoration(width - 20, 20, 90);
        // 左下
        this.createCornerDecoration(20, height - 20, 270);
        // 右下
        this.createCornerDecoration(width - 20, height - 20, 180);
    }

    private createCornerDecoration(x: number, y: number, rotation: number): void {
        const decor = this.add.graphics();
        decor.fillStyle(COLORS.GOLD_PRIMARY, 0.4);

        // 绘制简单的装饰图案
        decor.fillCircle(0, 0, 8);
        decor.fillRect(-30, -3, 30, 6);
        decor.fillRect(-3, -30, 6, 30);

        decor.setPosition(x, y);
        decor.setRotation((rotation * Math.PI) / 180);
    }

    private updateLoadingBar(value: number): void {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        this.loadingBar?.clear();

        // 渐变填充
        const fillWidth = 420 * value;

        if (fillWidth > 0) {
            // 基础填充
            this.loadingBar?.fillStyle(COLORS.RED_PRIMARY, 1);
            this.drawRoundedRect(this.loadingBar!, centerX - 210, centerY + 25, fillWidth, 40, 6);

            // 高光
            this.loadingBar?.fillStyle(0xFFFFFF, 0.2);
            this.drawRoundedRect(this.loadingBar!, centerX - 210, centerY + 25, fillWidth, 20, 6);

            // 流光效果
            if (fillWidth > 50) {
                this.loadingBar?.fillStyle(COLORS.GOLD_LIGHT, 0.4);
                const shimmerX = centerX - 210 + ((Date.now() / 10) % fillWidth);
                this.loadingBar?.fillRect(shimmerX, centerY + 25, 30, 40);
            }
        }

        if (this.loadingText) {
            this.loadingText.text = `正在加载资源... ${Math.floor(value * 100)}%`;
        }
    }

    private drawRoundedRect(
        graphics: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        graphics.beginPath();
        graphics.moveTo(x + radius, y);
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.fillPath();
    }

    private drawRoundedRectStroke(
        graphics: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ): void {
        graphics.beginPath();
        graphics.moveTo(x + radius, y);
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.strokePath();
    }

    private loadAssets(): void {
        AudioManager.getInstance().init(this);
        AudioManager.getInstance().preload();

        const basePath = 'images/';

        // 背景
        this.load.image('bg_sky', `${basePath}backgrounds/sky.png`);
        this.load.image('bg_mountains', `${basePath}backgrounds/mountains.png`);
        this.load.image('bg_buildings', `${basePath}backgrounds/buildings.png`);
        this.load.image('bg_ground', `${basePath}backgrounds/ground.png`);
        this.load.image('bg_village', `${basePath}backgrounds/village.png`);
        this.load.image('bg_city', `${basePath}backgrounds/city.png`);
        this.load.image('bg_palace', `${basePath}backgrounds/palace.png`);

        // 角色动画
        this.load.spritesheet('nianshou_run', `${basePath}characters/nianshou_run.png`, {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.image('nianshou_jump', `${basePath}characters/nianshou_jump.png`);
        this.load.spritesheet('nianshou_duck', `${basePath}characters/nianshou_duck.png`, {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet('nianshou_hurt', `${basePath}characters/nianshou_hurt.png`, {
            frameWidth: 128,
            frameHeight: 128,
        });

        // 障碍物
        this.load.spritesheet('firecracker', `${basePath}obstacles/firecracker.png`, {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.image('lantern', `${basePath}obstacles/lantern.png`);

        // 收集物
        this.load.image('fu_copper', `${basePath}items/fu_copper.png`);
        this.load.image('fu_silver', `${basePath}items/fu_silver.png`);
        this.load.image('fu_gold', `${basePath}items/fu_gold.png`);
        this.load.spritesheet('redpacket', `${basePath}items/redpacket.png`, {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet('spring_word', `${basePath}items/spring_word.png`, {
            frameWidth: 48,
            frameHeight: 48,
        });

        // UI
        this.load.image('ui_button', `${basePath}ui/button.png`);
        this.load.image('health_icon', `${basePath}ui/heart.png`);
    }

    create(): void {
        this.generatePlaceholderTextures();

        AudioManager.getInstance().init(this);
        AudioManager.getInstance().create();

        this.scene.start('MenuScene');
    }

    private generatePlaceholderTextures(): void {
        // 年兽奔跑动画 - 现代化设计
        this.generateSpriteSheet('nianshou_run', 128, 128, 4, (g, frameWidth, frameHeight, frameIndex) => {
            // 身体 - 更鲜艳的红色
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillCircle(frameWidth / 2, frameHeight / 2 + 5, 42);

            // 渐变效果
            g.fillStyle(COLORS.RED_LIGHT, 0.5);
            g.fillCircle(frameWidth / 2 - 10, frameHeight / 2 - 5, 30);

            // 眼睛 - 更明亮
            g.fillStyle(0xFFFFFF);
            g.fillCircle(frameWidth / 2 - 18, frameHeight / 2 - 10, 10);
            g.fillCircle(frameWidth / 2 + 18, frameHeight / 2 - 10, 10);
            g.fillStyle(0x000000);
            g.fillCircle(frameWidth / 2 - 18, frameHeight / 2 - 10, 5);
            g.fillCircle(frameWidth / 2 + 18, frameHeight / 2 - 10, 5);

            // 高光
            g.fillStyle(0xFFFFFF, 0.6);
            g.fillCircle(frameWidth / 2 - 20, frameHeight / 2 - 12, 3);
            g.fillCircle(frameWidth / 2 + 16, frameHeight / 2 - 12, 3);

            // 腿部动画
            g.fillStyle(COLORS.RED_DARK);
            const legOffset = Math.sin(frameIndex * Math.PI / 2) * 12;
            g.fillRoundedRect(frameWidth / 2 - 25 + legOffset, frameHeight / 2 + 42, 18, 28, 4);
            g.fillRoundedRect(frameWidth / 2 + 7 - legOffset, frameHeight / 2 + 42, 18, 28, 4);

            // 金色装饰
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillCircle(frameWidth / 2, frameHeight / 2 + 15, 8);
        });

        // 跳跃姿势
        this.generateTexture('nianshou_jump', 128, 128, (g, w, h) => {
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillCircle(w / 2, h / 2, 42);

            g.fillStyle(COLORS.RED_LIGHT, 0.5);
            g.fillCircle(w / 2 - 10, h / 2 - 10, 30);

            g.fillStyle(0xFFFFFF);
            g.fillCircle(w / 2 - 18, h / 2 - 15, 10);
            g.fillCircle(w / 2 + 18, h / 2 - 15, 10);
            g.fillStyle(0x000000);
            g.fillCircle(w / 2 - 18, h / 2 - 15, 5);
            g.fillCircle(w / 2 + 18, h / 2 - 15, 5);

            // 向上伸展的腿
            g.fillStyle(COLORS.RED_DARK);
            g.fillRoundedRect(w / 2 - 28, h / 2 + 25, 18, 25, 4);
            g.fillRoundedRect(w / 2 + 10, h / 2 + 25, 18, 25, 4);

            // 金色装饰
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillCircle(w / 2, h / 2 + 10, 8);
        });

        // 下蹲动画
        this.generateSpriteSheet('nianshou_duck', 128, 128, 2, (g, frameWidth, frameHeight, frameIndex) => {
            const squash = frameIndex === 0 ? 0.75 : 1;
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillEllipse(frameWidth / 2, frameHeight / 2 + 35, 55 * squash, 40);

            g.fillStyle(0xFFFFFF);
            g.fillCircle(frameWidth / 2 - 15, frameHeight / 2 + 20, 9);
            g.fillCircle(frameWidth / 2 + 15, frameHeight / 2 + 20, 9);
            g.fillStyle(0x000000);
            g.fillCircle(frameWidth / 2 - 15, frameHeight / 2 + 20, 4);
            g.fillCircle(frameWidth / 2 + 15, frameHeight / 2 + 20, 4);
        });

        // 受伤动画
        this.generateSpriteSheet('nianshou_hurt', 128, 128, 2, (g, frameWidth, frameHeight, frameIndex) => {
            const blink = frameIndex === 0;
            g.fillStyle(blink ? 0xFF4444 : COLORS.RED_PRIMARY);
            g.fillCircle(frameWidth / 2, frameHeight / 2 + 5, 42);

            if (!blink) {
                g.fillStyle(0xFFFFFF);
                g.fillCircle(frameWidth / 2 - 18, frameHeight / 2 - 10, 10);
                g.fillCircle(frameWidth / 2 + 18, frameHeight / 2 - 10, 10);
                g.fillStyle(0x000000);
                g.fillCircle(frameWidth / 2 - 18, frameHeight / 2 - 10, 5);
                g.fillCircle(frameWidth / 2 + 18, frameHeight / 2 - 10, 5);
            }

            // X形眼睛表示受伤
            g.lineStyle(4, 0x000000);
            if (blink) {
                const offset = 18;
                const centerY = frameHeight / 2 - 10;
                g.moveTo(frameWidth / 2 - offset - 8, centerY - 8);
                g.lineTo(frameWidth / 2 - offset + 8, centerY + 8);
                g.moveTo(frameWidth / 2 - offset + 8, centerY - 8);
                g.lineTo(frameWidth / 2 - offset - 8, centerY + 8);
                g.moveTo(frameWidth / 2 + offset - 8, centerY - 8);
                g.lineTo(frameWidth / 2 + offset + 8, centerY + 8);
                g.moveTo(frameWidth / 2 + offset + 8, centerY - 8);
                g.lineTo(frameWidth / 2 + offset - 8, centerY + 8);
            }
        });

        // 爆竹动画 - 现代化设计
        this.generateSpriteSheet('firecracker', 64, 64, 4, (g, frameWidth, frameHeight, frameIndex) => {
            // 红色爆竹主体 - 更现代
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillRoundedRect(frameWidth / 2 - 14, frameHeight / 2 - 22, 28, 44, 6);

            // 顶部引线
            g.lineStyle(3, 0x8B4513);
            g.beginPath();
            g.moveTo(frameWidth / 2, frameHeight / 2 - 22);
            g.lineTo(frameWidth / 2, frameHeight / 2 - 32);
            g.strokePath();

            // 火花动画 - 更明亮
            if (frameIndex > 0) {
                const sparkColors = [COLORS.GOLD_PRIMARY, COLORS.GOLD_LIGHT, 0xFF6B35];
                g.fillStyle(sparkColors[frameIndex - 1]);
                const offset = (frameIndex - 1) * 6;
                g.fillCircle(frameWidth / 2, frameHeight / 2 - 38 - offset, 5 + offset);

                // 火花光芒
                g.fillStyle(sparkColors[frameIndex - 1], 0.3);
                g.fillCircle(frameWidth / 2, frameHeight / 2 - 38 - offset, 12 + offset);
            }

            // 金色装饰条 - 更精致
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillRect(frameWidth / 2 - 14, frameHeight / 2 - 8, 28, 5);
            g.fillRect(frameWidth / 2 - 14, frameHeight / 2 + 8, 28, 5);

            // 高光
            g.fillStyle(0xFFFFFF, 0.3);
            g.fillRect(frameWidth / 2 - 10, frameHeight / 2 - 18, 6, 30);
        });

        // 灯笼 - 现代化设计
        this.generateTexture('lantern', 96, 128, (g, w, h) => {
            // 灯笼主体 - 渐变效果
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillEllipse(w / 2, h / 2 + 10, 75, 90);

            // 内部发光
            g.fillStyle(COLORS.RED_LIGHT, 0.5);
            g.fillEllipse(w / 2, h / 2 + 10, 55, 70);

            // 中心亮光
            g.fillStyle(COLORS.GOLD_PRIMARY, 0.3);
            g.fillEllipse(w / 2, h / 2 + 10, 35, 45);

            // 顶部悬挂
            g.fillStyle(COLORS.GOLD_DARK);
            g.fillRect(w / 2 - 4, 0, 8, 30);
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillCircle(w / 2, 5, 8);

            // 底部流苏
            g.fillStyle(COLORS.GOLD_PRIMARY);
            for (let i = -2; i <= 2; i++) {
                g.fillRect(w / 2 + i * 6 - 2, h / 2 + 55, 4, 20 + Math.abs(i) * 5);
            }

            // 装饰图案
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillCircle(w / 2, h / 2 + 10, 15);
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillCircle(w / 2, h / 2 + 10, 10);
        });

        // 福字（铜）- 现代化设计
        this.generateTexture('fu_copper', 48, 48, (g, w, h) => {
            // 背景渐变
            g.fillStyle(COLORS.COPPER);
            g.fillRect(0, 0, w, h);

            // 边框
            g.lineStyle(3, COLORS.GOLD_PRIMARY);
            g.strokeRect(3, 3, w - 6, h - 6);

            // 内部装饰
            g.fillStyle(COLORS.GOLD_PRIMARY, 0.3);
            g.fillRect(8, 8, w - 16, h - 16);

            this.drawCharPlaceholder(g, w / 2, h / 2, COLORS.GOLD_PRIMARY, 28);
        });

        // 福字（银）
        this.generateTexture('fu_silver', 48, 48, (g, w, h) => {
            g.fillStyle(COLORS.SILVER);
            g.fillRect(0, 0, w, h);

            g.lineStyle(3, 0xFFFFFF);
            g.strokeRect(3, 3, w - 6, h - 6);

            g.fillStyle(0xFFFFFF, 0.3);
            g.fillRect(8, 8, w - 16, h - 16);

            this.drawCharPlaceholder(g, w / 2, h / 2, 0xFFFFFF, 28);
        });

        // 福字（金）
        this.generateTexture('fu_gold', 48, 48, (g, w, h) => {
            // 金色渐变效果
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillRect(0, 0, w, h);

            // 高光
            g.fillStyle(COLORS.GOLD_LIGHT, 0.5);
            g.fillRect(0, 0, w, h / 2);

            // 边框
            g.lineStyle(3, COLORS.RED_PRIMARY);
            g.strokeRect(3, 3, w - 6, h - 6);

            // 内部装饰
            g.fillStyle(COLORS.RED_PRIMARY, 0.2);
            g.fillRect(8, 8, w - 16, h - 16);

            this.drawCharPlaceholder(g, w / 2, h / 2, COLORS.RED_PRIMARY, 28);
        });

        // 红包动画 - 现代化设计
        this.generateSpriteSheet('redpacket', 48, 48, 2, (g, frameWidth, frameHeight, frameIndex) => {
            // 红包主体 - 更鲜艳的红色
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillRoundedRect(4, 8, frameWidth - 8, frameHeight - 16, 4);

            // 金色边框
            g.lineStyle(2, COLORS.GOLD_PRIMARY);
            g.strokeRoundedRect(4, 8, frameWidth - 8, frameHeight - 16, 4);

            // 发光效果
            if (frameIndex === 1) {
                g.lineStyle(3, COLORS.GOLD_LIGHT, 0.5);
                g.strokeRoundedRect(2, 6, frameWidth - 4, frameHeight - 12, 6);
            }

            // 顶部装饰
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillRect(4, 8, frameWidth - 8, 8);

            // 福字占位
            this.drawCharPlaceholder(g, frameWidth / 2, frameHeight / 2 + 2, COLORS.GOLD_PRIMARY, 18);
        });

        // 春字动画
        this.generateSpriteSheet('spring_word', 48, 48, 4, (g, frameWidth, frameHeight, frameIndex) => {
            const colors = [0x00AA44, 0x00CC55, 0x00E666, 0x00CC55];
            g.fillStyle(colors[frameIndex]);
            g.fillRoundedRect(2, 2, frameWidth - 4, frameHeight - 4, 6);

            // 装饰边框
            g.lineStyle(2, 0x88FF88);
            g.strokeRoundedRect(4, 4, frameWidth - 8, frameHeight - 8, 4);

            this.drawCharPlaceholder(g, frameWidth / 2, frameHeight / 2, 0xCCFFCC, 24);
        });

        // ============================================
        // 关卡背景 - 每个关卡4层独立背景
        // ============================================

        // 第一关：乡村街道
        this.generateTexture('bg1_sky', 1280, 720, (g, w, h) => {
            for (let i = 0; i < h; i++) {
                const ratio = i / h;
                const r = Math.floor(255 - ratio * 80);
                const gVal = Math.floor(200 - ratio * 100);
                const b = Math.floor(150 - ratio * 100);
                g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
                g.fillRect(0, i, w, 1);
            }
        });

        this.generateTexture('bg1_hills', 1280, 720, (g, w) => {
            // 山丘层 - tileSprite在y=100，显示纹理0-620区域，所以内容画在顶部0-200
            g.fillStyle(0x4a7a4a);
            for (let x = 0; x < w; x += 100) {
                const height = 80 + Math.sin(x * 0.01) * 40 + Math.sin(x * 0.025) * 20;
                const baseY = 200; // 从纹理顶部向下200px处开始
                g.fillTriangle(x, baseY, x + 50, baseY - height, x + 100, baseY);
            }
            g.fillStyle(0x5a8a5a);
            for (let x = 0; x < w; x += 80) {
                const height = 50 + Math.sin(x * 0.015 + 1) * 25;
                const baseY = 230; // 稍低一点的山丘
                g.fillTriangle(x, baseY, x + 40, baseY - height, x + 80, baseY);
            }
        });

        this.generateTexture('bg1_houses', 1280, 720, (g, w) => {
            // 房屋层 - tileSprite在y=200，显示纹理0-520区域，内容画在顶部0-300
            for (let x = 0; x < w; x += 120) {
                const houseW = 70 + (x % 40);
                const houseH = 60 + (x % 30);
                const houseBase = 300; // 房屋底部在纹理300px处
                g.fillStyle(0x8B7355);
                g.fillRect(x, houseBase - houseH, houseW, houseH);
                g.fillStyle(0x6B5344);
                g.fillTriangle(x - 10, houseBase - houseH, x + houseW / 2, houseBase - houseH - 35, x + houseW + 10, houseBase - houseH);
                g.fillStyle(0x8B7355);
                const chimneyH = 25 + (x % 15);
                g.fillRect(x + houseW - 15, houseBase - houseH - chimneyH, 12, chimneyH);
            }
            // 树木
            g.fillStyle(0x5a3a2a);
            for (let x = 0; x < w; x += 150) {
                g.fillRect(x + 25, 340, 20, 40);
            }
        });

        this.generateTexture('bg1_ground', 1280, 720, (g, w) => {
            // 地面层 - tileSprite在y=580，高度140，填满纹理顶部0-140
            g.fillStyle(0x8B5a2a);
            g.fillRect(0, 0, w, 140);
            g.fillStyle(0x6B4520);
            for (let x = 0; x < w; x += 30) {
                g.fillRect(x, 0, 2, 140);
            }
            g.fillStyle(0xA0522D);
            for (let x = 10; x < w; x += 80) {
                g.fillEllipse(x, 110, 40, 15);
            }
        });

        // 第二关：城市夜景
        this.generateTexture('bg2_sky', 1280, 720, (g, w, h) => {
            for (let i = 0; i < h; i++) {
                const ratio = i / h;
                const r = Math.floor(40 + ratio * 30);
                const gVal = Math.floor(20 + ratio * 20);
                const b = Math.floor(60 + ratio * 40);
                g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
                g.fillRect(0, i, w, 1);
            }
            // 确定性星星生成
            g.fillStyle(0xFFFFFF);
            for (let i = 0; i < 50; i++) {
                const sx = ((i * 137) % 1280);
                const sy = ((i * 293) % 360);
                const size = 1 + (i % 2);
                g.fillCircle(sx, sy, size);
            }
            g.fillStyle(0xFFD700);
            g.fillCircle(w - 100, 80, 35);
        });

        this.generateTexture('bg2_cityline', 1280, 720, (g, w) => {
            // 城市天际线 - tileSprite在y=100，显示纹理0-620区域，内容画在顶部0-200
            g.fillStyle(0x6a5a7a);
            for (let x = 0; x < w; x += 60) {
                const bh = 180 + ((x * 7) % 150);
                // 从纹理顶部开始向下绘制建筑
                const buildingTop = 50;
                g.fillRect(x, buildingTop, 55, bh);
            }
        });

        this.generateTexture('bg2_buildings', 1280, 720, (g, w) => {
            // 城市建筑 - tileSprite在y=200，显示纹理0-520区域，内容画在顶部0-300
            for (let x = 0; x < w; x += 80) {
                const bh = 120 + ((x * 3) % 130);
                const bw = 70 + ((x * 5) % 30);
                g.fillStyle(0x8a7a9a);
                const buildingTop = 80;
                g.fillRect(x, buildingTop, bw, bh);
                g.fillStyle(0xFFE55C);
                for (let y = buildingTop + 10; y < buildingTop + bh; y += 20) {
                    // 确定性窗户
                    if ((x + y) % 3 !== 0) {
                        g.fillRect(x + 5, y, 10, 14);
                    }
                    if ((x + y + 1) % 3 !== 0) {
                        g.fillRect(x + bw - 15, y, 10, 14);
                    }
                }
                g.fillStyle(0xFF6B6B);
                g.fillRect(x + bw / 2 - 3, buildingTop - 8, 6, 8);
            }
            // 激光束
            g.fillStyle(0x00FFFF);
            for (let x = 0; x < w; x += 200) {
                g.fillRect(x, 100, 4, 100);
            }
        });

        this.generateTexture('bg2_road', 1280, 720, (g, w) => {
            // 道路 - tileSprite在y=580，高度140，填满纹理顶部0-140
            g.fillStyle(0x3a3a4a);
            g.fillRect(0, 0, w, 140);
            g.fillStyle(0x5a5a6a);
            for (let x = 0; x < w; x += 50) {
                g.fillRect(x, 65, 30, 8);
            }
            g.fillStyle(0xFFE55C);
            for (let x = 0; x < w; x += 300) {
                g.fillRect(x, 10, 8, 120);
                g.fillStyle(0xFFFFFF, 0.3);
                g.fillCircle(x + 4, 10, 15);
                g.fillStyle(0xFFE55C);
            }
        });

        // 第三关：皇宫大殿
        this.generateTexture('bg3_sky', 1280, 720, (g, w, h) => {
            for (let i = 0; i < h; i++) {
                const ratio = i / h;
                const r = Math.floor(180 - ratio * 60);
                const gVal = Math.floor(30 - ratio * 20);
                const b = Math.floor(30 - ratio * 20);
                g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
                g.fillRect(0, i, w, 1);
            }
            // 确定性金星生成
            g.fillStyle(0xFFD700);
            for (let i = 0; i < 30; i++) {
                const sx = ((i * 191) % 1280);
                const sy = ((i * 257) % 288);
                const size = 1.5 + (i % 3) * 0.5;
                g.fillCircle(sx, sy, size);
            }
        });

        this.generateTexture('bg3_wall', 1280, 720, (g, w) => {
            // 宫墙层 - tileSprite在y=100，显示纹理0-620区域，内容画在顶部0-200
            g.fillStyle(0x8B0000);
            g.fillRect(0, 170, w, 50);
            g.fillStyle(0xA52A2A);
            for (let x = 0; x < w; x += 40) {
                g.fillRect(x, 175, 3, 40);
            }
            g.fillStyle(0xFFD700);
            for (let x = 0; x < w; x += 200) {
                g.fillRect(x - 3, 180, 6, 15);
            }
            g.fillStyle(0x8B4513);
            g.fillRect(0, 210, w, 10);
        });

        this.generateTexture('bg3_palace', 1280, 720, (g, w) => {
            // 宫殿层 - tileSprite在y=200，显示纹理0-520区域，内容画在顶部0-300
            for (let x = 0; x < w; x += 200) {
                const bw = 140 + ((x * 7) % 60);
                const bh = 120 + ((x * 11) % 80);
                const palaceBase = 300; // 宫殿底部位置
                g.fillStyle(0xCD5C5C);
                g.fillRect(x, palaceBase - bh, bw, bh);
                g.fillStyle(0xFFD700);
                g.fillRect(x - 5, palaceBase - bh, bw + 10, 8);
                g.fillStyle(0x8B0000);
                g.beginPath();
                g.moveTo(x - 10, palaceBase - bh);
                g.lineTo(x + bw / 2, palaceBase - bh - 50);
                g.lineTo(x + bw + 10, palaceBase - bh);
                g.closePath();
                g.fillPath();
                g.fillStyle(0xFF6347);
                for (let y = 0; y < 3; y++) {
                    g.fillRect(x + 20 + y * 30, palaceBase - bh + 20, 20, 25);
                }
            }
            g.fillStyle(0xFFD700);
            for (let x = 0; x < w; x += 150) {
                g.fillCircle(x, 270, 12);
            }
        });

        this.generateTexture('bg3_ground', 1280, 720, (g, w) => {
            // 御道层 - tileSprite在y=580，高度140，填满纹理顶部0-140
            g.fillStyle(0x696969);
            g.fillRect(0, 0, w, 140);
            g.lineStyle(2, 0x505050);
            for (let x = 0; x < w; x += 60) {
                g.moveTo(x, 0);
                g.lineTo(x + 30, 140);
            }
            g.strokePath();
            g.fillStyle(0xDAA520);
            for (let x = 0; x < w; x += 400) {
                g.fillRect(x - 20, 30, 40, 80);
            }
        });

        // UI 元素
        this.generateTexture('ui_button', 64, 64, (g, w, h) => {
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillRoundedRect(0, 0, w, h, 8);
            g.lineStyle(2, COLORS.GOLD_PRIMARY);
            g.strokeRoundedRect(0, 0, w, h, 8);
        });

        this.generateTexture('health_icon', 32, 32, (g, w, h) => {
            // 灯笼形状的生命值图标
            g.fillStyle(COLORS.RED_PRIMARY);
            g.fillEllipse(w / 2, h / 2 + 2, 22, 26);
            g.fillStyle(COLORS.GOLD_PRIMARY);
            g.fillRect(w / 2 - 3, 2, 6, 8);
        });
    }

    private generateTexture(key: string, width: number, height: number,
        drawFn: (g: Phaser.GameObjects.Graphics, w: number, h: number) => void): void {
        // 如果纹理已存在，先移除以确保重新生成
        if (this.textures.exists(key)) {
            this.textures.remove(key);
        }

        const graphics = this.add.graphics();
        drawFn(graphics, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    private generateSpriteSheet(key: string, frameWidth: number, frameHeight: number,
        frameCount: number,
        drawFn: (g: Phaser.GameObjects.Graphics, fw: number, fh: number, frameIndex: number) => void): void {
        // 如果纹理已存在，先移除以确保重新生成
        if (this.textures.exists(key)) {
            this.textures.remove(key);
        }

        const graphics = this.add.graphics();
        const totalWidth = frameWidth * frameCount;

        for (let i = 0; i < frameCount; i++) {
            graphics.save();
            graphics.translateCanvas(i * frameWidth, 0);
            drawFn(graphics, frameWidth, frameHeight, i);
            graphics.restore();
        }

        graphics.generateTexture(key, totalWidth, frameHeight);
        graphics.destroy();

        const texture = this.textures.get(key);

        if (texture.has('__BASE')) {
            texture.remove('__BASE');
        }

        for (let i = 0; i < frameCount; i++) {
            texture.add(
                i,
                0,
                i * frameWidth,
                0,
                frameWidth,
                frameHeight
            );
        }
    }

    private drawCharPlaceholder(graphics: Phaser.GameObjects.Graphics,
        x: number, y: number, color: number, size: number): void {
        graphics.fillStyle(color);
        const half = size / 2;
        graphics.fillTriangle(x, y - half, x + half, y, x, y + half);
        graphics.fillTriangle(x, y - half, x - half, y, x, y + half);
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - size / 6, y - size / 6, size / 3, size / 3);
    }
}
