package com.bruon.userservice.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bruon.userservice.model.entity.Session;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SessionMapper extends BaseMapper<Session> {

}