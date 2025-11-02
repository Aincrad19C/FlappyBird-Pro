package org.example.controller;

import org.example.entity.GameRecord;
import org.example.entity.User;
import org.example.service.GameRecordService;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 游戏控制器 - 处理游戏相关请求
 */
@Controller
public class GameController {
    
    @Autowired
    private GameRecordService gameRecordService;
    
    @Autowired
    private UserService userService;
    
    /**
     * 游戏主页
     */
    @GetMapping("/game")
    public String showGamePage(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        // 刷新用户信息（获取最新的分数）
        user = userService.getUserById(user.getId());
        session.setAttribute("user", user);
        
        model.addAttribute("user", user);
        return "game";
    }
    
    /**
     * 保存游戏记录（AJAX请求）
     */
    @PostMapping("/api/game/save")
    @ResponseBody
    public Map<String, Object> saveGameRecord(@RequestBody Map<String, Object> data,
                                               HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                result.put("success", false);
                result.put("message", "用户未登录");
                return result;
            }
            
            Integer score = (Integer) data.get("score");
            Integer powerUpsCollected = (Integer) data.get("powerUpsCollected");
            String difficultyLevel = (String) data.get("difficultyLevel");
            Integer gameDuration = (Integer) data.get("gameDuration");
            
            GameRecord record = gameRecordService.saveGameRecord(
                user.getId(), score, powerUpsCollected, difficultyLevel, gameDuration
            );
            
            // 更新session中的用户信息
            user = userService.getUserById(user.getId());
            session.setAttribute("user", user);
            
            result.put("success", true);
            result.put("record", record);
            result.put("newHighScore", user.getHighestScore());
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 排行榜页面
     */
    @GetMapping("/leaderboard")
    public String showLeaderboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        List<User> topPlayers = userService.getLeaderboard();
        List<GameRecord> topRecords = gameRecordService.getGlobalLeaderboard();
        
        model.addAttribute("user", user);
        model.addAttribute("topPlayers", topPlayers);
        model.addAttribute("topRecords", topRecords);
        
        return "leaderboard";
    }
    
    /**
     * 个人记录页面
     */
    @GetMapping("/profile")
    public String showProfile(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        // 刷新用户信息
        user = userService.getUserById(user.getId());
        session.setAttribute("user", user);
        
        List<GameRecord> userRecords = gameRecordService.getUserRecords(user.getId());
        long gameCount = gameRecordService.getUserGameCount(user.getId());
        
        model.addAttribute("user", user);
        model.addAttribute("userRecords", userRecords);
        model.addAttribute("gameCount", gameCount);
        
        return "profile";
    }
}

