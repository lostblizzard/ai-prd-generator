import { PRDDocument } from './types';

/**
 * Parses a standard 12-section PRD Markdown document into a structured PRDDocument JSON object.
 * Supports flexible headings to handle minor format variances.
 */
export function parseMarkdownToPRD(md: string): PRDDocument {
  const lines = md.split('\n');
  const prd: PRDDocument = {
    title: 'AI Generated PRD',
    tagline: '',
    targetAudience: [],
    painPoints: [],
    useCases: [],
    mvpFeatures: [],
    nonMvpFeatures: [],
    pageStructure: [],
    userFlows: [],
    dataSchema: '',
    techImplementation: [],
    checklist: [],
    roadmap: []
  };

  let currentSection = '';
  let dataSchemaBuffer: string[] = [];
  let taglineBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect Title (H1)
    if (line.startsWith('# ') && !line.startsWith('##')) {
      prd.title = line.replace(/^# (PRD:\s*)?/, '').trim();
      continue;
    }

    // Detect Sections (H2 or H3)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const secText = line.replace(/^(##|###)\s*(\d+\.?\s*)?/, '').trim();
      
      if (secText.includes('定位') || secText.toLowerCase().includes('positioning') || secText.toLowerCase().includes('tagline')) {
        currentSection = 'tagline';
      } else if (secText.includes('目标用户') || (secText.includes('用户') && !secText.includes('痛点') && !secText.includes('流程')) || secText.toLowerCase().includes('audience')) {
        currentSection = 'targetAudience';
      } else if (secText.includes('痛点') || secText.toLowerCase().includes('pain')) {
        currentSection = 'painPoints';
      } else if (secText.includes('使用场景') || secText.includes('场景') || secText.toLowerCase().includes('scenario') || secText.toLowerCase().includes('case')) {
        currentSection = 'useCases';
      } else if (secText.includes('MVP 功能') || secText.includes('MVP功能') || secText.toLowerCase().includes('mvp')) {
        currentSection = 'mvpFeatures';
      } else if (secText.includes('非 MVP') || secText.includes('非MVP') || secText.toLowerCase().includes('non-mvp')) {
        currentSection = 'nonMvpFeatures';
      } else if (secText.includes('页面结构') || secText.toLowerCase().includes('structure') || secText.toLowerCase().includes('page')) {
        currentSection = 'pageStructure';
      } else if (secText.includes('流程') || secText.toLowerCase().includes('flow')) {
        currentSection = 'userFlows';
      } else if (secText.includes('数据结构') || secText.toLowerCase().includes('schema') || secText.toLowerCase().includes('data')) {
        currentSection = 'dataSchema';
      } else if (secText.includes('技术实现') || secText.toLowerCase().includes('tech') || secText.toLowerCase().includes('implement')) {
        currentSection = 'techImplementation';
      } else if (secText.includes('检查清单') || secText.includes('Checklist') || secText.toLowerCase().includes('checklist')) {
        currentSection = 'checklist';
      } else if (secText.includes('迭代') || secText.includes('路线') || secText.toLowerCase().includes('roadmap') || secText.toLowerCase().includes('path')) {
        currentSection = 'roadmap';
      } else {
        currentSection = '';
      }
      continue;
    }

    // Process section contents
    if (currentSection === 'tagline') {
      if (!line.startsWith('---')) {
        taglineBuffer.push(line);
      }
    } else if (currentSection === 'dataSchema') {
      // Keep original lines (including tabs/spaces) for code block readability
      dataSchemaBuffer.push(lines[i]);
    } else if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\.\s+/)) {
      const content = line.replace(/^([-*]|\d+\.)\s+/, '').trim();
      
      switch (currentSection) {
        case 'targetAudience':
          prd.targetAudience.push(content);
          break;
        case 'painPoints':
          prd.painPoints.push(content);
          break;
        case 'useCases':
          prd.useCases.push(content);
          break;
        case 'mvpFeatures':
          prd.mvpFeatures.push(content);
          break;
        case 'nonMvpFeatures':
          prd.nonMvpFeatures.push(content);
          break;
        case 'pageStructure':
          prd.pageStructure.push(content);
          break;
        case 'userFlows':
          prd.userFlows.push(content);
          break;
        case 'techImplementation':
          prd.techImplementation.push(content);
          break;
        case 'checklist':
          // Strip empty or checked Markdown checkbox notations
          prd.checklist.push(content.replace(/^\[\s*\]\s*/, '').replace(/^\[x\]\s*/i, '').trim());
          break;
        case 'roadmap':
          prd.roadmap.push(content);
          break;
      }
    } else {
      // Parse plain paragraph lines if lists are formatted as paragraphs
      switch (currentSection) {
        case 'targetAudience':
          prd.targetAudience.push(line);
          break;
        case 'painPoints':
          prd.painPoints.push(line);
          break;
        case 'useCases':
          prd.useCases.push(line);
          break;
        case 'mvpFeatures':
          prd.mvpFeatures.push(line);
          break;
        case 'nonMvpFeatures':
          prd.nonMvpFeatures.push(line);
          break;
        case 'pageStructure':
          prd.pageStructure.push(line);
          break;
        case 'userFlows':
          prd.userFlows.push(line);
          break;
        case 'techImplementation':
          prd.techImplementation.push(line);
          break;
        case 'checklist':
          prd.checklist.push(line.replace(/^\[\s*\]\s*/, '').replace(/^\[x\]\s*/i, '').trim());
          break;
        case 'roadmap':
          prd.roadmap.push(line);
          break;
      }
    }
  }

  prd.tagline = taglineBuffer.join('\n').trim();
  prd.dataSchema = dataSchemaBuffer.join('\n').trim();

  // Fallbacks for empty fields to maintain clean rendering
  if (!prd.tagline) prd.tagline = '未生成产品定位。';
  if (prd.targetAudience.length === 0) prd.targetAudience = ['未指定目标用户。'];
  if (prd.painPoints.length === 0) prd.painPoints = ['未指定用户痛点。'];
  if (prd.useCases.length === 0) prd.useCases = ['未指定使用场景。'];
  if (prd.mvpFeatures.length === 0) prd.mvpFeatures = ['未指定 MVP 功能。'];
  if (prd.nonMvpFeatures.length === 0) prd.nonMvpFeatures = ['未指定非 MVP 功能。'];
  if (prd.pageStructure.length === 0) prd.pageStructure = ['未指定页面结构。'];
  if (prd.userFlows.length === 0) prd.userFlows = ['未指定用户流程。'];
  if (!prd.dataSchema) prd.dataSchema = '未指定数据结构。';
  if (prd.techImplementation.length === 0) prd.techImplementation = ['未指定技术建议。'];
  if (prd.checklist.length === 0) prd.checklist = ['未指定检查清单。'];
  if (prd.roadmap.length === 0) prd.roadmap = ['未指定迭代路线。'];

  return prd;
}
