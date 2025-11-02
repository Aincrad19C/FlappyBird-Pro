package org.example.service;

import org.example.dao.UserRepository;
import org.example.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 用户服务类
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * 用户注册
     */
    @Transactional
    public User register(String username, String password, String nickname) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("用户名已存在");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // 实际项目中应该加密密码
        user.setNickname(nickname);
        user.setTotalGames(0);
        user.setHighestScore(0);
        
        return userRepository.save(user);
    }
    
    /**
     * 用户登录
     */
    public User login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (!userOpt.isPresent()) {
            throw new RuntimeException("用户名不存在");
        }
        
        User user = userOpt.get();
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("密码错误");
        }
        
        return user;
    }
    
    /**
     * 根据ID查找用户
     */
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    /**
     * 更新用户最高分
     */
    @Transactional
    public void updateHighestScore(Long userId, Integer score) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            if (score > user.getHighestScore()) {
                user.setHighestScore(score);
            }
            user.setTotalGames(user.getTotalGames() + 1);
            userRepository.save(user);
        }
    }
    
    /**
     * 获取排行榜
     */
    public List<User> getLeaderboard() {
        return userRepository.findTopPlayersByScore();
    }
}

