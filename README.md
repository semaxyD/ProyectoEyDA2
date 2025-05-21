# 🎓 Gestor de Pendientes y Cálculo de Notas para Estudiantes - UtrackTask
# Hecho por: Ricardo Stiven Gonzalez 2215602 - Sebastian Marinez Lopez 2220331

## 📌 Descripción
Una aplicación web desarrollada con **React + Vite**, pensada para ayudar a estudiantes a organizar sus materias, tareas y calcular sus notas finales. El sistema permitirá:
- Gestionar pendientes académicos.
- Calcular cuánto necesita un estudiante para aprobar una materia.

---
## 🪢 Links de la Entrega
- Link del diseño propuesto en Figma: https://www.figma.com/design/HIw62heApnoQE7CuySLIOe/Estructuras?node-id=0-1&t=FzZUaOer2Hgkrmmt-1
- Link a el despliegue del aplicativo web: https://utracktask.netlify.app
---

## 🧰 Tecnologías a Utilizar

### 🔷 Frontend
- 🟢 React con Vite (mejor performance).
- 🟢 React Router (navegación entre páginas).
- 🟢 Context API o Redux (según necesidad de estado global).
- 🟢 Hooks (`useState`, `useEffect`, `useContext`, `useReducer`, etc.).

### 🔶 Base de Datos
- 🔸 **Firebase Firestore** (NoSQL y integración sencilla con React).

### 🕸️ Otras Tecnologías
- 🔹 WebSockets (implementado con realtime Database de firebase).
- 🔹 TailwindCSS (para diseño responsivo y moderno).

---

## 📚 Temas de Estructura de Datos a Implementar
- ✅ Props & Validación de Props.
- ✅ Hooks (useState, useEffect, useContext, useReducer).
- ✅ Renderizado condicional.
- ✅ React Router.
- ✅ Context API.
- ✅ Manejo de página 404.
- ✅ Listas enlazadas (simples, dobles, circulares).
- ✅ Stacks (LIFO).
- ✅ Queues (FIFO).
- ✅ Árboles binarios.
- ✅ Redux para manejo de estado global.

---

## 🎯 Requisitos Funcionales (RF)

### 🔹 RF-01: Gestión de Materias
- RF-01.1 Agregar materias con nombre y código.
- RF-01.2 Definir número de cortes/evaluaciones.
- RF-01.3 Editar o eliminar materias.

### 🔹 RF-02: Gestión de Notas
- RF-02.1 Agregar notas por materia.
- RF-02.2 Asignar porcentaje a cada nota.
- RF-02.3 Editar o eliminar notas.
- RF-02.4 Cálculo automático de nota final.
- RF-02.5 Meta de nota: calcular cuánto necesita para aprobar.

### 🔹 RF-03: Gestión de Tareas/Pendientes
- RF-03.1 Agregar tareas con título, descripción, fecha y prioridad.
- RF-03.2 Editar o eliminar tareas.
- RF-03.3 Marcar tareas como completadas.
- RF-03.4 Ordenar tareas por prioridad y fecha.

### 🔹 RF-04: Interfaz de Usuario con React
- Uso de Props y validaciones.
- Hooks para manejar estados.
- Context API para compartir estados.
- Comunicación padre-hijo.
- Renderizado condicional.

### 🔹 RF-05: Navegación y Rutas
- Uso de React Router.
- Página 404 personalizada.
- Manejo de URL Params y Query Params.
- Redirecciones automáticas.
- Rutas públicas y privadas.

### 🔹 RF-06: Gestión de Usuarios *(Opcional en esta fase)*
- Login con Google (Firebase).
- Persistencia de datos por usuario.

### 🔹 RF-07: Estructuras de Datos
- Linked Lists para tareas.
- Double Linked Lists para navegación de notas.
- Circular Linked Lists para tareas recurrentes.

### 🔹 RF-08: Comunicación en Tiempo Real *(Futuro)*
- Compartir tareas/materias en tiempo real.
- Recordatorios y notificaciones.

---

## ⚙️ Requisitos No Funcionales (RNF)

### ✅ RNF-01: Desempeño y Optimización
- Carga rápida y sin bloqueos.
- Uso eficiente de recursos.

### ✅ RNF-02: Interfaz Responsiva y Accesible
- Compatible con PC, tablets y móviles.
- Paleta accesible: `#284dcb`, `#ffffff`, `#585858`.

### ✅ RNF-03: Escalabilidad
- Código modular y reutilizable.

### ✅ RNF-04: Seguridad
- Protección de datos de usuarios.
- Rutas privadas con autenticación (si aplica).

### ✅ RNF-05: Almacenamiento Temporal
- Datos persistentes en Firebase (materias, notas, tareas).

---

## 📂 Módulos Principales

### 🔐 Autenticación y Seguridad
- Inicio de sesión con Google (Firebase Auth).
- Control de rutas públicas y privadas.
- Cierre de sesión.

### 🏠 Dashboard Principal
- Resumen general de materias y tareas.
- Accesos rápidos a funciones clave.

### 📚 Gestión de Materias
- Agregar, editar y eliminar materias.
- Definir porcentajes por corte.

### 📅 Gestión de Pendientes/Tareas
- Agregar, marcar y eliminar tareas.
- Organización por fecha.

### 🧮 Cálculo de Notas
- Simulador: *¿Cuánto necesito para aprobar?*
- Visualización de notas por materia.

### 📡 Comunicación en Tiempo Real *(futuro)*
- Chat y colaboración entre estudiantes.

---

## 🛠️ Tareas Específicas para Construcción en React

- Configurar Firebase (Auth + Firestore).
- Configurar TailwindCSS y React Router.
- Generar vistas:
  - Dashboard
  - Página de Materias
  - Página de Tareas
  - Página de Cálculo de Notas
- Conectar Firebase para autenticación.
- Conectar Firestore para persistencia de datos.

## 🔜 Estructura de colecciones en Firebase

`users` Collection:
| Field | Type | Description
|-----|-----|-----
| `uid` | String | Firebase Auth user ID (primary key)
| `displayName` | String | User's full name
| `email` | String | User's email address
| `photoURL` | String | URL to user's profile picture
| `createdAt` | Timestamp | When the user account was created
| `lastLogin` | Timestamp | When the user last logged in
| `settings` | Map | User preferences (theme, notifications, etc.)
| `role` | String | User role (e.g., "student")



`subjects` Collection:
| Field | Type | Description
|-----|-----|-----
| `id` | String | Unique identifier for the subject
| `userId` | String | Reference to the user who owns this subject
| `name` | String | Name of the subject (e.g., "Mathematics")
| `professor` | String | Name of the professor
| `schedule` | String | Class schedule (e.g., "Mon, Wed 10:00 AM")
| `credits` | Number | Number of credits for the subject
| `color` | String | Color code for UI display
| `createdAt` | Timestamp | When the subject was created
| `updatedAt` | Timestamp | When the subject was last updated
| `gradeStructure` | Map | Breakdown of grade components
| `gradeStructure.firstCut` | Number | Percentage for first cut (e.g., 30%)
| `gradeStructure.secondCut` | Number | Percentage for second cut (e.g., 30%)
| `gradeStructure.finalExam` | Number | Percentage for final exam (e.g., 40%)
| `currentGrade` | Number | Current overall grade in the subject
| `targetGrade` | Number | Target grade the student wants to achieve
| `semester` | String | Current semester (e.g., "Spring 2025")
| `isActive` | Boolean | Whether the subject is active or archived

`tasks` Collection:
| Field | Type | Description
|-----|-----|-----
| `id` | String | Unique identifier for the task
| `userId` | String | Reference to the user who owns this task
| `subjectId` | String | Reference to the related subject
| `title` | String | Title of the task
| `description` | String | Detailed description of the task
| `dueDate` | Timestamp | When the task is due
| `priority` | String | Priority level ("high", "medium", "low")
| `completed` | Boolean | Whether the task is completed
| `completedAt` | Timestamp | When the task was completed (null if not completed)
| `createdAt` | Timestamp | When the task was created
| `updatedAt` | Timestamp | When the task was last updated
| `reminderDate` | Timestamp | When to send a reminder (optional)
| `attachments` | Array | List of attachment URLs (optional)
| `tags` | Array | List of tags for categorization
| `estimatedTime` | Number | Estimated time to complete (in minutes)
| `actualTime` | Number | Actual time spent (in minutes)

`grades` Collection:
| Field | Type | Description
|-----|-----|-----
| `id` | String | Unique identifier for the grade entry
| `userId` | String | Reference to the user who owns this grade
| `subjectId` | String | Reference to the related subject
| `title` | String | Title of the assessment (e.g., "Midterm Exam")
| `type` | String | Type of assessment (e.g., "exam", "quiz", "assignment")
| `score` | Number | Points earned
| `maxScore` | Number | Maximum possible points
| `percentage` | Number | Calculated percentage (score/maxScore * 100)
| `weight` | Number | Weight of this assessment in the overall grade
| `date` | Timestamp | When the assessment took place
| `notes` | String | Additional notes about the grade
| `createdAt` | Timestamp | When the grade entry was created
| `updatedAt` | Timestamp | When the grade entry was last updated
| `cutPeriod` | String | Which cut period this grade belongs to ("first", "second", "final")
| `contributionToFinal` | Number | Calculated contribution to final grade
