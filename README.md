# Grape Master Web

A full-stack web application with React frontend and Node.js backend.

## 📁 Project Structure

```
Grape-Master/
├── client/          # React frontend (Vite + TailwindCSS)
├── server/          # Node.js backend (Express)
├── .gitignore       # Root level gitignore
└── README.md        # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nikhilw101/GrapeMasterWeb.git
cd GrapeMasterWeb
```

2. Install dependencies for both client and server:

**Client Setup:**
```bash
cd client
npm install
cp .env.example .env
# Configure your environment variables in .env
```

**Server Setup:**
```bash
cd ../server
npm install
cp .env.example .env
# Configure your environment variables in .env
```

## 💻 Development

### Running the Frontend

```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal).

### Running the Backend

```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

The backend API will be available at `http://localhost:3000` (or configured port).

## 📦 Building for Production

### Frontend Build

```bash
cd client
npm run build
```

The production build will be in the `client/dist` folder.

### Backend Build

The backend is typically run directly with Node.js in production. Ensure all environment variables are properly configured.

## 🌐 Deployment

This monorepo structure supports various deployment strategies:

- **Frontend**: Can be deployed to Vercel, Netlify, or any static hosting
- **Backend**: Can be deployed to Render, Railway, Heroku, or any Node.js hosting

See individual README files in `client/` and `server/` folders for more detailed documentation.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- TailwindCSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB/PostgreSQL (check server README)

## 📝 Environment Variables

Both client and server require environment variables. Example files are provided:
- `client/.env.example`
- `server/.env.example`

Copy these to `.env` and configure with your values.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Nikhil**

- GitHub: [@Nikhilw101](https://github.com/Nikhilw101)

## 🙏 Acknowledgments

- Thanks to all contributors
- Built with modern web technologies
