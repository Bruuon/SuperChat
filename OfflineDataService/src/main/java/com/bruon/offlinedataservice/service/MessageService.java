package com.bruon.offlinedataservice.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.common.model.dto.MessageRequest;
import com.bruon.offlinedataservice.model.entity.Message;


public interface MessageService extends IService<Message> {


    void saveMessageToMySQL(MessageRequest messageRequest);
}