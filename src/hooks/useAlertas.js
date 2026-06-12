import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useAlertas() {
  const [alertas, setAlertas] = useState([])
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('https://triagem-hospitalar-production.up.railway.app/ws'),
      onConnect: () => {
        client.subscribe('/topic/alertas', (message) => {
          const alerta = JSON.parse(message.body)
          setAlertas(prev => [alerta, ...prev])

          // Toca som de alerta
          try {
            const ctx = new AudioContext()
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)
            oscillator.frequency.value = 880
            gainNode.gain.value = 0.3
            oscillator.start()
            setTimeout(() => oscillator.stop(), 500)
          } catch (e) {}

          // Notificação do navegador
          if (Notification.permission === 'granted') {
            new Notification('🚨 Triagem Urgente!', {
              body: alerta.mensagem,
              icon: '/favicon.ico'
            })
          }
        })
      },
      reconnectDelay: 5000,
    })

    client.activate()
    clientRef.current = client

    // Pede permissão para notificações
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => client.deactivate()
  }, [])

  function removerAlerta(index) {
    setAlertas(prev => prev.filter((_, i) => i !== index))
  }

  return { alertas, removerAlerta }
}