import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import HomePaciente from './pages/HomePaciente'
import Totem from './pages/Totem'
import PainelMedico from './pages/PainelMedico'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
       <Route path="/home" element={<HomePaciente />} />
      <Route path="/totem" element={<Totem />} />
      <Route path="/painel" element={<PainelMedico />} />
    </Routes>
  )
}

export default App