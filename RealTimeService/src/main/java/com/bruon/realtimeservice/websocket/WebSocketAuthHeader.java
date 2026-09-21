package com.bruon.realtimeservice.websocket;


import com.bruon.common.constant.CommonConstant;
import com.bruon.common.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.QueryStringDecoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.List;


@Slf4j
@RequiredArgsConstructor
public class WebSocketAuthHeader extends ChannelInboundHandlerAdapter {

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg)  {
        if (msg instanceof FullHttpRequest request){
            // 浏览器原生 WebSocket API 无法自定义握手请求头，
            // 所以除了 Authorization 头，也兼容从查询参数 ?token= 读取
            String authHeader = request.headers().get("Authorization");
            QueryStringDecoder decoder = new QueryStringDecoder(request.uri());
            if (authHeader == null || authHeader.isEmpty()) {
                List<String> tokenParams = decoder.parameters().get("token");
                if (tokenParams != null && !tokenParams.isEmpty()) {
                    authHeader = tokenParams.get(0);
                }
            }
            // WebSocketServerProtocolHandler 按精确路径匹配握手 URI，
            // 握手请求带上了查询参数就匹配不到，这里转发前把它裁掉
            request.setUri(decoder.path());
            if (authHeader == null || authHeader.isEmpty()) {
                ctx.close();
                return;
            }
            try {
                Claims claims = JwtUtil.parse(authHeader);
                if (claims == null) {
                    ctx.close();
                    return;
                }

                String userId = claims.getSubject();
                if (userId == null || userId.isEmpty()) {
                    ctx.close();
                    return;
                }

                String storedToken = stringRedisTemplate.opsForValue().get(CommonConstant.ACCESS_TOKEN_PREFIX + userId);
                if (StringUtils.isEmpty(storedToken) || !authHeader.equals(storedToken)) {
                    ctx.close();
                    return;
                }

                // 3. 绑定用户与 channel
                ChannelManager.addUserChannel(userId, ctx.channel());
                ChannelManager.addChannelUser(userId, ctx.channel());

                ctx.fireChannelRead(msg);
            } catch (Exception e) {
                // 记录日志
                ctx.close();
            }

        } else {
            ctx.fireChannelRead(msg);
        }
    }
}