import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

// Type for the search index embedded in the page
export type SearchIndexEntry = {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  content: string; // Plain text content
}

export default function SearchBar(props: {
  onSearch: (results: string[] | null) => void;
  lang?: string;
}) {
  const searchTerm = useSignal("");
  const searchIndex = useRef<SearchIndexEntry[]>([]);
  const filteredCount = useSignal(0);
  const debounceTimer = useRef<number | null>(null);

  // On component mount, load the search index from the DOM
  useEffect(() => {
    const indexElement = document.getElementById('search-index');
    if (indexElement) {
      try {
        searchIndex.current = JSON.parse(indexElement.textContent || '[]');
      } catch (e) {
        console.error("Failed to parse search index:", e);
      }
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear the previous timer on every new keystroke
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer
    debounceTimer.current = window.setTimeout(() => {
      const term = searchTerm.value.toLowerCase();

      if (!term) {
        props.onSearch(null); // Show all posts if search is empty
        filteredCount.value = 0;
        return;
      }

      const filtered = searchIndex.current.filter((post) => 
        post.title.toLowerCase().includes(term) ||
        post.blurb.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
      );

      const matchingSlugs = filtered.map(post => post.slug);
      filteredCount.value = matchingSlugs.length;
      props.onSearch(matchingSlugs);
    }, 300); // 300ms delay

    // Cleanup function to clear timer when component unmounts
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm.value]); // This effect runs whenever the search term changes

  // Input handler now only updates the signal, triggering the debounced effect
  const handleInput = (e: Event) => {
    searchTerm.value = (e.target as HTMLInputElement).value;
  };

  return (
    <div class="mt-8">
      <div class="relative group">
        <input
          type="text"
          value={searchTerm.value}
          onInput={handleInput}
          placeholder={props.lang === 'en' ? 'Search articles, content or tags...' : '搜索文章标题、内容或标签...'}
          class="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                 dark:text-white dark:placeholder-gray-400
                 transition-colors transition-shadow duration-300
                 group-hover:border-primary-300 dark:group-hover:border-primary-700
                 group-hover:shadow-md"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            class="w-5 h-5 text-gray-400 dark:text-gray-500 duration-300 group-hover:text-primary-500 dark:group-hover:text-primary-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>
      {searchTerm.value && (
        <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          找到 {filteredCount.value} 篇相关文章
        </div>
      )}
    </div>
  );
}