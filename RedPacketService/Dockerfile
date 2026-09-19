# 运行时用 JRE（更轻量）
FROM eclipse-temurin:17-jre

# 创建非 root 用户（安全最佳实践）
RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

# 创建 Nacos 客户端缓存目录（解决权限问题）
RUN mkdir -p /home/appuser/nacos/naming/public && \
    chown -R appuser:appgroup /home/appuser/nacos

WORKDIR /app

# 设置时区为上海 + 安装 curl（用于健康检查）
ENV TZ=Asia/Shanghai
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# 将 jar 包添加到工作目录（使用 COPY 更明确，重命名为 app.jar）
COPY target/RedPacketService-0.0.1-SNAPSHOT.jar app.jar

# 设置文件权限
RUN chown -R appuser:appgroup /app

# 切换到非 root 用户运行（安全最佳实践）
USER appuser

# 暴露端口
EXPOSE 8103

# /tmp 是 Tomcat/Jetty 默认临时文件目录，挂载 volume 可以提升性能
VOLUME /tmp

# 启动命令
# - 让 compose 传进来的 JAVA_OPTS / SPRING_PROFILES_ACTIVE 生效
# - 增加了 -XX:+HeapDumpOnOutOfMemoryError 等生产环境常用参数（通过 JAVA_OPTS 传入）
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar --spring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}"]