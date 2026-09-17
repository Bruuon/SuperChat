package com.bruon.userservice.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import com.bruon.userservice.mapper.SessionMapper;
import com.bruon.userservice.model.entity.Session;
import com.bruon.userservice.service.SessionService;
import org.springframework.stereotype.Service;


@Service
public class SessionServiceImpl extends ServiceImpl<SessionMapper, Session>
    implements SessionService {

}