class WeatherApp {
    constructor() {
        this.apiBase = '/api/weather';
        this.initializeElements();
        this.attachEventListeners();
        this.loadUserPreferences();
        this.initializeGeolocation();
    }

    initializeElements() {
        this.searchBox = document.querySelector('.search input');
        this.searchBtn = document.querySelector('.search button');
        this.weatherIcon = document.querySelector('.weather-icon');
        this.suggestionEl = document.querySelector('.suggestions');
        this.errorEl = document.querySelector('.error');
        this.weatherEl = document.querySelector('.weather');
    }

    attachEventListeners() {
        this.searchBox.addEventListener('input', this.debounce(this.handleInput.bind(this), 300));
        this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
        this.searchBox.addEventListener('keypress', this.handleKeyPress.bind(this));
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search')) {
                this.clearSuggestions();
            }
        });
    }

    loadUserPreferences() {
        this.currentUnit = localStorage.getItem('weatherUnit') || 'metric';
    }

    async initializeGeolocation() {
        if (navigator.geolocation) {
            try {
                const position = await this.getCurrentPosition();
                await this.fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
            } catch (error) {
                console.log('Geolocation not available:', error.message);
                this.loadDefaultCity();
            }
        } else {
            this.loadDefaultCity();
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: true
            });
        });
    }

    loadDefaultCity() {
        const defaultCity = localStorage.getItem('lastSearchedCity') || 'New York';
        this.fetchWeather(defaultCity);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async handleInput() {
        const query = this.searchBox.value.trim();
        
        if (query.length < 2) {
            this.clearSuggestions();
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/suggestions?q=${encodeURIComponent(query)}`);
            const suggestions = await response.json();
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    displaySuggestions(suggestions) {
        this.suggestionEl.innerHTML = '';
        
        suggestions.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion';
            div.innerHTML = city.displayName;
            
            div.addEventListener('click', () => {
                this.searchBox.value = city.displayName;
                this.fetchWeather(city.name);
                this.clearSuggestions();
            });
            
            this.suggestionEl.appendChild(div);
        });
    }

    clearSuggestions() {
        this.suggestionEl.innerHTML = '';
    }

    handleSearch() {
        const city = this.searchBox.value.trim();
        if (city) {
            this.fetchWeather(city);
            this.clearSuggestions();
            this.searchBox.value = '';
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    showError(message = 'Invalid City Name') {
        this.errorEl.querySelector('p').textContent = message;
        this.errorEl.style.display = 'block';
        this.weatherEl.style.display = 'none';
    }

    async fetchWeather(city) {
        try {
            const response = await fetch(`${this.apiBase}/current?city=${encodeURIComponent(city)}&units=${this.currentUnit}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch weather data');
            }
            
            this.displayWeather(data);
            localStorage.setItem('lastSearchedCity', city);
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError(error.message);
        }
    }

    async fetchWeatherByCoordinates(lat, lon) {
        try {
            const response = await fetch(`${this.apiBase}/coordinates?lat=${lat}&lon=${lon}&units=${this.currentUnit}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch weather data');
            }
            
            this.displayWeather(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.loadDefaultCity();
        }
    }

    displayWeather(data) {
        document.querySelector('.city').textContent = `${data.location.name}, ${data.location.country}`;
        document.querySelector('.temp').textContent = `${data.temperature.current}°${this.currentUnit === 'metric' ? 'C' : 'F'}`;
        document.querySelector('.humidity').textContent = `${data.humidity}%`;
        
        const windSpeed = this.currentUnit === 'metric' ? 
            `${data.wind.speed} m/s` : 
            `${Math.round(data.wind.speed * 2.237)} mph`;
        document.querySelector('.wind').textContent = windSpeed;

        this.updateWeatherIcon(data.weather.main);
        
        this.weatherEl.style.display = 'block';
        this.errorEl.style.display = 'none';
    }

    updateWeatherIcon(weatherMain) {
        const iconMap = {
            'Clear': '/img/images/clear.png',
            'Clouds': '/img/images/clouds.png',
            'Rain': '/img/images/rain.png',
            'Drizzle': '/img/images/drizzle.png',
            'Mist': '/img/images/mist.png',
            'Snow': '/img/images/snow.png',
            'Thunderstorm': '/img/images/thunderstorm.png'
        };
        
        this.weatherIcon.src = iconMap[weatherMain] || '/img/images/rain.png';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});