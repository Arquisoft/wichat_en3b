import './utils/i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';


import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import App from './App';
import Login from './components/Login';
import SignUp from './components/AddUser';
import GameModeSelection from './components/GameModeSelection';
import Game from './components/Game';
import Home from './components/Home';
import Layout from './components/Layout';
import GameTopicSelection from './components/GameTopicSelection';
import PersistentLogin from './components/PersistentLogin';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          {/* Routes without authentication */}
          <Route index element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Routes with authentication */}
          <Route element={<PersistentLogin />}>
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/gamemode" element={<GameModeSelection />} />
              <Route path="/gametopic" element={<GameTopicSelection />} />
              <Route path="/game" element={<Game />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
