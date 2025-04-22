import Link from "next/link";
import { Story, ApiError } from "@/lib/types";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import PaginationControls from "@/components/PaginationControls";

const STORIES_PER_PAGE = 10;

interface StoriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// --- Data Fetching Function ---
async function getStories(
  page: number,
  pageSize: number,
): Promise<{ stories: Story[]; error?: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    console.error("API Base URL not configured.");
    return { stories: [] };
  }

  const url = `${apiUrl}/stories?page=${page}&pageSize=${pageSize}`;
  console.log(`Fetching stories from: ${url}`); // Log the URL being fetched

  try {
    const res = await fetch(url, {
      cache: "no-store", // For paginated lists, often better to not cache heavily on the fetch level
      // or next: { revalidate: 60 } // Revalidate every minute, adjust as needed
    });

    if (!res.ok) {
      let errorMsg = `Failed to fetch stories: ${res.status} ${res.statusText}`;
      try {
        const errorData: ApiError = await res.json();
        errorMsg = errorData.error || errorData.title || errorMsg;
      } catch {
        /* Ignore parsing error */
      }
      console.error(errorMsg);
      return { stories: [], error: errorMsg };
    }

    const stories: Story[] = await res.json();
    return { stories };
  } catch (error) {
    console.error("Error fetching stories:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { stories: [] };
  }
}

// --- Date Formatting Helper ---
const formatDisplayDate = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return format(dateObj, "yyyy 年 M 月 d 日", { locale: zhCN });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback
  }
};

// --- The Page Component ---
export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  // Get current page from URL query, default to 1
  const search = await searchParams;
  const page = parseInt((search?.page as string) ?? "1", 10);
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  const { stories, error } = await getStories(currentPage, STORIES_PER_PAGE);

  // Determine if there might be a next page
  // This is a workaround because the API doesn't return total count.
  // It assumes if we received a full page of results, there *might* be more.
  const hasNextPage = stories.length === STORIES_PER_PAGE;
  const hasPreviousPage = currentPage > 1;

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-red-700 px-4 py-3" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!error && stories.length === 0 && (
        <div className="py-8">
          <p className="text-stone-500">这里还没有故事。</p>
        </div>
      )}

      {!error && stories.length > 0 && (
        <ul className="space-y-4">
          {stories.map((story) => (
            <li key={story.id}>
              <Link href={`/story/${story.date}`} className="group block py-2">
                <h2 className="text-lg text-stone-900 group-hover:text-stone-600">
                  {story.title}
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  {formatDisplayDate(story.date)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {(stories.length > 0 || currentPage > 1) && !error && (
        <PaginationControls
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          basePath="/stories"
        />
      )}
    </div>
  );
}
