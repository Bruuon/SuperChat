package com.bruon.userservice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.userservice.model.entity.Session;
import com.bruon.userservice.model.entity.UserSession;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;


public interface UserSessionService extends IService<UserSession> {

    List<Long> getUserIdBySessionId(Long sessionId);

    List<Long> getSessionIdsByUserId(Long userId);

    /**
     * 获取群聊成员数量
     *
     * @param sessionId 会话ID
     * @return 群聊成员数量
     */
    int getGroupMemberCount(Long sessionId);

    /**
     * 获取用户加入的所有会话详情（单聊/群聊/AI），按最近更新时间倒序
     *
     * @param userId 用户ID
     * @return 会话详情列表
     */
    List<Session> getMySessions(Long userId);
}