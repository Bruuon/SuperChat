package com.bruon.userservice.controller;


import com.bruon.common.common.BaseResponse;
import com.bruon.common.common.ResultUtils;
import com.bruon.userservice.model.entity.Session;
import com.bruon.userservice.service.UserSessionService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserSessionController {

    @Resource
    private UserSessionService userSessionService;




    @GetMapping("/get/receivers")
    List<Long> getUserIdBySessionId(@RequestParam("sessionId")  Long sessionId) {
        return userSessionService.getUserIdBySessionId(sessionId);
    }



    @GetMapping("/get/sessions")
    List<Long> getSessionIdsByUserId(@RequestParam("userId")  Long userId) {
        return userSessionService.getSessionIdsByUserId(userId);
    }

    /**
     * 获取当前用户加入的所有会话详情（单聊/群聊/AI），用于前端会话列表和识别 AI 助手会话。
     */
    @GetMapping("/get/mySessions")
    public BaseResponse<List<Session>> getMySessions(@RequestParam("userId") Long userId) {
        return ResultUtils.success(userSessionService.getMySessions(userId));
    }


}
