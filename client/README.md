# GrapeMaster - Premium Fresh Grapes E-Commerce

A modern, premium e-commerce web application built with React, Vite, Tailwind CSS, Shadcn UI, and Framer Motion.

## Features

- 🍇 **Premium Design** - Calm, professional UI with realistic product photography
- 🎨 **Modern UI Components** - Built with Shadcn UI and Radix UI primitives
- ✨ **Smooth Animations** - Powered by Framer Motion for silky interactions
- 📱 **Mobile-First** - Fully responsive design optimized for all devices
- 🛒 **Shopping Cart** - Complete cart functionality with localStorage persistence
- ❤️ **Wishlist** - Save favorite products for later
- ♿ **Accessible** - ARIA-compliant components with keyboard navigation

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Custom hooks with localStorage

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional Shadcn components (if needed):
```bash
npx shadcn-ui@latest add [component-name]
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── layout/          # Header, Footer
│   │   ├── home/            # Home page sections
│   │   ├── product/         # Product components
│   │   └── cart/            # Cart drawer
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (cn function)
│   ├── constants/           # Config, products, categories
│   ├── styles/              # Global CSS
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
└── index.html              # HTML template
```

## Key Features

### Design System
- Custom green color palette for grape theme
- Inter/Poppins fonts from Google Fonts
- Consistent spacing and rounded corners
- Subtle shadows and smooth transitions

### Animations
- Hero section slide-in animations
- Product card hover effects with scale
- Category icon wiggle on hover
- Stagger animations for lists
- Smooth cart drawer slide-in
- Spring animations for natural feel

### State Management
- `useCart` - Shopping cart with localStorage
- `useWishlist` - Wishlist persistence
- `useLocalStorage` - Generic local storage hook

## Future Enhancements

- Backend API integration (base URL ready in config)
- User authentication
- Payment processing
- Product search and filtering
- Order history
- Product reviews and ratings

## License

MIT

---

Built with ❤️ using modern web technologies
