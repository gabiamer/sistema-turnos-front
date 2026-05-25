// ============================================================
// MedicosAlternativos.jsx — Luciana Sprint 2
// Aparece cuando el médico elegido no tiene slots disponibles
// Muestra otros médicos de la misma especialidad
// Props:
//   especialidad : string
//   medicos      : [{ id, nombre, apellido, especialidad }]
//   onSeleccionar: (medico) => void
// ============================================================

export default function MedicosAlternativos({ especialidad, medicos = [], onSeleccionar }) {
  const alternativos = medicos.filter(m => m.especialidad === especialidad)

  if (alternativos.length === 0) return null

  return (
    <div className="alt-wrapper">
      <div className="alt-header">
        <span className="alt-icon">⚠</span>
        <span className="alt-titulo">
          Sin disponibilidad — médicos alternativos de {especialidad}
        </span>
      </div>
      <div className="alt-lista">
        {alternativos.map(m => (
          <button
            key={m.id}
            className="alt-card"
            onClick={() => onSeleccionar(m)}
            aria-label={`Seleccionar Dr/a ${m.nombre} ${m.apellido}`}
          >
            <span className="alt-nombre">Dr/a. {m.nombre} {m.apellido}</span>
            <span className="alt-esp">{m.especialidad}</span>
            <span className="alt-ver">Ver disponibilidad →</span>
          </button>
        ))}
      </div>
    </div>
  )
}
