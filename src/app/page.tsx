import StoryDisplay from "@/components/StoryDisplay"; // 引入稍后创建的故事展示组件
import { Story, ApiError } from "@/lib/types"; // 引入类型定义

async function getTodaysStory(): Promise<Story | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    console.error("[Server] API Base URL not configured.");
    return null;
  }

  const url = `${apiUrl}/story`;
  console.log('[Server] Fetching story from:', url);

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    console.log('[Server] Response status:', res.status);

    if (!res.ok) {
      let errorData: ApiError | null = null;
      try {
        errorData = await res.json();
      } catch (e) {
        console.error('[Server] Failed to parse error response:', e);
      }

      console.error(
        `[Server] Failed to fetch today's story: ${res.status} ${res.statusText}`,
        errorData,
      );
      return null;
    }

    const story: Story = await res.json();
    console.log('[Server] Successfully fetched story:', story.id);
    return story;
  } catch (error) {
    console.error("[Server] Error fetching today's story:", error);
    return null;
  }
}

// 主页组件 (Server Component)
export default async function HomePage() {
  const story = await getTodaysStory();

  return (
    <div className="space-y-8">
      {story ? (
        // 使用 StoryDisplay 组件展示故事
        <StoryDisplay story={story} isHomepage={true} />
      ) : (
        // 如果获取失败或当天没有故事，显示提示信息
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            今天的故事还在路上...
          </h2>
          <p className="text-gray-500">
            请稍后再来查看，或者看看{" "}
            <a href="/stories" className="text-indigo-600 hover:underline">
              往日的故事
            </a>
            。
          </p>
        </div>
      )}

      {/* 可以在这里添加其他主页内容 */}
    </div>
  );
}
