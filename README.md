# React Globe App 🌍

An interactive 3D globe built with React and Three.js that displays world countries with hover effects and click interactions.

## Features

- 🌍 Interactive 3D globe with realistic earth textures
- 🏠 Country hover effects with elevation and color changes
- 📊 GDP-based color coding for countries
- 🖱️ Click events for country selection
- 📱 Responsive design
- ⚡ Smooth animations and transitions

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build
npm run serve
```

## Dependencies

- `react-globe.gl` - 3D globe component
- `d3-scale` - Color scaling
- `d3-scale-chromatic` - Color schemes
- `three` - 3D graphics library

## Data

The app uses GeoJSON data for world countries with properties for:
- Country names and ISO codes
- GDP estimates
- Population data

## Development

```bash
# Start with hot reload
npm run dev

# Analyze bundle size
npm run analyze

# Format code
npx prettier --write src/
```

## License

MIT
