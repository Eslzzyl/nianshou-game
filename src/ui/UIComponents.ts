import type { Scene } from 'phaser';
import { COLORS, STYLE } from '../utils/constants.js';

export class UIComponents {
    /**
     * 创建现代春节风格按钮
     */
    static createModernButton(
        scene: Scene,
        x: number,
        y: number,
        text: string,
        onClick: () => void,
        options?: {
            width?: number;
            height?: number;
            disabled?: boolean;
        }
    ): Phaser.GameObjects.Container {
        const width = options?.width ?? STYLE.BUTTON.WIDTH;
        const height = options?.height ?? STYLE.BUTTON.HEIGHT;
        const isDisabled = options?.disabled ?? false;

        const container = scene.add.container(x, y);

        // 创建圆角矩形背景
        const bg = scene.add.graphics();
        this.drawRoundedButton(bg, width, height, isDisabled ? COLORS.UI_DISABLED : COLORS.RED_PRIMARY);

        // 创建边框
        const border = scene.add.graphics();
        this.drawRoundedBorder(border, width, height, COLORS.GOLD_PRIMARY);

        // 创建文字
        const label = scene.add.text(0, 0, text, {
            fontSize: STYLE.FONT.BUTTON_SIZE,
            color: isDisabled ? '#888888' : '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5);

        // 添加发光效果
        const glow = scene.add.graphics();
        this.drawGlow(glow, width, height);
        glow.setAlpha(0);

        container.add([glow, bg, border, label]);

        if (!isDisabled) {
            // 交互区域
            const hitArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            container.add(hitArea);

            // 悬停效果
            hitArea.on('pointerover', () => {
                bg.clear();
                this.drawRoundedButton(bg, width, height, COLORS.UI_BUTTON_HOVER);
                scene.tweens.add({
                    targets: container,
                    scale: STYLE.BUTTON.SCALE_ON_HOVER,
                    duration: STYLE.ANIMATION.BUTTON_HOVER,
                    ease: 'Back.easeOut',
                });
                glow.setAlpha(STYLE.BUTTON.GLOW_ALPHA);
            });

            hitArea.on('pointerout', () => {
                bg.clear();
                this.drawRoundedButton(bg, width, height, COLORS.RED_PRIMARY);
                scene.tweens.add({
                    targets: container,
                    scale: 1,
                    duration: STYLE.ANIMATION.BUTTON_HOVER,
                    ease: 'Power2',
                });
                glow.setAlpha(0);
            });

            hitArea.on('pointerdown', () => {
                scene.tweens.add({
                    targets: container,
                    scale: 0.95,
                    duration: STYLE.ANIMATION.BUTTON_CLICK,
                    yoyo: true,
                    ease: 'Power2',
                });
                onClick();
            });
        }

        return container;
    }

    /**
     * 创建现代面板
     */
    static createModernPanel(
        scene: Scene,
        x: number,
        y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);

        // 阴影
        const shadow = scene.add.graphics();
        shadow.fillStyle(0x000000, STYLE.PANEL.SHADOW_ALPHA);
        this.drawRoundedRect(
            shadow,
            STYLE.PANEL.SHADOW_BLUR,
            STYLE.PANEL.SHADOW_BLUR,
            width,
            height,
            STYLE.PANEL.CORNER_RADIUS
        );
        shadow.setDepth(-1);

        // 背景
        const bg = scene.add.graphics();
        this.drawRoundedRect(bg, 0, 0, width, height, STYLE.PANEL.CORNER_RADIUS, COLORS.UI_PANEL);

        // 边框
        const border = scene.add.graphics();
        border.lineStyle(STYLE.PANEL.BORDER_WIDTH, COLORS.UI_PANEL_BORDER);
        this.drawRoundedRectStroke(border, 0, 0, width, height, STYLE.PANEL.CORNER_RADIUS);

        container.add([shadow, bg, border]);

        return container;
    }

    /**
     * 创建卷轴风格面板
     */
    static createScrollPanel(
        scene: Scene,
        x: number,
        y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);

        // 主背景
        const bg = scene.add.graphics();
        bg.fillStyle(COLORS.BG_WARM, 0.95);
        bg.fillRect(-width / 2, -height / 2, width, height);

        // 顶部卷轴装饰
        const topScroll = scene.add.graphics();
        topScroll.fillStyle(COLORS.GOLD_DARK, 1);
        topScroll.fillRect(-width / 2 - 10, -height / 2 - 8, width + 20, 16);
        topScroll.fillStyle(COLORS.GOLD_PRIMARY, 1);
        topScroll.fillRect(-width / 2 - 5, -height / 2 - 6, width + 10, 12);

        // 底部卷轴装饰
        const bottomScroll = scene.add.graphics();
        bottomScroll.fillStyle(COLORS.GOLD_DARK, 1);
        bottomScroll.fillRect(-width / 2 - 10, height / 2 - 8, width + 20, 16);
        bottomScroll.fillStyle(COLORS.GOLD_PRIMARY, 1);
        bottomScroll.fillRect(-width / 2 - 5, height / 2 - 6, width + 10, 12);

        // 边框
        const border = scene.add.graphics();
        border.lineStyle(2, COLORS.GOLD_PRIMARY);
        border.strokeRect(-width / 2, -height / 2, width, height);

        container.add([bg, topScroll, bottomScroll, border]);

        return container;
    }

    /**
     * 创建发光文字
     */
    static createGlowText(
        scene: Scene,
        x: number,
        y: number,
        text: string,
        options?: {
            fontSize?: string;
            color?: string;
            glowColor?: number;
        }
    ): Phaser.GameObjects.Text {
        const fontSize = options?.fontSize ?? STYLE.FONT.TITLE_SIZE;
        const color = options?.color ?? '#FFD700';

        // 发光层
        const glow = scene.add.text(x, y, text, {
            fontSize: fontSize,
            color: color,
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5);

        glow.setStroke('#FFD700', 8);
        glow.setAlpha(0.3);

        // 主文字
        const main = scene.add.text(x, y, text, {
            fontSize: fontSize,
            color: color,
            fontStyle: 'bold',
            fontFamily: STYLE.FONT.FAMILY,
        }).setOrigin(0.5);

        main.setStroke('#8B0000', 4);

        // 动画
        scene.tweens.add({
            targets: glow,
            scale: 1.05,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 容器包裹
        const container = scene.add.container(0, 0);
        container.add([glow, main]);

        return main;
    }

    /**
     * 绘制圆角按钮
     */
    private static drawRoundedButton(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        color: number
    ): void {
        const r = STYLE.BUTTON.CORNER_RADIUS;

        // 主背景 - 使用标准圆角矩形
        graphics.fillStyle(color, 1);
        graphics.beginPath();
        graphics.moveTo(-width / 2 + r, -height / 2);
        graphics.lineTo(width / 2 - r, -height / 2);
        graphics.arc(width / 2 - r, -height / 2 + r, r, -Math.PI / 2, 0);
        graphics.lineTo(width / 2, height / 2 - r);
        graphics.arc(width / 2 - r, height / 2 - r, r, 0, Math.PI / 2);
        graphics.lineTo(-width / 2 + r, height / 2);
        graphics.arc(-width / 2 + r, height / 2 - r, r, Math.PI / 2, Math.PI);
        graphics.lineTo(-width / 2, -height / 2 + r);
        graphics.arc(-width / 2 + r, -height / 2 + r, r, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.fillPath();

        // 高光效果
        graphics.fillStyle(0xFFFFFF, 0.1);
        graphics.beginPath();
        graphics.moveTo(-width / 2 + r, -height / 2);
        graphics.lineTo(width / 2 - r, -height / 2);
        graphics.arc(width / 2 - r, -height / 2 + r, r, -Math.PI / 2, 0);
        graphics.lineTo(width / 2, -height / 4);
        graphics.lineTo(-width / 2, -height / 4);
        graphics.lineTo(-width / 2, -height / 2 + r);
        graphics.arc(-width / 2 + r, -height / 2 + r, r, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.fillPath();
    }

    /**
     * 绘制圆角边框
     */
    private static drawRoundedBorder(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        color: number
    ): void {
        const r = STYLE.BUTTON.CORNER_RADIUS;

        graphics.lineStyle(STYLE.BUTTON.BORDER_WIDTH, color);
        graphics.beginPath();
        graphics.moveTo(-width / 2 + r, -height / 2);
        graphics.lineTo(width / 2 - r, -height / 2);
        graphics.arc(width / 2 - r, -height / 2 + r, r, -Math.PI / 2, 0);
        graphics.lineTo(width / 2, height / 2 - r);
        graphics.arc(width / 2 - r, height / 2 - r, r, 0, Math.PI / 2);
        graphics.lineTo(-width / 2 + r, height / 2);
        graphics.arc(-width / 2 + r, height / 2 - r, r, Math.PI / 2, Math.PI);
        graphics.lineTo(-width / 2, -height / 2 + r);
        graphics.arc(-width / 2 + r, -height / 2 + r, r, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.strokePath();
    }

    /**
     * 绘制发光效果
     */
    private static drawGlow(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number
    ): void {
        const r = STYLE.BUTTON.CORNER_RADIUS + 5;
        const w = width + 20;
        const h = height + 20;

        graphics.fillStyle(COLORS.GOLD_PRIMARY, 0.3);
        graphics.beginPath();
        graphics.moveTo(-w / 2 + r, -h / 2);
        graphics.lineTo(w / 2 - r, -h / 2);
        graphics.arc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
        graphics.lineTo(w / 2, h / 2 - r);
        graphics.arc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
        graphics.lineTo(-w / 2 + r, h / 2);
        graphics.arc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
        graphics.lineTo(-w / 2, -h / 2 + r);
        graphics.arc(-w / 2 + r, -h / 2 + r, r, Math.PI, -Math.PI / 2);
        graphics.closePath();
        graphics.fillPath();
    }

    /**
     * 绘制圆角矩形
     */
    private static drawRoundedRect(
        graphics: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        color?: number
    ): void {
        if (color !== undefined) {
            graphics.fillStyle(color, 1);
        }

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

    /**
     * 绘制圆角矩形边框
     */
    private static drawRoundedRectStroke(
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
}
