export async function generateStoryImage(
  title: string,
  content: string,
): Promise<string> {
  // 创建 canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 设置基础画布宽度
  canvas.width = 1080;
  
  // 设置字体大小
  const titleFontSize = 64; // 标题字号
  const contentFontSize = 42; // 正文字号
  const watermarkFontSize = 28; // 水印字号
  
  // 设置边距和间距
  const topMargin = 160; // 顶部边距
  const leftMargin = 80; // 左侧边距
  const titleMarginBottom = 60; // 标题和正文之间的间距
  const watermarkMargin = 80; // 水印上边距，从160px减小到80px
  const bottomMargin = 80; // 底部边距
  
  // 计算标题换行
  ctx.font = `bold ${titleFontSize}px "Noto Sans SC"`;
  const titleLines = getWrappedText(ctx, title, canvas.width - (leftMargin * 2)); // 左右各留80px边距
  
  // 计算内容换行
  ctx.font = `${contentFontSize}px "Noto Sans SC"`;
  const contentLines = getWrappedText(ctx, content, canvas.width - (leftMargin * 2)); // 左右各留80px边距
  
  // 计算各部分高度
  const titleHeight = titleLines.length * (titleFontSize * 1.5); // 标题行高为字号的1.5倍
  const contentHeight = contentLines.length * (contentFontSize * 1.6); // 内容行高为字号的1.6倍
  
  // 计算总高度并设置最小值
  const totalHeight = topMargin + titleHeight + titleMarginBottom + contentHeight + watermarkMargin + bottomMargin;
  canvas.height = Math.max(2000, totalHeight); // 最小高度2000px
  
  // 背景
  ctx.fillStyle = '#FAFAF9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 添加细微纹理
  ctx.fillStyle = '#F5F5F4';
  for (let i = 0; i < canvas.height; i += 4) {
    ctx.fillRect(0, i, canvas.width, 1);
  }
  
  // 绘制标题
  ctx.font = `bold ${titleFontSize}px "Noto Sans SC"`;
  ctx.fillStyle = '#1C1917';
  ctx.textAlign = 'left'; // 改为左对齐
  const titleY = topMargin;
  
  titleLines.forEach((line, index) => {
    ctx.fillText(line, leftMargin, titleY + (index * titleFontSize * 1.5));
  });
  
  // 绘制内容
  ctx.font = `${contentFontSize}px "Noto Sans SC"`;
  ctx.fillStyle = '#292524';
  ctx.textAlign = 'left';
  
  let contentY = titleY + titleHeight + titleMarginBottom;
  contentLines.forEach((line, index) => {
    // 首行缩进两个字符的空格
    const x = index === 0 ? leftMargin * 2 : leftMargin; // 首行缩进约两个字的宽度
    ctx.fillText(line, x, contentY + (index * contentFontSize * 1.6));
  });
  
  // 底部水印
  ctx.font = `${watermarkFontSize}px "Noto Sans SC"`;
  ctx.fillStyle = '#A8A29E';
  ctx.textAlign = 'center';
  ctx.fillText('dailythriller.com', canvas.width / 2, canvas.height - bottomMargin);
  
  return canvas.toDataURL('image/png');
}

function getWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let currentLine = '';
  
  const words = text.split('');
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + word).width;
    
    if (width < maxWidth) {
      currentLine += word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
