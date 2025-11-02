package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * FlappyBird Pro - 升级版的FlappyBird游戏
 * 
 * 创新点：
 * 1. 道具系统（护盾、加分倍增器、缩小）
 * 2. 主动技能系统（咖喱棒、时间倒流）
 * 3. 用户登录和游戏记录保存
 * 4. 实时排行榜
 * 5. 多难度模式
 * 6. 成就系统
 */
@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}