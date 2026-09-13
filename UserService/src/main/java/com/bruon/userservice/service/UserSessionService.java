package com.bruon.userservice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.userservice.model.entity.UserSession;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;


public interface UserSessionService extends IService<UserSession> {

    List<Long> getUserIdBySessionId(Long sessionId);
}