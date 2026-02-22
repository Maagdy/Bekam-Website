import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  function toggleLanguage() {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  }

  return (
    <button
      onClick={toggleLanguage}
      className="btn-ghost p-2 text-sm font-medium flex items-center gap-1.5"
      title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <Languages className="w-4 h-4" />
      <span>{i18n.language === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  );
}
