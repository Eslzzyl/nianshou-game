import type { ParallaxLayer, LevelConfig, Achievement } from '../types/index.js';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// ==================== 现代春节配色方案 ====================
export const COLORS = {
    // 主色调 - 现代春节红
    RED_PRIMARY: 0xFF1A2C,
    RED_DARK: 0xB91C1C,
    RED_LIGHT: 0xFF6B7A,

    // 金色系 - 渐变亮金
    GOLD_PRIMARY: 0xFFD700,
    GOLD_LIGHT: 0xFFF8DC,
    GOLD_DARK: 0xDAA520,
    GOLD_GRADIENT_START: 0xFFA500,
    GOLD_GRADIENT_END: 0xFFD700,

    // 辅助色
    CORAL: 0xFF6B6B,
    CORAL_LIGHT: 0xFFB4A2,
    SMOKE_BLUE: 0x6B8E9F,
    WARM_WHITE: 0xFFF5F0,

    // 背景色
    BG_DARK: 0x1a0a0a,
    BG_WARM: 0x2d1810,
    BGGradient_START: 0x1a0a0a,
    BG_GRADIENT_END: 0x3d1f18,

    // UI专用
    UI_PANEL: 0x2a1a1a,
    UI_PANEL_BORDER: 0xFFD700,
    UI_TEXT_PRIMARY: 0xFFD700,
    UI_TEXT_SECONDARY: 0xFFFFFF,
    UI_BUTTON_HOVER: 0xFF2D3D,
    UI_DISABLED: 0x666666,

    // 传统色保留
    RED: 0xFF0000,
    GOLD: 0xFFD700,
    SILVER: 0xC0C0C0,
    COPPER: 0xB87333,
    GREEN: 0x00FF00,
    WHITE: 0xFFFFFF,
    BLACK: 0x000000,
} as const;

// 现代春节风格常量
export const STYLE = {
    // 按钮样式
    BUTTON: {
        WIDTH: 280,
        HEIGHT: 65,
        CORNER_RADIUS: 12,
        BORDER_WIDTH: 3,
        GLOW_ALPHA: 0.4,
        SCALE_ON_HOVER: 1.08,
    },

    // 面板样式
    PANEL: {
        CORNER_RADIUS: 16,
        BORDER_WIDTH: 2,
        PADDING: 20,
        SHADOW_ALPHA: 0.3,
        SHADOW_BLUR: 20,
    },

    // 文字样式
    FONT: {
        TITLE_SIZE: '72px',
        BUTTON_SIZE: '28px',
        BODY_SIZE: '20px',
        SMALL_SIZE: '16px',
        FAMILY: 'system-ui, -apple-system, sans-serif',
    },

    // 动画时间
    ANIMATION: {
        BUTTON_HOVER: 150,
        BUTTON_CLICK: 100,
        TRANSITION: 300,
        PARTICLE_FADE: 500,
    },

    // 粒子效果
    PARTICLES: {
        SNOW_COUNT: 50,
        FIREWORK_INTERVAL: 5000,
        GLOW_PULSE_SPEED: 1500,
        FLOAT_AMPLITUDE: 8,
    },
} as const;

export const PLAYER = {
    X: 200,
    Y: 548,  // 玩家中心点，站在地面上（地面顶部580 - 玩家半高32 = 548）
    WIDTH: 64,
    HEIGHT: 64,
    JUMP_VELOCITY: -600,
    GRAVITY: 1000,
    MOVE_SPEED: 300,
    AIR_MOVE_SPEED: 200,
    COYOTE_TIME: 100,
    DUCK_HEIGHT: 32,
    INVINCIBLE_DURATION: 3000,
    FLY_DURATION: 5000,
} as const;

export const SCROLL = {
    ACCELERATION: 5,
    INITIAL_SPEED: 200,
} as const;

export const PARALLAX_LAYERS: ParallaxLayer[] = [
    { key: 'bg_sky', speed: 0.1, y: 0 },
    { key: 'bg_mountains', speed: 0.3, y: 100 },
    { key: 'bg_buildings', speed: 0.6, y: 200 },
    { key: 'bg_ground', speed: 1.0, y: 550 },
];

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        length: 4000,
        baseSpeed: 150,
        maxSpeed: 250,
        bgKey: 'bg_village',
    },
    {
        level: 2,
        length: 6000,
        baseSpeed: 200,
        maxSpeed: 320,
        bgKey: 'bg_city',
    },
    {
        level: 3,
        length: 8000,
        baseSpeed: 250,
        maxSpeed: 400,
        bgKey: 'bg_palace',
        bossPhase: true,
    },
];

export const ITEMS = {
    FU_COPPER: { score: 10, type: 'fu_copper' as const },
    FU_SILVER: { score: 25, type: 'fu_silver' as const },
    FU_GOLD: { score: 50, type: 'fu_gold' as const },
    REDPACKET: { score: 0, type: 'redpacket' as const },
    SPRING_WORD: { score: 0, type: 'spring_word' as const, effect: 'fly' },
} as const;

export const REDPACKET_THRESHOLD = 5;

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'fu_master', name: '福气满满', desc: '累计收集100个福字', target: 100 },
    { id: 'packet_saver', name: '红包收藏家', desc: '单局收集20个红包', target: 20 },
    { id: 'firecracker_proof', name: '爆竹免疫', desc: '无伤通过第三关', target: 1 },
    { id: 'speed_demon', name: '快递高手', desc: '30秒内完成第一关', target: 30 },
    { id: 'no_damage_1', name: '平安乡村', desc: '第一关无伤', target: 1 },
    { id: 'no_damage_2', name: '平安都市', desc: '第二关无伤', target: 1 },
    { id: 'spring_flyer', name: '春风得意', desc: '累计飞行时间60秒', target: 60 },
    { id: 'nianshou_deliverer', name: '金牌快递员', desc: '通关所有关卡', target: 1 },
];
