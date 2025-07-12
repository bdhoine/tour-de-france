# Tour de France Prognosis

A modern web application to display and explore Tour de France rider prognosis data from 78 participants.

## Features

- 📊 Interactive table showing all participants
- 🔍 Real-time search functionality
- 👤 Detailed view of each participant's rider selections
- 📱 Responsive design for all devices
- ⚡ Fast and modern development setup with Vite

## Project Structure

```
tour-de-france/
├── src/
│   ├── css/
│   │   └── styles.css          # Application styles
│   └── js/
│       ├── main.js            # Application entry point
│       ├── data.js            # Data management module
│       └── ui.js              # UI management module
├── public/
│   └── data.json              # Tour de France prognosis data
├── data/                      # Original screenshot data
├── index.html                 # Main HTML file
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm start` - Alias for `npm run dev`

## Data Structure

The application uses a JSON dataset with 78 participants, each containing:

- `id`: Unique identifier
- `name`: Participant name
- `riders`: Array of 15 rider names (10 main + 5 reserves)

## Development

The project follows modern web development best practices:

- ✅ **Modular JavaScript** - ES6 modules for better organization
- ✅ **Separation of Concerns** - Data, UI, and application logic separated
- ✅ **Modern CSS** - Flexbox, Grid, and CSS custom properties
- ✅ **Development Server** - Hot reload with Vite
- ✅ **Error Handling** - Proper error handling and user feedback
- ✅ **Responsive Design** - Mobile-first approach

## Browser Support

- Modern browsers supporting ES6 modules
- Chrome, Firefox, Safari, Edge (latest versions)

## License

MIT