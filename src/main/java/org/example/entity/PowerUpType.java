package org.example.entity;

/**
 * 道具类型枚举
 */
public enum PowerUpType {
    SHIELD("护盾", "提供3秒无敌保护"),
    SCORE_MULTIPLIER("加分倍增", "5秒内得分翻倍"),
    SHRINK("缩小", "小鸟体积缩小5秒，更容易通过管道");
    
    private final String name;
    private final String description;
    
    PowerUpType(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    public String getName() {
        return name;
    }
    
    public String getDescription() {
        return description;
    }
}

