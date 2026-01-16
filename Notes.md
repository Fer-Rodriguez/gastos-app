

# Notas del desarrollo – Expenses App

## Decisiones técnicas importantes

- Se utilizó Nuxt 3 con Composition API para aprovechar SSR opcional, reactividad y estructura moderna.
- Se centralizó el consumo del backend en un composable (`useExpenses`) para mantener el código desacoplado.
- Se optó por modales para creación y edición de gastos para mejorar la experiencia de usuario.
- Se integró vue-toast-notification para proporcionar feedback inmediato al usuario en operaciones CRUD.
- Se priorizó una tabla responsiva y clara.

## Desafíos enfrentados

- Manejo correcto de `useAsyncData` y `$fetch` en Nuxt.
- Sincronización entre paginación, filtros y recarga de datos.
- Asegurar que la UI no se rompa en pantallas pequeñas.
- Mantener el estado del formulario entre crear y editar gastos.

## Posibles mejoras futuras

- Autenticación y manejo de usuarios.
- Exportación de gastos (CSV / Excel).
- Dashboard con gráficas (charts).
- Filtros avanzados por rango de fechas y montos.
- Pruebas unitarias y e2e.

## Tiempo invertido aproximado

- Backend: 2–3 horas
- Frontend: 5–6 horas
- Ajustes UI/UX y depuración: 2 horas

Total aproximado: 10–11 horas
