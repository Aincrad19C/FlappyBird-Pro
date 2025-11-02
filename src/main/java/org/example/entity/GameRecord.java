package org.example.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 游戏记录实体类
 */
@Entity
@Table(name = "game_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private Integer score;
    
    @Column(name = "power_ups_collected")
    private Integer powerUpsCollected = 0;
    
    @Column(name = "difficulty_level")
    private String difficultyLevel = "NORMAL";
    
    @Column(name = "game_duration")
    private Integer gameDuration; // 游戏时长（秒）
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

