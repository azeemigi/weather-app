import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";

const authConfig = {
  "clientID": window.config.clientID,
  "baseUrl": window.config.baseUrl,
  "signInRedirectURL": window.config.signInRedirectURL,
  "signOutRedirectURL": window.config.signOutRedirectURL,
  "scope": window.config.scope,
  "apiUrl": window.config.apiUrl
};

function WeatherApp() {
  const { state, signIn, getAccessToken } = useAuthContext();
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeather = async () => {
    if (!city) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${authConfig.apiUrl}/weather?city=${city}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.cod === "404" && data.message === "city not found") {
        setError('City not found');
        setWeatherData(null);
      } else {
        setWeatherData(data);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      {!state.isAuthenticated ? (
        <button onClick={ () => signIn() }>Login with Asgardeo</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={getWeather}>Get Weather</button>
          {loading && <div>Loading...</div>}
          {error && <div className="error">{error}</div>}
          {weatherData && !loading && !error && (
            <div>
              <h2>{weatherData.name}</h2>
              <p>{weatherData.weather[0].description}</p>
              <p>Temperature: {weatherData.main.temp} K</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider config={ authConfig }>
      <WeatherApp />
    </AuthProvider>
  );
}

export default App;
