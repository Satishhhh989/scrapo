# SCRAPO - Vintage AI Poetry Generator 🎭

A premium, aesthetic-first web application that generates vintage-styled poetry with AI. Built with the melancholic, nostalgic aesthetic inspired by Lana Del Rey.

![Made with ♥ by Satish](https://img.shields.io/badge/Made%20with%20%E2%99%A5%20by-Satish-red)

## ✨ Features

### Core Features
- **Ghost Writer Mode**: AI-powered poetry generation with character-by-character typewriter streaming
- **Vintage Aesthetic**: Film grain overlays, sepia tones, and nostalgic design elements
- **Responsive Design**: 
  - Mobile: Full-screen cinematic experience
  - Desktop: Tilted polaroid container with ambient effects
- **Mood System**: Four distinct poetry moods (Melancholic, Romantic, Rebellious, Dreamy)
- **The Vinyl Collection**: Gallery view of saved poems as vintage vinyl record sleeves
- **One-Click Export**: Generate beautiful PDFs with vintage styling and watermarks
- **Pen Name System**: Personalized experience with custom poet names

### Technical Features
- Real-time AI streaming with OpenRouter API
- Firebase Authentication (Email + Google Sign-In)
- Firestore database for poem storage
- Framer Motion animations
- TypeScript for type safety
- Custom Tailwind theme with vintage color palette

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- OpenRouter API account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd scrapo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# OpenRouter API (Keep this secret!)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Firebase Configuration (Public - Safe for client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Optional: Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Firebase**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or use existing one
   
   c. Enable Authentication:
      - Go to Authentication → Sign-in method
      - Enable "Email/Password"
      - Enable "Google" sign-in
   
   d. Create Firestore Database:
      - Go to Firestore Database
      - Create database (start in test mode for development)
      - Add these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Poems collection
    match /poems/{poemId} {
      allow read, write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

5. **Set up OpenRouter API**

   a. Go to [OpenRouter](https://openrouter.ai/)
   
   b. Sign up and get your API key
   
   c. Add credits to your account
   
   d. The app uses `deepseek/deepseek-chat` model by default

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
scrapo/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Secure API endpoint for AI
│   ├── history/
│   │   └── page.tsx               # Vinyl collection gallery
│   ├── login/
│   │   └── page.tsx               # Authentication page
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout with fonts
│   ├── page.tsx                   # Main chat interface
│   └── not-found.tsx              # 404 page
├── components/
│   ├── ChatMessage.tsx            # Message bubble component
│   ├── FloatingElements.tsx       # Ambient animations
│   ├── LoadingScreen.tsx          # Premium loading screen
│   ├── TypewriterText.tsx         # Streaming text effect
│   └── VinylCard.tsx              # Poem card component
├── lib/
│   ├── exportUtils.ts             # PDF/PNG export logic
│   ├── firebase.ts                # Firebase configuration
│   ├── types.ts                   # TypeScript interfaces
│   └── utils.ts                   # Utility functions
├── .env.local                     # Environment variables (create this)
├── middleware.ts                  # Next.js middleware
├── tailwind.config.ts             # Tailwind customization
└── package.json                   # Dependencies
```

## 🎨 Design System

### Color Palette
- **vintage-paper**: #FDFBF7 (Background)
- **ink-black**: #2A2A2A (Primary text)
- **cherry-red**: #8B0000 (Accents/CTA)
- **faded-gold**: #C5A059 (Borders/Highlights)
- **melancholy-blue**: #2C3E50 (Secondary text)

### Typography
- **Headings**: Cinzel / Playfair Display (Serif)
- **Body/Poems**: Courier Prime (Typewriter style)
- **UI Elements**: Montserrat (Sans-serif)

### Animations
- Typewriter streaming effect
- Floating ambient elements (petals, hearts, lyrics)
- Film grain and vintage overlays
- Smooth Framer Motion transitions

## 🔧 Configuration

### Change AI Model
Edit `app/api/generate/route.ts`:
```typescript
model: "deepseek/deepseek-chat", // Change this
```

### Adjust Typewriter Speed
Edit `components/TypewriterText.tsx`:
```typescript
speed={50} // milliseconds per character
```

### Modify Moods
Edit `lib/types.ts` to add/change moods:
```typescript
export const MOODS: Record<MoodType, string> = {
  // Add your custom moods here
};
```

## 📦 Build for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
Works with any Next.js hosting provider:
- Netlify
- Railway
- Render
- AWS Amplify

## 🐛 Troubleshooting

### "Firebase not initialized"
- Check that `.env.local` exists and has correct values
- Restart dev server after adding env variables

### "API Key not found"
- Ensure `OPENROUTER_API_KEY` is set in `.env.local`
- Don't commit `.env.local` to git (it's in .gitignore)

### Poems not saving
- Check Firebase security rules
- Verify user is authenticated
- Check browser console for errors

### Export not working
- Check browser console for canvas errors
- Ensure the poem element has an ID

## 🎯 Roadmap

- [ ] Add more AI models (GPT-4, Claude)
- [ ] Collaborative poem editing
- [ ] Social sharing features
- [ ] Audio recitation of poems
- [ ] Mobile app (React Native)
- [ ] Theme customization
- [ ] Import/Export poem collections

## 📝 License

MIT License - Feel free to use this project for your own purposes!

## 💝 Credits

- **Created by**: Satish
- **AI Model**: DeepSeek via OpenRouter
- **Design Inspiration**: Lana Del Rey aesthetic, vintage Polaroids
- **Fonts**: Google Fonts (Cinzel, Playfair Display, Courier Prime, Montserrat)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Made with ♥ by Satish** | [Report Issues](https://github.com/your-username/scrapo/issues)