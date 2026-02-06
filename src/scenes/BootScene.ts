import { Scene } from 'phaser';
import { AudioManager } from '../managers/AudioManager.js';

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
        });
        
        // 监听加载错误，生成占位纹理
        this.load.on('loaderror', (file: Phaser.Loader.File) => {
            console.warn(`资源加载失败: ${file.key}，将使用占位纹理`);
        });
        
        this.loadAssets();
    }

    private loadingBar?: Phaser.GameObjects.Graphics;
    private loadingText?: Phaser.GameObjects.Text;

    private createLoadingUI(): void {
        const { width, height } = this.scale;
        
        this.loadingBar = this.add.graphics();
        this.loadingBar.fillStyle(0x222222, 0.8);
        this.loadingBar.fillRect(width / 2 - 200, height / 2 - 30, 400, 60);
        
        this.loadingText = this.add.text(width / 2, height / 2, '加载中... 0%', {
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 80, '年兽送福', {
            fontSize: '48px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
    }

    private updateLoadingBar(value: number): void {
        const { width, height } = this.scale;
        
        this.loadingBar?.clear();
        this.loadingBar?.fillStyle(0x222222, 0.8);
        this.loadingBar?.fillRect(width / 2 - 200, height / 2 - 30, 400, 60);
        this.loadingBar?.fillStyle(0xFFD700, 1);
        this.loadingBar?.fillRect(width / 2 - 190, height / 2 - 20, 380 * value, 40);
        
        if (this.loadingText) {
            this.loadingText.text = `加载中... ${Math.floor(value * 100)}%`;
        }
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
        // 生成占位纹理（如果真实资源未加载）
        this.generatePlaceholderTextures();
        
        AudioManager.getInstance().init(this);
        AudioManager.getInstance().create();
        
        this.scene.start('MenuScene');
    }

    private generatePlaceholderTextures(): void {
        // 生成角色精灵图（4帧奔跑动画）
        this.generateSpriteSheet('nianshou_run', 128, 128, 4, (g, frameWidth, frameHeight, frameIndex) => {
            // 身体（红色圆形）
            g.fillStyle(0xCC0000);
            g.fillCircle(frameWidth / 2, frameHeight / 2 + 10, 40);
            // 眼睛
            g.fillStyle(0xFFFFFF);
            g.fillCircle(frameWidth / 2 - 15, frameHeight / 2 - 5, 8);
            g.fillCircle(frameWidth / 2 + 15, frameHeight / 2 - 5, 8);
            g.fillStyle(0x000000);
            g.fillCircle(frameWidth / 2 - 15, frameHeight / 2 - 5, 4);
            g.fillCircle(frameWidth / 2 + 15, frameHeight / 2 - 5, 4);
            // 腿部动画（简单移动）
            g.fillStyle(0x8B0000);
            const legOffset = Math.sin(frameIndex * Math.PI / 2) * 10;
            g.fillRect(frameWidth / 2 - 20 + legOffset, frameHeight / 2 + 45, 15, 25);
            g.fillRect(frameWidth / 2 + 5 - legOffset, frameHeight / 2 + 45, 15, 25);
        });

        // 跳跃姿势
        this.generateTexture('nianshou_jump', 128, 128, (g, w, h) => {
            g.fillStyle(0xCC0000);
            g.fillCircle(w / 2, h / 2, 40);
            g.fillStyle(0xFFFFFF);
            g.fillCircle(w / 2 - 15, h / 2 - 10, 8);
            g.fillCircle(w / 2 + 15, h / 2 - 10, 8);
            g.fillStyle(0x000000);
            g.fillCircle(w / 2 - 15, h / 2 - 10, 4);
            g.fillCircle(w / 2 + 15, h / 2 - 10, 4);
            // 向上伸展的腿
            g.fillStyle(0x8B0000);
            g.fillRect(w / 2 - 25, h / 2 + 30, 15, 20);
            g.fillRect(w / 2 + 10, h / 2 + 30, 15, 20);
        });

        // 下蹲动画（2帧）
        this.generateSpriteSheet('nianshou_duck', 128, 128, 2, (g, frameWidth, frameHeight, frameIndex) => {
            const squash = frameIndex === 0 ? 0.8 : 1;
            g.fillStyle(0xCC0000);
            g.fillEllipse(frameWidth / 2, frameHeight / 2 + 30, 50 * squash, 35);
            g.fillStyle(0xFFFFFF);
            g.fillCircle(frameWidth / 2 - 12, frameHeight / 2 + 15, 7);
            g.fillCircle(frameWidth / 2 + 12, frameHeight / 2 + 15, 7);
            g.fillStyle(0x000000);
            g.fillCircle(frameWidth / 2 - 12, frameHeight / 2 + 15, 3);
            g.fillCircle(frameWidth / 2 + 12, frameHeight / 2 + 15, 3);
        });

        // 受伤动画（2帧）
        this.generateSpriteSheet('nianshou_hurt', 128, 128, 2, (g, frameWidth, frameHeight, frameIndex) => {
            const blink = frameIndex === 0;
            g.fillStyle(blink ? 0xFF0000 : 0xCC0000);
            g.fillCircle(frameWidth / 2, frameHeight / 2 + 10, 40);
            if (!blink) {
                g.fillStyle(0xFFFFFF);
                g.fillCircle(frameWidth / 2 - 15, frameHeight / 2 - 5, 8);
                g.fillCircle(frameWidth / 2 + 15, frameHeight / 2 - 5, 8);
                g.fillStyle(0x000000);
                g.fillCircle(frameWidth / 2 - 15, frameHeight / 2 - 5, 4);
                g.fillCircle(frameWidth / 2 + 15, frameHeight / 2 - 5, 4);
            }
            // X形眼睛表示受伤
            g.lineStyle(3, 0x000000);
            if (blink) {
                g.moveTo(frameWidth / 2 - 20, frameHeight / 2 - 10);
                g.lineTo(frameWidth / 2 - 10, frameHeight / 2);
                g.moveTo(frameWidth / 2 - 10, frameHeight / 2 - 10);
                g.lineTo(frameWidth / 2 - 20, frameHeight / 2);
                g.moveTo(frameWidth / 2 + 10, frameHeight / 2 - 10);
                g.lineTo(frameWidth / 2 + 20, frameHeight / 2);
                g.moveTo(frameWidth / 2 + 20, frameHeight / 2 - 10);
                g.lineTo(frameWidth / 2 + 10, frameHeight / 2);
            }
        });

        // 爆竹动画（4帧）
        this.generateSpriteSheet('firecracker', 64, 64, 4, (g, frameWidth, frameHeight, frameIndex) => {
            // 红色爆竹主体
            g.fillStyle(0xFF0000);
            g.fillRect(frameWidth / 2 - 12, frameHeight / 2 - 20, 24, 40);
            // 顶部引线
            g.lineStyle(2, 0x8B4513);
            g.beginPath();
            g.moveTo(frameWidth / 2, frameHeight / 2 - 20);
            g.lineTo(frameWidth / 2, frameHeight / 2 - 30);
            g.strokePath();
            // 火花动画
            if (frameIndex > 0) {
                const sparkColors = [0xFFD700, 0xFF8C00, 0xFF4500];
                g.fillStyle(sparkColors[frameIndex - 1]);
                const offset = (frameIndex - 1) * 5;
                g.fillCircle(frameWidth / 2, frameHeight / 2 - 35 - offset, 4 + offset);
            }
            // 金色装饰条
            g.fillStyle(0xFFD700);
            g.fillRect(frameWidth / 2 - 12, frameHeight / 2 - 5, 24, 4);
            g.fillRect(frameWidth / 2 - 12, frameHeight / 2 + 10, 24, 4);
        });

        // 灯笼
        this.generateTexture('lantern', 96, 128, (g, w, h) => {
            // 灯笼主体（金色椭圆）
            g.fillStyle(0xFFD700);
            g.fillEllipse(w / 2, h / 2 + 10, 70, 80);
            // 内部发光效果
            g.fillStyle(0xFFA500);
            g.fillEllipse(w / 2, h / 2 + 10, 50, 60);
            // 顶部悬挂
            g.fillStyle(0x8B4513);
            g.fillRect(w / 2 - 3, 0, 6, 25);
            // 底部流苏
            g.fillStyle(0xFF0000);
            g.fillRect(w / 2 - 2, h / 2 + 50, 4, 25);
        });

        // 福字（铜）
        this.generateTexture('fu_copper', 48, 48, (g, w, h) => {
            g.fillStyle(0xB87333);
            g.fillRect(0, 0, w, h);
            g.lineStyle(2, 0xFFD700);
            g.strokeRect(2, 2, w - 4, h - 4);
            // 绘制简单的"福"字形状（方形代表）
            this.drawCharPlaceholder(g, w / 2, h / 2, 0xFFD700, 24);
        });

        // 福字（银）
        this.generateTexture('fu_silver', 48, 48, (g, w, h) => {
            g.fillStyle(0xC0C0C0);
            g.fillRect(0, 0, w, h);
            g.lineStyle(2, 0xFFFFFF);
            g.strokeRect(2, 2, w - 4, h - 4);
            this.drawCharPlaceholder(g, w / 2, h / 2, 0xFFFFFF, 24);
        });

        // 福字（金）
        this.generateTexture('fu_gold', 48, 48, (g, w, h) => {
            g.fillStyle(0xFFD700);
            g.fillRect(0, 0, w, h);
            g.lineStyle(2, 0xFF8C00);
            g.strokeRect(2, 2, w - 4, h - 4);
            this.drawCharPlaceholder(g, w / 2, h / 2, 0x8B0000, 24);
        });

        // 红包动画（2帧）
        this.generateSpriteSheet('redpacket', 48, 48, 2, (g, frameWidth, frameHeight, frameIndex) => {
            // 红包主体
            g.fillStyle(0xFF0000);
            g.fillRect(4, 8, frameWidth - 8, frameHeight - 16);
            // 金色边框
            g.lineStyle(2, 0xFFD700);
            g.strokeRect(4, 8, frameWidth - 8, frameHeight - 16);
            // 发光效果（第2帧更亮）
            if (frameIndex === 1) {
                g.lineStyle(3, 0xFFFFFF, 0.5);
                g.strokeRect(2, 6, frameWidth - 4, frameHeight - 12);
            }
            // 福字占位
            this.drawCharPlaceholder(g, frameWidth / 2, frameHeight / 2, 0xFFD700, 16);
        });

        // 春字动画（4帧旋转）
        this.generateSpriteSheet('spring_word', 48, 48, 4, (g, frameWidth, frameHeight, frameIndex) => {
            const colors = [0x00AA00, 0x00CC00, 0x00FF00, 0x00CC00];
            g.fillStyle(colors[frameIndex]);
            g.fillRect(0, 0, frameWidth, frameHeight);
            // 春字占位
            const charColors = [0x00FF00, 0x32CD32, 0x7CFC00, 0x00FF00];
            this.drawCharPlaceholder(g, frameWidth / 2, frameHeight / 2, charColors[frameIndex], 20);
        });

        // 背景占位图
        this.generateTexture('bg_sky', 1280, 720, (g, w, h) => {
            // 渐变天空
            for (let i = 0; i < h; i++) {
                const ratio = i / h;
                const r = Math.floor(25 + ratio * 50);
                const gVal = Math.floor(25 + ratio * 100);
                const b = Math.floor(100 + ratio * 156);
                g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
                g.fillRect(0, i, w, 1);
            }
        });

        this.generateTexture('bg_mountains', 1280, 720, (g, w, h) => {
            g.fillStyle(0x2F4F4F);
            // 远山轮廓
            for (let x = 0; x < w; x += 100) {
                const height = 150 + Math.sin(x * 0.01) * 50;
                g.fillTriangle(x, h - 100, x + 50, h - 100 - height, x + 100, h - 100);
            }
        });

        this.generateTexture('bg_buildings', 1280, 720, (g, w, h) => {
            g.fillStyle(0x4A4A4A);
            // 简化的建筑轮廓
            for (let x = 0; x < w; x += 80) {
                const buildingHeight = 100 + Math.random() * 150;
                g.fillRect(x, h - 200 - buildingHeight, 60, buildingHeight);
                // 窗户
                g.fillStyle(0xFFFF00);
                for (let y = h - 200 - buildingHeight + 10; y < h - 200; y += 20) {
                    if (Math.random() > 0.5) {
                        g.fillRect(x + 10, y, 15, 10);
                    }
                    if (Math.random() > 0.5) {
                        g.fillRect(x + 35, y, 15, 10);
                    }
                }
                g.fillStyle(0x4A4A4A);
            }
        });

        this.generateTexture('bg_ground', 1280, 720, (g, w, h) => {
            // 地面
            g.fillStyle(0x654321);
            g.fillRect(0, h - 100, w, 100);
            // 石板路纹理
            g.lineStyle(1, 0x5D4037);
            for (let x = 0; x < w; x += 40) {
                g.strokeRect(x, h - 100, 40, 100);
            }
        });

        // 村庄/城市/宫殿背景使用相同的地面但不同装饰
        ['bg_village', 'bg_city', 'bg_palace'].forEach((key, index) => {
            this.generateTexture(key, 2048, 512, (g, w, h) => {
                // 天空渐变
                for (let i = 0; i < h; i++) {
                    const ratio = i / h;
                    const colors = [
                        { r: 135, g: 206, b: 235 }, // 村庄 - 天蓝
                        { r: 25, g: 25, b: 112 },   // 城市 - 深蓝
                        { r: 139, g: 0, b: 0 },     // 宫殿 - 暗红
                    ][index];
                    const r = Math.floor(colors.r * (1 - ratio * 0.5));
                    const gVal = Math.floor(colors.g * (1 - ratio * 0.5));
                    const b = Math.floor(colors.b * (1 - ratio * 0.3));
                    g.fillStyle(Phaser.Display.Color.GetColor(r, gVal, b));
                    g.fillRect(0, i, w, 1);
                }
                // 地面
                g.fillStyle(0x8B4513);
                g.fillRect(0, h - 50, w, 50);
            });
        });

        // UI 元素
        this.generateTexture('ui_button', 64, 64, (g, w, h) => {
            g.fillStyle(0x8B0000);
            g.fillRect(0, 0, w, h);
            g.lineStyle(2, 0xFFD700);
            g.strokeRect(2, 2, w - 4, h - 4);
        });

        this.generateTexture('health_icon', 32, 32, (g, w, h) => {
            g.fillStyle(0xFF0000);
            // 简化的爱心形状
            g.fillCircle(w / 4, h / 3, w / 5);
            g.fillCircle(3 * w / 4, h / 3, w / 5);
            g.fillTriangle(w / 2, h - 2, 2, h / 3, w - 2, h / 3);
        });
    }

    private generateTexture(key: string, width: number, height: number, 
        drawFn: (g: Phaser.GameObjects.Graphics, w: number, h: number) => void): void {
        if (this.textures.exists(key)) return;
        
        const graphics = this.add.graphics();
        drawFn(graphics, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    private generateSpriteSheet(key: string, frameWidth: number, frameHeight: number, 
        frameCount: number,
        drawFn: (g: Phaser.GameObjects.Graphics, fw: number, fh: number, frameIndex: number) => void): void {
        if (this.textures.exists(key)) return;
        
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
        
        // 手动添加精灵图帧数据
        const texture = this.textures.get(key);
        
        // 删除默认的完整纹理帧
        if (texture.has('__BASE')) {
            texture.remove('__BASE');
        }
        
        // 为每个帧创建帧数据
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
        // 绘制一个代表文字的菱形块
        graphics.fillStyle(color);
        const half = size / 2;
        graphics.fillTriangle(x, y - half, x + half, y, x, y + half);
        graphics.fillTriangle(x, y - half, x - half, y, x, y + half);
        // 添加一个内部小方块增加细节
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(x - size / 6, y - size / 6, size / 3, size / 3);
    }
}
