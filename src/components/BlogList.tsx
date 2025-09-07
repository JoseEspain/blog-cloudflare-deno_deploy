/**
 * @file src/components/BlogList.tsx
 * @description 博客文章列表组件，包含搜索功能和文章卡片展示
 */

import { useSignal } from "@preact/signals";
import SearchBar from "./SearchBar.tsx";
import PostCard from "./PostCard.tsx";
import type { PostForDisplay } from "./PostCard.tsx";

export default function BlogList({ posts, lang = 'zh' }: { posts: PostForDisplay[], lang?: string }) {
  // 搜索过滤后的文章slug列表
  const filteredSlugs = useSignal<string[] | null>(null);

  // 根据搜索结果过滤文章
  const postsToRender = filteredSlugs.value === null 
    ? posts 
    : posts.filter(post => filteredSlugs.value!.includes(post.slug));

  return (
    <>
      <SearchBar 
        onSearch={(results) => {
          filteredSlugs.value = results;
        }}
        lang={lang}
      />

      <div class="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {postsToRender.length === 0 ? (
          // 搜索结果为空时显示提示信息
          <div class="col-span-full text-center py-12">
            <div class="text-gray-500 dark:text-gray-400 text-lg">
              <p>{lang === 'zh' ? '没有找到匹配的文章' : 'No matching articles found'}</p>
              <p class="mt-2 text-sm">{lang === 'zh' ? '请尝试使用其他关键词搜索' : 'Please try searching with different keywords'}</p>
            </div>
          </div>
        ) : (
          // 渲染文章卡片列表
          postsToRender.map((post) => (
            <PostCard post={post} lang={lang} key={post.slug} />
          ))
        )}
      </div>
    </>
  );
}