-- Categories
insert into categories (name, slug, emoji) values
  ('Breakfast', 'breakfast', '🍳'),
  ('Lunch', 'lunch', '🥪'),
  ('Dinner', 'dinner', '🍽️'),
  ('Desserts', 'desserts', '🍰'),
  ('Vegan', 'vegan', '🥬'),
  ('Salads', 'salads', '🥗'),
  ('Baking', 'baking', '🥖'),
  ('Drinks', 'drinks', '🥤')
on conflict (slug) do nothing;
