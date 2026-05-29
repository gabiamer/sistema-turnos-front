// src/hooks/useModal.js
// Patrón Factory para modales — Sprint Vista Médicos/Pacientes
//
// OCP: agregar un tipo nuevo = agregar una entrada en MODAL_CONFIG, sin tocar
// el hook ni los consumidores existentes.
//
// Uso:
//   const { modal, abrirModal, cerrarModal, errorAccion, setErrorAccion } = useModal()
//
//   abrirModal('reprogramar')  → modal.tipo === 'reprogramar'
//   abrirModal('cancelar')     → modal.tipo === 'cancelar'
//   cerrarModal()              → modal === null

import { useState, useCallback } from 'react'

// Registro de tipos de modal válidos.
// Cada entrada puede llevar metadata útil (label, etc) si el consumidor la necesita.
const MODAL_CONFIG = {
  reprogramar: { label: 'Reprogramar cita' },
  cancelar:    { label: 'Cancelar cita'    },
  // Para agregar un tipo nuevo: solo añadir aquí.
  // Ej: confirmar: { label: 'Confirmar cita' }
}

export function useModal() {
  const [modal, setModal]               = useState(null)   // { tipo, ...config } | null
  const [errorAccion, setErrorAccion]   = useState(null)

  const abrirModal = useCallback((tipo) => {
    const config = MODAL_CONFIG[tipo]
    if (!config) {
      console.warn(`useModal: tipo desconocido "${tipo}". Tipos válidos: ${Object.keys(MODAL_CONFIG).join(', ')}`)
      return
    }
    setModal({ tipo, ...config })
    setErrorAccion(null)
  }, [])

  const cerrarModal = useCallback(() => {
    setModal(null)
    setErrorAccion(null)
  }, [])

  const esModal = useCallback((tipo) => modal?.tipo === tipo, [modal])

  return {
    modal,
    abrirModal,
    cerrarModal,
    esModal,
    errorAccion,
    setErrorAccion,
  }
}
