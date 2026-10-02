// Shapes of the JSON returned by the Java backend (see backend/.../site/SiteService.java).

export type Category = {
  id: string;
  name: string;
  /** Short line shown under the name on the home page. */
  blurb: string;
  /** Sub-items, e.g. "Countertops", "Flooring". */
  items: string[];
};

export type Brand = {
  id: string;
  name: string;
  categoryId: string;
  url: string;
  /** File name under /uploads, or null to show the name as text. */
  logo: string | null;
  visible: boolean;
};

export type Settings = {
  siteName: string;
  heroTitle: string;
  heroText: string;
  address: string;
  mapUrl: string;
  phone: string;
  email: string;
  hours: string;
  instagramHandle: string;
};

export type InstagramPost = {
  id: string;
  caption: string;
  image: string;
  permalink: string;
  isVideo: boolean;
  timestamp: string;
};

export type InstagramStatus = {
  connected: boolean;
  /** ISO time the token was saved or last renewed. */
  tokenUpdatedAt: string | null;
  postCount: number;
  fetchedAt: string | null;
  lastError: string | null;
};

/** Lists arrive already in display order. */
export type Site = {
  settings: Settings;
  categories: Category[];
  brands: Brand[];
  posts: InstagramPost[];
};

export type AdminSite = Site & { instagram: InstagramStatus };
