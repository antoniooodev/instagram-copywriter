<div align="center">

# 📸 Instagram Copywriter - IG Content Generator

**AI-powered Instagram content creation platform for brands and artisans**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

Instagram Copywriter is a full-stack application that generates authentic, brand-aligned Instagram content using AI vision and language models. Upload product images, configure your brand identity, and receive ready-to-publish captions with optimized hashtags.

Built for artisans, small businesses, and content creators who want to maintain a consistent social media presence without spending hours on copywriting.

## ✨ Features

### 🤖 AI-Powered Content Generation

- **Vision Analysis**: GPT-4o analyzes product images to generate contextually relevant captions
- **Brand Voice Consistency**: Maintains your unique tone across all posts
- **Smart Hashtag Generation**: Auto-generates relevant hashtags while respecting required brand tags

### 📅 Weekly Content Planning

- **Schedule Builder**: Plan 1-7 posts per week with automatic day assignment
- **Template System**: 4 content templates (Object, Detail, Process, Story)
- **CTA Integration**: Optional Sunday call-to-action posts

### 🔧 Customization

- **Voice Modes**: Minimal, Warm, Professional
- **CTA Styles**: DM, Link in Bio, Event-based
- **Availability Policies**: Control product availability mentions

## 🖼️ Demo

<div align="center">

|                Brand Configuration                 |              Content Generation              |              Results View               |
| :------------------------------------------------: | :------------------------------------------: | :-------------------------------------: |
| Configure your brand identity, hashtags, and voice | Set campaign goals and upload product images | Review and export ready-to-post content |

</div>

## 🛠️ Tech Stack

### Backend

| Technology        | Purpose                  |
| ----------------- | ------------------------ |
| **FastAPI**       | REST API framework       |
| **OpenAI GPT-4o** | Vision & text generation |
| **Pydantic**      | Data validation          |
| **Uvicorn**       | ASGI server              |

### Frontend

| Technology        | Purpose      |
| ----------------- | ------------ |
| **React 18**      | UI framework |
| **Vite**          | Build tool   |
| **Tailwind CSS**  | Styling      |
| **Framer Motion** | Animations   |
| **Lucide Icons**  | Icon library |

## 📦 Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API Key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/instagram-copywriter.git
cd instagram-copywriter
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API key
# Edit main.py and replace OPENAI_API_KEY value
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

## 🚀 Usage

### Start the Backend

```bash
cd backend
source venv/bin/activate
python main.py
```

Server runs at `http://localhost:8000`

### Start the Frontend (Development)

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`

### Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve with backend (static files from dist/)
cd backend && python main.py
```

## 📖 User Guide

### Step 1: Brand Configuration

- Enter your **brand name** and **description**
- Add a **tagline** (used as post closing line)
- Configure **required hashtags** (always included)
- Add **additional hashtags** (brand-specific)

### Step 2: Campaign Setup

- Define your weekly **goal** and **theme**
- Select **number of posts** (1-7)
- Choose **voice** (Minimal/Warm/Professional)
- Configure **CTA mode** (DM/Link in Bio/Event)

### Step 3: Image Upload

- Upload product images with naming convention:
  - `oggetto_*.jpg` - Main product shots
  - `dettaglio_*.jpg` - Detail/close-up shots
  - `processo_*.jpg` - Process/making-of shots
  - `storia_*.jpg` - Story/lifestyle shots

### Step 4: Review & Export

- Preview generated captions with Instagram mock
- Copy individual captions to clipboard
- Export full campaign as JSON

## 🔌 API Documentation

### Endpoints

#### `POST /upload-multiple`

Upload product images.

```bash
curl -X POST "http://localhost:8000/upload-multiple" \
  -F "files=@oggetto_product1.jpg" \
  -F "files=@dettaglio_product1.jpg"
```

#### `POST /generate`

Generate Instagram content.

```json
{
  "brand_name": "Artisan Studio",
  "brand_description": "Handcrafted wooden jewelry",
  "brand_tagline": "Crafted with passion",
  "required_hashtags": ["#handmade", "#woodwork"],
  "goal": "Increase engagement by 20%",
  "theme": "Spring Collection 2025",
  "n_posts": 5,
  "voice": "minimal",
  "cta_mode": "dm",
  "images": ["/uploads/oggetto_ring.jpg"]
}
```

#### `GET /schedule-preview?n_posts=5`

Preview weekly schedule.

```json
{
  "n_posts": 5,
  "schedule": [
    { "day_code": "mon", "day_name": "Lunedì", "template_id": "T1_OGGETTO" },
    { "day_code": "tue", "day_name": "Martedì", "template_id": "T2_DETTAGLIO" }
  ]
}
```

### Response Schema

```typescript
interface GenerationResponse {
  week_brief: {
    week_id: string;
    theme: string;
    goal: string;
    voice: string;
    keywords: string[];
    cta: { text: string; mode: string };
  };
  posts: Array<{
    day_name: string;
    template_id: string;
    post_role: string;
    title: string | null;
    caption: string;
    ig_caption_full: string;
    image_url: string;
    content: {
      hashtags: string[];
      alt_text: string;
      visual_description: string;
    };
  }>;
}
```

## 📁 Project Structure

```
instagram-copywriter/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── copywriter.py        # AI generation logic
│   ├── requirements.txt     # Python dependencies
│   └── uploads/             # Uploaded images (gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   └── index.css        # Tailwind + custom styles
│   ├── public/              # Static assets
│   ├── dist/                # Production build
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
│
└── README.md
```

## ⚙️ Configuration

### Environment Variables

| Variable         | Description    | Default   |
| ---------------- | -------------- | --------- |
| `OPENAI_API_KEY` | OpenAI API key | Required  |
| `HOST`           | Server host    | `0.0.0.0` |
| `PORT`           | Server port    | `8000`    |

### Content Templates

| Template       | Use Case           | Title Rule      |
| -------------- | ------------------ | --------------- |
| `T1_OGGETTO`   | Main product       | No title        |
| `T2_DETTAGLIO` | Close-ups          | Optional title  |
| `T3_PROCESSO`  | Behind-the-scenes  | Short title     |
| `T4_STORIA`    | Brand storytelling | Evocative title |

### Voice Modes

| Voice          | Description                |
| -------------- | -------------------------- |
| `minimal`      | Clean, essential, no fluff |
| `warm`         | Friendly, approachable     |
| `professional` | Formal, business-oriented  |

## 🔒 Security

- API keys are stored server-side only
- No client-side exposure of sensitive credentials
- Image uploads are validated for type and size
- CORS configured for local development

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Backend (with hot reload)
cd backend
uvicorn main:app --reload

# Frontend (with HMR)
cd frontend
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UI inspiration from [ReactBits.dev](https://reactbits.dev)
- Icons by [Lucide](https://lucide.dev)
- AI powered by [OpenAI](https://openai.com)

---

<div align="center">

**Built with ❤️ for artisans and creators**

[Report Bug](https://github.com/yourusername/instagram-copywriter/issues) • [Request Feature](https://github.com/yourusername/instagram-copywriter/issues)

</div>
