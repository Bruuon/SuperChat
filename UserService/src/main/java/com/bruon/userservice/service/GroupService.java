package com.bruon.userservice.service;

import com.bruon.userservice.model.dto.request.InviteGroupRequest;
import com.bruon.userservice.model.dto.response.InviteGroupResponse;
import com.bruon.userservice.model.vo.GroupMemberVO;

import java.util.List;

/**
 * 群组服务接口
 *
 * 功能说明：
 * - 处理群组邀请、成员查询、踢人、退群相关业务
 */
public interface GroupService {

    /**
     * 邀请用户加入群聊
     *
     * 处理流程：
     * 1. 验证会话存在且为群聊类型
     * 2. 验证邀请者权限（必须是群主或管理员）
     * 3. 验证被邀请者都是邀请者的好友
     * 4. 检查被邀请者是否已在群中
     * 5. 创建UserSession记录
     * 6. 发送Kafka通知
     *
     * @param request 邀请请求参数
     * @return 邀请结果（成功列表、失败列表）
     */
    InviteGroupResponse inviteGroup(InviteGroupRequest request);

    /**
     * 查询群成员列表（群主排在最前）
     *
     * @param sessionId 群聊会话ID
     * @return 成员列表
     */
    List<GroupMemberVO> getMembers(Long sessionId);

    /**
     * 踢出群成员，仅群主/管理员可操作，且不能踢群主
     *
     * @param sessionId  群聊会话ID
     * @param operatorId 操作人ID
     * @param targetId   被踢用户ID
     */
    void kickMember(Long sessionId, Long operatorId, Long targetId);

    /**
     * 主动退群
     *
     * @param sessionId 群聊会话ID
     * @param userId    退群用户ID
     */
    void leaveGroup(Long sessionId, Long userId);
}