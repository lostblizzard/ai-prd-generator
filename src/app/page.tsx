'use client';

import { useState } from 'react';
import { PRDDocument } from '@/lib/types';
import { track } from '@vercel/analytics';
import { detectTheme } from '@/lib/themeDetector';

// Clickable prompt templates to quickly test the application
const SUGGESTIONS = [
  {
    label: "健身与运动App",
    text: "我想做一个AI驱动的个人健身与运动记录App。目标用户是白领和健身爱好者。核心功能包括通过手机摄像头辅助纠正动作、自动推荐周训练计划、饮食宏量元素拍照识别记录，并且能够根据用户的身体数据和训练反馈动态调整训练强度。"
  },
  {
    label: "电商裂变推广系统",
    text: "为独立站跨境电商做一个Shopify智能分销推广插件。主要功能是帮助商家在客户完成结账、或撰写五星好评的黄金瞬间，自动生成个性化的裂变海报与专属优惠链接，鼓励消费者进行社媒分享。包含完善的自购防作弊监控与积分分销奖励机制。"
  },
  {
    label: "会议纪要与AI摘要",
    text: "开发一个网页版的AI智能会议助手 Summify。可以通过录制 Zoom/Google Meet 会议音频，自动进行说话人分离并高精度转写为文字。核心卖点是AI能够从对话中精准抓取核心决定、待办任务（Action Items）、负责人及截止日期，并一键推送到 Notion 库和 Slack 频道。"
  }
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prd, setPrd] = useState<PRDDocument | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'notion' | 'markdown'>('notion');
  const [copied, setCopied] = useState(false);

  // Character limit validation
  const CHAR_LIMIT = 2000;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('请输入您的产品创意或想法');
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '生成 PRD 失败，请稍后重试');
      }

      setPrd(result.data.prd);
      setMarkdown(result.data.markdown);
      setActiveTab('notion'); // default back to Notion view when loaded

      // Track analytics custom event
      track('generate_prd_click', {
        input_length: trimmed.length,
        detected_theme: detectTheme(trimmed)
      });
    } catch (err: any) {
      setError(err.message || '网络连接出错，请检查后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('复制到剪贴板失败，请手动选择复制');
    }
  };

  const selectSuggestion = (text: string) => {
    if (loading) return;
    setPrompt(text);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Glow Ambient Header background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <header className="relative w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md shadow-indigo-500/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M13 3L21 11.093M3 14h6.781M21 14H14M3 10H10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 19.5A2.5 2.5 0 0116.5 22H4.5A2.5 2.5 0 012 19.5V4.5A2.5 2.5 0 014.5 2h12A2.5 2.5 0 0119 4.5V19.5z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">AI PRD Generator</span>
              <span className="ml-2 text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded-full">v0.2 Mock</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">文档</a>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-zinc-500">产品经理 / 独立开发者的敏捷利器</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 z-10">
        {/* Left Side: Input Panel */}
        <section className="w-full lg:w-[440px] flex flex-col gap-6 shrink-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">创意，即刻成文</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              输入您的产品想法、核心功能或痛点定位，我们将为您自动提炼出结构完整、逻辑严密的专业级 PRD 需求文档。
            </p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              <label htmlFor="idea-input" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">产品核心想法 / 脑暴草稿</label>
              <div className="relative">
                <textarea
                  id="idea-input"
                  rows={8}
                  maxLength={CHAR_LIMIT}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：开发一个个人记账App，主要给大学生和刚毕业的新人使用。能够自动读取银行短信、支持拍照记账、生成每月的消费图表并给出节约建议..."
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none"
                  disabled={loading}
                />
                <span className="absolute bottom-2.5 right-2.5 text-[10px] text-zinc-600">
                  {prompt.length} / {CHAR_LIMIT}
                </span>
              </div>
            </div>

            {/* Template recommendations */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">快速测试模板</span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSuggestion(item.text)}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error box */}
            {error && (
              <div className="flex gap-2.5 items-start bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>AI 脑暴提炼中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>生成 PRD 需求文档</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Side: Result Panel */}
        <section className="flex-1 min-w-0 flex flex-col bg-zinc-900/20 border border-zinc-800/80 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Output header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">PRD 实时生成区</span>
            </div>

            {/* Toggle view tabs and copy button */}
            {prd && (
              <div className="flex items-center gap-3">
                <div className="flex p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <button
                    onClick={() => setActiveTab('notion')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      activeTab === 'notion'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>结构预览</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      activeTab === 'markdown'
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>原始代码</span>
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-medium cursor-pointer transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-400">已复制!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>复制 Markdown</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Output content area */}
          <div className="flex-1 overflow-y-auto p-6 min-h-[350px]">
            {loading ? (
              /* High-fidelity Skeleton Loader */
              <div className="flex flex-col gap-6 animate-pulse">
                <div className="flex flex-col gap-3">
                  <div className="h-7 w-3/5 bg-zinc-800 rounded" />
                  <div className="h-4 w-4/5 bg-zinc-800/60 rounded" />
                </div>
                <hr className="border-zinc-800" />
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-20 bg-zinc-800 rounded" />
                  <div className="h-16 w-full bg-zinc-800/40 rounded-lg" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-24 bg-zinc-800 rounded" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-24 w-full bg-zinc-800/30 rounded-lg" />
                    <div className="h-24 w-full bg-zinc-800/30 rounded-lg" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-32 bg-zinc-800 rounded" />
                  <div className="h-24 w-full bg-zinc-800/40 rounded-lg" />
                </div>
              </div>
            ) : prd ? (
              activeTab === 'notion' ? (
                /* Interactive Document Preview */
                <div className="flex flex-col gap-8 text-zinc-300">
                  {/* Notion-style Document Cover/Header */}
                  <div className="flex flex-col gap-3 border-b border-zinc-800 pb-6">
                    <h2 className="text-3xl font-bold tracking-tight text-white">{prd.title}</h2>
                    <p className="text-base text-zinc-400 font-medium italic leading-relaxed">“ {prd.tagline} ”</p>
                  </div>

                  {/* Row 1: Target Audience & Pain Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        2. 目标用户
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2.5">
                        {prd.targetAudience.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-zinc-300">
                            <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        3. 用户痛点
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2.5">
                        {prd.painPoints.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-zinc-300">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* 4. Core Use Cases */}
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <span className="w-1.5 h-3 rounded bg-indigo-500" />
                      4. 核心使用场景
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {prd.useCases.map((item, idx) => (
                        <div key={idx} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2">
                          <span className="text-xs font-bold text-indigo-400">场景 {idx + 1}</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Row 2: MVP Features & Non-MVP Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        5. MVP 功能列表
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3">
                        {prd.mvpFeatures.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed text-zinc-300">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider shrink-0 mt-0.5">MVP</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        6. 非 MVP 功能
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3">
                        {prd.nonMvpFeatures.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed text-zinc-400">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50 text-[10px] uppercase font-bold tracking-wider shrink-0 mt-0.5">Backlog</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* Row 3: Page Structure & User Flows */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        7. 页面结构
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2.5">
                        {prd.pageStructure.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-zinc-300">
                            <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        8. 用户流程
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2.5">
                        {prd.userFlows.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-zinc-300">
                            <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* 9. Data Schema */}
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <span className="w-1.5 h-3 rounded bg-indigo-500" />
                      9. 数据结构建议
                    </h3>
                    <pre className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 font-mono text-xs leading-relaxed text-emerald-400/90 overflow-x-auto whitespace-pre-wrap">
                      <code>{prd.dataSchema}</code>
                    </pre>
                  </section>

                  {/* 10. Technical Implementation */}
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <span className="w-1.5 h-3 rounded bg-indigo-500" />
                      10. 技术实现建议
                    </h3>
                    <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2.5">
                      {prd.techImplementation.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-zinc-300">
                          <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Row 4: Pre-launch Checklist & Roadmap */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        11. 上线前检查清单
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3">
                        {prd.checklist.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs leading-relaxed text-zinc-300">
                            <input
                              type="checkbox"
                              readOnly
                              checked={false}
                              className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900 shrink-0 mt-0.5 pointer-events-none"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="flex flex-col gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <span className="w-1.5 h-3 rounded bg-indigo-500" />
                        12. 后续迭代路线
                      </h3>
                      <ul className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-2.5">
                        {prd.roadmap.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-xs leading-relaxed text-zinc-300">
                            <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              ) : (
                /* Raw Markdown Code Block View */
                <div className="relative h-full">
                  <pre className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4.5 font-mono text-[11px] sm:text-xs leading-relaxed text-zinc-300 overflow-x-auto h-full max-h-[600px]">
                    <code>{markdown}</code>
                  </pre>
                </div>
              )
            ) : (
              /* Initial Empty State */
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-800 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4 border border-zinc-800/80">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm text-zinc-300">暂无 PRD 内容</h3>
                <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
                  在左侧面板中输入您的产品构思，或直接点击预设模板快速填充，然后点击“生成 PRD”按钮，这里将为您呈现完整的交互式需求文档。
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} AI PRD Generator. Designed with visual excellence & modern web systems.</p>
        </div>
      </footer>
    </div>
  );
}
