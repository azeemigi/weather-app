import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState('');

  const getWeather = async () => {
    try {
      const response = await fetch(`/weather?city=${city}`);
      const data = await response.json();
      setWeather(data.weather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeather('Failed to fetch weather data');
    }
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={getWeather}>Get Weather</button>
      <div>{weather}</div>
    </div>
  );
}

export default App;
