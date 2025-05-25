import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css';
import Dashboard from './App.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Forum from './components/forum/Register.jsx'
import RegisterAsesor from './components/asesor/Register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Forum" element={<Forum />} />
        <Route path="/Asesor" element={<RegisterAsesor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
