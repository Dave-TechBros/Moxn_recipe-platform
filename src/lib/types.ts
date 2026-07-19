export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: "user" | "creator" | "admin";
  is_private: boolean;
  notify_email: boolean;
  notify_new_follower: boolean;
  notify_new_review: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
};

export type Recipe = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  ingredients: string[];
  steps: string[];
  is_published: boolean;
  featured: boolean;
  created_at: string;
  // joined
  author?: Profile;
  category?: Category;
  avg_rating?: number;
  rating_count?: number;
};

export type Review = {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  author?: Profile;
};

export type Collection = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
  recipe_count?: number;
};
