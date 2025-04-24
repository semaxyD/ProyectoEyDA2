// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/routes';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
