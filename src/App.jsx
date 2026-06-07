import { Routes, Route } from 'react-router-dom'
import Totem from './pages/Totem'
import PainelMedico from './pages/PainelMedico'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Totem />} />
      <Route path="/painel" element={<PainelMedico />} />
    </Routes>
  )
}

export default App