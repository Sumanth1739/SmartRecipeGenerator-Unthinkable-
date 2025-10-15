# 🍳 Smart Recipe Generator

**Smart Recipe Generator** is an intelligent web application that helps users discover recipes based on the ingredients they already have.  
It uses AI-powered ingredient recognition, smart recipe matching, and a beautiful modern UI to create a seamless cooking experience.

---

## 🌐 Live Demo

[![Smart Recipe Generator](./1.png)](https://smart-recipe-generator-unthinkable.vercel.app/)  
Click the image or visit: [https://smart-recipe-generator-unthinkable.vercel.app/](https://smart-recipe-generator-unthinkable.vercel.app/)

---

## 🚀 Features

### 🔍 1. Intelligent Recipe Search
- Smart ingredient matching (≥50% compatibility)
- Match scoring and sorting
- Ingredient substitution suggestions
- Filters for diet, difficulty, and cooking time

### 🤖 2. AI Recipe Generation (LLM-Powered)
- Uses a Large Language Model (LLM) to generate recipes dynamically
- Generates **3 custom recipes** based on user input: stir-fry, salad, and soup
- Includes **nutritional data** (calories, protein, carbs, fat)
- Provides **step-by-step cooking instructions** tailored to ingredients

### 🖼️ 3. Image Recognition
- Uses **Hugging Face DETR model** for ingredient detection
- Recognizes common fruits, vegetables, and cooking items
- Converts detected objects into usable ingredient names
- Graceful fallback when API is unavailable

### ⭐ 4. User Experience
- Save & rate favorite recipes
- Anonymous user system (localStorage)
- Mobile-friendly responsive UI
- “Clear All” functionality with smart visual cues

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

### 🗃️ Database Schema

#### `recipes` Table

| Column         | Type          | Description                          |
| -------------- | ------------- | ------------------------------------ |
| id             | UUID          | Primary Key                           |
| name           | TEXT          | Recipe name                           |
| description    | TEXT          | Short description                     |
| ingredients    | JSONB         | Ingredient list with quantities       |
| instructions   | TEXT[]        | Step-by-step instructions             |
| image_url      | TEXT          | Link to recipe image                  |
| cooking_time   | INT           | Cooking time in minutes               |
| difficulty     | TEXT          | Difficulty level (Easy/Medium/Hard)  |
| diet_type      | TEXT[]        | Vegetarian, Vegan, etc.               |
| calories       | FLOAT         | Nutritional info                       |
| protein        | FLOAT         | Nutritional info                       |
| carbs          | FLOAT         | Nutritional info                       |
| fat            | FLOAT         | Nutritional info                       |
| created_at     | TIMESTAMP     | Record creation timestamp             |

#### `favorites` Table

| Column      | Type      | Description                         |
| ----------- | -------- | ----------------------------------- |
| id          | UUID      | Primary Key                          |
| user_id     | TEXT      | Anonymous or authenticated user      |
| recipe_id   | UUID      | References `recipes(id)`             |
| rating      | INTEGER   | User rating                          |
| created_at  | TIMESTAMP | Record creation timestamp            |

---

## 🧩 Smart Algorithms

### 🥘 Recipe Matching
1. Normalize ingredient names
2. Match using partial string similarity
3. Compute score: `(matched / total) × 100`
4. Filter ≥50% match
5. Sort by relevance

### 🧂 Ingredient Substitution
- Common mapping (e.g., butter → olive oil)
- Suggests smart replacements based on recipe context

### 🤖 AI Recipe Generation
- Template system: stir-fry, salad, soup
- Dynamic ingredient quantities
- Nutritional estimates
- Step-by-step instructions

---

## 🎨 UI/UX Highlights
- **Glassmorphism design** with backdrop blur
- **Emerald–teal gradient palette**
- **Modern typography and smooth ani**
