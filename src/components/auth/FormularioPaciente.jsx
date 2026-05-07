import { useState } from 'react';
import { pacienteService } from '../../services/pacienteService';

const FormularioPaciente = ({ ciInicial }) => {

    const [formData, setFormData] = useState({
        ci: ciInicial || '',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        telefono: '',
        email: ''
    });

    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await pacienteService.registrar(formData);

            setSuccess(true);

        } catch (error) {
            console.error(error);
        }
    };

    if (success) {
        return (
            <div style={styles.success}>
                Paciente registrado correctamente
            </div>
        );
    }

    return (
        <div style={styles.container}>

            <h3 style={styles.title}>
                Paciente no encontrado
            </h3>

            <p style={styles.subtitle}>
                Complete sus datos para registrarse
            </p>

            <form onSubmit={handleSubmit}>

                <input
                    name="nombre"
                    placeholder="Nombre"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <input
                    name="apellido"
                    placeholder="Apellido"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <input
                    type="date"
                    name="fechaNacimiento"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <input
                    name="telefono"
                    placeholder="Teléfono"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <button
                    type="submit"
                    style={styles.button}
                >
                    Registrarse
                </button>

            </form>

        </div>
    );
};

const styles = {

    container: {
        marginTop: '30px'
    },

    title: {
        color: '#1E3A8A',
        marginBottom: '10px'
    },

    subtitle: {
        color: '#64748B',
        marginBottom: '20px'
    },

    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '10px',
        border: '1px solid #CBD5E1'
    },

    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#22C55E',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer'
    },

    success: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#DCFCE7',
        borderRadius: '12px',
        color: '#166534',
        textAlign: 'center'
    }
};

export default FormularioPaciente;