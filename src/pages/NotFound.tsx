import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('notFound.title', 'Page Not Found')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('notFound.message', 'The page you are looking for does not exist.')}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t('notFound.goHome', 'Go Home')}
        </Link>
      </div>
    </div>
  );
}
