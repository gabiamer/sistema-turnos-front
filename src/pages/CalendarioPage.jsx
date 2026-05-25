// ============================================================
// CalendarioPage.jsx — Luciana Sprint 1
// Página de demostración del CalendarioSemana con mock
// Sprint 2: recibirá medicoId como parámetro de ruta y conectará
// con GET /api/medicos/{id}/disponibilidad?semana=...
// ============================================================
import { useState } from "react";
import CalendarioSemana from "../components/CalendarioSemana";
import { generarSlotsMock, mockMedicos } from "../data/mockData";
import "./CalendarioPage.css";
import "../components/CalendarioSemana.css";

// Devuelve el lunes de la semana actual
function getLunes() {
  const d = new Date();
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function CalendarioPage() {
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(mockMedicos[0]);
  const [slotElegido, setSlotElegido] = useState(null);

  // En Sprint 2 esto vendrá de la API real
  const lunes = getLunes();
  const slots = generarSlotsMock(medicoSeleccionado.id, lunes);

  const handleSlotClick = (slot) => {
    setSlotElegido(slot);
  };

  const handleCerrarModal = () => setSlotElegido(null);

  return (
    <div className="cal-page">
      <div className="cal-page-header">
        <h2 className="cal-page-title">Consultar Disponibilidad</h2>
        <p className="cal-page-sub">
          Selecciona un médico y elige un horario disponible
        </p>
      </div>

      {/* Selector de médico */}
      <div className="medico-selector">
        <label htmlFor="sel-medico" className="sel-label">
          Médico
        </label>
        <select
          id="sel-medico"
          className="sel-input"
          value={medicoSeleccionado.id}
          onChange={(e) => {
            const m = mockMedicos.find((x) => x.id === Number(e.target.value));
            setMedicoSeleccionado(m);
            setSlotElegido(null);
          }}
          aria-label="Seleccionar médico"
        >
          {mockMedicos.map((m) => (
            <option key={m.id} value={m.id}>
              Dr/a. {m.nombre} {m.apellido} — {m.especialidad}
            </option>
          ))}
        </select>
      </div>

      {/* Badge del médico seleccionado */}
      <div className="medico-badge">
        <span className="mb-nombre">
          Dr/a. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
        </span>
        <span className="mb-esp">{medicoSeleccionado.especialidad}</span>
        <span className="mb-mock-tag">mock · Sprint 1</span>
      </div>

      {/* Calendario */}
      <CalendarioSemana
        slots={slots}
        onSlotClick={handleSlotClick}
      />

      {/* Modal de confirmación de slot elegido */}
      {slotElegido && (
        <div
          className="modal-backdrop"
          onClick={handleCerrarModal}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar turno"
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">¿Confirmar selección?</h3>
            <div className="modal-info">
              <div className="modal-row">
                <span className="modal-lbl">Médico</span>
                <span>
                  Dr/a. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Especialidad</span>
                <span>{medicoSeleccionado.especialidad}</span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Fecha</span>
                <span>{slotElegido.fecha}</span>
              </div>
              <div className="modal-row">
                <span className="modal-lbl">Hora</span>
                <span>{slotElegido.hora}</span>
              </div>
            </div>
            <p className="modal-note">
              En Sprint 3 este botón llamará al endpoint de solicitar turno (CU-01).
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--cancel"
                onClick={handleCerrarModal}
                aria-label="Cancelar selección"
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn--confirm"
                onClick={() => {
                  alert(`Turno pre-seleccionado: ${slotElegido.fecha} ${slotElegido.hora} con Dr/a. ${medicoSeleccionado.nombre}`);
                  handleCerrarModal();
                }}
                aria-label="Confirmar turno"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
