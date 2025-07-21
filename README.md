# Better Together

A React TypeScript application for exploring love, connection, and desire privately.

## Features

- **Fantasy Page**: Build and explore intimate scenarios with your partner
- **Journal Page**: Write thoughts, voice notes, and reflections with timestamped entries
- **Quiz Page**: Take turns answering and reflecting together
- **Home Page**: Welcome screen with navigation

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

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **CSS** - Styling

Built with love by Kitso.
