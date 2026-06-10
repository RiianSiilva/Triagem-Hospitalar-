import { Navigate } from 'react-router-dom'

function RotaProtegida({ children, perfisPermitidos }) {
  const token = localStorage.getItem('token')
  const usuarioRaw = localStorage.getItem('usuario')

  // Não está logado → vai para login
  if (!token || !usuarioRaw) {
    return <Navigate to="/" replace />
  }

  const usuario = JSON.parse(usuarioRaw)

  // Perfil não permitido → redireciona para a tela certa
  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    if (usuario.perfil === 'PACIENTE') return <Navigate to="/home" replace />
    return <Navigate to="/painel" replace />
  }

  return children
}

export default RotaProtegida