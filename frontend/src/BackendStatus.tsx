
import { useEffect, useState } from 'react'

function BackendStatus() {
  const [status, setStatus] = useState('Conectando...')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error de conexión')
        }

        setStatus('Conectado')
        setIsConnected(true)
      })
      .catch(() => {
        setStatus('Sin conexión')
        setIsConnected(false)
      })
  }, [])

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        fontSize: '14px',
      }}
    >
      <span
        style={{
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#22c55e' : '#f59e0b',
        }}
      />

      Backend: {status}
    </div>
  )
}

export default BackendStatus
