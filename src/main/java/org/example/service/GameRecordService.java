package org.example.service;

import org.example.dao.GameRecordRepository;
import org.example.entity.GameRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 游戏记录服务类
 */
@Service
public class GameRecordService {
    
    @Autowired
    private GameRecordRepository gameRecordRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * 保存游戏记录
     */
    @Transactional
    public GameRecord saveGameRecord(Long userId, Integer score, Integer powerUpsCollected, 
                                     String difficultyLevel, Integer gameDuration) {
        GameRecord record = new GameRecord();
        record.setUserId(userId);
        record.setScore(score);
        record.setPowerUpsCollected(powerUpsCollected);
        record.setDifficultyLevel(difficultyLevel);
        record.setGameDuration(gameDuration);
        
        GameRecord savedRecord = gameRecordRepository.save(record);
        
        // 更新用户最高分
        userService.updateHighestScore(userId, score);
        
        return savedRecord;
    }
    
    /**
     * 获取用户游戏记录
     */
    public List<GameRecord> getUserRecords(Long userId) {
        return gameRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 获取全局排行榜
     */
    public List<GameRecord> getGlobalLeaderboard() {
        return gameRecordRepository.findTopRecords();
    }
    
    /**
     * 获取用户游戏次数
     */
    public long getUserGameCount(Long userId) {
        return gameRecordRepository.countByUserId(userId);
    }
}

