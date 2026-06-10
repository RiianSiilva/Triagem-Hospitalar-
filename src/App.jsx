import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import HomePaciente from './pages/HomePaciente'
import Totem from './pages/Totem'
import PainelMedico from './pages/PainelMedico'
import Admin from './pages/Admin'
import RotaProtegida from './components/RotaProtegida'

function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas do paciente */}
      <Route path="/home" element={
        <RotaProtegida perfisPermitidos={['PACIENTE']}>
          <HomePaciente />
        </RotaProtegida>
      } />
      <Route path="/totem" element={
        <RotaProtegida perfisPermitidos={['PACIENTE']}>
          <Totem />
        </RotaProtegida>
      } />

      {/* Rotas da equipe médica */}
      <Route path="/painel" element={
        <RotaProtegida perfisPermitidos={['MEDICO', 'ENFERMEIRA', 'ADMIN']}>
          <PainelMedico />
        </RotaProtegida>
      } />
    <Route path="/admin" element={
        <RotaProtegida perfisPermitidos={['ADMIN']}>
          <Admin />
        </RotaProtegida>
      } />
    </Routes>
  )
}

export default App