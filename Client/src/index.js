import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import store from './app/store'; // Assuming you have configured your Redux store

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_AUTHENTICATION_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
} else {
  console.log("Loading.....");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider
    appearance={{
      layout: {
        socialButtonsPlacement: 'bottom',
        shimmer: true,
      }
    }}
    publishableKey={PUBLISHABLE_KEY}
  >
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </ClerkProvider>
);

reportWebVitals();
