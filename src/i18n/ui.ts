export const languages = {
  zh: '中文',
  en: 'English',
};

export const defaultLang = 'zh';

export const ui = {
  zh: {
    'site.title': '博客名称 - 技术博客',
    'site.description': '分享土木工程、编程和AI相关的技术知识和实用工具',
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.blog': '博客',
    'nav.tools': '工具',
    'nav.chat': 'AI聊天',
    'footer.copyright': '版权所有',
    'theme.toggle': '切换主题',
    'lang.toggle': '切换语言',
    'search.placeholder': '搜索文章...',
    'blog.readMore': '阅读更多',
    'blog.publishedAt': '发布于',
    'blog.tags': '标签',
    'calculator.export': '保存计算书',
    'calculator.calculating': '计算中...',
    'chat.placeholder': '输入您的问题... (Shift+Enter 换行)',
    'chat.send': '发送',
    'chat.stop': '停止',
  },
  en: {
    'site.title': 'The Next Syntax for Civil Engineering',
    'site.description': 'Gleanings and glimmers in civil engineering, programming, and AI',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.tools': 'Tools',
    'nav.chat': 'AI Chat',
    'footer.copyright': 'All rights reserved',
    'theme.toggle': 'Toggle theme',
    'lang.toggle': 'Switch language',
    'search.placeholder': 'Search articles...',
    'blog.readMore': 'Read more',
    'blog.publishedAt': 'Published on',
    'blog.tags': 'Tags',
    'calculator.export': 'Save Report',
    'calculator.calculating': 'Calculating...',
    'chat.placeholder': 'Enter your question... (Shift+Enter for new line)',
    'chat.send': 'Send',
    'chat.stop': 'Stop',
  },
} as const;

export type UiType = typeof ui;