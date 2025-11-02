package org.example.dao;

import org.example.entity.GameRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 游戏记录数据访问层
 */
@Repository
public interface GameRecordRepository extends JpaRepository<GameRecord, Long> {
    
    /**
     * 根据用户ID查找游戏记录
     */
    List<GameRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * 获取全局最高分排行榜
     */
    @Query("SELECT r FROM GameRecord r ORDER BY r.score DESC")
    List<GameRecord> findTopRecords();
    
    /**
     * 统计用户游戏次数
     */
    long countByUserId(Long userId);
}

