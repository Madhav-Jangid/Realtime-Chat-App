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

const text = "Do not type or paste anything here!";

// Define the CSS styles
const styles = `
  font-size: 300%;
  color: #539bff;
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
`;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
} else {
  console.log("%c" + text, styles);
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
