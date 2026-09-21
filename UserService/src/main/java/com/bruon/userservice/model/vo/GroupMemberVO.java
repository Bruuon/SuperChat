package com.bruon.userservice.model.vo;

import lombok.Data;

/**
 * 群成员VO
 */
@Data
public class GroupMemberVO {

    private String userId;

    private String nickname;

    private String avatar;

    /**
     * 角色：0 群主，1 管理员，2 普通成员
     */
    private Integer role;
}
