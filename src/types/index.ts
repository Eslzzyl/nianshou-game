export type PlayerState =
    | 'IDLE'
    | 'RUNNING'
    | 'JUMPING'
    | 'FALLING'
    | 'DUCKING'
    | 'HURT'
    | 'INVINCIBLE'
    | 'FLYING';

export type LevelType = 1 | 2 | 3;

export interface GameData {
    score: number;
    lives: number;
    redPackets: number;
    level: LevelType;
    distance: number;
    isInvincible: boolean;
    invincibleTime: number;
    isFlying: boolean;
    flyTime: number;
}

export interface Achievement {
    id: string;
    name: string;
    desc: string;
    target: number;
    current?: number;
    unlocked?: boolean;
}

export interface LevelConfig {
    level: LevelType;
    length: number;
    baseSpeed: number;
    maxSpeed: number;
    bgKey: string;
    bossPhase?: boolean;
}

export interface ParallaxLayer {
    key: string;
    speed: number;
    y: number;
}

export interface SaveData {
    highScore: number;
    achievements: Record<string, number>;
    totalFuCollected: number;
    totalRedPackets: number;
    totalFlyTime: number;
    levelsUnlocked: boolean[];
}

export type ObstacleType = 'firecracker' | 'lantern';
export type ItemType = 'fu_copper' | 'fu_silver' | 'fu_gold' | 'redpacket' | 'spring_word';

export interface FirecrackerConfig {
    type: 'ground' | 'air';
    movePattern: 'static' | 'bounce';
    damage: number;
    warningTime: number;
}

export interface LanternConfig {
    height: 'low' | 'mid' | 'high';
    swingAmplitude: number;
    swingSpeed: number;
}

export interface ItemConfig {
    type: ItemType;
    score: number;
    effect?: string;
}
