import './utils/i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import './index.css'; // Global css to fix margin
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';

import Layout from './components/Layout';
import App from './App';
import Home from './components/Home';
import Login from './components/login/Login';
import SignUp from './components/AddUser';
import GameModeSelection from './components/selections/GameModeSelection';
import RoundsGame from './components/game/RoundsGame';
import TimeGame from './components/game/TimeGame';
import GameTopicSelection from './components/selections/GameTopicSelection';
import PersistentLogin from './components/login/PersistentLogin';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
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
                <Route path="/timegame" element={<TimeGame />} />
                <Route path="/roundsgame" element={<RoundsGame />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
