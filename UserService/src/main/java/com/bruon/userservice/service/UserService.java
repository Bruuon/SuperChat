package com.bruon.userservice.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.bruon.userservice.model.dto.UserLoginCodeRequest;
import com.bruon.userservice.model.dto.UserLoginPasswordRequest;
import com.bruon.userservice.model.dto.UserRegisterRequest;
import com.bruon.userservice.model.entity.User;
import com.bruon.userservice.model.vo.LoginAndRegisterResponse;
import com.bruon.userservice.model.vo.TokenResponse;


public interface UserService extends IService<User> {

    void sendCaptcha(String targetEmail);


    LoginAndRegisterResponse register(UserRegisterRequest userRegisterRequest);


    LoginAndRegisterResponse loginPassword(UserLoginPasswordRequest userLoginPasswordRequest);



    LoginAndRegisterResponse loginCode(UserLoginCodeRequest userLoginCodeRequest);

    boolean logout(String userId);


    TokenResponse refreshToken(String refreshToken);
}
