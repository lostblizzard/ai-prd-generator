import { NextRequest, NextResponse } from 'next/server';
import { parseMarkdownToPRD } from '@/lib/markdownParser';

const SYSTEM_PROMPT = `你是一名资深产品经理和技术产品顾问。

用户会输入一个产品想法。请你基于这个想法，生成一份结构化 PRD。

输出必须包含以下 12 个模块，且必须严格使用以下指定的标题格式：

# PRD: [产品名称]
## [产品一句话定位/副标题]

### 1. 产品一句话定位
[详细写明产品的一句话定位与核心价值主张]

### 2. 目标用户
- [目标用户 1 及其特征]
- [目标用户 2 及其特征]
- [目标用户 3 及其特征]

### 3. 用户痛点
- [核心痛点 1]
- [核心痛点 2]
- [核心痛点 3]

### 4. 核心使用场景
- [场景 1 流程与体验]
- [场景 2 流程与体验]
- [场景 3 流程与体验]

### 5. MVP 功能列表
- [MVP 功能 1 描述与基本验收标准]
- [MVP 功能 2 描述与基本验收标准]
- [MVP 功能 3 描述与基本验收标准]

### 6. 非 MVP 功能
- [非 MVP 功能 1 描述，以及暂不实现的原因]
- [非 MVP 功能 2 描述，以及暂不实现的原因]

### 7. 页面结构
- [核心页面结构 1（如看板页面、设置页面）]
- [核心页面结构 2]

### 8. 用户流程
- [核心用户流程 1（如注册/登录流、生成流）]
- [核心用户流程 2]

### 9. 数据结构建议
建议的实体关系（ERD）或数据模型，使用代码块格式提供，例如 SQL 或 JSON Schema：
\`\`\`sql
-- 推荐表结构
\`\`\`
或
\`\`\`json
// 推荐数据模型
\`\`\`

### 10. 技术实现建议
- [技术栈推荐、前端/后端框架选型]
- [技术难点分析与推荐解决方案]

### 11. 上线前检查清单
- [ ] [检查项 1：安全与隐私合规检查]
- [ ] [检查项 2：核心链路集成测试检查]
- [ ] [检查项 3：灰度或监控指标配置]

### 12. 后续迭代路线
- [第 2 阶段（Phase 2）迭代核心规划]
- [第 3 阶段（Phase 3）迭代核心规划]

【要求】
- 结构清晰
- 适合产品经理阅读
- 不要空泛，尽量给出可执行建议
- 必须完全使用简体中文（Simplified Chinese）进行输出
- 严格按照上述指定的「### 数字. 标题名」的结构输出，以便系统能够正确解析并在 UI 中渲染。不要在最外层包裹 \`\`\`markdown 代码块标签，直接输出 Markdown 文本。`;

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Content-Type
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: '请求 Content-Type 错误，应为 application/json' },
        { status: 400 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { prompt } = body;

    // 3. Validate prompt
    if (typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: '输入内容必须为字符串类型' },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return NextResponse.json(
        { success: false, error: '产品想法不能为空' },
        { status: 400 }
      );
    }

    if (trimmedPrompt.length > 2000) {
      return NextResponse.json(
        { success: false, error: '输入内容过长，请精简至 2000 字符以内' },
        { status: 400 }
      );
    }

    // 4. Retrieve API Keys and Configs
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    const model = process.env.ANTHROPIC_MODEL || 'glm-5.1';

    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: '服务器未配置 ANTHROPIC_API_KEY。请在本地项目的 .env.local 文件中配置后重试。' 
        },
        { status: 500 }
      );
    }

    // 5. Call Anthropic Messages API via standard fetch
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: trimmedPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const anthropicErrorMessage = errorData?.error?.message || 'Anthropic API 响应错误';
      return NextResponse.json(
        { success: false, error: `AI 服务响应失败: ${anthropicErrorMessage}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let aiMarkdownText = data?.content?.[0]?.text || '';

    // Remove any accidental markdown code block wrappers from output if they exist
    aiMarkdownText = aiMarkdownText.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '').trim();

    if (!aiMarkdownText) {
      return NextResponse.json(
        { success: false, error: 'AI 未能生成有效的文档内容' },
        { status: 500 }
      );
    }

    // 6. Parse Markdown into structured JSON
    const prd = parseMarkdownToPRD(aiMarkdownText);

    // 7. Return payload containing both formats
    return NextResponse.json({
      success: true,
      data: {
        prd,
        markdown: aiMarkdownText
      }
    });

  } catch (error) {
    // TODO(security): Log detailed error internally and safely
    return NextResponse.json(
      { success: false, error: '服务器内部错误，生成 PRD 失败' },
      { status: 500 }
    );
  }
}
