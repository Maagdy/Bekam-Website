import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export default function SEOHead({
  title = 'Bekam - بكام',
  description = 'Compare grocery prices in Egypt | قارن أسعار البقالة في مصر',
  ogTitle,
  ogDescription,
  ogImage,
}: SEOHeadProps) {
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
    </Helmet>
  );
}
