// 叙事内容数据 - 集中管理所有故事文本
// 便于后续本地化和内容更新

import type { LevelType } from '../types/index.js';

// ==================== 开场故事 ====================
export const OPENING_STORY = {
    title: '年兽的觉醒',
    pages: [
        {
            text: '很久以前，年兽是给大家带来恐惧的怪物。\n每到除夕，它就会下山伤人毁物。\n人们用红色的对联、响亮的爆竹驱赶它。',
            icon: '👹',
        },
        {
            text: '但不知从何时起，年兽厌倦了被驱赶的日子。\n它看到孩子们穿着新衣，看到家家户户\n贴福字、发红包、挂灯笼的欢乐场景...',
            icon: '🧧',
        },
        {
            text: '年兽想："为什么我不能成为\n送福的神兽呢？"\n\n于是它决定改邪归正，踏上送福之旅。',
            icon: '✨',
        },
        {
            text: '帮助年兽躲避不理解它的人们，\n将福气送到千家万户！',
            icon: '🏮',
        },
    ],
} as const;

// ==================== 关卡故事 ====================
export const LEVEL_STORIES: Record<LevelType, LevelStory> = {
    1: {
        title: '乡村送福',
        location: '乡村街道',
        icon: '🏘️',
        theme: '宁静祥和的新春乡村',
        introLines: [
            '春节将至，年兽决定给人类送福。',
            '它从深山出发，首先来到宁静的乡村。',
            '',
            '这里炊烟袅袅，远处烟花绽放，',
            '农家小院的门上贴着红红的福字。',
            '',
            '但村里的人们还不知道年兽已经改邪归正，',
            '孩子们仍然用爆竹驱赶它...',
            '',
            '帮助年兽躲避爆竹，收集福气吧！',
        ],
        culturalNotes: [
            { item: '老槐树', meaning: '乡村的象征，见证岁月的守护者' },
            { item: '门上福字', meaning: '倒贴寓意"福到"，春节必备装饰' },
            { item: '炊烟', meaning: '万家灯火的温暖，团圆的象征' },
        ],
    },
    2: {
        title: '都市传福',
        location: '城市夜景',
        icon: '🌃',
        theme: '繁华热闹的现代都市',
        introLines: [
            '年兽成功通过了乡村，',
            '来到了繁华的城市。',
            '',
            '霓虹闪烁，高楼大厦林立，',
            '商场里张灯结彩，街头有舞狮表演。',
            '',
            '这里的爆竹更加密集，',
            '灯笼也挂得更高...',
            '',
            '小心那些摇摆的灯笼！',
        ],
        culturalNotes: [
            { item: '霓虹灯火', meaning: '现代都市的春节装饰，传统与现代的融合' },
            { item: '舞狮表演', meaning: '南方春节传统，驱邪纳福的吉祥之舞' },
            { item: '商场年货', meaning: '置办年货是春节前的重头戏' },
        ],
    },
 3: {
        title: '皇宫献福',
        location: '皇宫大殿',
        icon: '🏯',
        theme: '庄严神圣的紫禁城',
        introLines: [
            '最后一关！年兽来到了皇宫附近。',
            '红墙金瓦，龙飞凤舞，',
            '皇家庆典正在进行中。',
            '',
            '宫灯高挂，烟花漫天，',
            '皇帝即将举行赐福仪式。',
            '',
            '年兽要向皇帝证明自己已经改邪归正，',
            '坚持到最后，福气就会送达！',
        ],
        culturalNotes: [
            { item: '紫禁城', meaning: '明清皇宫，中国传统建筑的巅峰之作' },
            { item: '宫灯', meaning: '皇家御用灯笼，象征尊贵与吉祥' },
            { item: '皇帝赐福', meaning: '古代最高规格的送福仪式，福泽天下' },
        ],
    },
};

export interface LevelStory {
    title: string;
    location: string;
    icon: string;
    theme: string;
    introLines: string[];
    culturalNotes: CulturalNote[];
}

export interface CulturalNote {
    item: string;
    meaning: string;
}

// ==================== 文化图鉴 ====================
export const CULTURE_CODEX: CultureCodexItem[] = [
    {
        id: 'fu',
        name: '福字',
        icon: '🧧',
        gameItem: 'fu_copper / fu_silver / fu_gold',
        description: '春节最重要的装饰符号',
        culturalBackground: '福字倒贴寓意"福到了"，是中国人过年时必贴的装饰。铜、银、金三种颜色代表不同的福气等级，金色最为珍贵。',
        inGameEffect: '收集获得分数，金福+50分，银福+25分，铜福+10分',
    },
    {
        id: 'redpacket',
        name: '红包',
        icon: '💰',
        gameItem: 'redpacket',
        description: '长辈给晚辈的压岁钱',
        culturalBackground: '红包又称压岁钱，寓意压住邪祟，保佑孩子平安度过一岁。红色象征喜庆和好运。',
        inGameEffect: '收集5个可激活"福气护体"护盾，持续3秒无敌',
    },
    {
        id: 'spring',
        name: '春字',
        icon: '🌸',
        gameItem: 'spring_word',
        description: '春天与生机的象征',
        culturalBackground: '春字代表春天到来，万物复苏。在古代，人们会在立春时贴上"春"字，迎接新春。',
        inGameEffect: '激活飞行模式5秒，可以自由移动并自动收集福字',
    },
    {
        id: 'firecracker',
        name: '爆竹',
        icon: '🧨',
        gameItem: 'firecracker',
        description: '传统驱邪物品',
        culturalBackground: '相传爆竹可以驱赶"年"这个怪兽，保护村庄平安。这也是年兽被人类驱赶的历史原因。',
        inGameEffect: '碰到会受伤，需要跳跃或下蹲躲避',
    },
    {
        id: 'lantern',
        name: '灯笼',
        icon: '🏮',
        gameItem: 'lantern',
        description: '光明与团圆的象征',
        culturalBackground: '元宵节挂灯笼是传统习俗，象征阖家团圆、事业兴旺。红色灯笼更能增添节日喜庆气氛。',
        inGameEffect: '悬挂在空中摆动，需要跳跃才能通过',
    },
];

export interface CultureCodexItem {
    id: string;
    name: string;
    icon: string;
    gameItem: string;
    description: string;
    culturalBackground: string;
    inGameEffect: string;
}

// ==================== 成就故事化 ====================
export const ACHIEVEMENT_STORIES: Record<string, AchievementStory> = {
    fu_master: {
        title: '福气满满',
        story: '年兽的真诚感动了天地，百福降临，鸿运当头！\n人间烟火处，福气正浓时。',
        flavorText: '福如东海长流水',
    },
    packet_saver: {
        title: '红包收藏家',
        story: '压岁钱拿到手软，年兽成为了最受孩子们喜爱的神兽！\n红包鼓鼓，福气满满。',
        flavorText: '财源滚滚来',
    },
    firecracker_proof: {
        title: '爆竹免疫',
        story: '曾经怕爆竹的年兽，如今已经能够从容面对，\n真正完成了从恐惧到勇敢的蜕变。',
        flavorText: '浴火重生，无所畏惧',
    },
    speed_demon: {
        title: '快递高手',
        story: '快如闪电，疾如流星！\n年兽的送福速度堪比顺丰快递！',
        flavorText: '神速送福，使命必达',
    },
    no_damage_1: {
        title: '平安乡村',
        story: '优雅地穿越宁静的乡村，\n没有惊扰一草一木，这便是神兽的风范。',
        flavorText: '出入平安，万事如意',
    },
    no_damage_2: {
        title: '平安都市',
        story: '在繁华都市中游刃有余，\n年兽的身手比 ninja 还要灵活！',
        flavorText: '城市穿行，如履平地',
    },
    spring_flyer: {
        title: '春风得意',
        story: '春字的力量让年兽翱翔天际，\n春风得意马蹄疾，一日看尽长安花！',
        flavorText: '大鹏一日同风起，扶摇直上九万里',
    },
    nianshou_deliverer: {
        title: '金牌快递员',
        story: '恭喜！年兽已正式成为天界认证的\n五星级送福使者，福禄寿喜财五星好评！',
        flavorText: '送福使者，非你莫属',
    },
};

export interface AchievementStory {
    title: string;
    story: string;
    flavorText: string;
}

// ==================== 游戏结束文案 ====================
export const GAME_OVER_TEXTS: GameOverText[] = [
    {
        condition: 'default',
        title: '送福之旅暂时中断',
        message: '年兽累了，让它休息一下吧...',
        encouragement: '但不要放弃，福气还在等待着你！',
        hint: '提示：收集红包可以激活护盾保护自己',
    },
    {
        condition: 'firecracker',
        title: '哎呀！被爆竹吓到了',
        message: '爆竹还是太响了，年兽需要更加小心...',
        encouragement: '失败乃成功之母，继续加油！',
        hint: '提示：看到爆竹可以跳跃躲避，或者下蹲通过',
    },
    {
        condition: 'lantern',
        title: '撞到了灯笼',
        message: '灯笼虽然美丽，但撞上去可不好受...',
        encouragement: '年兽当年也是被一次次驱赶，才学会了灵活躲避！',
        hint: '提示：把握好时机跳跃通过悬挂的灯笼',
    },
];

export interface GameOverText {
    condition: string;
    title: string;
    message: string;
    encouragement: string;
    hint: string;
}

// ==================== 通关结局 ====================
export const VICTORY_STORY = {
    title: '🎉 圆满结局 🎉',
    story: [
        '年兽成功穿越乡村、城市，最终来到皇宫。',
        '皇帝被它的坚持和真诚所感动，',
        '亲自为它戴上象征吉祥的红色绸带。',
        '',
        '从此，年兽不再是被驱赶的怪物，',
        '而是和新春一起到来的福气使者。',
        '',
        '人们开始说："年兽来了，福气到了！"',
    ],
    blessing: '🏮 愿这份福气也能传递给你的新年！🏮',
    quote: '爆竹声中一岁除，春风送暖入屠苏',
} as const;

// ==================== 加载提示 ====================
export const LOADING_TIPS = [
    '💡 福字倒贴寓意"福到了"',
    '💡 红包又称压岁钱，可以保佑平安',
    '💡 爆竹最初是用来驱赶怪兽"年"的',
    '💡 春节贴春联的习俗已有千年历史',
    '💡 元宵节挂灯笼象征团圆美满',
    '💡 舞狮是南方春节的传统表演',
    '💡 年兽最怕红色、火光和巨大的声响',
    '💡 收集5个红包可以激活无敌护盾！',
] as const;
