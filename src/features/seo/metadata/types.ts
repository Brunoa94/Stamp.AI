import { Metadata } from "next";

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  openGraph?: Partial<Metadata["openGraph"]>;
  twitter?: Partial<Metadata["twitter"]>;
}
