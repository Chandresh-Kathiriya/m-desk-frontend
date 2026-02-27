import 'bootstrap/dist/css/bootstrap.min.css';
// import './schemas/css/Constants.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import './index.css';
import './schemas/css/theme.css';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);