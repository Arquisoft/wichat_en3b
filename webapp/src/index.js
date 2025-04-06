import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import App from './App';
import Login from './components/login/Login';
import SignUp from './components/AddUser';
import GameModeSelection from './components/selections/GameModeSelection';
import RoundsGame from './components/modes/RoundsGame';
import TimeGame from './components/modes/TimeGame';
import Home from './components/Home';
import Layout from './components/Layout';
import GameTopicSelection from './components/selections/GameTopicSelection';
import PersistentLogin from './components/login/PersistentLogin';

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
              <Route path="/roundsgame" element={<RoundsGame />} />
              <Route path="/timegame" element={<TimeGame />} />
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
