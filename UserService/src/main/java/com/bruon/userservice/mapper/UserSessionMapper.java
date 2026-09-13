package com.bruon.userservice.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bruon.userservice.model.entity.UserSession;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserSessionMapper extends BaseMapper<UserSession> {

}