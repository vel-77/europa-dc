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

export type Solution = {
  id: string;
  title: string;
  description: string;
  /** File name under /uploads, or null. */
  image: string | null;
};

export type Project = {
  id: string;
  title: string;
  /** Short descriptor line, e.g. "Kitchen / Dekton / Walnut". */
  tags: string;
  location: string;
  cover: string | null;
  gallery: string[];
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  files: { stored: string; originalName: string }[];
  createdAt: string;
  read: boolean;
};

export type Settings = {
  siteName: string;
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
  solutions: Solution[];
  projects: Project[];
  testimonials: Testimonial[];
  categories: Category[];
  brands: Brand[];
  posts: InstagramPost[];
};

export type AdminSite = Site & { instagram: InstagramStatus; inquiries: Inquiry[] };
