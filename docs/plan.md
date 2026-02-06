# 🎮 年兽送福 - 详细游戏设计文档

## 1. 技术架构

### 1.1 技术栈
| 层级 | 技术选择 | 说明 |
|------|----------|------|
| 游戏引擎 | **Phaser 3** | 成熟的 2D 游戏框架，支持 WebGL/Canvas |
| 构建工具 | Vite | 快速热更新，现代化开发体验 |
| 语言 | TypeScript | 类型安全，更好的 IDE 支持 |
| 资源格式 | PNG/SVG + MP3/WAV | 精灵图 + 音效 |

### 1.2 项目结构
```
nianshou-game/
├── public/
│   ├── assets/
│   │   ├── images/          # 精灵图、背景、UI
│   │   │   ├── characters/  # 年兽动画帧
│   │   │   ├── obstacles/   # 爆竹、灯笼
│   │   │   ├── items/       # 福字、红包
│   │   │   ├── backgrounds/ # 三层视差背景
│   │   │   └── ui/          # 按钮、血条、分数板
│   │   ├── audio/           # 音效和背景音乐
│   │   └── atlas/           # 纹理图集 (Texture Atlas)
│   └── fonts/               # 中文字体（裁剪子集）
├── src/
│   ├── main.ts              # 游戏入口
│   ├── config.ts            # Phaser 配置
│   ├── scenes/              # 游戏场景
│   │   ├── BootScene.ts     # 资源预加载
│   │   ├── MenuScene.ts     # 主菜单
│   │   ├── StoryScene.ts    # 剧情过场
│   │   ├── GameScene.ts     # 核心游戏
│   │   ├── BossScene.ts     # BOSS战
│   │   ├── PauseScene.ts    # 暂停界面
│   │   ├── GameOverScene.ts # 游戏结束
│   │   └── VictoryScene.ts  # 通关庆祝
│   ├── objects/             # 游戏对象类
│   │   ├── Player.ts        # 年兽角色
│   │   ├── Obstacle.ts      # 障碍物基类
│   │   ├── Firecracker.ts   # 爆竹
│   │   ├── Lantern.ts       # 灯笼
│   │   ├── Item.ts          # 收集物基类
│   │   ├── FuCharacter.ts   # 福字
│   │   ├── RedPacket.ts     # 红包
│   │   └── SpringWord.ts    # 春字（飞行道具）
│   ├── managers/            # 管理器
│   │   ├── AudioManager.ts  # 音效管理
│   │   ├── InputManager.ts  # 输入控制（键盘+触摸）
│   │   ├── ScoreManager.ts  # 分数系统
│   │   └── SaveManager.ts   # 本地存储
│   ├── ui/                  # UI 组件
│   │   ├── HUD.ts           # 游戏内 HUD
│   │   ├── HealthBar.ts     # 生命值条
│   │   └── VirtualButtons.ts # 虚拟按键（移动端）
│   ├── utils/               # 工具函数
│   │   ├── constants.ts     # 游戏常量
│   │   └── helpers.ts       # 辅助函数
│   └── types/               # TypeScript 类型定义
│       └── index.ts
└── plan.md                  # 本文档
```

---

## 2. 游戏机制详解

### 2.1 核心玩法循环
```typescript
// 游戏主循环伪代码
update(time: number, delta: number) {
    // 1. 场景自动卷轴（恒定速度 + 渐进加速）
    this.background.tilePositionX += this.scrollSpeed * delta;
    
    // 2. 玩家输入处理
    if (jumpPressed && player.isGrounded()) {
        player.jump();
    }
    if (duckPressed && player.isGrounded()) {
        player.duck();
    }
    
    // 3. 障碍物生成（基于距离/时间）
    if (this.shouldSpawnObstacle()) {
        this.spawnObstacle();
    }
    
    // 4. 碰撞检测
    this.physics.overlap(player, obstacles, this.onHit);
    this.physics.overlap(player, items, this.onCollect);
    
    // 5. 难度递增
    this.scrollSpeed += ACCELERATION * delta;
}
```

### 2.2 玩家控制方案

| 平台 | 跳跃 | 下蹲 | 特殊能力 |
|------|------|------|----------|
| 键盘 | ↑ / Space / W | ↓ / S | Enter（激活无敌） |
| 移动端 | 点击左半屏 | 点击右半屏 | 双击任意位置 |

**操作手感参数：**
- 跳跃高度：-450 px/s（模拟重力 1000 px/s²）
- 跳跃缓冲（Coyote Time）：100ms（离开平台后仍可跳跃）
- 下蹲持续时间：按住保持，松开恢复
- 无敌时间：收集5个红包触发，持续3秒

### 2.3 障碍物系统

#### 爆竹（Firecracker）
```typescript
interface FirecrackerConfig {
    type: 'ground' | 'air';        // 地面/空中爆竹
    movePattern: 'static' | 'bounce'; // 静止/弹跳
    damage: 1;                     // 1点伤害
    warningTime: 500;              // 出现前预警时间(ms)
}
```
- **视觉表现**：红色爆竹，点燃时有火星粒子效果
- **行为**：地面爆竹固定位置，空中爆竹可做正弦波移动

#### 灯笼（Lantern）
```typescript
interface LanternConfig {
    height: 'low' | 'mid' | 'high'; // 悬挂高度
    swingAmplitude: number;          // 摆动幅度
    swingSpeed: number;              // 摆动速度
}
```
- **视觉表现**：金色灯笼，随风轻微摆动
- **行为**：需要跳跃通过，可与爆竹组合形成"高低配"

### 2.4 收集物系统

| 物品 | 外观 | 效果 | 出现频率 |
|------|------|------|----------|
| 福字（铜） | 铜色福字 | +10 分 | 常见 |
| 福字（银） | 银色福字 | +25 分 | 中等 |
| 福字（金） | 金色福字 | +50 分 | 稀有 |
| 红包 | 红色信封 | +1 红包计数 | 中等 |
| 春字 | 绿色春字 | 激活飞行模式 5秒 | 稀有 |

**红包充能系统：**
- 收集 5 个红包 → 能量槽满
- 按 Enter / 双击屏幕 → 激活"福气护体"（无敌状态）
- 无敌期间碰撞障碍物会摧毁它们，获得额外分数

**春字飞行模式：**
- 年兽背后长出临时翅膀
- 可无视所有地面和空中障碍
- 自动收集路径上的所有福字

---

## 3. 场景设计

### 3.1 视差滚动背景（Parallax）

每层以不同速度移动，创造深度感：

```typescript
const PARALLAX_LAYERS = [
    { key: 'bg_sky', speed: 0.1, y: 0 },      // 天空/烟花（最慢）
    { key: 'bg_mountains', speed: 0.3, y: 100 }, // 远山
    { key: 'bg_buildings', speed: 0.6, y: 200 }, // 建筑
    { key: 'bg_ground', speed: 1.0, y: 400 },    // 地面（与玩家同步）
];
```

### 3.2 三关详细设计

#### 🏠 第一关：乡村街道（教学关）
- **长度**：1000米
- **速度**：基础速度 200 px/s，最大 300 px/s
- **背景**：乡村小屋、田野、远处烟花
- **障碍物组合**：
  ```
  简单模式：爆竹(地面) → 福字(跳跃可达) → 灯笼(低)
  中等模式：爆竹(空中弹跳) + 灯笼(低)
  ```
- **教学提示**：
  - 0-200米：提示"按空格跳跃"
  - 200-400米：提示"按下箭头下蹲"
  - 400-600米：提示"收集红包充能"

#### 🌃 第二关：城市夜景（进阶关）
- **长度**：1500米
- **速度**：基础 300 px/s，最大 450 px/s
- **背景**：高楼大厦、霓虹灯、繁忙街道
- **新元素**：
  - 移动灯笼：左右摆动，需要预判
  - 连环爆竹：3-5个连续排列
  - 高低配：空中爆竹 + 地面灯笼组合
- **视觉效果**：夜景灯光闪烁，灯笼发光

#### 🎆 第三关：最终冲刺（BOSS关）
- **长度**：2000米
- **速度**：基础 400 px/s，持续加速至 600 px/s
- **背景**：紫禁城风格 + 漫天烟花
- **BOSS机制 - "爆竹阵"**：
  ```typescript
  class BossPhase {
      phase1: 'random_rain';      // 随机爆竹雨（30秒）
      phase2: 'wave_pattern';      // 波浪式排列（30秒）
      phase3: 'final_burst';       // 密集冲刺（至终点）
  }
  ```
- **通关判定**：到达终点线，显示"福气送达！"

---

## 4. 状态机设计

### 4.1 玩家状态
```typescript
type PlayerState = 
    | 'IDLE'      // 待机（仅菜单）
    | 'RUNNING'   // 奔跑（默认）
    | 'JUMPING'   // 跳跃中
    | 'FALLING'   // 下降中
    | 'DUCKING'   // 下蹲
    | 'HURT'      // 受伤（无敌帧）
    | 'INVINCIBLE'// 无敌状态
    | 'FLYING';   // 飞行模式（春字道具）
```

### 4.2 游戏状态流转
```
[Boot] → [Menu] → [Story] → [Game Level 1] → [Story] → [Game Level 2] → [Story] → [Boss Level] → [Victory]
          ↑        ↓            ↓                ↓            ↓              ↓            ↓
          └────────┴────────────┴────────────────┴────────────┴──────────────┴────────────┘
                                   ↑
                              [Pause]（任意时刻可进入）
                                   ↓
                              [Game Over]
```

---

## 5. UI/UX 设计

### 5.1 游戏内 HUD
```
┌─────────────────────────────────────────┐
│  ❤️❤️❤️      福气值: 1250      🧧 x3    │  <- 顶部：生命、分数、红包
├─────────────────────────────────────────┤
│                                         │
│         [游戏区域]                      │
│                                         │
├─────────────────────────────────────────┤
│  [░░░░░░░░░░] 福气护体（50%）           │  <- 底部：能量槽（移动端隐藏）
└─────────────────────────────────────────┘
```

### 5.2 移动端适配
- **虚拟按键**：
  - 左半屏：跳跃按钮（半透明白色圆形）
  - 右半屏：下蹲按钮（半透明白色圆形）
  - 中央上方：能量激活按钮（满能量时闪烁）
- **安全区域**：避开手机刘海和圆角
- **横屏锁定**：强制横屏游玩

---

## 6. 资源清单

### 6.1 图像资源（建议尺寸）

| 资源名 | 类型 | 尺寸 | 说明 |
|--------|------|------|------|
| nianshou_run | 精灵图 | 128x128 x4帧 | 奔跑动画 |
| nianshou_jump | 精灵图 | 128x128 x1帧 | 跳跃姿势 |
| nianshou_duck | 精灵图 | 128x128 x2帧 | 下蹲/起身 |
| nianshou_hurt | 精灵图 | 128x128 x2帧 | 受伤闪烁 |
| firecracker | 精灵图 | 64x64 x4帧 | 爆竹爆炸动画 |
| lantern | 精灵图 | 96x128 x1帧 | 灯笼（带摆动）|
| fu_copper | 静态图 | 48x48 | 铜福字 |
| fu_silver | 静态图 | 48x48 | 银福字 |
| fu_gold | 静态图 | 48x48 | 金福字 |
| redpacket | 精灵图 | 48x48 x2帧 | 红包发光 |
| spring_word | 精灵图 | 48x48 x4帧 | 春字旋转 |
| bg_village | 背景图 | 2048x512 | 乡村背景（可无缝拼接）|
| bg_city | 背景图 | 2048x512 | 城市背景 |
| bg_palace | 背景图 | 2048x512 | 宫殿背景 |
| ui_button | 九宫格 | 64x64 | 按钮底图 |
| health_icon | 静态图 | 32x32 | 心形图标 |

### 6.2 音效资源

| 音效名 | 触发时机 | 建议时长 |
|--------|----------|----------|
| jump.mp3 | 跳跃 | 0.3s |
| collect_fu.mp3 | 收集福字 | 0.2s（音高随品质升高）|
| collect_packet.mp3 | 收集红包 | 0.4s |
| powerup.mp3 | 激活无敌 | 1.0s |
| hurt.mp3 | 受伤 | 0.5s |
| explosion.mp3 | 碰到爆竹 | 0.6s |
| level_complete.mp3 | 过关 | 2.0s |
| game_over.mp3 | 游戏结束 | 2.0s |
| bgm_chunjie.mp3 | 背景音乐 | 循环，8-bit风格 |

---

## 7. 成就系统（本地存储）

```typescript
const ACHIEVEMENTS = [
    { id: 'fu_master', name: '福气满满', desc: '累计收集100个福字', target: 100 },
    { id: 'packet_saver', name: '红包收藏家', desc: '单局收集20个红包', target: 20 },
    { id: 'firecracker_proof', name: '爆竹免疫', desc: '无伤通过第三关', target: 1 },
    { id: 'speed_demon', name: '快递高手', desc: '30秒内完成第一关', target: 30 },
    { id: 'no_damage_1', name: '平安乡村', desc: '第一关无伤', target: 1 },
    { id: 'no_damage_2', name: '平安都市', desc: '第二关无伤', target: 1 },
    { id: 'spring_flyer', name: '春风得意', desc: '累计飞行时间60秒', target: 60 },
    { id: 'nianshou_deliverer', name: '金牌快递员', desc: '通关所有关卡', target: 1 },
];
```

---

## 8. 开发里程碑

| 阶段 | 内容 | 预估时间 |
|------|------|----------|
| **M1** | 基础框架搭建、资源加载、场景切换 | 1天 |
| **M2** | 玩家控制（跳跃/下蹲）、物理碰撞 | 1天 |
| **M3** | 障碍物生成系统、两种障碍实现 | 1天 |
| **M4** | 收集物系统、分数计算 | 0.5天 |
| **M5** | 三关场景搭建、视差背景 | 1天 |
| **M6** | BOSS战实现、通关判定 | 1天 |
| **M7** | UI系统、菜单、HUD、暂停 | 1天 |
| **M8** | 音效集成、成就系统 | 0.5天 |
| **M9** | 移动端适配、性能优化 | 1天 |
| **M10** | 测试、Bug修复、 polish | 1天 |

**总计：约 9-10 天**（单人全职开发）

---

## 9. Phaser.js 关键技术点

### 9.1 使用的核心功能
- **Arcade Physics**：轻量级物理引擎，适合平台跳跃
- **Tilemaps**：背景无限滚动（使用 `setTilePosition`）
- **Animations**：精灵动画管理
- **Particle Emitters**：爆竹火花、收集特效
- **Timers**：障碍物生成计时器
- **Input**：多输入源管理（键盘 + 触摸）

### 9.2 性能优化策略
- 对象池（Object Pooling）：复用障碍物和收集物对象
- 纹理图集（Texture Atlas）：减少 draw calls
- 相机裁剪：只渲染屏幕内对象
- 音频精灵（Audio Sprites）：合并短音效

---

## 10. 可扩展性考虑

未来可添加的内容：
- **无尽模式**：随机生成障碍，比拼高分
- **皮肤系统**：不同颜色的年兽皮肤
- **更多道具**：磁铁（自动吸附近福字）、护盾等
- **社交功能**：排行榜（接入微信小游戏等）
- **多语言**：支持英文版本