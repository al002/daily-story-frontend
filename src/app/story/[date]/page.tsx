import StoryDisplay from "@/components/StoryDisplay";
import { Story, ApiError } from "@/lib/types";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface StoryDetailPageProps {
  params: Promise<{
    date: string;
  }>;
}

// --- Data Fetching Function ---
async function getStoryByDate(date: string): Promise<Story | null> {
  // Validate the date format (basic check)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`Invalid date format received: ${date}`);
    return null; // Or you could throw an error earlier
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    console.error("API Base URL not configured.");
    return null;
  }

  const url = `${apiUrl}/story/${date}`; // Use the date in the API URL
  console.log(`Fetching story from: ${url}`);

  try {
    // Fetch the specific story
    const res = await fetch(url, {
      // Cache strategy for individual stories:
      // 'force-cache' (default) is good if stories rarely change once generated.
      // next: { revalidate: 86400 } // Revalidate once a day (86400 seconds)
      cache: "no-store", // Or no caching if you want it always fresh (less ideal for past stories)
    });

    // Handle Not Found specifically
    if (res.status === 404) {
      return null; // Indicate story not found
    }

    if (!res.ok) {
      let errorMsg = `Failed to fetch story for date ${date}: ${res.status} ${res.statusText}`;
      try {
        const errorData: ApiError = await res.json();
        errorMsg = `${errorData.title || "Error"}: ${errorData.error || errorData.detail || res.statusText}`;
      } catch {
        /* Ignore parsing error */
      }
      console.error(errorMsg);
      // For server components, throwing an error is often better for non-404 issues
      throw new Error(errorMsg);
    }

    const story: Story = await res.json();
    return story;
  } catch (error) {
    console.error(`Error fetching story for date ${date}:`, error);
    // Re-throw the error to be caught by Next.js error handling or the component
    throw error;
    // return null; // Or return null if you want to handle the error display differently in the component
  }
}

// --- Generate Metadata for SEO ---
// This function dynamically generates metadata based on the fetched story
export async function generateMetadata({
  params,
}: StoryDetailPageProps): Promise<Metadata | undefined> {
  const { date } = await params;
  try {
    const story = await getStoryByDate(date);

    if (!story) {
      return {
        title: "故事未找到",
      };
    }

    // Format date for title/description if needed
    const [year, month, day] = story.date.split("-").map(Number);
    const displayDate = `${year}年${month}月${day}日`;

    return {
      title: `${story.title} - ${displayDate} AI 小说`,
      description: `阅读 ${displayDate} 由 AI 生成的短篇小说: ${story.content.substring(0, 150)}...`, // Use excerpt for description
      // Add Open Graph and Twitter card metadata
      openGraph: {
        title: `${story.title}`,
        description: `阅读 ${displayDate} 由 AI 生成的短篇小说...`,
        type: "article",
        publishedTime: new Date(Date.UTC(year, month - 1, day)).toISOString(), // Use ISO string for date
        url: `/story/${story.date}`, // Canonical URL
        // Add image if you have one associated with stories later
      },
      twitter: {
        card: "summary",
        title: `${story.title}`,
        description: `阅读 ${displayDate} 由 AI 生成的短篇小说...`,
        // creator: '@YourTwitterHandle', // If you have one
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "加载故事时出错",
      description: "无法加载此故事的元数据。",
    };
  }
}

// --- The Detail Page Component ---
export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { date } = await params; // Extract the date from the route parameters

  let story: Story | null = null;
  let fetchError: string | null = null;

  try {
    story = await getStoryByDate(date);
  } catch (error) {
    console.error(`Detail page render error for date ${date}:`, error);
    fetchError =
      error instanceof Error ? error.message : "加载故事时发生未知错误。";
  }

  // If the story is not found after fetching, use Next.js's notFound()
  // This will render the nearest not-found.tsx file or a default 404 page
  if (!story && !fetchError) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Optional: Breadcrumb or back link */}
      <nav className="mb-4 text-sm">
        <Link
          href="/stories"
          className="text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          ← 返回往日故事列表
        </Link>
      </nav>

      {fetchError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">加载错误：</strong>
          <span className="block sm:inline">{fetchError}</span>
          <p className="mt-2 text-sm">
            请稍后再试或检查日期格式是否正确 (YYYY-MM-DD)。
          </p>
        </div>
      )}

      {story && (
        // Reuse the StoryDisplay component
        <StoryDisplay story={story} />
      )}

      {/* Optional: Add navigation to previous/next day's story */}
      {/* You would need to fetch the adjacent dates or calculate them */}
      {/* <div className="flex justify-between mt-8 pt-4 border-t">
         <Link href={`/story/PREVIOUS_DATE`} className="..."> ← 前一天 </Link>
         <Link href={`/story/NEXT_DATE`} className="..."> 后一天 → </Link>
       </div> */}
    </div>
  );
}
