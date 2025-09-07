import * as docx from 'docx';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import { latexToDocxMath } from './latexToDocx';

/**
 * 将 Markdown 字符串转换为 DOCX 文档
 * @param markdownString 要转换的 Markdown 字符串
 * @returns Promise<docx.Document>
 */
export async function generateDocxFromMarkdown(markdownString: string): Promise<docx.Document> {
  // 解析 Markdown 为 AST
  const ast: any = unified()
    .use(remarkParse)
    .use(remarkMath)
    .parse(markdownString);

  // 存储转换后的 DOCX 段落
  const docxParagraphs: docx.Paragraph[] = [];

  // 遍历 AST 节点
  for (const node of ast.children) {
    switch (node.type) {
      // 处理标题 (#, ##, ###)
      case 'heading':
        const headingChildren: docx.ParagraphChild[] = [];
        
        // 处理标题中的子节点
        for (const child of node.children) {
          if (child.type === 'inlineMath') {
            // 处理行内数学公式
            headingChildren.push(latexToDocxMath(child.value));
          } else if (child.type === 'text') {
            // 处理普通文本
            headingChildren.push(new docx.TextRun(child.value));
          } else {
            // 其他类型的节点也作为普通文本处理
            const textValue = child.value || JSON.stringify(child);
            headingChildren.push(new docx.TextRun(textValue));
          }
        }
        
        // 根据标题级别设置不同的样式
        let headingLevel: docx.HeadingLevel;
        let fontSize: number;
        let bold: boolean = true;
        
        switch (node.depth) {
          case 1: // # 一级标题
            headingLevel = docx.HeadingLevel.HEADING_1;
            fontSize = 28; // 14pt
            break;
          case 2: // ## 二级标题
            headingLevel = docx.HeadingLevel.HEADING_2;
            fontSize = 24; // 12pt
            break;
          case 3: // ### 三级标题
            headingLevel = docx.HeadingLevel.HEADING_3;
            fontSize = 20; // 10pt
            break;
          default:
            headingLevel = docx.HeadingLevel.HEADING_5; // 默认使用较小的标题
            fontSize = 18; // 9pt
            break;
        }
        
        docxParagraphs.push(new docx.Paragraph({
          children: headingChildren,
          heading: headingLevel,
          style: headingLevel.toString(),
        }));
        break;

      // 处理段落
      case 'paragraph':
        const paragraphChildren: docx.ParagraphChild[] = [];
        
        // 遍历段落中的子节点
        for (const child of node.children) {
          if (child.type === 'inlineMath') {
            // 处理行内数学公式
            paragraphChildren.push(latexToDocxMath(child.value));
          } else if (child.type === 'strong') {
            // 处理加粗文本 (**text** 或 __text__)
            for (const strongChild of child.children) {
              if (strongChild.type === 'inlineMath') {
                // 加粗文本中的数学公式
                paragraphChildren.push(latexToDocxMath(strongChild.value));
              } else if (strongChild.type === 'text') {
                // 加粗的普通文本
                paragraphChildren.push(new docx.TextRun({
                  text: strongChild.value,
                  bold: true
                }));
              } else {
                // 其他类型的节点也作为加粗文本处理
                const textValue = strongChild.value || JSON.stringify(strongChild);
                paragraphChildren.push(new docx.TextRun({
                  text: textValue,
                  bold: true
                }));
              }
            }
          } else if (child.type === 'emphasis') {
            // 处理斜体文本 (*text* 或 _text_)
            for (const emChild of child.children) {
              if (emChild.type === 'inlineMath') {
                // 斜体文本中的数学公式
                paragraphChildren.push(latexToDocxMath(emChild.value));
              } else if (emChild.type === 'text') {
                // 斜体的普通文本
                paragraphChildren.push(new docx.TextRun({
                  text: emChild.value,
                  italics: true
                }));
              } else {
                // 其他类型的节点也作为斜体文本处理
                const textValue = emChild.value || JSON.stringify(emChild);
                paragraphChildren.push(new docx.TextRun({
                  text: textValue,
                  italics: true
                }));
              }
            }
          } else if (child.type === 'text') {
            // 处理普通文本
            paragraphChildren.push(new docx.TextRun(child.value));
          } else {
            // 其他类型的节点也作为普通文本处理
            const textValue = child.value || JSON.stringify(child);
            paragraphChildren.push(new docx.TextRun(textValue));
          }
        }
        
        docxParagraphs.push(new docx.Paragraph({
          children: paragraphChildren
        }));
        break;

      // 处理块级数学公式 $...$
      case 'math':
        docxParagraphs.push(new docx.Paragraph({
          children: [latexToDocxMath(node.value)],
          alignment: docx.AlignmentType.CENTER
        }));
        break;

      // 其他所有节点暂时作为普通文本处理
      default:
        // 处理 HTML 节点
        if (node.type === 'html') {
          // 简单处理一些常见的 HTML 标签
          let textContent = node.value || '';
          
          // 处理 <img> 标签
          if (textContent.includes('<img')) {
            const imgRegex = /<img[^>]*src\s*=\s*["']([^"']*)["'][^>]*alt\s*=\s*["']([^"']*)["'][^>]*>/i;
            const imgMatch = textContent.match(imgRegex);
            
            if (imgMatch) {
              const imgSrc = imgMatch[1];
              const imgAlt = imgMatch[2];
              
              try {
                // 尝试获取图片数据
                const imageResponse = await fetch(imgSrc);
                const imageArrayBuffer = await imageResponse.arrayBuffer();
                const imageData = new Uint8Array(imageArrayBuffer);
                
                // 从文件扩展名提取图片类型和名称
                const ext = imgSrc.substring(imgSrc.lastIndexOf('.') + 1).toLowerCase();
                const imageName = imgSrc.substring(imgSrc.lastIndexOf('/') + 1, imgSrc.lastIndexOf('.'));

                // 根据文件扩展名确定图片类型
                let imageType = ext; // 大多数情况下直接使用扩展名
                if (ext === 'jpg') {
                  imageType = "jpeg"; // JPG 文件需要特殊处理
                }

                // 设置合理的默认尺寸
                let width = 360;  // 默认宽度
                let height = 360; // 默认高度

                // 从 HTML 属性中提取宽度和高度
                const widthMatch = textContent.match(/width\s*=\s*["'](\d+)["']/i);
                const heightMatch = textContent.match(/height\s*=\s*["'](\d+)["']/i);

                // 如果找到 width 属性，则使用用户指定的宽度
                if (widthMatch) {
                  width = parseInt(widthMatch[1]);
                }

                // 如果找到 height 属性，则使用用户指定的高度
                if (heightMatch) {
                  height = parseInt(heightMatch[1]);
                }
                
                // 创建图片段落
                docxParagraphs.push(new docx.Paragraph({
                  children: [
                    new docx.ImageRun({
                      data: imageData,
                      transformation: {
                        width: width,   // 使用动态宽度
                        height: height, // 使用动态高度
                      },
                      type: imageType,
                      altText: {
                        title: imgAlt,
                        description: imgAlt,
                        name: imageName,
                      },
                    }),
                  ],
                  alignment: docx.AlignmentType.CENTER
                }));
                
                // 添加图片说明（如果有）
                if (textContent.includes('</center>') && textContent.includes('<strong>')) {
                  const strongRegex = /<strong>([^<]*)<\/strong>/;
                  const strongMatch = textContent.match(strongRegex);
                  if (strongMatch) {
                    docxParagraphs.push(new docx.Paragraph({
                      children: [
                        new docx.TextRun({
                          text: strongMatch[1],
                          bold: true
                        })
                      ],
                      alignment: docx.AlignmentType.CENTER
                    }));
                  }
                }
              } catch (error) {
                // 如果图片获取失败，显示占位符文本
                console.error('图片加载失败:', error);
                docxParagraphs.push(new docx.Paragraph({
                  children: [
                    new docx.TextRun(`[图片: ${imgAlt}]`),
                    new docx.Run({
                      children: [
                        new docx.TextRun({
                          text: `
图片路径: ${imgSrc}`,
                          font: "Courier New",
                          size: 20 // 10pt
                        })
                      ]
                    })
                  ],
                  alignment: docx.AlignmentType.CENTER
                }));
              }
            } else {
              // 没有匹配到 img 标签，作为普通文本处理
              if (textContent.trim()) {
                docxParagraphs.push(new docx.Paragraph({
                  children: [new docx.TextRun(textContent)]
                }));
              }
            }
          } else {
            // 处理其他 HTML 内容
            if (textContent.trim()) {
              docxParagraphs.push(new docx.Paragraph({
                children: [new docx.TextRun(textContent)]
              }));
            }
          }
        } else {
          // 尝试提取文本内容
          let textContent = '';
          if (node.value) {
            textContent = node.value;
          } else if (node.children) {
            // 递归提取子节点的文本
            const extractText = (nodes: any[]): string => {
              return nodes.map(child => {
                if (child.type === 'text') {
                  return child.value;
                } else if (child.children) {
                  return extractText(child.children);
                } else {
                  return child.value || '';
                }
              }).join('');
            };
            textContent = extractText(node.children);
          }
          
          if (textContent) {
            docxParagraphs.push(new docx.Paragraph({
              children: [new docx.TextRun(textContent)]
            }));
          }
        }
        break;
    }
  }

  // 创建 DOCX 文档
  return new docx.Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          quickFormat: true,
          run: {
            size: 24, // 12pt
            font: {
              ascii: "Cambria Math",
              eastAsia: "宋体",
            }
          },
          paragraph: {
            alignment: docx.AlignmentType.JUSTIFY,
            spacing: {
              // after: 120, // 6pt 段后间距
              line: 360, // 1.5倍行距
            },
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 40, // 20pt
            bold: true,
            font: {
              ascii: "黑体",
              eastAsia: "黑体",
            }
          },
          paragraph: {
            alignment: docx.AlignmentType.CENTER,
            spacing: {
              before: 240,
              after: 240,
              line: 360,
            },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32, // 16pt
            bold: true,
            font: {
              ascii: "黑体",
              eastAsia: "黑体",
            }
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 240,
              line: 360,
            },
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 24, // 12pt
            bold: true,
            font: {
              ascii: "黑体",
              eastAsia: "黑体",
            }
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 240,
              line: 360,
            },
          },
        }
      ]
    },
    sections: [{
      children: docxParagraphs
    }]
  });
}