// 标点符号常量
const CHINESE_PUNCTUATION = /[，。！？；：、]/;
// const NO_BREAK_BEFORE = /[，。！？；：、》］｝】」』)/]/;
// const NO_BREAK_AFTER = /[《［｛【「『(]/;

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
      // const nextChar = characters[i + 1] || '';
      const charWidth = measureText(char);
      
      // 检查是否需要换行
      if (currentWidth + charWidth > maxWidth - margin.right) {
        // 当前字符是标点符号时，应该放在当前行
        if (CHINESE_PUNCTUATION.test(char)) {
          currentLine += char;
          lines.push(currentLine);
          currentLine = '';
          currentWidth = firstLineIndent;
        } else {
          lines.push(currentLine);
          currentLine = char;
          currentWidth = charWidth + firstLineIndent;
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

  // 绘制文本时实现两端对齐
  function drawJustifiedText(
    line: string,
    x: number,
    y: number,
    maxWidth: number, // Still needed for effectiveMaxWidth calculation
    isFirstLineOfFirstParagraph: boolean = false,
    isLastLineOfParagraph: boolean = false
  ) {
    // fontSize parameter removed as it's not directly used; font is set on ctx before calling.
    const chars = Array.from(line);
    
    // Calculate total width and effective max width
    const totalWidth = measureText(line);
    const effectiveMaxWidth = isFirstLineOfFirstParagraph 
      ? canvas.width - margin.left * 2 - margin.right // Adjusted for double indent
      : canvas.width - margin.left - margin.right;

    // If it's the last line and doesn't fill the width, draw left-aligned
    if (isLastLineOfParagraph && totalWidth < effectiveMaxWidth) {
      ctx.fillText(line, x, y);
      return;
    }

    // Existing justification logic for other lines or full last lines
    if (chars.length <= 1) {
      ctx.fillText(line, x, y);
      return;
    }

    // Calculate extra space needed for justification
    const extraSpace = effectiveMaxWidth - totalWidth;
    
    // Calculate space between characters for justification
    // Avoid division by zero if there's only one character (though handled above)
    const spaceBetweenChars = chars.length > 1 ? extraSpace / (chars.length - 1) : 0;
    
    // 绘制每个字符
    let currentX = x;
    chars.forEach((char, index) => {
      ctx.fillText(char, currentX, y);
      // 最后一个字符不需要添加间距
      if (index < chars.length - 1) {
        currentX += measureText(char) + spaceBetweenChars;
      }
    });
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
  let currentParagraphIndex = -1; // Start at -1 to trigger initial calculation
  let linesInCurrentParagraph = 0;
  let currentParagraphWrappedLines: string[] = [];
  let totalLinesInCurrentParagraph = 0;
  
  contentLines.forEach((line) => {
    // Check if we've moved to a new paragraph
    if (currentParagraphIndex === -1 || linesInCurrentParagraph >= totalLinesInCurrentParagraph) {
      currentParagraphIndex++;
      linesInCurrentParagraph = 0;
      if (currentParagraphIndex > 0) { // Add spacing only between paragraphs
          contentY += paragraphSpacing;
      }
      // Calculate wrapped lines ONCE per paragraph
      const currentParagraph = contentParagraphs[currentParagraphIndex];
      const firstLineIndentForCalc = currentParagraphIndex === 0 ? margin.left : 0;
      currentParagraphWrappedLines = getWrappedText(
          currentParagraph,
          contentFontSize,
          canvas.width - margin.left - margin.right,
          false,
          firstLineIndentForCalc
      );
      totalLinesInCurrentParagraph = currentParagraphWrappedLines.length;
    }

    // This check seems redundant now with the logic above, removing the while loop.
    // The paragraph change logic handles moving to the next paragraph.

    const isFirstLineOfFirstParagraph = currentParagraphIndex === 0 && linesInCurrentParagraph === 0;
    const x = isFirstLineOfFirstParagraph
      ? margin.left * 2  // 第一段首行缩进
      : margin.left;     // 其他行正常对齐

    // Determine if it's the last line of the current paragraph using pre-calculated value
    const isLastLine = linesInCurrentParagraph + 1 === totalLinesInCurrentParagraph;

    // 使用两端对齐绘制文本, passing the new flag and without fontSize
    drawJustifiedText(
      line,
      x,
      contentY,
      canvas.width - margin.left - margin.right,
      // contentFontSize, // Removed fontSize parameter
      isFirstLineOfFirstParagraph,
      isLastLine
    );
    
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
