# 🌤️ Weather App

A modern, full-stack weather application built with **Node.js**, **Express.js**, and **Vanilla JavaScript**. Features real-time weather data, intelligent autocomplete, caching, and a beautiful responsive UI.

## 🚀 Live Demo

**[View Live Demo →](your-deployed-url-here)**

## ✨ Features

### 🎯 Core Functionality
- **Real-time Weather Data** - Current weather conditions for any city worldwide
- **Geolocation Support** - Automatically detects user's location
- **Smart City Search** - Intelligent autocomplete with instant suggestions
- **Temperature Units** - Switch between Celsius and Fahrenheit
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### ⚡ Performance & UX
- **Lightning-fast Autocomplete** - 150ms debounce with caching
- **Keyboard Navigation** - Arrow keys, Enter, and Escape support
- **Request Cancellation** - Cancels slow requests for better performance
- **Visual Feedback** - Loading states, error handling, and smooth animations
- **Offline-first Caching** - Reduces API calls and improves speed

### 🛡️ Backend Features
- **Rate Limiting** - Prevents API abuse and manages costs
- **Input Validation** - Secure data handling with express-validator
- **Error Handling** - Comprehensive error management
- **Security Headers** - Helmet.js for production security
- **Request Compression** - Gzip compression for faster loading

## 🛠️ Tech Stack

### Frontend
- **Vanilla JavaScript** - Modern ES6+ with classes and async/await
- **CSS3** - Custom styling with animations and responsive design
- **HTML5** - Semantic markup with accessibility features

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Fast, minimalist web framework
- **Axios** - HTTP client for API requests
- **Node-Cache** - In-memory caching for performance

### APIs & Services
- **OpenWeatherMap API** - Weather data and geocoding
- **Geolocation API** - User location detection

### DevOps & Tools
- **Nodemon** - Development server with hot reload
- **Helmet.js** - Security middleware
- **Express Rate Limit** - API rate limiting
- **Compression** - Response compression middleware


## 📁 Project Structure

```
weather-app/
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── server/                # Backend application
│   ├── app.js            # Main server file
│   ├── package.json      # Server dependencies
│   ├── routes/           # API routes
│   │   └── weather.js    # Weather API endpoints
│   └── public/           # Frontend files
│       ├── index.html    # Main HTML file
│       ├── main.js       # Client-side JavaScript
│       ├── style.css     # Styling
│       └── img/          # Images

📱 To run your new professional app:

1. Clone the repo
2. cd server
3. npm install
4. Create .env with your API key
5. npm run dev
6. Visit localhost:3000