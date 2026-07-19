import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return NextResponse.json({ error: "No database configured" }, { status: 500 });
  }

  // Skip auth if DB is empty (fresh deploy — no users yet).
  const { rows: userRows } = await pool.query("select count(*)::int as n from users");
  if (userRows[0].n > 0) {
    const auth = await requireUser();
    if (!("response" in auth)) {
      const r = await pool.query("select role from users where id = $1", [auth.userId]);
      if (r.rows[0]?.role !== "admin") {
        return NextResponse.json({ error: "Admin role required to seed" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Log in as admin first" }, { status: 401 });
    }
  }

  try {
    // Check if already seeded.
    const { rows } = await pool.query("select count(*)::int as n from recipes");
    if (rows[0].n > 0) {
      return NextResponse.json({ ok: true, message: `Already has ${rows[0].n} recipes` });
    }

    // Seed categories.
    const cats: [string, string, string][] = [
      ["breakfast", "Breakfast", "\u{1F95E}"],
      ["lunch", "Lunch", "\u{1F96A}"],
      ["dinner", "Dinner", "\u{1F35D}"],
      ["desserts", "Desserts", "\u{1F370}"],
      ["baking", "Baking", "\u{1F950}"],
      ["salads", "Salads", "\u{1F957}"],
      ["vegan", "Vegan", "\u{1F331}"],
      ["drinks", "Drinks", "\u{1F964}"],
    ];
    for (const [slug, name, emoji] of cats) {
      await pool.query(
        `insert into categories (slug, name, emoji) values ($1,$2,$3) on conflict (slug) do nothing`,
        [slug, name, emoji]
      );
    }

    // Seed 12 demo users.
    const pwHash = bcrypt.hashSync("Password123", 10);
    const seedUsers: { email: string; username: string; display_name: string; bio: string; role: string }[] = [
      { email: "demo@moxn.app", username: "chefmox", display_name: "Chef Mox", bio: "Home cook & founder of MOXN.", role: "admin" },
      { email: "olive@moxn.app", username: "oliveandthyme", display_name: "Olive & Thyme", bio: "Mediterranean home cooking, mostly plants.", role: "creator" },
      { email: "dutch@moxn.app", username: "thefryingdutch", display_name: "The Frying Dutchman", bio: "Crispy, golden, indulgent. Fry guy.", role: "creator" },
      { email: "soon@moxn.app", username: "mamasoon", display_name: "Mama Soon", bio: "Korean comfort food, one bowl at a time.", role: "creator" },
      { email: "green@moxn.app", username: "greengoddess", display_name: "Green Goddess", bio: "Salads that don't taste like punishment.", role: "creator" },
      { email: "brunch@moxn.app", username: "brunchbae", display_name: "Brunch Bae", bio: "Weekend mornings are a love language.", role: "creator" },
      { email: "smoke@moxn.app", username: "smokeandember", display_name: "Smoke & Ember", bio: "Low and slow BBQ from a tiny balcony.", role: "creator" },
      { email: "lina@moxn.app", username: "lina", display_name: "Lina Eats", bio: "Plant-based recipes for busy people.", role: "user" },
      { email: "theo@moxn.app", username: "theo", display_name: "Theo Bakes", bio: "Sourdough & pastries enthusiast.", role: "user" },
      { email: "priya@moxn.app", username: "priya.k", display_name: "Priya Nair", bio: "Spice lover, chai scientist.", role: "user" },
      { email: "marco@moxn.app", username: "marco", display_name: "Marco R.", bio: "Pasta evangelist from Bologna (via Zoom).", role: "user" },
      { email: "amy@moxn.app", username: "amy.w", display_name: "Amy Wells", bio: "Meal-prep queen, mom of two.", role: "user" },
    ];
    const userIds: string[] = [];
    for (const u of seedUsers) {
      const r = await pool.query(
        `insert into users (email, password_hash, username, display_name, bio, avatar_url, role)
         values ($1,$2,$3,$4,$5,$6,$7) on conflict (email) do nothing returning id`,
        [u.email, pwHash, u.username, u.display_name, u.bio,
         `https://api.dicebear.com/9.x/adventurer/svg?seed=${u.username}`, u.role]
      );
      if (r.rows[0]) userIds.push(r.rows[0].id);
    }
    if (userIds.length === 0) {
      return NextResponse.json({ ok: true, message: "Users already exist — seed skipped" });
    }

    // Map usernames to ids.
    const userMap: Record<string, string> = {};
    for (const u of seedUsers) {
      const r = await pool.query("select id from users where username = $1", [u.username]);
      if (r.rows[0]) userMap[u.username] = r.rows[0].id;
    }
    const uid = (username: string) => userMap[username];
    const catId = async (slug: string) => {
      const r = await pool.query("select id from categories where slug = $1", [slug]);
      return r.rows[0]?.id;
    };

    // Seed 20 recipes.
    const recipes = [
      { a: "oliveandthyme", c: "dinner", title: "Lemon Herb Roast Chicken", summary: "Golden roast chicken with a bright lemon-herb butter.", time: 90, diff: "Medium", ing: ["1 whole chicken","3 lemons","Rosemary","Thyme","Butter","Garlic","Olive oil","Salt"], steps: ["Zest lemons into softened butter with herbs.","Rub under and over the skin.","Roast at 200\u00b0C for 75 mins.","Rest 10 mins, then carve."], img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80", feat: true },
      { a: "oliveandthyme", c: "salads", title: "Watermelon Feta Salad", summary: "Sweet, salty and fresh \u2014 the ultimate summer bowl.", time: 15, diff: "Easy", ing: ["Watermelon","Feta","Mint","Cucumber","Olive oil","Lime"], steps: ["Cube watermelon and cucumber.","Toss with crumbled feta and mint.","Drizzle olive oil and lime."], img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80" },
      { a: "mamasoon", c: "dinner", title: "Kimchi Fried Rice", summary: "Leftover rice, punchy kimchi and a crispy egg.", time: 20, diff: "Easy", ing: ["2 cups rice","1 cup kimchi","2 eggs","Spring onion","Sesame oil","Gochujang"], steps: ["Fry kimchi in sesame oil.","Add rice and gochujang, toss.","Top with a crispy fried egg."], img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80", feat: true },
      { a: "mamasoon", c: "lunch", title: "Bibimbap Bowl", summary: "Rainbow vegetables over rice with a chili-sesame sauce.", time: 35, diff: "Medium", ing: ["Rice","Spinach","Carrot","Bean sprouts","Egg","Gochujang","Sesame"], steps: ["Blanch and season each veg separately.","Arrange over warm rice.","Top with egg and sauce."], img: "https://images.unsplash.com/photo-1558162199-5ec04b9bf6f8?w=800&q=80" },
      { a: "thefryingdutch", c: "desserts", title: "Crispy Churros", summary: "Cinnamon-sugar pillows with molten centers.", time: 40, diff: "Medium", ing: ["Water","Butter","Flour","Eggs","Cinnamon","Sugar","Oil"], steps: ["Boil water and butter, add flour.","Pipe into hot oil, fry golden.","Toss in cinnamon sugar."], img: "https://images.unsplash.com/photo-1624377632654-7a5a9b3b0d4?w=800&q=80", feat: true },
      { a: "thefryingdutch", c: "breakfast", title: "Fluffy Buttermilk Pancakes", summary: "Tall, cloud-like stacks for slow mornings.", time: 25, diff: "Easy", ing: ["Flour","Buttermilk","Eggs","Baking powder","Butter","Maple"], steps: ["Whisk wet and dry separately.","Fold together, rest 10 mins.","Cook on a buttered griddle."], img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" },
      { a: "greengoddess", c: "vegan", title: "Rainbow Buddha Bowl", summary: "Roasted veg, chickpeas and tahini over fluffy rice.", time: 35, diff: "Easy", ing: ["Rice","Chickpeas","Sweet potato","Broccoli","Tahini","Lemon"], steps: ["Roast veg and chickpeas.","Cook rice.","Whisk tahini dressing, assemble."], img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80", feat: true },
      { a: "greengoddess", c: "salads", title: "Crunchy Garden Spring Salad", summary: "Peas, radish and cucumber with a lemony dressing.", time: 15, diff: "Easy", ing: ["Peas","Radish","Cucumber","Lettuce","Lemon","Olive oil"], steps: ["Shave radish.","Toss with greens.","Dress with lemon and oil."], img: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800&q=80" },
      { a: "brunchbae", c: "breakfast", title: "Sunrise Avocado Toast", summary: "Crispy sourdough, smashed avocado, chili and a soft egg.", time: 15, diff: "Easy", ing: ["Sourdough","Avocado","Eggs","Chili flakes","Olive oil","Salt"], steps: ["Toast the bread.","Smash avocado with salt.","Top with a soft egg."], img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80", feat: true },
      { a: "brunchbae", c: "drinks", title: "Sunshine Mango Smoothie", summary: "Tropical mango, banana and orange for a bright start.", time: 5, diff: "Easy", ing: ["Mango","Banana","Orange","Oat milk","Ice"], steps: ["Peel and chop fruit.","Blend with milk and ice."], img: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=800&q=80" },
      { a: "smokeandember", c: "dinner", title: "Smoky BBQ Pulled Jackfruit", summary: "Slow-cooked jackfruit in a sticky BBQ glaze.", time: 120, diff: "Medium", ing: ["Jackfruit","BBQ sauce","Onion","Smoked paprika","Bun"], steps: ["Saut\u00e9 onion with paprika.","Add jackfruit and sauce, simmer.","Shred and pile into buns."], img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80" },
      { a: "chefmox", c: "vegan", title: "Creamy Coconut Lentil Curry", summary: "Hearty red lentils simmered in coconut milk with warming spices.", time: 40, diff: "Easy", ing: ["Red lentils","Coconut milk","Onion","Garlic","Curry spices","Spinach"], steps: ["Saut\u00e9 onion and garlic.","Add spices and lentils.","Pour in coconut milk, simmer."], img: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80", feat: true },
      { a: "chefmox", c: "baking", title: "Rustic Sourdough Loaf", summary: "A tangy, crusty country loaf with an open crumb.", time: 1440, diff: "Hard", ing: ["Bread flour","Water","Starter","Salt"], steps: ["Autolyse flour and water.","Add starter and salt.","Stretch and fold hourly, bake."], img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80" },
      { a: "theo", c: "baking", title: "Honey Cinnamon Banana Bread", summary: "Moist, lightly spiced loaf with a honey glaze.", time: 70, diff: "Medium", ing: ["Bananas","Eggs","Flour","Sugar","Cinnamon","Honey"], steps: ["Mash bananas.","Mix wet and dry.","Bake, then glaze with honey."], img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80" },
      { a: "theo", c: "desserts", title: "Molten Chocolate Cake", summary: "Gooey centered chocolate cakes ready in 12 minutes.", time: 20, diff: "Medium", ing: ["Dark chocolate","Eggs","Butter","Sugar","Flour"], steps: ["Melt chocolate and butter.","Whisk eggs and sugar.","Fold in flour, bake 9 mins."], img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80" },
      { a: "lina", c: "salads", title: "Citrus Quinoa Salad", summary: "Bright, zesty quinoa with orange, herbs and almonds.", time: 25, diff: "Easy", ing: ["Quinoa","Orange","Parsley","Mint","Almonds","Olive oil"], steps: ["Cook quinoa, cool.","Segment orange.","Toss with herbs and nuts."], img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
      { a: "amy.w", c: "lunch", title: "Garden Caprese Sandwich", summary: "Fresh mozzarella, tomato and basil on ciabatta.", time: 10, diff: "Easy", ing: ["Ciabatta","Mozzarella","Tomato","Basil","Olive oil","Balsamic"], steps: ["Slice roll.","Layer cheese, tomato, basil.","Drizzle oil and balsamic."], img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
      { a: "marco", c: "dinner", title: "One-Pan Tomato Basil Pasta", summary: "A 20-minute weeknight pasta bursting with fresh tomato.", time: 25, diff: "Easy", ing: ["Pasta","Cherry tomatoes","Garlic","Basil","Parmesan","Olive oil"], steps: ["Simmer tomatoes and garlic.","Cook pasta in the sauce.","Toss with basil and parmesan."], img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80" },
      { a: "priya.k", c: "drinks", title: "Cardamom Rose Chai", summary: "Fragrant masala chai with a floral finish.", time: 15, diff: "Easy", ing: ["Milk","Black tea","Cardamom","Ginger","Rose water","Sugar"], steps: ["Simmer spices in water.","Add tea and milk.","Strain, add rose water."], img: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80" },
      { a: "priya.k", c: "desserts", title: "Berry Yogurt Parfait", summary: "Layers of yogurt, granola and summer berries.", time: 8, diff: "Easy", ing: ["Yogurt","Granola","Strawberries","Blueberries","Honey"], steps: ["Layer yogurt and berries.","Top with granola.","Drizzle honey."], img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" },
    ];

    let count = 0;
    for (const r of recipes) {
      const cat = await catId(r.c);
      const slug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const q = await pool.query(
        `insert into recipes (author_id, category_id, title, slug, summary, image_url, servings, prep_minutes, difficulty, ingredients, steps, is_published, featured)
         values ($1,$2,$3,$4,$5,$6,4,$7,$8,$9,$10,true,$11)
         on conflict (slug) do nothing`,
        [uid(r.a), cat, r.title, slug, r.summary, r.img, r.time, r.diff.toLowerCase(), r.ing, r.steps, !!r.feat]
      );
      if (q.rowCount !== null && q.rowCount > 0) count++;
    }

    return NextResponse.json({
      ok: true,
      message: `Seeded ${count} recipes, ${userIds.length} users, ${cats.length} categories`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
