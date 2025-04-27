// 标点符号常量
const CHINESE_PUNCTUATION = /[，。！？；：、]/;
const NO_BREAK_BEFORE = /[，。！？；：、》］｝】」』)/]/;
const NO_BREAK_AFTER = /[《［｛【「『(]/;

export async function generateStoryImage(
  title: string,
  content: string,
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 基础设置
  canvas.width = 1080;
  
  // 字体和大小设置
  const titleFontSize = 64;
  const contentFontSize = 42;
  const watermarkFontSize = 28;
  
  // 边距设置
  const margin = {
    top: 160,
    bottom: 80,
    left: 80,
    right: 80,
    titleBottom: 80,
    watermarkTop: 80,
  };

  // 行高设置
  const lineHeight = {
    title: 1.75,    // 标题行高增加到1.75
    content: 1.8,   // 正文行高增加到1.8
  };

  // 设置字体
  const setFont = (size: number, bold: boolean = false) => {
    ctx.font = `${bold ? 'bold' : ''} ${size}px "Noto Sans SC"`.trim();
  };

  // 计算文本宽度
  const measureText = (text: string): number => {
    return ctx.measureText(text).width;
  };

  // 优化的文本换行函数
  function getWrappedText(
    text: string,
    fontSize: number,
    maxWidth: number,
    isTitle: boolean = false,
    firstLineIndent: number = 0
  ): string[] {
    setFont(fontSize, isTitle);
    
    const lines: string[] = [];
    let currentLine = '';
    let currentWidth = firstLineIndent;
    
    // 将文本分割成字符，包括标点符号
    const characters = Array.from(text);
    
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const nextChar = characters[i + 1] || '';
      const charWidth = measureText(char);
      
      // 处理标点符号的特殊情况
      if (NO_BREAK_BEFORE.test(nextChar) || NO_BREAK_AFTER.test(char)) {
        currentLine += char;
        currentWidth += charWidth;
        continue;
      }
      
      // 检查是否需要换行
      if (currentWidth + charWidth > maxWidth - margin.right) {
        // 如果当前行以标点符号结尾，尽量将标点符号放在下一行开头
        if (CHINESE_PUNCTUATION.test(currentLine[currentLine.length - 1])) {
          const lastChar = currentLine[currentLine.length - 1];
          currentLine = currentLine.slice(0, -1);
          lines.push(currentLine);
          currentLine = lastChar + char;
          currentWidth = measureText(currentLine);
        } else {
          lines.push(currentLine);
          currentLine = char;
          currentWidth = charWidth;
        }
      } else {
        currentLine += char;
        currentWidth += charWidth;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  // 计算标题文本
  const titleLines = getWrappedText(
    title,
    titleFontSize,
    canvas.width - margin.left - margin.right,
    true
  );

  // 计算正文文本（首行缩进）
  const contentParagraphs = content.split('\n').filter(p => p.trim());
  const contentLines: string[] = [];
  let actualContentHeight = 0;
  
  // 段落间距设置为0.8倍行高
  const paragraphSpacing = contentFontSize * 0.8;
  
  contentParagraphs.forEach((paragraph, index) => {
    const firstLineIndent = index === 0 ? margin.left : 0; // 首段缩进
    const wrappedLines = getWrappedText(
      paragraph,
      contentFontSize,
      canvas.width - margin.left - margin.right,
      false,
      firstLineIndent
    );
    contentLines.push(...wrappedLines);
    
    // 计算这个段落的高度
    actualContentHeight += wrappedLines.length * (contentFontSize * lineHeight.content);
    
    // 在段落之间添加间距
    if (index < contentParagraphs.length - 1) {
      actualContentHeight += paragraphSpacing;
    }
  });

  // 计算总高度
  const titleHeight = titleLines.length * (titleFontSize * lineHeight.title);
  
  const totalHeight = margin.top + 
    titleHeight + 
    margin.titleBottom + 
    actualContentHeight + 
    margin.watermarkTop + 
    margin.bottom;
    
  canvas.height = Math.max(2000, totalHeight);

  // 绘制背景
  ctx.fillStyle = '#FAFAF9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 添加纹理
  ctx.fillStyle = '#F5F5F4';
  for (let i = 0; i < canvas.height; i += 4) {
    ctx.fillRect(0, i, canvas.width, 1);
  }

  // 绘制标题
  setFont(titleFontSize, true);
  ctx.fillStyle = '#1C1917';
  ctx.textAlign = 'left';
  
  titleLines.forEach((line, index) => {
    const y = margin.top + (index * titleFontSize * lineHeight.title);
    ctx.fillText(line, margin.left, y);
  });

  // 绘制正文
  setFont(contentFontSize);
  ctx.fillStyle = '#292524';
  
  let contentY = margin.top + titleHeight + margin.titleBottom;
  let currentParagraphIndex = 0;
  let linesInCurrentParagraph = 0;
  
  contentLines.forEach((line, index) => {
    // 计算当前行属于哪个段落
    while (linesInCurrentParagraph >= getWrappedText(
      contentParagraphs[currentParagraphIndex],
      contentFontSize,
      canvas.width - margin.left - margin.right,
      false,
      currentParagraphIndex === 0 ? margin.left : 0
    ).length) {
      currentParagraphIndex++;
      linesInCurrentParagraph = 0;
      contentY += paragraphSpacing; // 添加段落间距
    }
    
    const x = currentParagraphIndex === 0 && linesInCurrentParagraph === 0 
      ? margin.left * 2  // 第一段首行缩进
      : margin.left;     // 其他行正常对齐
    
    ctx.fillText(line, x, contentY);
    contentY += contentFontSize * lineHeight.content;
    linesInCurrentParagraph++;
  });

  // 绘制水印
  setFont(watermarkFontSize);
  ctx.fillStyle = '#A8A29E';
  ctx.textAlign = 'center';
  ctx.fillText(
    'dailythriller.com',
    canvas.width / 2,
    canvas.height - margin.bottom
  );

  return canvas.toDataURL('image/png');
}
