export interface FaqEntry {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface WebPageData {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}

export interface ProductData {
  name: string;
  description: string;
  image: string;
  sku?: string;
  brand?: string;
  price?: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  url?: string;
}
