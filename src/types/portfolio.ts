export interface SocialLink {
  name: string;
  url: string;
  icon: "github" | "linkedin" | "facebook" | "aws";
}

export interface HeroData {
  statusText: string;
  intro: string;
  name: string;
  roles: string[];
  description: string;
  avatar: string;
  location: string;
  education: string;
  socials: SocialLink[];
}

export interface AchievementCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  detail?: string;
  theme?: "emerald" | "gold" | "blue" | "cyan";
  featured?: boolean;
}

export interface AboutData {
  chapter: string;
  title: string;
  caption: string;
  lead: string;
  bio: string;
  location: string;
  education: string;
  northStarQuote: string;
  achievements: AchievementCard[];
}

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  client: string;
  date: string;
  role: string;
  copy: string;
  details: string[];
  tags: string[];
  icon: "terminal" | "map" | "shield" | "code" | "server" | "spark";
  accent: "cyan" | "gold" | "violet" | "emerald";
  link?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  monogram: string;
  category?: "build" | "operate" | "defend";
}

export interface CredentialItem {
  id: string;
  name: string;
  short: string;
  issuer: string;
  category: "Cybersecurity" | "Community" | "Accreditation" | "Cloud";
  image: string;
  verifyUrl?: string;
}

export interface ContactData {
  chapter: string;
  headlineMain: string;
  headlineHighlight: string;
  copy: string;
  topics: string[];
  email: string;
  responseTime: string;
  formspreeUrl: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  dataPath: string;
  uploadsFolder: string;
}

export interface PortfolioData {
  hero: HeroData;
  about: AboutData;
  projects: ProjectItem[];
  arsenal: SkillItem[];
  credentials: CredentialItem[];
  contact: ContactData;
  githubConfig: GitHubConfig;
}

export interface GitHubUser {
  login: string;
  name?: string;
  avatar_url?: string;
  html_url?: string;
}

export interface AdminState {
  isLoggedIn: boolean;
  token: string;
  user: GitHubUser | null;
  mode: "edit" | "preview";
  hasUnsavedChanges: boolean;
  fileSha: string | null;
}
