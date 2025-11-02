# FlappyBird Pro - 升级版FlappyBird游戏

这是一个基于SpringBoot + Thymeleaf开发的网页版FlappyBird游戏，作为Java服务端课程期中作业。

## 🎮 游戏特色（创新点）

基于经典FlappyBird游戏，增加了以下创新功能：

1. **道具系统**
   - 🛡️ 护盾：提供3秒无敌保护
   - ⭐ 加分倍增：5秒内得分翻倍
   - 🔻 缩小：小鸟体积缩小5秒，更容易通过管道

2. **主动技能系统**
   - 🗡️ 咖喱棒（按E键）：清除前方所有管道
   - ⏪ 时间倒流（按Q键）：回到3秒前状态

此外还包含用户登录、排行榜、游戏记录保存和成就系统

## 🏗️ 技术架构

### 后端技术
- **SpringBoot 2.7.14** - Web应用框架
- **Spring Data JPA** - 数据持久化
- **H2 Database** - 嵌入式数据库
- **Thymeleaf** - 模板引擎
- **Lombok** - 简化代码

### 前端技术
- **HTML5 Canvas** - 游戏渲染
- **CSS3** - 样式设计（渐变、动画、响应式）
- **JavaScript** - 游戏逻辑
- **Thymeleaf模板** - 服务端渲染

### 代码结构（三层架构）
```
org.example
├── Main.java                    # SpringBoot启动类
├── entity/                      # 实体层
│   ├── User.java               # 用户实体
│   ├── GameRecord.java         # 游戏记录实体
│   └── PowerUpType.java        # 道具类型枚举
├── dao/                        # 数据访问层
│   ├── UserRepository.java     # 用户数据仓库
│   └── GameRecordRepository.java # 游戏记录数据仓库
├── service/                    # 业务逻辑层
│   ├── UserService.java        # 用户服务
│   └── GameRecordService.java  # 游戏记录服务
└── controller/                 # 控制层
    ├── AuthController.java     # 认证控制器
    └── GameController.java     # 游戏控制器
```

## 📋 功能列表

### 已实现功能 ✅
- ✅ 用户注册和登录（10分）
- ✅ 数据库保存用户游戏记录（10分）
- ✅ DAO-Service-Controller三层设计（10分）
- ✅ CSS样式美化（5分）
- ✅ 图片资源（5分）
- ✅ 多页面切换（登录、注册、游戏、排行榜、个人中心）（5分）
- ✅ 游戏创意（道具系统、多难度、成就系统）（50分）
- ✅ 可打包为jar运行（5分）


## 🚀 快速开始

### 编译并打包
```bash
mvn clean package
```

### 运行
```bash
java -jar target/FlappyBirdPro-1.0-SNAPSHOT.jar
```

然后在浏览器中访问：**http://localhost:8080**

## 🎯 游戏玩法

1. **注册/登录**
   - 首次使用需要注册账号
   - 输入用户名、昵称和密码

2. **开始游戏**
   - 选择难度（简单/普通/困难）
   - 点击"开始游戏"
   - 使用鼠标点击或空格键控制小鸟飞行

3. **收集道具**
   - 游戏中会随机出现道具
   - 碰到道具即可激活特殊能力
   - 合理使用道具获得更高分数

4. **查看排行榜**
   - 全球玩家最高分排行
   - 单局游戏记录排行

5. **个人中心**
   - 查看个人统计信息
   - 查看游戏历史记录
   - 解锁成就徽章

## 📊 数据库设计

### users表（用户表）
- id: 主键
- username: 用户名（唯一）
- password: 密码
- nickname: 昵称
- created_at: 创建时间
- total_games: 游戏总次数
- highest_score: 最高分

### game_records表（游戏记录表）
- id: 主键
- user_id: 用户ID（外键）
- score: 分数
- power_ups_collected: 收集道具数
- difficulty_level: 难度等级
- game_duration: 游戏时长（秒）
- created_at: 创建时间

## 🎨 界面展示

- **登录页面**: 渐变背景，现代化卡片设计
- **游戏页面**: Canvas游戏画布，实时信息面板，道具提示
- **排行榜页面**: 标签切换，表格展示，当前用户高亮
- **个人中心**: 统计卡片，游戏记录表，成就系统

## 🔧 配置说明

### application.properties
- 端口配置: `server.port=8080`
- 数据库配置: H2嵌入式数据库，数据保存在`./data/flappybird`
- Thymeleaf配置: 模板缓存关闭（开发模式）

## 🎓 作业要求完成情况

| 功能点 | 子功能要求 | 分数 | 完成情况 |
|--------|-----------|------|---------|
| 游戏创意 | 有与众不同的创新点 | 50 | ✅ 道具系统、多难度、成就系统 |
| 前端技术 | 有CSS样式 | 5 | ✅ 渐变、动画、响应式设计 |
|  | 有图片 | 5 | ✅ SVG图标 |
|  | 有多个页面切换 | 5 | ✅ 5个页面（登录、注册、游戏、排行榜、个人中心） |
| 后端技术 | 有登录功能 | 10 | ✅ 完整的登录注册系统 |
|  | 有数据库保存用户游戏记录 | 10 | ✅ 用户表和游戏记录表 |
|  | 有使用dao-service-controller三层设计 | 10 | ✅ 标准三层架构 |
| 部署 | 能够以单独的jar包运行 | 5 | ✅ Maven打包配置 |
