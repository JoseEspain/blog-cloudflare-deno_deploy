import * as docx from "docx";
import { latexToDocxMath } from "./latexToDocx";

/**
 * 自定义的矩阵类，用于在数学公式中创建矩阵
 * 通过生成符合OMML规范的结构实现矩阵显示
 */
export class MathMatrix extends docx.XmlComponent {
  constructor(rows: number, cols: number, elements: string[][]) {
    super("m:m");
    
    // 添加矩阵属性
    const mPr = new docx.XmlComponent("m:mPr");
    
    // 设置基线对齐方式为居中
    const baseJc = new docx.XmlComponent("m:baseJc");
    baseJc.root.push(new docx.XmlAttributeComponent({ val: "center" }));
    mPr.root.push(baseJc);
    
    // 隐藏占位符
    const plcHide = new docx.XmlComponent("m:plcHide");
    plcHide.root.push(new docx.XmlAttributeComponent({ val: "on" }));
    mPr.root.push(plcHide);
    
    // 定义矩阵列属性
    const mcs = new docx.XmlComponent("m:mcs");
    const mc = new docx.XmlComponent("m:mc");
    const mcPr = new docx.XmlComponent("m:mcPr");
    
    // 设置列数和对齐方式
    const count = new docx.XmlComponent("m:count");
    count.root.push(new docx.XmlAttributeComponent({ val: cols.toString() }));
    mcPr.root.push(count);
    
    const mcJc = new docx.XmlComponent("m:mcJc");
    mcJc.root.push(new docx.XmlAttributeComponent({ val: "center" }));
    mcPr.root.push(mcJc);
    
    mc.root.push(mcPr);
    mcs.root.push(mc);
    mPr.root.push(mcs);
    
    this.root.push(mPr);
    
    // 添加矩阵行
    for (let i = 0; i < rows; i++) {
      const mr = new docx.XmlComponent("m:mr");
      
      // 添加每行的元素
      for (let j = 0; j < cols; j++) {
        const e = new docx.XmlComponent("m:e");
        
        // 获取元素值，如果不存在则使用空字符串
        const elementValue = elements[i] && elements[i][j] ? elements[i][j] : "";
        
        // 如果元素值不为空，解析为数学表达式
        if (elementValue.trim() !== "") {
          // 使用latexToDocxMath解析元素内容
          const mathElement = latexToDocxMath(elementValue);
          // 将解析后的数学表达式的根元素添加到e中
          if (mathElement.root && mathElement.root.length > 0) {
            // 遍历根元素的所有子元素并添加到e中
            for (const child of mathElement.root) {
              e.root.push(child);
            }
          }
        } else {
          // 空元素处理
          const r = new docx.XmlComponent("m:r");
          const t = new docx.XmlComponent("m:t");
          t.root.push("");
          r.root.push(t);
          e.root.push(r);
        }
        
        mr.root.push(e);
      }
      
      this.root.push(mr);
    }
  }
}

/**
 * 创建矩阵的辅助函数
 * @param rows 行数
 * @param cols 列数
 * @param elements 矩阵元素的二维数组
 * @returns MathMatrix实例
 */
export const createMatrix = (rows: number, cols: number, elements: string[][]): MathMatrix => {
  return new MathMatrix(rows, cols, elements);
};