-- SuperChat 数据库结构
--
-- 仓库里原本没有 schema.sql，这份是从本机 MySQL 里已经建好的 `SuperChat` 库
-- 导出结构后整理来的（mysqldump --no-data），并对照各模块的 entity /
-- mapper.xml 核对过字段一致。所有微服务共用这一个库，不按服务拆分 schema。
--
-- 用法：
--   mysql -uroot -p < sql/schema.sql
--   mysql -uroot -p SuperChat < sql/seed.sql   -- 建完表后再灌种子数据

CREATE DATABASE IF NOT EXISTS `SuperChat`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `SuperChat`;

-- ----------------------------
-- 用户表（UserService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` bigint NOT NULL COMMENT '用户ID（雪花算法生成）',
  `phone` char(11) DEFAULT NULL COMMENT '用户手机号',
  `email` varchar(128) NOT NULL COMMENT '用户邮箱',
  `password` varchar(256) NOT NULL COMMENT '用户密码（MD5(salt+明文)，见 UserConstant.PASSWORD_SALT）',
  `nickname` varchar(128) NOT NULL COMMENT '用户昵称',
  `avatar` varchar(512) DEFAULT NULL COMMENT '用户头像url',
  `gender` tinyint(1) NOT NULL DEFAULT '2' COMMENT '性别 0 女 1 男 2 未知',
  `description` text COMMENT '个性签名',
  `state` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 0 正常 1 封禁 2 注销',
  `role` tinyint(1) NOT NULL DEFAULT '0' COMMENT '角色类型 0 普通用户 1 管理员 2 超级管理员',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_delete` tinyint NOT NULL DEFAULT '0' COMMENT '删除标记（0未删 1已删）',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_phone` (`phone`),
  KEY `idx_state` (`state`),
  KEY `idx_role` (`role`),
  KEY `idx_create_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='用户表';

-- ----------------------------
-- 会话表（UserService，单聊/群聊/AI 都是一条 session）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `session` (
  `session_id` bigint NOT NULL COMMENT '会话 ID',
  `name` varchar(255) DEFAULT NULL COMMENT '名称（单聊为空字符串，群聊自动生成）',
  `type` tinyint NOT NULL COMMENT '类别：0 单聊，1 群聊，2 AI',
  `status` tinyint NOT NULL COMMENT '状态：0 正常，1 删除',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `avatar` varchar(512) DEFAULT NULL COMMENT '会话头像',
  PRIMARY KEY (`session_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='会话表';

-- ----------------------------
-- 用户-会话关系表（UserService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_session` (
  `user_id` bigint NOT NULL COMMENT '用户 id',
  `session_id` bigint NOT NULL COMMENT '会话 id',
  `role` tinyint NOT NULL COMMENT '角色：0 群主，1 管理员，2 普通用户',
  `status` tinyint NOT NULL COMMENT '状态：0 正常，1 删除',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`,`session_id`),
  KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='用户会话关系表';

-- ----------------------------
-- 好友关系表（UserService，双向各一行）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `friend` (
  `user_id` bigint NOT NULL COMMENT '用户 ID',
  `friend_id` bigint NOT NULL COMMENT '好友 ID',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '好友状态：0好友，1拉黑，2删除',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`,`friend_id`),
  KEY `idx_friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='好友关系表';

-- ----------------------------
-- 好友申请表（UserService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `apply_friend` (
  `apply_friend_id` bigint NOT NULL COMMENT '申请 ID',
  `sender_id` bigint NOT NULL COMMENT '发送者用户ID',
  `receiver_id` bigint NOT NULL COMMENT '接收者用户ID',
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '请求添加好友' COMMENT '申请信息',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '申请状态：0未读，1通过，2拒绝，3已读，4过期',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`apply_friend_id`),
  UNIQUE KEY `uk_sender_receiver` (`sender_id`,`receiver_id`),
  KEY `idx_sender_status` (`sender_id`,`status`),
  KEY `idx_receiver_status` (`receiver_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='好友申请表';

-- ----------------------------
-- 消息表（OfflineDataService，Canal 监听这张表同步落库）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `message` (
  `message_id` bigint NOT NULL COMMENT '消息 id',
  `sender_id` bigint NOT NULL COMMENT '发送者 id',
  `session_id` bigint NOT NULL COMMENT '会话 id',
  `type` tinyint NOT NULL COMMENT '消息类型: 0 文本消息，1 图片消息，3 红包，4 表情包',
  `content` text NOT NULL COMMENT '消息内容',
  `reply_id` bigint DEFAULT NULL COMMENT '消息引用 id',
  `session_type` tinyint NOT NULL COMMENT '会话类型: 0 单聊，1 群聊',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`message_id`) USING BTREE,
  KEY `idx_session_time` (`session_id`,`created_time`),
  KEY `idx_sender_time` (`sender_id`,`created_time`),
  KEY `idx_reply_id` (`reply_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='消息表';

-- ----------------------------
-- 红包主表（RedPacketService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `red_packet` (
  `red_packet_id` bigint NOT NULL COMMENT '红包 ID',
  `sender_id` bigint NOT NULL COMMENT '发送者用户 ID',
  `session_id` bigint NOT NULL COMMENT '会话 ID（单聊或群聊）',
  `red_packet_wrapper_text` varchar(50) NOT NULL DEFAULT '恭喜发财，大吉大利' COMMENT '红包封面文案',
  `red_packet_type` tinyint NOT NULL COMMENT '红包类型：0 普通红包，1 拼手气红包',
  `total_amount` bigint NOT NULL COMMENT '红包总金额(单位：分)',
  `total_count` int NOT NULL COMMENT '红包总个数',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态：0 未领取完，1 已领取完，2 已过期',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`red_packet_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_sender_id` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='红包主表';

-- ----------------------------
-- 红包领取记录表（RedPacketService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `red_packet_receive` (
  `red_packet_receive_id` bigint NOT NULL COMMENT '记录 ID',
  `red_packet_id` bigint NOT NULL COMMENT '红包 ID',
  `receiver_id` bigint NOT NULL COMMENT '领取者用户 ID',
  `amount` bigint NOT NULL COMMENT '领取金额（单位：分）',
  `received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`red_packet_receive_id`),
  KEY `idx_red_packet_id` (`red_packet_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_red_packet_receiver` (`red_packet_id`,`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='红包领取记录表';

-- ----------------------------
-- 用户余额表（RedPacketService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_balance` (
  `user_id` bigint NOT NULL COMMENT '用户 ID',
  `balance` bigint NOT NULL DEFAULT '0' COMMENT '余额（单位：分）',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='用户余额表';

-- ----------------------------
-- 余额变动记录表（RedPacketService）
-- ----------------------------
CREATE TABLE IF NOT EXISTS `balance_log` (
  `balance_log_id` bigint NOT NULL COMMENT '记录 ID',
  `user_id` bigint NOT NULL COMMENT '用户 ID',
  `amount` bigint NOT NULL COMMENT '变动金额（单位：分），正数为增加，负数为减少',
  `type` tinyint NOT NULL COMMENT '变动类型：0 发送红包，1 领取红包，2 红包退回',
  `related_id` bigint DEFAULT NULL COMMENT '关联 ID，如红包 ID',
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`balance_log_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='余额变动记录表';
