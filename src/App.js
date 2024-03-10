import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";

const authConfig = {
  "clientID": "pY0NnIUxpc5y9fbtnw9h6B7OsVUa",
  "baseUrl": "https://api.asgardeo.io/t/qbitlabs",
  "signInRedirectURL": "https://e7783938-532e-4a2c-99b2-1deba768f486.e1-us-east-azure.choreoapps.dev/",
  "signOutRedirectURL": "https://e7783938-532e-4a2c-99b2-1deba768f486.e1-us-east-azure.choreoapps.dev/",
  "scope": ["openid profile"],
  "apiUrl": "/choreo-apis/ewyk/weather-api/endpoint-9090-803/v1.0"
};

function WeatherApp() {
  const { state, signIn } = useAuthContext();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeather = async () => {
    if (!city) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${authConfig.apiUrl}/weather?city=${city}`);
      const data = await response.json();

      if (data.error) {
        setError('City not found');
        setWeather('');
      } else {
        setWeather(data.weather);
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
          {weather && !loading && !error && <div>{weather}</div>}
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
