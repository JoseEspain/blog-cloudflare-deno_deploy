import * as docx from "docx";

/**
 * 自定义的正体文本类，用于在数学公式中创建正体（非斜体）文本
 * 通过添加<m:nor />标记实现OMML中的正体显示
 */
export class MathNormalText extends docx.XmlComponent {
  constructor(text: string) {
    super("m:r");
    
    // 添加运行属性以指定正常文本（正体）
    const rPr = new docx.XmlComponent("m:rPr");
    const nor = new docx.XmlComponent("m:nor");
    rPr.root.push(nor);
    this.root.push(rPr);
    
    // 添加文本内容
    const t = new docx.XmlComponent("m:t");
    t.root.push(text);
    this.root.push(t);
  }
}

/**
 * 从数学子元素中提取文本内容的辅助函数
 * @param children 数学子元素数组
 * @returns 提取的文本内容
 */
export const extractTextFromMathChildren = (children: any[]): string => {
  if (!children || children.length === 0) {
    return '';
  }
  
  return children.map(child => {
    // 处理MathRun对象
    if (child && child instanceof docx.MathRun) {
      // MathRun通常包含一个文本子元素
      if (child.root && child.root.length > 0) {
        // 遍历root数组查找文本内容
        for (const item of child.root) {
          if (typeof item === 'string') {
            return item;
          } else if (item && item.rootKey === 'm:t' && item.root && item.root.length > 0) {
            // 如果是m:t元素，获取其中的文本
            return String(item.root[0]);
          }
        }
        // 如果没有找到字符串，返回第一个元素的字符串表示
        return String(child.root[0]);
      }
      return '';
    } 
    // 处理嵌套的Math对象
    else if (child && child instanceof docx.Math) {
      // 递归处理嵌套的Math对象
      return extractTextFromMathChildren((child as any).children || []);
    }
    // 处理其他可能的对象
    else if (child && typeof child === 'object' && child.root) {
      // 如果对象有root属性，尝试获取其中的文本
      if (Array.isArray(child.root) && child.root.length > 0) {
        // 递归处理子元素
        return extractTextFromMathChildren(child.root);
      }
      return '';
    }
    // 处理字符串
    else if (typeof child === 'string') {
      return child;
    }
    // 其他情况返回空字符串
    return '';
  }).join('');
};