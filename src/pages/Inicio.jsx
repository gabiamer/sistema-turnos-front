// src/pages/Inicio.jsx
import FormularioPaciente from '../components/FormularioPaciente'

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`

function Inicio() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#c8dde8',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%, rgba(180,210,228,0.6) 0%, transparent 60%),
        radial-gradient(ellipse at 100% 100%, rgba(195,218,232,0.5) 0%, transparent 55%)
      `,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        ${fontImport}
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: 'clamp(2.5rem,5vw,4rem) clamp(2rem,5vw,4rem)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
        gap: 'clamp(2rem,5vw,5rem)',
        alignItems: 'start',
      }}>

        {/* ── Columna izquierda: texto ───────────────────────────────────── */}
        <div style={{ animation: 'fadeUp 0.5s ease both', paddingTop: '1rem' }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: '500', color: '#4a7c9e',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            Sistema de Turnos Médicos
          </p>

          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            fontWeight: '400', color: '#1c3545',
            lineHeight: 1.1, letterSpacing: '-0.02em',
            margin: '0 0 1.5rem',
          }}>
            Tu salud Adriana--,<br />
            <em style={{ fontStyle: 'italic', color: '#4a7c9e' }}>sin adriana esperas</em><br />
            innecesarias.
          </h1>

          <p style={{
            fontSize: '0.9rem', color: '#4a7c9e', lineHeight: 1.8,
            maxWidth: '360px', fontWeight: '300', marginBottom: '2.5rem',
          }}>
            Regístrate una sola vez y reserva turnos con los mejores especialistas de forma rápida y sencilla.
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { num: '6+', label: 'Especialidades' },
              { num: '100%', label: 'Online' },
              { num: '24/7', label: 'Disponible' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '1.6rem', color: '#1c3545', margin: '0 0 0.1rem',
                  fontWeight: '400',
                }}>{num}</p>
                <p style={{ fontSize: '0.72rem', color: '#7fa3b8', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha: formulario ───────────────────────────────── */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <FormularioPaciente />
        </div>
      </div>
    </div>
  )
}

export default Inicio