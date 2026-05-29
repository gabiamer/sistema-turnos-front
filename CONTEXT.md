# Contexto del proyecto — sistema-turnos-front

Frontend React + Vite del sistema de turnos médicos. Se comunica con un backend Spring Boot en `http://localhost:8090` a través del proxy de Vite (`/api → http://localhost:8090`).

---

## Rutas de la aplicación (`src/App.jsx`)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Inicio` | Página de bienvenida |
| `/login` | `LoginPage` | Login por CI; guarda el paciente en `sessionStorage` |
| `/buscar` | `BuscarMedico` | Búsqueda y filtrado de médicos por especialidad |
| `/calendario` | `CalendarioPage` | Disponibilidad semanal de un médico (flujo de reserva) |
| `/mis-turnos` | `MisTurnos` | Turnos del paciente — versión de diseño anterior |
| `/paciente/turnos` | `VistaPaciente` | Turnos del paciente — versión actual (light theme) |
| `/medico` | `VistaMedico` | Agenda semanal del médico + acciones sobre citas |
| `/agenda` | `GestionAgendaPage` | Gestión de horarios y bloqueos del médico |

---

## Estructura de carpetas

### `src/pages/`
Páginas completas montadas en el router.

- **`Inicio.jsx`** — landing page.
- **`BuscarMedico.jsx`** — lista de médicos con filtro por especialidad. Usa `ListaMedicosV2` y `FiltrosEspecialidad`.
- **`CalendarioPage.jsx`** — muestra la disponibilidad semanal de un médico y permite solicitar/confirmar un turno. Usa `ModalTurno` y `CalendarioSemana`.
- **`MisTurnos.jsx`** — lista de turnos del paciente con opción de cancelar. Lee el paciente de `sessionStorage`. **Versión paralela a `VistaPaciente`.**
- **`auth/LoginPage.jsx`** — formulario de búsqueda por CI. Si el paciente no existe, muestra `FormularioPaciente` para registrarlo. Guarda el objeto paciente en `sessionStorage` al encontrarlo.
- **`medico/VistaMedico.jsx`** — vista principal del médico: calendario semanal con slots, panel lateral de detalle de cita (`PanelCita`), y modales para reprogramar (`ModalReprogramar`) y cancelar (`ModalCancelar`). Usa `medicoStore`. El `MEDICO_ID` está hardcodeado en `1`.
- **`medico/VistaPaciente.jsx`** — lista de turnos del paciente, versión con diseño unificado (mismo sistema de colores que `VistaMedico`). Lee el paciente de `sessionStorage`.
- **`agenda/GestionAgendaPage.jsx`** — permite al médico configurar sus horarios de atención por día y crear bloqueos de días. Usa `agendaService`.

---

### `src/components/`
Componentes reutilizables organizados por dominio.

#### `components/medico/` — exclusivos de la vista del médico
- **`CalendarioMedico.jsx`** — grilla semanal con slots coloreados por estado. Recibe `slots` del store.
- **`PanelCita.jsx`** — panel lateral deslizable con detalle de una cita seleccionada y botones de acción (concluir, reprogramar, cancelar).
- **`ModalReprogramar.jsx`** — modal para elegir un nuevo slot libre de la semana actual.
- **`ModalCancelar.jsx`** — modal para ingresar motivo de cancelación y canales de notificación.
- **`Toast.jsx`** — notificación flotante de éxito o error.

#### `components/buscar-medico/` — búsqueda de médicos (v2)
- **`CardMedicoV2.jsx`** — tarjeta de médico con especialidad y botón de acción.
- **`ListaMedicosV2.jsx`** — lista de tarjetas de médicos.
- **`FiltrosEspecialidad.jsx`** — chips filtrables por especialidad.
- **`SearchBar.jsx`** — barra de búsqueda por nombre.

#### `components/auth/`
- **`FormularioPaciente.jsx`** — formulario de registro de nuevo paciente (nombre, apellido, CI, email).

#### `components/formulario/`
- **`CampoInput.jsx`** — campo de input genérico reutilizable con label y validación.

#### Componentes en raíz de `components/`
- **`Navbar.jsx`** — barra de navegación global.
- **`ModalTurno.jsx`** — modal de confirmación al reservar un turno (usado en `CalendarioPage`).
- **`CalendarioSemana.jsx`** — componente de calendario semanal genérico (navegación de semanas, slots).
- **`CardMedico.jsx`**, **`ListaMedicos.jsx`**, **`SelectorEspecialidad.jsx`** — versiones v1, reemplazadas por las de `buscar-medico/`.
- **`MedicosAlternativos.jsx`** — muestra médicos alternativos cuando no hay disponibilidad.
- **`FormularioPaciente.jsx`** — duplicado legacy de `auth/FormularioPaciente.jsx` (en desuso).

---

### `src/services/`
Toda la comunicación con el backend. Usan `axiosInstance`.

- **`axiosInstance.js`** — instancia Axios con `baseURL: VITE_API_URL` (si no está definida, usa proxy de Vite) y `timeout: 5000ms`.
- **`pacienteService.js`** — `buscarPorCi(ci)`, `registrar(paciente)`.
- **`medicoService.js`** — `getAll`, `getById`, `getDisponibilidad(medicoId, semana)`, `getAgendaSemana(medicoId, semana)`.
- **`turnoService.js`** — `solicitar`, `confirmar`, `listar(pacienteId)`, `cancelar` (paciente), `patchEstado(turnoId, estado)`, `putReprogramar(turnoId, fecha, hora)`, `cancelarMedico(turnoId, motivo, canales)`.
- **`agendaService.js`** — `getByMedico`, `actualizarAgenda`, `getBloqueos`, `crearBloqueo`.
- **`disponibilidadService.js`** — `getSlots(medicoId, semana)`. Acepta semana como offset numérico (0 = semana actual) o string `YYYY-MM-DD`.

---

### `src/store/`
Estado global con Zustand.

- **`medicoStore.js`** — estado de `VistaMedico`: lista de `slots`, `citaSeleccionada`, flags de `loading`/`error`, y acciones: `actualizarEstadoTurno`, `liberarSlot`, `reprogramarTurno`.

---

### `src/utils/`
- **`mapEstado.js`** — mapa de estados de turno (`PENDIENTE`, `CONFIRMADO`, `CANCELADO`, `CONCLUIDA`, `BLOQUEADO`, `EXPIRADO`) a estilos CSS (color de fondo, borde, texto y label). Exporta `getEstiloEstado(estado)`.

---

### `src/mocks/`
Datos de prueba usados durante el desarrollo inicial. No se usan en producción.
- **`mockData.js`**, **`mockMedicoData.js`**

### `src/data/`
- **`mockData.js`** — versión anterior de datos mock (legacy, en desuso).

### `src/assets/`
- `hero.png` — imagen de la página de inicio.
- `react.svg`, `vite.svg` — logos del stack.

---

## Configuración

| Archivo | Descripción |
|---|---|
| `vite.config.js` | Proxy `/api` → `http://localhost:8090`. Sin archivo `.env`, todas las llamadas van por el proxy. |
| `package.json` | React 18, React Router v6, Axios, Zustand. |
| `tailwind.config.js` | Tailwind instalado pero poco usado; la mayoría de estilos son inline. |

---

## Estados de un turno

```
PENDIENTE → CONFIRMADO → CONCLUIDA
                       → CANCELADO
BLOQUEADO  (reserva temporal, expira automáticamente)
EXPIRADO   (BLOQUEADO que no fue confirmado)
PROGRAMADA (sinónimo de CONFIRMADO en algunos contextos)
```
