Sure! Here’s your **updated README** with the deployment URL section updated and ready for a **clickable screenshot/banner**. I’ve also added a markdown image section so you can include a screenshot linking to your live app.

---

````markdown
# 🍳 Smart Recipe Generator

**Smart Recipe Generator** is an intelligent web application that helps users discover recipes based on the ingredients they already have.  
It uses AI-powered ingredient recognition, smart recipe matching, and a beautiful modern UI to create a seamless cooking experience.

---

## 🌐 Live Demo

[![Smart Recipe Generator](./1.png)](https://smart-recipe-generator-unthinkable.vercel.app/)  
Click the image or visit: [https://smart-recipe-generator-unthinkable.vercel.app/](https://smart-recipe-generator-unthinkable.vercel.app/)

---

## 🚀 Features

### 🔍 **1. Intelligent Recipe Search**

* Smart ingredient matching (≥50% compatibility)
* Match scoring and sorting
* Ingredient substitution suggestions
* Filters for diet, difficulty, and cooking time

### 🤖 2. AI Recipe Generation (LLM-Powered)

* Uses a Large Language Model (LLM) to generate recipes dynamically
* Generates **3 custom recipes** based on user input: stir-fry, salad, and soup
* Includes **nutritional data** (calories, protein, carbs, fat) for each recipe
* Provides **step-by-step cooking instructions** tailored to ingredients

### 🖼️ **3. Image Recognition**

* Uses **Hugging Face DETR model** for ingredient detection
* Recognizes common fruits, vegetables, and cooking items
* Converts detected objects into usable ingredient names
* Graceful fallback when API is unavailable

### ⭐ **4. User Experience**

* Save & rate favorite recipes
* Anonymous user system (localStorage)
* Mobile-friendly responsive UI
* “Clear All” functionality with smart visual cues

---

## 🏗️ Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| **Frontend**   | React 18.3.1 + TypeScript             |
| **Styling**    | Tailwind CSS 3.4.1                    |
| **Build Tool** | Vite 5.4.2                            |
| **Icons**      | Lucide React                          |
| **Backend**    | Supabase (PostgreSQL + RLS)           |
| **AI / ML**    | Hugging Face DETR for image detection |
| **Hosting**    | Vercel / Netlify (recommended)        |

---

## 🧠 Core Architecture

### 🗃️ **Database Schema**

#### `recipes` Table

```sql
id UUID PRIMARY KEY,
name TEXT,
description TEXT,
ingredients JSONB,
instructions TEXT[],
image_url TEXT,
cooking_time INT,
difficulty TEXT,
diet_type TEXT[],
calories FLOAT,
protein FLOAT,
carbs FLOAT,
fat FLOAT,
created_at TIMESTAMP
````

#### `favorites` Table

```sql
id UUID PRIMARY KEY,
user_id TEXT,
recipe_id UUID REFERENCES recipes(id),
rating INTEGER,
created_at TIMESTAMP
```

---

## 🧩 Smart Algorithms

### 🥘 **Recipe Matching**

1. Normalize ingredient names
2. Match using partial string similarity
3. Compute score: `(matched / total) × 100`
4. Filter ≥50% match
5. Sort by relevance

### 🧂 **Ingredient Substitution**

* Common mapping (e.g., butter → olive oil)
* Suggests smart replacements based on recipe context

### 🤖 **AI Recipe Generation**

* Template system: stir-fry, salad, soup
* Dynamic ingredient quantities
* Nutritional estimates
* Step-by-step instructions

---

## 🎨 UI/UX Highlights

* **Glassmorphism design** with backdrop blur
* **Emerald–teal gradient palette**
* **Modern typography and smooth animations**
* **Accessible design** (keyboard & contrast compliant)
* **Components:**

  * `IngredientInput` (with image upload + clear all)
  * `RecipeCard` (match % indicator)
  * `FilterBar` (gradient filter buttons)
  * `RecipeModal` (details + AI generation)

---

## 🔒 Security

* Row-Level Security (RLS) in Supabase
* Anonymous user data (no sensitive info)
* Input & file validation
* Robust error handling

---

## ⚙️ Performance & Optimization

* Vite’s fast HMR & optimized builds
* Code splitting and lazy loading
* Indexed DB queries for filters
* Cached image resources

---

## 📈 Scalability

* Stateless frontend → easy horizontal scaling
* Supabase auto-scaling backend
* Ready for CDN distribution

**Future Enhancements:**

* Real-time Supabase updates
* Authenticated user accounts
* Recipe sharing & community ratings
* PWA (offline support)
* AI-powered personalized recommendations

---

## 🧰 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Sumanth1739/SmartRecipeGenerator-Unthinkable-.git
cd SmartRecipeGenerator-Unthinkable-

# Install dependencies
npm install

# Add your environment variables
# Example: .env
VITE_HUGGINGFACE_API_TOKEN=your_token_here
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_KEY=your_key

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing

* Unit & component testing with React Testing Library
* API mock tests for recipe and ingredient detection

---

## 🧑‍💻 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push branch: `git push origin feature-name`
5. Create a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to modify and use it with attribution.

---

## 💖 Credits

* **Developer:** Sumanth Reddy
* **AI Model:** Hugging Face DETR
* **Database & Auth:** Supabase
* **UI Design:** Tailwind CSS + Lucide Icons

```

---

✅ **Notes:**
- Replace `./screenshot.png` with your actual screenshot file in your repo.  
- The image is clickable and links to your live app at: `https://smart-recipe-generator-unthinkable.vercel.app/`  

---

If you want, I can **also make a nicer header/banner with emojis and badges** for GitHub that makes the README stand out.  

Do you want me to do that?
```
