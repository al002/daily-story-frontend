import { Story } from "@/lib/types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface StoryDisplayProps {
  story: Story;
  isHomepage?: boolean;
}

export default function StoryDisplay({
  story,
  isHomepage = false,
}: StoryDisplayProps) {
  const formattedDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split("-").map(Number);
      // Date constructor (month is 0-indexed)
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      return format(dateObj, "yyyy 年 M 月 d 日", { locale: zhCN });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  return (
    <article className="bg-stone-50/50 rounded-lg overflow-hidden p-6 md:p-8 lg:p-10">
      <header className="mb-8 border-b border-stone-200 pb-4">
        <h1
          className={`text-2xl md:text-3xl font-medium text-stone-900 ${isHomepage ? "text-center" : ""}`}
        >
          {story.title}
        </h1>
        <p
          className={`text-sm text-stone-500 mt-3 ${isHomepage ? "text-center" : ""}`}
        >
          {formattedDate(story.date)}
        </p>
      </header>

      {/* 使用 prose 类优化长文本阅读体验 (来自 @tailwindcss/typography 插件) */}
      <div className="prose prose-stone max-w-none lg:prose-lg xl:prose-xl prose-p:leading-relaxed prose-p:text-justify prose-p:tracking-wide prose-headings:font-medium">
        {/* 将换行符 \n 转换为 <br /> 或 <p> */}
        {story.content.split("\n").map(
          (paragraph, index) =>
            // 过滤掉空段落
            paragraph.trim() !== "" && <p key={index}>{paragraph}</p>,
        )}
      </div>

      {/* 在文章末尾添加一个标记元素，用于后续实现无限滚动检测 */}
      <div id="story-end-sentinel" data-story-date={story.date}></div>
    </article>
  );
}
