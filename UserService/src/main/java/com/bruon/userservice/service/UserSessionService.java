package com.bruon.userservice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.userservice.model.entity.UserSession;

import java.util.List;


public interface UserSessionService extends IService<UserSession> {

    List<Long> getUserIdBySessionId(Long sessionId);

    List<Long> getSessionIdsByUserId(Long userId);
}