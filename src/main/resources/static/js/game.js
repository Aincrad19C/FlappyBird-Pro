// FlappyBird Pro 游戏逻辑

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏状态
let gameState = 'start'; // start, playing, gameOver
let score = 0;
let powerUpsCollected = 0;
let gameStartTime = 0;
let difficultyLevel = 'NORMAL';

// 游戏配置
const config = {
    gravity: 0.5,
    jumpStrength: -9,
    pipeSpeed: 2,
    pipeGap: 200,          // 增大纵向间距（原150 -> 200）
    pipeInterval: 90,     // 增大横向间距（原90 -> 130）
    powerUpChance: 0.25,   // 提高道具出现频率（原0.15 -> 0.35）
};

// 难度配置
const difficulties = {
    EASY: { pipeSpeed: 1.5, pipeGap: 220, gravity: 0.4 },      // 简单模式
    NORMAL: { pipeSpeed: 3, pipeGap: 200, gravity: 0.5 },      // 普通模式（提速）
    HARD: { pipeSpeed: 4, pipeGap: 200, gravity: 0.5 }         // 困难模式（提速+增加重力）
};

// 小鸟对象
const bird = {
    x: 80,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    rotation: 0,
    originalSize: { width: 34, height: 24 }
};

// 管道数组
let pipes = [];
let frameCount = 0;

// 道具系统
let powerUps = [];
let activePowerUp = null;
let powerUpTimeLeft = 0;

const powerUpTypes = [
    { type: 'SHIELD', name: '护盾', color: '#4CAF50', duration: 3 },
    { type: 'SCORE_MULTIPLIER', name: '加分', color: '#FFD700', duration: 5 },
    { type: 'SHRINK', name: '缩小', color: '#9C27B0', duration: 5 }
];

// 主动技能系统
let activeSkills = [];
let excaliburCooldown = 0;
const excaliburCooldownMax = 20; // 20秒冷却时间
const excaliburRange = 400; // 咖喱棒范围

// 时间倒流技能（Re:Zero）
let timeRewindCooldown = 0;
const timeRewindCooldownMax = 25; // 25秒冷却时间
let positionHistory = []; // 记录历史位置
const historyLength = 180; // 记录3秒的历史（60fps * 3秒）
let timeRewindPause = 0; // 时间倒流后的停顿时间

// 初始化游戏
function initGame() {
    // 设置难度
    const selectedDifficulty = difficulties[difficultyLevel];
    config.pipeSpeed = selectedDifficulty.pipeSpeed;
    config.pipeGap = selectedDifficulty.pipeGap;
    config.gravity = selectedDifficulty.gravity;
    
    // 重置游戏状态
    score = 0;
    powerUpsCollected = 0;
    frameCount = 0;
    pipes = [];
    powerUps = [];
    activePowerUp = null;
    powerUpTimeLeft = 0;
    activeSkills = [];
    excaliburCooldown = 0;
    timeRewindCooldown = 0;
    positionHistory = [];
    timeRewindPause = 0;
    
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.width = bird.originalSize.width;
    bird.height = bird.originalSize.height;
    
    updateScoreDisplay();
    hideActivePowerUpDisplay();
    updateExcaliburDisplay();
    updateTimeRewindDisplay();
}

// 小鸟跳跃
function jump() {
    if (gameState === 'playing') {
        bird.velocity = config.jumpStrength;
    }
}

// 创建管道
function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - config.pipeGap - minHeight;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: height,
        bottomY: height + config.pipeGap,
        width: 52,
        scored: false,
        gap: config.pipeGap  // 保存创建时的间隙大小，防止后续被修改影响
    });
    
    // 随机生成道具
    if (Math.random() < config.powerUpChance) {
        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const powerUpY = height + config.pipeGap / 2;
        
        powerUps.push({
            x: canvas.width + 100,
            y: powerUpY,
            width: 30,
            height: 30,
            type: powerUpType.type,
            name: powerUpType.name,
            color: powerUpType.color,
            duration: powerUpType.duration,
            collected: false
        });
    }
}

// 更新游戏状态
function update() {
    if (gameState !== 'playing') return;
    
    // 检查时间倒流停顿
    if (timeRewindPause > 0) {
        timeRewindPause -= 1/60;
        if (timeRewindPause < 0) timeRewindPause = 0;
        return; // 停顿期间不更新任何状态
    }
    
    // 更新小鸟
    bird.velocity += config.gravity;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90);
    
    // 更新管道
    const currentSpeed = config.pipeSpeed;
    
    pipes.forEach(pipe => {
        pipe.x -= currentSpeed;
        
        // 计分
        if (!pipe.scored && pipe.x + pipe.width < bird.x) {
            pipe.scored = true;
            const scoreIncrease = activePowerUp?.type === 'SCORE_MULTIPLIER' ? 2 : 1;
            score += scoreIncrease;
            updateScoreDisplay();
        }
    });
    
    // 移除离开屏幕的管道
    pipes = pipes.filter(pipe => pipe.x + pipe.width > -50);
    
    // 更新道具
    powerUps.forEach(powerUp => {
        powerUp.x -= currentSpeed;
    });
    powerUps = powerUps.filter(powerUp => powerUp.x > -50);
    
    // 生成新管道
    frameCount++;
    if (frameCount % config.pipeInterval === 0) {
        createPipe();
    }
    
    // 更新道具时间
    if (activePowerUp) {
        powerUpTimeLeft -= 1/60;
        if (powerUpTimeLeft <= 0) {
            deactivatePowerUp();
        } else {
            updateActivePowerUpDisplay();
        }
    }
    
    // 记录历史位置（用于时间倒流）
    positionHistory.push({
        y: bird.y,
        velocity: bird.velocity,
        score: score,
        pipes: JSON.parse(JSON.stringify(pipes)),
        powerUps: JSON.parse(JSON.stringify(powerUps))
    });
    if (positionHistory.length > historyLength) {
        positionHistory.shift(); // 只保留最近3秒的历史
    }
    
    // 更新技能冷却
    if (excaliburCooldown > 0) {
        excaliburCooldown -= 1/60;
        if (excaliburCooldown < 0) excaliburCooldown = 0;
        updateExcaliburDisplay();
    }
    
    if (timeRewindCooldown > 0) {
        timeRewindCooldown -= 1/60;
        if (timeRewindCooldown < 0) timeRewindCooldown = 0;
        updateTimeRewindDisplay();
    }
    
    // 更新主动技能特效
    activeSkills = activeSkills.filter(skill => {
        skill.lifetime -= 1/60;
        return skill.lifetime > 0;
    });
    
    // 碰撞检测
    checkCollision();
}

// 碰撞检测
function checkCollision() {
    // 检查地面和天花板
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        if (activePowerUp?.type !== 'SHIELD') {
            gameOver();
        } else {
            bird.y = Math.max(0, Math.min(bird.y, canvas.height - bird.height));
            bird.velocity = 0;
        }
        return;
    }
    
    // 检查管道碰撞
    for (let pipe of pipes) {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                if (activePowerUp?.type !== 'SHIELD') {
                    gameOver();
                    return;
                }
            }
        }
    }
    
    // 检查道具收集
    for (let powerUp of powerUps) {
        if (!powerUp.collected &&
            bird.x + bird.width > powerUp.x && 
            bird.x < powerUp.x + powerUp.width &&
            bird.y + bird.height > powerUp.y - powerUp.height/2 && 
            bird.y < powerUp.y + powerUp.height/2) {
            collectPowerUp(powerUp);
        }
    }
}

// 收集道具
function collectPowerUp(powerUp) {
    powerUp.collected = true;
    powerUpsCollected++;
    document.getElementById('powerUpCount').textContent = powerUpsCollected;
    
    activatePowerUp(powerUp);
}

// 激活道具
function activatePowerUp(powerUp) {
    // 如果有正在使用的道具，先取消
    if (activePowerUp) {
        deactivatePowerUp();
    }
    
    activePowerUp = powerUp;
    powerUpTimeLeft = powerUp.duration;
    
    // 应用道具效果
    switch (powerUp.type) {
        case 'SHRINK':
            bird.width = bird.originalSize.width * 0.6;
            bird.height = bird.originalSize.height * 0.6;
            break;
    }
    
    showActivePowerUpDisplay();
}

// 取消道具效果
function deactivatePowerUp() {
    if (activePowerUp) {
        switch (activePowerUp.type) {
            case 'SHRINK':
                bird.width = bird.originalSize.width;
                bird.height = bird.originalSize.height;
                break;
        }
        activePowerUp = null;
        powerUpTimeLeft = 0;
        hideActivePowerUpDisplay();
    }
}

// 显示激活道具
function showActivePowerUpDisplay() {
    const display = document.getElementById('activePowerUp');
    display.style.display = 'flex';
    updateActivePowerUpDisplay();
}

// 更新激活道具显示
function updateActivePowerUpDisplay() {
    if (!activePowerUp) return;
    document.getElementById('powerUpName').textContent = activePowerUp.name;
    document.getElementById('powerUpTimer').textContent = Math.ceil(powerUpTimeLeft) + 's';
}

// 隐藏激活道具显示
function hideActivePowerUpDisplay() {
    document.getElementById('activePowerUp').style.display = 'none';
}

// 释放咖喱棒技能（誓约胜利之剑 - Excalibur）
function useExcalibur() {
    if (gameState !== 'playing') return;
    if (excaliburCooldown > 0) return;
    
    // 创建技能特效
    activeSkills.push({
        type: 'EXCALIBUR',
        x: bird.x,
        y: bird.y + bird.height / 2,
        lifetime: 0.5,  // 特效持续0.5秒
        maxLifetime: 0.5
    });
    
    // 清除范围内的管道（直接删除）
    const originalLength = pipes.length;
    pipes = pipes.filter(pipe => {
        // 保留技能范围外的管道
        return !(pipe.x > bird.x && pipe.x < bird.x + excaliburRange);
    });
    
    const clearedCount = originalLength - pipes.length;
    
    // 设置冷却时间
    excaliburCooldown = excaliburCooldownMax;
    updateExcaliburDisplay();
    
    // 增加分数奖励（根据清除数量）
    score += 5 + clearedCount * 2;
    updateScoreDisplay();
}

// 更新咖喱棒显示
function updateExcaliburDisplay() {
    const display = document.getElementById('excaliburSkill');
    const cooldownText = document.getElementById('excaliburCooldown');
    
    if (excaliburCooldown > 0) {
        display.classList.add('on-cooldown');
        cooldownText.textContent = Math.ceil(excaliburCooldown) + 's';
    } else {
        display.classList.remove('on-cooldown');
        cooldownText.textContent = '准备就绪';
    }
}

// 释放时间倒流技能（Re:Zero）
function useTimeRewind() {
    if (gameState !== 'playing') return;
    if (timeRewindCooldown > 0) return;
    if (positionHistory.length < 60) return; // 至少需要1秒的历史
    
    // 创建特效
    activeSkills.push({
        type: 'TIME_REWIND',
        lifetime: 1.0,
        maxLifetime: 1.0
    });
    
    // 回到3秒前（或历史记录的起点）
    const rewindIndex = Math.max(0, positionHistory.length - historyLength);
    const pastState = positionHistory[rewindIndex];
    
    if (pastState) {
        bird.y = pastState.y;
        bird.velocity = pastState.velocity;
        score = pastState.score;
        pipes = JSON.parse(JSON.stringify(pastState.pipes));
        powerUps = JSON.parse(JSON.stringify(pastState.powerUps));
        
        updateScoreDisplay();
    }
    
    // 设置冷却时间和停顿时间
    timeRewindCooldown = timeRewindCooldownMax;
    timeRewindPause = 1; // 停顿1秒给用户反应时间
    updateTimeRewindDisplay();
}

// 更新时间倒流显示
function updateTimeRewindDisplay() {
    const display = document.getElementById('timeRewindSkill');
    const cooldownText = document.getElementById('timeRewindCooldown');
    
    if (timeRewindCooldown > 0) {
        display.classList.add('on-cooldown');
        cooldownText.textContent = Math.ceil(timeRewindCooldown) + 's';
    } else {
        display.classList.remove('on-cooldown');
        cooldownText.textContent = '准备就绪';
    }
}

// 绘制游戏
function draw() {
    // 清空画布（马里奥天空蓝）
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制云朵装饰
    drawClouds();
    
    // 绘制管道（马里奥绿色）
    pipes.forEach(pipe => {
        // 上管道
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillStyle = '#2E8B57';
        ctx.fillRect(pipe.x, pipe.topHeight - 20, pipe.width, 20);
        
        // 下管道
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        ctx.fillStyle = '#2E8B57';
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, 20);
    });
    
    // 绘制道具
    powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
            ctx.save();
            ctx.fillStyle = powerUp.color;
            ctx.shadowColor = powerUp.color;
            ctx.shadowBlur = 10;
            
            // 绘制道具（圆形）
            ctx.beginPath();
            ctx.arc(powerUp.x + powerUp.width/2, powerUp.y, powerUp.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制道具符号
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const symbol = powerUp.type === 'SHIELD' ? '🛡' : 
                          powerUp.type === 'SCORE_MULTIPLIER' ? '⭐' : '🔻';
            ctx.fillText(symbol, powerUp.x + powerUp.width/2, powerUp.y);
            
            ctx.restore();
        }
    });
    
    // 绘制小鸟
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    // 护盾效果
    if (activePowerUp?.type === 'SHIELD') {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, bird.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 缩小效果高亮
    if (activePowerUp?.type === 'SHRINK') {
        ctx.shadowColor = '#9C27B0';
        ctx.shadowBlur = 10;
    }
    
    // 绘制小鸟（马里奥红色）
    ctx.fillStyle = '#E52521';
    ctx.fillRect(-bird.width/2, -bird.height/2, bird.width, bird.height);
    
    // 小鸟眼睛
    ctx.fillStyle = 'white';
    ctx.fillRect(bird.width/4 - 2, -bird.height/4 - 2, 6, 6);
    ctx.fillStyle = 'black';
    ctx.fillRect(bird.width/4, -bird.height/4, 3, 3);
    
    // 小鸟嘴巴
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.width/2, -2, 8, 4);
    
    ctx.restore();
    
    // 绘制主动技能特效
    activeSkills.forEach(skill => {
        if (skill.type === 'EXCALIBUR') {
            const alpha = skill.lifetime / skill.maxLifetime;
            const width = excaliburRange * (1 - skill.lifetime / skill.maxLifetime);
            
            // 金色光剑特效
            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            
            // 外层光芒
            const gradient = ctx.createLinearGradient(skill.x, 0, skill.x + excaliburRange, 0);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.5, '#FFA500');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(skill.x, 0, width, canvas.height - 50);
            
            // 剑光效果
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 5;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
            
            // 绘制三道剑光
            for (let i = 0; i < 3; i++) {
                const y = skill.y + (i - 1) * 80;
                ctx.beginPath();
                ctx.moveTo(skill.x, y);
                ctx.lineTo(skill.x + width, y);
                ctx.stroke();
            }
            
            // 绘制剑身轮廓
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.moveTo(skill.x, skill.y);
            ctx.lineTo(skill.x + width, skill.y);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // 时间倒流特效
        if (skill.type === 'TIME_REWIND') {
            const alpha = skill.lifetime / skill.maxLifetime;
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.7;
            
            // 紫色时钟波纹
            for (let i = 0; i < 3; i++) {
                const radius = (1 - skill.lifetime / skill.maxLifetime + i * 0.3) * 300;
                const gradient = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, radius
                );
                gradient.addColorStop(0, 'rgba(138, 43, 226, 0)');
                gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.5)');
                gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 绘制时钟逆转效果
            ctx.strokeStyle = '#8B00FF';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#8B00FF';
            ctx.shadowBlur = 15;
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const clockRadius = 80;
            
            // 时钟圆圈
            ctx.beginPath();
            ctx.arc(centerX, centerY, clockRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 逆时针箭头
            const arrowAngle = -skill.lifetime * Math.PI * 4; // 逆时针旋转
            const arrowX = centerX + Math.cos(arrowAngle) * clockRadius * 0.7;
            const arrowY = centerY + Math.sin(arrowAngle) * clockRadius * 0.7;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(arrowX, arrowY);
            ctx.stroke();
            
            // 箭头
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - Math.cos(arrowAngle - 0.3) * 15,
                arrowY - Math.sin(arrowAngle - 0.3) * 15
            );
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - Math.cos(arrowAngle + 0.3) * 15,
                arrowY - Math.sin(arrowAngle + 0.3) * 15
            );
            ctx.stroke();
            
            ctx.restore();
        }
    });
    
    // 绘制地面（马里奥土褐色）
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

// 绘制云朵
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    const cloudY = [80, 150, 220];
    const cloudX = [(frameCount * 0.3) % (canvas.width + 100), 
                    (frameCount * 0.5 + 200) % (canvas.width + 100),
                    (frameCount * 0.4 + 400) % (canvas.width + 100)];
    
    cloudX.forEach((x, i) => {
        ctx.beginPath();
        ctx.arc(x, cloudY[i], 20, 0, Math.PI * 2);
        ctx.arc(x + 25, cloudY[i], 25, 0, Math.PI * 2);
        ctx.arc(x + 50, cloudY[i], 20, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = score;
}

// 游戏结束
function gameOver() {
    gameState = 'gameOver';
    
    const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
    
    // 显示游戏结束界面
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalPowerUps').textContent = powerUpsCollected;
    document.getElementById('gameDuration').textContent = gameDuration;
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    // 保存游戏记录
    saveGameRecord(score, powerUpsCollected, difficultyLevel, gameDuration);
}

// 保存游戏记录到服务器
function saveGameRecord(score, powerUpsCollected, difficulty, duration) {
    fetch('/api/game/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            score: score,
            powerUpsCollected: powerUpsCollected,
            difficultyLevel: difficulty,
            gameDuration: duration
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 更新最高分显示
            const newHighScore = data.newHighScore;
            document.getElementById('highScore').textContent = newHighScore;
            
            // 检查是否是新纪录
            if (score >= currentHighScore && score > 0) {
                document.getElementById('newHighScore').style.display = 'block';
                currentHighScore = newHighScore;
            }
        }
    })
    .catch(error => {
        console.error('保存游戏记录失败:', error);
    });
}

// 开始游戏
document.getElementById('startBtn').addEventListener('click', function() {
    gameState = 'playing';
    gameStartTime = Date.now();
    initGame();
    document.getElementById('startScreen').style.display = 'none';
});

// 重新开始游戏
document.getElementById('restartBtn').addEventListener('click', function() {
    gameState = 'playing';
    gameStartTime = Date.now();
    initGame();
    document.getElementById('gameOverScreen').style.display = 'none';
});

// 返回选择难度
document.getElementById('backToStartBtn').addEventListener('click', function() {
    gameState = 'start';
    initGame();
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
});

// 难度选择
document.querySelectorAll('.btn-difficulty').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.btn-difficulty').forEach(b => b.classList.remove('btn-selected'));
        this.classList.add('btn-selected');
        difficultyLevel = this.dataset.difficulty;
    });
});

// 点击技能UI释放技能
document.getElementById('excaliburSkill').addEventListener('click', function() {
    useExcalibur();
});

document.getElementById('timeRewindSkill').addEventListener('click', function() {
    useTimeRewind();
});

// 控制事件
canvas.addEventListener('click', jump);
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start') {
            document.getElementById('startBtn').click();
        } else {
            jump();
        }
    }
    
    // E键释放咖喱棒技能
    if (e.code === 'KeyE') {
        e.preventDefault();
        useExcalibur();
    }
    
    // Q键释放时间倒流技能
    if (e.code === 'KeyQ') {
        e.preventDefault();
        useTimeRewind();
    }
});

// 启动游戏循环
gameLoop();

