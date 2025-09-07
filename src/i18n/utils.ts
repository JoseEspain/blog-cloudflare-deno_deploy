import { ui, defaultLang, type UiType } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof UiType;
  return defaultLang;
}

export function useTranslations(lang: keyof UiType) {
  return function t(key: keyof UiType[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getStaticPaths() {
  return [
    {params: {lang: 'zh'}},
    {params: {lang: 'en'}},
  ];
}