package com.bruon.userservice.controller;


import com.bruon.common.common.BaseResponse;
import com.bruon.common.common.ErrorCode;
import com.bruon.common.common.ResultUtils;
import com.bruon.common.exception.ThrowUtils;
import com.bruon.common.utils.JwtUtil;

import com.bruon.userservice.constant.UserConstant;

import com.bruon.userservice.model.dto.UserLoginCodeRequest;
import com.bruon.userservice.model.dto.UserLoginPasswordRequest;
import com.bruon.userservice.model.dto.UserRegisterRequest;
import com.bruon.userservice.model.vo.LoginAndRegisterResponse;
import com.bruon.userservice.model.vo.TokenResponse;
import com.bruon.userservice.service.UserService;
import io.jsonwebtoken.Claims;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.apache.commons.lang3.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Validated
public class UserController {

    @Resource
    private UserService userService;

    @GetMapping("/sendCaptcha")
    public BaseResponse<String> sendCaptcha(@NotBlank(message = "邮箱不能为空") @Email(message = "邮箱格式不正确")  @RequestParam String targetEmail) {

        userService.sendCaptcha(targetEmail);
        return ResultUtils.success(UserConstant.SEND_EMAIL_SUCCESS);
    }


    @PostMapping("/register")
    public BaseResponse<LoginAndRegisterResponse> register(@Valid @RequestBody UserRegisterRequest userRegisterRequest) {
        return ResultUtils.success(userService.register(userRegisterRequest));
    }


    @PostMapping("/login/password")
    public BaseResponse<LoginAndRegisterResponse> loginPassword(@Valid @RequestBody UserLoginPasswordRequest userLoginPasswordRequest) {
        return ResultUtils.success(userService.loginPassword(userLoginPasswordRequest));
    }


    @PostMapping("/login/code")
    public BaseResponse<LoginAndRegisterResponse> loginCode(@Valid @RequestBody UserLoginCodeRequest userLoginCodeRequest) {
        return ResultUtils.success(userService.loginCode(userLoginCodeRequest));
    }



    @GetMapping("/logout")
    public BaseResponse<Boolean> logout(HttpServletRequest request) {
        String accessToken = request.getHeader("Access-Token");
        Claims claims = JwtUtil.parse(accessToken);
        ThrowUtils.throwIf(claims == null, ErrorCode.NOT_LOGIN_ERROR);
        return ResultUtils.success(userService.logout(claims.getSubject()));
    }


    @PostMapping("/refresh")
    public BaseResponse<TokenResponse> refreshToken(HttpServletRequest request) {
        String refreshToken = request.getHeader("Refresh-Token");
        ThrowUtils.throwIf(StringUtils.isBlank(refreshToken), ErrorCode.PARAMS_ERROR);
        return ResultUtils.success(userService.refreshToken(refreshToken));
    }


}


