package com.bruon.userservice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.common.model.vo.UserInfosResponse;
import com.bruon.userservice.model.dto.request.UpdateAvatarRequest;
import com.bruon.userservice.model.dto.request.UserLoginCodeRequest;
import com.bruon.userservice.model.dto.request.UserLoginPasswordRequest;
import com.bruon.userservice.model.dto.request.UserRegisterRequest;
import com.bruon.userservice.model.entity.User;
import com.bruon.userservice.model.vo.LoginAndRegisterResponse;
import com.bruon.userservice.model.vo.TokenResponse;
import com.bruon.userservice.model.vo.UploadUrlResponse;

import java.util.List;
import java.util.Map;


public interface UserService extends IService<User> {

    void sendCaptcha(String targetEmail);


    LoginAndRegisterResponse register(UserRegisterRequest userRegisterRequest);


    LoginAndRegisterResponse loginPassword(UserLoginPasswordRequest userLoginPasswordRequest);



    LoginAndRegisterResponse loginCode(UserLoginCodeRequest userLoginCodeRequest);

    boolean logout(String userId);


    TokenResponse refreshToken(String refreshToken);

    String refreshUri(Long userId);


    UploadUrlResponse uploadUrl(String fileName) ;

    Boolean updateAvatar(UpdateAvatarRequest updateAvatarRequest);

    Map<Long, String> getUserNickName(Long sessionId);

    Map<Long, UserInfosResponse> getUserInfos(List<Long> userIds);
}
