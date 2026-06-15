export interface PRDDocument {
  title: string;
  tagline: string;              // 1. 产品一句话定位
  targetAudience: string[];     // 2. 目标用户
  painPoints: string[];         // 3. 用户痛点
  useCases: string[];           // 4. 核心使用场景
  mvpFeatures: string[];        // 5. MVP 功能列表
  nonMvpFeatures: string[];     // 6. 非 MVP 功能
  pageStructure: string[];      // 7. 页面结构
  userFlows: string[];          // 8. 用户流程
  dataSchema: string;           // 9. 数据结构建议
  techImplementation: string[]; // 10. 技术实现建议
  checklist: string[];          // 11. 上线前检查清单
  roadmap: string[];            // 12. 后续迭代路线
}
