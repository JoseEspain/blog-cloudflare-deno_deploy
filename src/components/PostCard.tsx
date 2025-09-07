/**
 * @file src/components/Post-card.tsx
 * @description A purely presentational component for displaying a single post card preview in a blog list.
 * @param {object} props - Component properties.
 * @param {PostForDisplay} props.post - The post data to display.
 */

export type PostForDisplay = {
  slug: string;
  data: {
    title: string;
    published_at: Date;
    blurb: string;
    tags: string[];
    isPinned?: boolean;
  };
}

export default function PostCard(props: { post: PostForDisplay, lang?: string }) {
  const { post, lang = 'zh' } = props;

  return (
    <div class="group relative h-full flex flex-col p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-transform transition-shadow duration-500 ease-out border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2">
      {post.data.isPinned && (
        <div class="absolute top-0 right-0 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-tr-lg rounded-bl-lg z-10">
          {lang === 'zh' ? '置顶' : 'Pinned'}
        </div>
      )}
      <a href={lang === 'zh' ? `/${post.slug}` : `/en/${post.slug.replace('-en', '')}`} class="flex flex-col flex-grow">
        <h3 class={`${lang === 'zh' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-500 ease-out`}>
          {post.data.title}
        </h3>
        <div class="mt-3 flex flex-wrap items-center gap-4">
          <time class="text-gray-500 dark:text-gray-400 text-sm">
            {new Date(post.data.published_at).toLocaleDateString(lang === 'zh' ? "zh-CN" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <div class="flex flex-wrap gap-2">
            {post.data.tags?.map((tag) => (
              <span class="px-2 py-1 text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full transform group-hover:scale-105 transition-transform duration-500 ease-out">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div class="mt-4 flex-grow text-gray-600 dark:text-gray-300">
          <p class={`line-clamp-3 ${lang === 'zh' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
            {post.data.blurb}
          </p>
        </div>
        <div class="mt-4 sm:mt-6 flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-2 transition-transform duration-500 ease-out">
          {lang === 'zh' ? '阅读更多' : 'Read more'}
          <svg class="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-500 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </a>
    </div>
  );
}