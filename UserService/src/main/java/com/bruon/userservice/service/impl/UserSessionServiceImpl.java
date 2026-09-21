package com.bruon.userservice.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import com.bruon.common.enums.UserSessionStatusEnum;
import com.bruon.userservice.mapper.SessionMapper;
import com.bruon.userservice.mapper.UserSessionMapper;
import com.bruon.userservice.model.entity.Session;
import com.bruon.userservice.model.entity.User;
import com.bruon.userservice.model.entity.UserSession;
import com.bruon.userservice.service.UserSessionService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class UserSessionServiceImpl extends ServiceImpl<UserSessionMapper, UserSession>
    implements UserSessionService {

    @Resource
    private SessionMapper sessionMapper;

    @Override
    public List<Long> getUserIdBySessionId(Long sessionId) {
        QueryWrapper<UserSession> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("session_id", sessionId);
        List<UserSession> userSessions = this.list(queryWrapper);
        return userSessions.stream().map(UserSession::getUserId).collect(Collectors.toList());
    }


    @Override
    public List<Long> getSessionIdsByUserId(Long userId) {
        QueryWrapper<UserSession> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId);
        List<UserSession> userSessions = this.list(queryWrapper);
        return userSessions.stream().map(UserSession::getSessionId).collect(Collectors.toList());
    }

    @Override
    public int getGroupMemberCount(Long sessionId) {
        LambdaQueryWrapper<UserSession> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserSession::getSessionId, sessionId)
                .eq(UserSession::getStatus, UserSessionStatusEnum.NORMAL.getCode());
        return Math.toIntExact(this.count(wrapper));
    }

    @Override
    public List<Session> getMySessions(Long userId) {
        // 不能直接复用 getSessionIdsByUserId：它不过滤 status，会把已退出/被踢的会话也带出来
        LambdaQueryWrapper<UserSession> userSessionWrapper = new LambdaQueryWrapper<>();
        userSessionWrapper.eq(UserSession::getUserId, userId)
                .eq(UserSession::getStatus, UserSessionStatusEnum.NORMAL.getCode());
        List<Long> sessionIds = this.list(userSessionWrapper).stream()
                .map(UserSession::getSessionId)
                .collect(Collectors.toList());
        if (sessionIds.isEmpty()) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<Session> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Session::getSessionId, sessionIds)
                .eq(Session::getStatus, UserSessionStatusEnum.NORMAL.getCode());
        List<Session> sessions = sessionMapper.selectList(wrapper);
        sessions.sort(Comparator.comparing(Session::getUpdatedTime).reversed());
        return sessions;
    }
}