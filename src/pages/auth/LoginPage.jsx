import { useState, useEffect } from 'react';
import { pacienteService } from '../../services/pacienteService';
import FormularioPaciente from '../../components/auth/FormularioPaciente';

const LoginPage = () => {

    const [ci, setCi] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pacienteNoExiste, setPacienteNoExiste] = useState(false);
    const [paciente, setPaciente] = useState(null);

    // Limpiar márgenes y evitar barras negras
    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Efectos hover y focus
    useEffect(() => {
        const inputs = document.querySelectorAll('input');
        const button = document.querySelector('button');

        inputs.forEach(input => {
            const handleFocus = () => {
                input.style.borderColor = '#3B82F6';
                input.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)';
            };
            const handleBlur = () => {
                input.style.borderColor = '#E2E8F0';
                input.style.boxShadow = 'none';
            };

            input.addEventListener('focus', handleFocus);
            input.addEventListener('blur', handleBlur);

            // Cleanup
            return () => {
                input.removeEventListener('focus', handleFocus);
                input.removeEventListener('blur', handleBlur);
            };
        });

        if (button) {
            const handleMouseEnter = () => {
                button.style.backgroundColor = '#1D4ED8';
                button.style.transform = 'translateY(-2px)';
            };
            const handleMouseLeave = () => {
                button.style.backgroundColor = '#2563EB';
                button.style.transform = 'translateY(0)';
            };

            button.addEventListener('mouseenter', handleMouseEnter);
            button.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                button.removeEventListener('mouseenter', handleMouseEnter);
                button.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, [loading]); // Se actualiza cuando cambia el estado de loading

    const handleBuscarPaciente = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await pacienteService.buscarPorCi(ci);
            setPaciente(data);
            setPacienteNoExiste(false);
        } catch (err) {
            if (err.response?.status === 404) {
                setPacienteNoExiste(true);
            } else {
                setError('Error al conectar con el servidor');
            }
        } finally {
            setLoading(false);
        }
    };

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
                            onChange={(e) => setCi(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Buscando...' : 'Continuar'}
                    </button>

                </form>

                {error && <p style={styles.error}>{error}</p>}

                {paciente && (
                    <div style={styles.successBox}>
                        <h3>Bienvenido</h3>
                        <p>{paciente.nombre} {paciente.apellido}</p>
                    </div>
                )}

                {pacienteNoExiste && <FormularioPaciente ciInicial={ci} />}

            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },

    card: {
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '50px 40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255,255,255,0.3)',
    },

    header: {
        textAlign: 'center',
        marginBottom: '40px'
    },

    icon: {
        fontSize: '62px',
        marginBottom: '30px',
    },

    title: {
        color: '#0F172A',
        fontSize: '28px',
        fontWeight: '700',
        margin: '0 0 8px 0',
    },

    subtitle: {
        color: '#64748B',
        fontSize: '15.5px',
        margin: 0,
        lineHeight: '1.45'
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    },

    inputGroup: {
        width: '100%',
        maxWidth: '380px',
        marginBottom: '28px'
    },

    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#334155',
        fontWeight: '600',
        fontSize: '14.5px'
    },

    input: {
        width: '100%',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '2px solid #E2E8F0',
        fontSize: '17px',
        outline: 'none',
        backgroundColor: '#F8FAFC',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        color: 'black'
    },

    button: {
        width: '100%',
        maxWidth: '380px',
        padding: '16px',
        borderRadius: '14px',
        border: 'none',
        backgroundColor: '#2563EB',
        color: 'white',
        fontSize: '17px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '4px'
    },

    error: {
        color: '#EF4444',
        textAlign: 'center',
        marginTop: '16px',
        fontWeight: '500'
    },

    successBox: {
        marginTop: '24px',
        padding: '20px',
        backgroundColor: '#DCFCE7',
        borderRadius: '16px',
        color: '#166534',
        textAlign: 'center',
        border: '1px solid #86EFAC',
        width: '100%'
    }
};

export default LoginPage;