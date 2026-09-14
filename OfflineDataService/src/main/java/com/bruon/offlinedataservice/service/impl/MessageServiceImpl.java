package com.bruon.offlinedataservice.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import com.bruon.common.common.ErrorCode;
import com.bruon.common.exception.ThrowUtils;
import com.bruon.common.model.dto.MessageRequest;
import com.bruon.offlinedataservice.mapper.MessageMapper;
import com.bruon.offlinedataservice.model.entity.Message;
import com.bruon.offlinedataservice.service.MessageService;

import org.springframework.stereotype.Service;


@Service
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message>
    implements MessageService{


    @Override
    public void saveMessageToMySQL(MessageRequest messageRequest) {
        Message message = new Message();
        BeanUtil.copyProperties(messageRequest, message);
        message.setContent(messageRequest.getBody().getContent());
        message.setReplyId(messageRequest.getBody().getReplyId());
        ThrowUtils.throwIf(!this.save(message), ErrorCode.SYSTEM_ERROR);
    }
}