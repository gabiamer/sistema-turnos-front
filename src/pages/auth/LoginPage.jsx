// src/pages/auth/LoginPage.jsx
// FIX: guarda el paciente en sessionStorage tras el login exitoso,
// para que VistaPaciente pueda leer el pacienteId real.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pacienteService } from '../../services/pacienteService';
import FormularioPaciente from '../../components/auth/FormularioPaciente';

const LoginPage = () => {
  const navigate = useNavigate();
  const [ci, setCi]                         = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [pacienteNoExiste, setPacienteNoExiste] = useState(false);
  const [paciente, setPaciente]             = useState(null);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleBuscarPaciente = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await pacienteService.buscarPorCi(ci);
      // Guardar en sessionStorage para que VistaPaciente lo lea
      sessionStorage.setItem('paciente', JSON.stringify(data));
      setPaciente(data);
      setPacienteNoExiste(false);
      navigate('/buscar');
    } catch (err) {
      if (err.response?.status === 404) {
        setPacienteNoExiste(true);
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIrATurnos = () => navigate('/paciente/turnos');

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🩺</div>
          <h1 style={styles.title}>Sistema de Turnos Médicos</h1>
          <p style={styles.subtitle}>Ingrese su Carnet de Identidad para continuar</p>
        </div>

        <form onSubmit={handleBuscarPaciente} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Carnet de Identidad</label>
            <input
              type="text"
              placeholder="Ej: 12345678"
              value={ci}
              onChange={e => setCi(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Buscando...' : 'Continuar'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {paciente && (
          <div style={styles.successBox}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Bienvenido/a</p>
            <p style={{ fontSize: 15, marginBottom: 14 }}>{paciente.nombre} {paciente.apellido}</p>
            <button onClick={handleIrATurnos} style={styles.btnTurnos}>
              Ver mis turnos →
            </button>
          </div>
        )}

        {pacienteNoExiste && <FormularioPaciente ciInicial={ci} />}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', width: '100vw',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '20px', fontFamily: 'system-ui, sans-serif',
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden',
  },
  card: {
    width: '100%', maxWidth: '440px',
    backgroundColor: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(20px)', borderRadius: '24px',
    padding: '50px 40px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  header: { textAlign: 'center', marginBottom: '36px' },
  icon: { fontSize: '56px', marginBottom: '20px' },
  title: { color: '#0F172A', fontSize: '26px', fontWeight: '700', margin: '0 0 8px' },
  subtitle: { color: '#64748B', fontSize: '15px', margin: 0, lineHeight: '1.45' },
  form: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  inputGroup: { width: '100%', maxWidth: '380px', marginBottom: '24px' },
  label: { display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '14px' },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '2px solid #E2E8F0', fontSize: '16px', outline: 'none',
    backgroundColor: '#F8FAFC', boxSizing: 'border-box', color: '#1e293b',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%', maxWidth: '380px', padding: '14px',
    borderRadius: '12px', border: 'none', backgroundColor: '#2563EB',
    color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    transition: 'background 0.2s',
  },
  error: { color: '#EF4444', textAlign: 'center', marginTop: '14px', fontWeight: '500', fontSize: '14px' },
  successBox: {
    marginTop: '22px', padding: '20px', backgroundColor: '#F0FDF4',
    borderRadius: '14px', color: '#166534', textAlign: 'center',
    border: '1px solid #86EFAC',
  },
  btnTurnos: {
    padding: '10px 24px', borderRadius: '8px', border: 'none',
    backgroundColor: '#16a34a', color: 'white', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
  },
};

export default LoginPage;