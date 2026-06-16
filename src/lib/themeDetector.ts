/**
 * Simple keyword-based keyword classifier to categorize product prompts into themes.
 * Supports both English and Chinese keywords.
 */
export function detectTheme(text: string): string {
  const normalized = text.toLowerCase();

  const rules = [
    {
      theme: "健身与运动",
      keywords: ["健身", "运动", "训练", "跑步", "肌肉", "饮食", "卡路里", "fitness", "workout", "gym", "run", "sport", "diet", "macros", "exercise"]
    },
    {
      theme: "电商与分销",
      keywords: ["电商", "分销", "商城", "裂变", "购买", "支付", "优惠券", "折扣", "网店", "shopify", "shop", "store", "ecommerce", "referral", "coupon", "checkout", "loyalty"]
    },
    {
      theme: "协同与办公",
      keywords: ["会议", "协作", "办公", "协同", "看板", "任务", "日程", "日历", "meeting", "zoom", "slack", "notion", "jira", "collaboration", "workspace", "sprint", "kanban", "trello", "project"]
    },
    {
      theme: "社交与社区",
      keywords: ["社交", "社区", "群聊", "朋友圈", "发帖", "关注", "聊天", "留言", "social", "chat", "community", "forum", "group", "profile", "friend"]
    },
    {
      theme: "医疗与健康",
      keywords: ["医疗", "健康", "医生", "挂号", "问诊", "药", "心理", "medical", "health", "clinic", "doctor", "therapy", "patient", "medicine"]
    },
    {
      theme: "金融与理财",
      keywords: ["金融", "理财", "记账", "账本", "投资", "炒股", "基金", "钱包", "finance", "budget", "wallet", "stock", "portfolio", "bank", "pay"]
    },
    {
      theme: "教育与学习",
      keywords: ["教育", "学习", "课程", "网课", "备考", "背单词", "学校", "education", "learn", "course", "school", "vocab", "study", "class"]
    },
    {
      theme: "游戏与娱乐",
      keywords: ["游戏", "动漫", "音乐", "视频", "电影", "听歌", "看剧", "game", "music", "video", "movie", "anime", "play", "entertainment"]
    },
    {
      theme: "AI与智能工具",
      keywords: ["ai", "智能", "大模型", "生成", "摘要", "转写", "翻译", "剪辑", "gpt", "llm", "helper", "copilot", "generator", "summarize", "transcribe", "translate", "automation"]
    }
  ];

  for (const rule of rules) {
    const matched = rule.keywords.some(keyword => normalized.includes(keyword));
    if (matched) {
      return rule.theme;
    }
  }

  return "其他";
}
