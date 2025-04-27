'use client';

import { Story } from "@/lib/types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { generateStoryImage } from "@/utils/shareImage";
import { useState } from "react";

interface StoryDisplayProps {
  story: Story;
  isHomepage?: boolean;
}

export default function StoryDisplay({
  story,
  isHomepage = false,
}: StoryDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formattedDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split("-").map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      return format(dateObj, "yyyy 年 M 月 d 日", { locale: zhCN });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const handleShare = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await generateStoryImage(
        story.title,
        story.content
      );
      
      // 将 Data URL 转换为 Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // 检查是否支持 Web Share API
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `story-${story.date}.png`, { 
          type: 'image/png' 
        });
        
        const shareData = {
          title: story.title,
          text: `每日恐怖故事 - ${formattedDate(story.date)}`,
          files: [file],
          url: `https://dailythriller.com/story/${story.date}`
        };
        
        // 检查是否可以分享文件
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
        
        // 如果不支持分享文件，尝试只分享文本和链接
        const textOnlyShareData = {
          title: story.title,
          text: `每日恐怖故事 - ${formattedDate(story.date)}`,
          url: `https://dailythriller.com/story/${story.date}`
        };
        
        await navigator.share(textOnlyShareData);
        return;
      }
      
      // 如果不支持 Web Share API，回退到下载方案
      const link = document.createElement('a');
      link.download = `story-${story.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error sharing story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const paragraphs = story.content
    .split("\n")
    .filter(para => para.trim() !== "");

  return (
    <article className="bg-stone-50/50 rounded-lg overflow-hidden p-6 md:p-8 lg:p-10">
      <header className="mb-8 border-b border-stone-200 pb-4">
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-medium text-stone-900 text-center">
            {story.title}
          </h1>
          
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className={`
              absolute 
              right-0 
              top-1/2 
              -translate-y-1/2
              p-2 
              rounded-lg 
              transition-all
              ${
                isGenerating
                  ? 'text-stone-400 cursor-not-allowed'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }
            `}
            title={isGenerating ? '生成中...' : '分享故事'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-stone-500 mt-3 text-center">
          {formattedDate(story.date)}
        </p>
      </header>

      <div className="prose prose-stone max-w-none lg:prose-lg xl:prose-xl prose-p:leading-relaxed prose-p:text-justify prose-p:tracking-wide prose-headings:font-medium">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={index === 0 ? "indent-[2em]" : ""}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div id="story-end-sentinel" data-story-date={story.date}></div>
    </article>
  );
}