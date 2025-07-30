const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { body, query, validationResult } = require('express-validator');

const router = express.Router();

// Cache for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Validation middleware
const validateCity = [
    query('city')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('City name must be between 1 and 100 characters')
        .matches(/^[a-zA-Z\s,.-]+$/)
        .withMessage('City name contains invalid characters')
];

const validateCoordinates = [
    query('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    query('lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180')
];

// Error handler for validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Get weather by city name
router.get('/current', validateCity, handleValidationErrors, async (req, res) => {
    try {
        const { city, units = 'metric' } = req.query;
        const cacheKey = `weather_${city}_${units}`;
        
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json({
                ...cachedData,
                cached: true,
                timestamp: new Date().toISOString()
            });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: units
            },
            timeout: 5000
        });

        const weatherData = {
            location: {
                name: response.data.name,
                country: response.data.sys.country,
                coordinates: {
                    lat: response.data.coord.lat,
                    lon: response.data.coord.lon
                }
            },
            weather: {
                main: response.data.weather[0].main,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            },
            temperature: {
                current: Math.round(response.data.main.temp),
                feels_like: Math.round(response.data.main.feels_like),
                min: Math.round(response.data.main.temp_min),
                max: Math.round(response.data.main.temp_max)
            },
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            wind: {
                speed: response.data.wind.speed,
                direction: response.data.wind.deg
            },
            visibility: response.data.visibility,
            sunrise: new Date(response.data.sys.sunrise * 1000).toISOString(),
            sunset: new Date(response.data.sys.sunset * 1000).toISOString(),
            timezone: response.data.timezone,
            cached: false,
            timestamp: new Date().toISOString()
        };

        // Cache the response
        cache.set(cacheKey, weatherData);

        res.json(weatherData);
    } catch (error) {
        console.error('Weather API Error:', error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                error: 'City not found',
                message: 'Please check the city name and try again'
            });
        }
        
        if (error.response?.status === 401) {
            return res.status(500).json({
                error: 'API configuration error',
                message: 'Weather service temporarily unavailable'
            });
        }

        res.status(500).json({
            error: 'Failed to fetch weather data',
            message: 'Please try again later'
        });
    }
});

// Get weather by coordinates
router.get('/coordinates', validateCoordinates, handleValidationErrors, async (req, res) => {
    try {
        const { lat, lon, units = 'metric' } = req.query;
        const cacheKey = `weather_coord_${lat}_${lon}_${units}`;
        
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json({
                ...cachedData,
                cached: true,
                timestamp: new Date().toISOString()
            });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                appid: API_KEY,
                units: units
            },
            timeout: 5000
        });

        const weatherData = {
            location: {
                name: response.data.name,
                country: response.data.sys.country,
                coordinates: {
                    lat: response.data.coord.lat,
                    lon: response.data.coord.lon
                }
            },
            weather: {
                main: response.data.weather[0].main,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            },
            temperature: {
                current: Math.round(response.data.main.temp),
                feels_like: Math.round(response.data.main.feels_like),
                min: Math.round(response.data.main.temp_min),
                max: Math.round(response.data.main.temp_max)
            },
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            wind: {
                speed: response.data.wind.speed,
                direction: response.data.wind.deg
            },
            visibility: response.data.visibility,
            sunrise: new Date(response.data.sys.sunrise * 1000).toISOString(),
            sunset: new Date(response.data.sys.sunset * 1000).toISOString(),
            timezone: response.data.timezone,
            cached: false,
            timestamp: new Date().toISOString()
        };

        cache.set(cacheKey, weatherData);
        res.json(weatherData);
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch weather data',
            message: 'Please try again later'
        });
    }
});

// Get city suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }

        const cacheKey = `suggestions_${q}_${limit}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            return res.json(cachedData);
        }

        const response = await axios.get(`${GEO_URL}/direct`, {
            params: {
                q: q.trim(),
                limit: parseInt(limit),
                appid: API_KEY
            },
            timeout: 5000
        });

        const suggestions = response.data.map(city => ({
            name: city.name,
            state: city.state || '',
            country: city.country,
            lat: city.lat,
            lon: city.lon,
            displayName: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`
        }));

        cache.set(cacheKey, suggestions, 3600); // Cache for 1 hour
        res.json(suggestions);
    } catch (error) {
        console.error('Geocoding API Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch city suggestions',
            message: 'Please try again later'
        });
    }
});

// Get 5-day forecast
router.get('/forecast', validateCity, handleValidationErrors, async (req, res) => {
    try {
        const { city, units = 'metric' } = req.query;
        const cacheKey = `forecast_${city}_${units}`;
        
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json({
                ...cachedData,
                cached: true,
                timestamp: new Date().toISOString()
            });
        }

        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                q: city,
                appid: API_KEY,
                units: units
            },
            timeout: 5000
        });

        const forecastData = {
            location: {
                name: response.data.city.name,
                country: response.data.city.country,
                coordinates: {
                    lat: response.data.city.coord.lat,
                    lon: response.data.city.coord.lon
                }
            },
            forecast: response.data.list.map(item => ({
                datetime: item.dt_txt,
                temperature: {
                    current: Math.round(item.main.temp),
                    feels_like: Math.round(item.main.feels_like),
                    min: Math.round(item.main.temp_min),
                    max: Math.round(item.main.temp_max)
                },
                weather: {
                    main: item.weather[0].main,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                },
                humidity: item.main.humidity,
                wind: {
                    speed: item.wind.speed,
                    direction: item.wind.deg
                },
                pop: item.pop // Probability of precipitation
            })),
            cached: false,
            timestamp: new Date().toISOString()
        };

        cache.set(cacheKey, forecastData);
        res.json(forecastData);
    } catch (error) {
        console.error('Forecast API Error:', error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                error: 'City not found',
                message: 'Please check the city name and try again'
            });
        }

        res.status(500).json({
            error: 'Failed to fetch forecast data',
            message: 'Please try again later'
        });
    }
});

module.exports = router;