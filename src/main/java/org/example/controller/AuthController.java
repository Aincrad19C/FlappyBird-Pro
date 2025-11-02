package org.example.controller;

import org.example.entity.User;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;

/**
 * 认证控制器 - 处理登录和注册
 */
@Controller
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 首页 - 重定向到登录页
     */
    @GetMapping("/")
    public String index(HttpSession session) {
        // 如果已登录，直接跳转到游戏页面
        if (session.getAttribute("user") != null) {
            return "redirect:/game";
        }
        return "redirect:/login";
    }
    
    /**
     * 显示登录页面
     */
    @GetMapping("/login")
    public String showLoginPage(HttpSession session) {
        // 如果已登录，直接跳转到游戏页面
        if (session.getAttribute("user") != null) {
            return "redirect:/game";
        }
        return "login";
    }
    
    /**
     * 处理登录请求
     */
    @PostMapping("/login")
    public String login(@RequestParam String username, 
                       @RequestParam String password,
                       HttpSession session,
                       Model model) {
        try {
            User user = userService.login(username, password);
            session.setAttribute("user", user);
            return "redirect:/game";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "login";
        }
    }
    
    /**
     * 显示注册页面
     */
    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
    }
    
    /**
     * 处理注册请求
     */
    @PostMapping("/register")
    public String register(@RequestParam String username,
                          @RequestParam String password,
                          @RequestParam String nickname,
                          Model model) {
        try {
            userService.register(username, password, nickname);
            model.addAttribute("success", "注册成功，请登录！");
            return "login";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }
    
    /**
     * 退出登录
     */
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}

