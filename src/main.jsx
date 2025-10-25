import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css';
import Dashboard from './App.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Forum from './components/forum/Register.jsx'
import RegisterAsesor from './components/asesor/Register.jsx'
import Chatbot from './components/chate/Chatstudy.jsx'
import Password from './components/Password.jsx';
import ResetPassword from './components/Resetpassword.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Forum" element={<Forum />} />
        <Route path="/Asesor" element={<RegisterAsesor />} />
        <Route path="/Chatstudy" element={<Chatbot />} />
        <Route path="/ForgotPassword" element={<Password />} />
        <Route path="/ResetPassword/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
