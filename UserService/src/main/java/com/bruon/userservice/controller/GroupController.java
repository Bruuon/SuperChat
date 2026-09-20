package com.bruon.userservice.controller;

import com.bruon.common.common.BaseResponse;
import com.bruon.common.common.ErrorCode;
import com.bruon.common.common.ResultUtils;
import com.bruon.common.exception.BusinessException;
import com.bruon.userservice.model.dto.request.CreateGroupRequest;
import com.bruon.userservice.model.dto.request.InviteGroupRequest;
import com.bruon.userservice.model.dto.response.CreateGroupResponse;
import com.bruon.userservice.model.dto.response.InviteGroupResponse;
import com.bruon.userservice.service.GroupService;
import com.bruon.userservice.service.SessionService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 群组Controller
 * <p>
 * 功能说明：
 * - 提供群组相关的REST API接口
 * - 包含创建群聊、邀请成员、踢出成员、退出群聊、查询成员等功能
 */
@Slf4j
@RestController
@RequestMapping("api/group")
public class GroupController {

    private final SessionService sessionService;
    private final GroupService groupService;

    public GroupController(SessionService sessionService,
                           GroupService groupService) {
        this.sessionService = sessionService;
        this.groupService = groupService;
    }

    /**
     * 创建群聊
     */
    @PostMapping
    public BaseResponse<?> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        try {
            CreateGroupResponse response = sessionService.createGroup(request);
            return ResultUtils.success(response);
        } catch (BusinessException e) {
            log.error("创建群聊失败，原因：{}", e.getMessage());
            return ResultUtils.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("创建群聊失败，原因：{}", e.getMessage(), e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR);
        }
    }


    /**
     * 群聊邀请接口
     */
    @PostMapping("invite")
    public BaseResponse<?> inviteGroup(@Valid @RequestBody InviteGroupRequest request) {
        try {
            InviteGroupResponse response = groupService.inviteGroup(request);
            return ResultUtils.success(response);
        } catch (BusinessException e) {
            log.error("群聊邀请失败，原因：{}", e.getMessage());
            return ResultUtils.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("群聊邀请失败，原因：{}", e.getMessage(), e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR);
        }
    }

}