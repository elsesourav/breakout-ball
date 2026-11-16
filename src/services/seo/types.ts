/**
 * SEO & Social Sharing Metadata Types
 */

export interface OpenGraphMeta {
  title: string;
  description: string;
  type?: 'website' | 'article' | 'game';
  url: string;
  image: string;
  imageSecureUrl?: string;
  imageType?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  siteName?: string;
  locale?: string;
}

export interface TwitterMeta {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  site?: string;
  creator?: string;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  themeColor?: string;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
  structuredData?: Record<string, unknown>;
}
