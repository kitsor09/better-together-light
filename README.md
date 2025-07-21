# Better Together

A React TypeScript application for exploring love, connection, and desire privately.

## Features

### 🔒 **Security & Privacy**
- **PIN Lock**: Secure your private data with a PIN that never leaves your device
- **Offline Storage**: All data is stored locally on your device using IndexedDB
- **No Cloud**: Your intimate moments stay completely private

### 📓 **Enhanced Journal**
- **Text Entries**: Write your thoughts and reflections
- **Voice Notes**: Record audio messages with professional quality
- **Photo Journal**: Upload and store photos with your entries
- **Mixed Media**: Combine text, voice, and photos in single entries
- **Timestamped**: All entries automatically timestamped

### 📅 **Calendar & Events**
- **Event Tracking**: Add anniversaries, date nights, and special moments
- **Reminders**: Set up recurring reminders for important dates
- **Visual Calendar**: Beautiful month view with event indicators
- **Event Types**: Categorize events (anniversaries, dates, cycle-related, etc.)

### 🔥 **Fantasy Builder** *(Coming Soon)*
- **Modular Stories**: Choose scenes and generate personalized stories
- **Templates**: Pre-built romantic, adventurous, and intimate scenarios
- **Custom Elements**: Add your own personal touches

### 🌸 **Cycle Tracking** *(Coming Soon)*
- **Menstrual Tracking**: Monitor cycle patterns and symptoms
- **Mood Tracking**: Record emotional changes throughout the cycle
- **Health Insights**: Track symptoms and wellness patterns

### 🌙 **Moon Cycle Rituals** *(Coming Soon)*
- **Lunar Alignment**: Track moon phases and their meanings
- **Ritual Suggestions**: Activities aligned with lunar cycles
- **Cycle Synchronization**: Connect with natural rhythms

### 💬 **Couples Quiz** *(Coming Soon)*
- **Relationship Questions**: Thought-provoking conversation starters
- **Discovery Game**: Learn new things about each other
- **Connection Building**: Deepen your bond through meaningful dialogue

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:
```bash
npm run typecheck
```

## Project Structure

```
├── src/                 # React application source
│   ├── App.tsx         # Main application component
│   ├── App.css         # Application styles
│   └── main.tsx        # React entry point
├── app/                # Page components
│   ├── fantasy/        # Fantasy exploration page
│   ├── journal/        # Personal journal page
│   └── quiz/           # Couples quiz page
├── dist/               # Production build output
└── public/             # Static assets
```

## Technology Stack

- **React 19** - Modern UI framework with hooks
- **TypeScript** - Full type safety and better development experience
- **Vite** - Lightning-fast build tool and development server
- **LocalForage** - Robust offline storage with IndexedDB, WebSQL, and localStorage fallbacks
- **Web APIs** - MediaRecorder for voice, File API for photos, Crypto API for PIN security
- **Progressive CSS** - Responsive design with mobile-first approach

## Privacy & Security

✅ **100% Local Storage** - All data stays on your device  
✅ **No Internet Required** - Works completely offline  
✅ **PIN Protection** - Secure access with hashed PIN  
✅ **No Analytics** - No tracking or data collection  
✅ **Open Source** - Full transparency  

## Browser Compatibility

- ✅ Chrome/Edge 88+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Mobile browsers with modern API support

Built with love by Kitso. 💝
