package com.bruon.offlinedataservice.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.common.model.dto.MessageRequest;
import com.bruon.common.model.vo.MessageResponse;
import com.bruon.offlinedataservice.model.dto.HistoryMessageRequest;
import com.bruon.offlinedataservice.model.dto.OfflineMessageRequest;
import com.bruon.offlinedataservice.model.entity.Message;

import java.util.List;
import java.util.Map;


public interface MessageService extends IService<Message> {


    void saveMessageToMySQL(MessageRequest messageRequest);


    Map<Long, List<MessageResponse>> getOfflineMessages(OfflineMessageRequest request);


    List<MessageResponse> getHistoryMessages(HistoryMessageRequest request);
}