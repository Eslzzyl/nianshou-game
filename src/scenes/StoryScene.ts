import { Scene } from 'phaser';
import type { LevelType } from '../types/index.js';

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

export class StoryScene extends Scene {
    private level!: LevelType;

    constructor() {
        super({ key: 'StoryScene' });
    }

    init(data: StoryData): void {
        this.level = data.level;
    }

    create(): void {
        this.createBackground();
        this.createStoryText();
        this.createContinueHint();
        
        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
    }

    private createBackground(): void {
        const bgKeys = ['bg_village', 'bg_city', 'bg_palace'];
        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, bgKeys[this.level - 1]);
        bg.setDisplaySize(this.scale.width, this.scale.height);
        bg.setAlpha(0.5);
        
        this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.7
        );
    }

    private createStoryText(): void {
        const texts = STORY_TEXTS[this.level];
        let yOffset = 200;
        
        for (const text of texts) {
            if (text === '') {
                yOffset += 30;
                continue;
            }
            
            const txt = this.add.text(this.scale.width / 2, yOffset, text, {
                fontSize: '28px',
                color: '#FFFFFF',
                align: 'center',
            }).setOrigin(0.5);
            
            txt.setAlpha(0);
            
            this.tweens.add({
                targets: txt,
                alpha: 1,
                duration: 500,
                delay: (yOffset - 200) * 2,
            });
            
            yOffset += 50;
        }
        
        this.add.text(this.scale.width / 2, 100, `第 ${this.level} 关`, {
            fontSize: '48px',
            color: '#FFD700',
            fontStyle: 'bold',
        }).setOrigin(0.5);
    }

    private createContinueHint(): void {
        const hint = this.add.text(this.scale.width / 2, this.scale.height - 100, '点击或按空格键继续', {
            fontSize: '20px',
            color: '#AAAAAA',
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: hint,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
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
