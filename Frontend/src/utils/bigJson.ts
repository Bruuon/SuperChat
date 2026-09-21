// 后端把 userId / sessionId / messageId 这些字段都存成 Java Long（雪花算法生成，
// 19 位数字），远超 JS Number 能精确表示的 2^53。普通 JSON.parse 会把它们悄悄
// 舍入到最近的可表示值（19 位数字这个量级下，误差可以到 ±256），导致前端拿到
// 的 ID 跟后端实际的对不上——请求会打到错误的用户/会话/消息上，且不会报错。
//
// 修法：解析 JSON 前，先把"裸的"超长整数字面量（16 位以上、没被引号包住，
// 只可能是数值型 value，不可能出现在字符串内容里）转成带引号的字符串，
// 这样解析出来的就是精确的十进制字符串而不是被舍入的 number。
// 对应地，types/api.ts 里这些 ID 字段的类型都是 string，不是 number。
// 用零宽的前后查找（而不是捕获组吞掉分隔符），这样像 [id1,id2,id3] 这种连续
// 裸整数数组里相邻的每一个都能各自匹配到——之前用捕获组吞掉逗号的写法，
// 相邻两个大整数之间只有一个逗号可"共用"，会导致隔一个丢一个。
const BIG_INT_PATTERN = /(?<=[:[,]\s*)(-?\d{16,})(?=\s*[,\]}])/g;

export function parseBigJson<T = unknown>(text: string): T {
  if (!text) return text as unknown as T;
  const safe = text.replace(BIG_INT_PATTERN, '"$1"');
  return JSON.parse(safe) as T;
}
