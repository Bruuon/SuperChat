# 运行时用 JRE（更轻量）
FROM eclipse-temurin:17-jre

# 1. 创建固定 UID(1001) 的非 root 用户，并用 -m 建 home 目录（Nacos 客户端缓存要用）
RUN groupadd -g 1001 appgroup && \
    useradd -r -u 1001 -g appgroup -m appuser

WORKDIR /app

# 2. 时区设为上海 + 安装 curl（健康检查用）
ENV TZ=Asia/Shanghai
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# 3. 复制 jar（AiService）
COPY target/AiService-0.0.1-SNAPSHOT.jar app.jar

# 4. 复制初始文档到镜像内的备份目录（首次启动用它来"播种" /data/docs）
#    ⚠️ AiService 模块下必须真的存在 src/main/resources/docs/ 目录，否则构建会直接报错
COPY src/main/resources/docs/ /init-docs/

# 5. 创建运行时目录：RAG 文档目录 + Nacos 客户端缓存目录
RUN mkdir -p /data/docs && \
    mkdir -p /home/appuser/nacos/naming/public

# 6. 把相关目录权限统一归给 appuser
RUN chown -R appuser:appgroup /app /init-docs /data /home/appuser

USER appuser

EXPOSE 8105

# /tmp 是 Tomcat 默认临时目录
VOLUME /tmp

# 7. 启动脚本：
#    - 打印当前用户便于排错
#    - cp -n 把初始文档播种进 /data/docs（已存在的不覆盖，保护挂载卷里的数据）
#    - || true 保证即使没有初始文档也不影响启动
#    - exec 让 java 成为 1 号进程，能正确接收 docker stop 信号
#    - 透传 JAVA_OPTS 和 SPRING_PROFILES_ACTIVE（默认 prod）
ENTRYPOINT ["sh", "-c", "echo 'Current User:' $(whoami); cp -rn /init-docs/. /data/docs/ || true; ls -l /data/docs/; exec java $JAVA_OPTS -jar /app/app.jar --spring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}"]