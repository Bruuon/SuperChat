// 与后端 Common.BaseResponse / ErrorCode 完全对应
export interface BaseResponse<T> {
  code: number;
  data: T;
  message: string;
}

export const ErrorCode = {
  SUCCESS: 200,
  PARAMS_ERROR: 40000,
  NOT_LOGIN_ERROR: 40100,
  NO_AUTH_ERROR: 40101,
  TOKEN_MISSING: 40102,
  TOKEN_EXPIRED: 40103,
  TOKEN_INVALID: 40104,
  TOKEN_MISMATCH: 40105,
} as const;

export interface PageRequest {
  pageNum?: number;
  pageSize?: number;
}

export interface PageResponse<T> {
  list: T[];
  total: number;
  pageSize: number;
  pageNum: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ---------- 会话 / 消息类型常量（与 Common 常量类对应） ----------
export const SessionType = {
  SIGNAL: 0, // 单聊
  GROUP: 1, // 群聊
  ROBOT: 2, // AI 机器人
} as const;
export type SessionTypeValue = (typeof SessionType)[keyof typeof SessionType];

export const MessageType = {
  TEXT: 0,
  IMAGE: 1,
  EMOJI: 2,
  RED_PACKET: 3,
} as const;

// ---------- 鉴权 ----------
// 注意：userId / sessionId / messageId 等 ID 字段在这个文件里一律是 string，
// 不是 number——后端用雪花算法生成 19 位 Long，超出 JS Number 精确表示范围，
// 当 number 处理会被静默舍入、指向错误的用户/会话/消息（http.ts 的
// transformResponse 已经把响应里的这些字段解析成精确字符串了，这里的类型要跟上）。
export interface LoginAndRegisterResponse {
  userId: string;
  email: string;
  nickname: string;
  avatar: string | null;
  gender: number | null;
  description: string | null;
  accessToken: string;
  refreshToken: string;
  nettyUri: string | null;
  offlineTime: number | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  nickname?: string;
}

export interface UserLoginPasswordRequest {
  email: string;
  password: string;
}

export interface UserLoginCodeRequest {
  email: string;
  code: string;
}

// ---------- 联系人 ----------
export interface FriendDTO {
  userId: string;
  nickname: string;
  avatar: string | null;
  status: number;
  signature: string | null;
  sessionId: string;
}

export interface FriendDetailVO {
  userId: string;
  nickname: string;
  avatar: string | null;
  email: string;
  phone: string | null;
  signature: string | null;
  gender: number;
  sessionId: string;
  status: number;
}

export interface ApplyFriendDTO {
  /** 对方用户 ID（发送者或接收者，取决于 isReceiver） */
  userId: string;
  nickname: string;
  avatar: string | null;
  msg: string | null;
  /** 0 未读 1 通过 2 拒绝 3 已读 4 过期 */
  status: number;
  time: string;
  /** 0 我是发送者 1 我是接收者 */
  isReceiver: number;
}

export interface AddFriendRequest {
  msg?: string;
}

export interface ModifyFriendApplicationRequest {
  receiveuserIds: string[];
}

export interface ModifyFriendApplicationResponse {
  userId: string;
  sessionId: string;
  sessionType: number;
  sessionName: string;
  avatar: string | null;
}

// ---------- 群组 ----------
export interface CreateGroupRequest {
  creatorId: string;
  memberIds: string[];
}

export interface CreateGroupResponse {
  creatorId: string;
  sessionId: string;
  sessionName: string;
  sessionType: number;
  avatar: string | null;
  failedMemberIds: string[];
}

export interface InviteGroupRequest {
  sessionId: string;
  inviterId: string;
  inviteeIds: string[];
}

export interface InviteGroupResponse {
  successIds: string[];
  failedIds: string[];
}

export interface GroupMemberVO {
  userId: string;
  nickname: string;
  avatar: string | null;
  /** 0 群主，1 管理员，2 普通成员 */
  role: number;
}

// ---------- 会话（UserSessionController /get/mySessions，直接映射后端 Session 实体） ----------
export interface SessionSummary {
  sessionId: string;
  name: string | null;
  /** 0 单聊 1 群聊 2 AI */
  type: number;
  status: number;
  avatar: string | null;
  createdTime: string;
  updatedTime: string;
}

// ---------- 头像上传 ----------
export interface UploadUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
}

export interface UpdateAvatarRequest {
  uri: string;
  userId: string;
}

// ---------- 消息 ----------
export interface MessageBody {
  content?: string;
  replyId?: string | null;
  redPacketId?: string | null;
  redPacketWrapperText?: string | null;
}

export interface MessageRequest {
  sessionId: string;
  receiverId?: string | null;
  senderId?: string;
  type: number;
  sessionType: number;
  createdTime?: string;
  messageId?: string;
  body: MessageBody;
  clientMessageId?: string;
}

export interface MessageResponse {
  sessionId: string;
  senderId: string;
  type: number;
  sessionType: number;
  createdTime: string;
  messageId: string;
  clientMessageId?: string;
  nickname?: string;
  avatar?: string;
  role?: number;
  body: MessageBody;
}

export interface OfflineMessageRequest {
  userId: string;
  offlineTime: number;
}

export interface HistoryMessageRequest {
  sessionId: string;
  beforeTime: number;
  limit?: number;
}

// ---------- 红包 ----------
export interface RedPacketBody {
  redPacketType: number; // 0 普通，1 拼手气
  totalAmount: number;
  totalCount: number;
  redPacketWrapperText?: string;
}

export interface RedPacketSendRequest {
  sessionId: string;
  receiverId?: string | null;
  senderId: string;
  type: number;
  sessionType: number;
  body: RedPacketBody;
  clientMessageId?: string;
}

export interface RedPacketSendVO {
  redPacketId: string;
  messageId: string;
}

export interface RedPacketReceiveRequest {
  userId: string;
  redPacketId: string;
}

export interface ReceiveResultVO {
  status: number; // 0 成功 1 已抢完 2 已领取过 等
  amount: number | null;
  message?: string;
}

export interface RedPacketBasicVO {
  redPacketId: string;
  senderId: string;
  senderNickname?: string;
  totalAmount: number;
  totalCount: number;
  receivedCount: number;
  status: number;
  redPacketWrapperText?: string;
}

export interface RedPacketReceiveVO {
  userId: string;
  nickname?: string;
  avatar?: string;
  amount: number;
  receivedTime: string;
}

export interface RedPacketDetailVO extends RedPacketBasicVO {
  receiveList: RedPacketReceiveVO[];
}
