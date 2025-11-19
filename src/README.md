# RestInn Front-End

Aplicación web desarrollada en **Angular** para la gestión integral del sistema hotelero **RestInn**.  
Permite la administración de **clientes**, **reservas**, **habitaciones**, **empleados** y **facturación**, con conexión directa a la **API RESTful** de backend.

Incluye autenticación con roles, guards de seguridad, operaciones CRUD y un diseño responsive orientado a la experiencia del usuario.

---

## Funcionalidades principales
- Sistema de **login** con distintos roles de usuario.
- Implementación de **guards** para proteger rutas según permisos.
- CRUD completos para:
  - Clientes
  - Reservas
  - Habitaciones
  - Empleados
  - Facturación
- Comunicación con el backend mediante peticiones **HTTP**.
- **Interfaz moderna y responsive** optimizada para distintos dispositivos.
- Uso de **servicios** para la lógica de negocio y conexión con la API.

---

## Tecnologías utilizadas
- **Framework:** Angular 20  
- **Lenguajes:** TypeScript, HTML, CSS  
- **Estructura de interfaz:** FXML / componentes Angular  
- **Gestión de rutas y guards:** Angular Router  
- **HTTP Client:** Angular HttpClient  
- **Diseño y maquetado:** Bootstrap / TailwindCSS  
- **Autenticación:** JWT (en conexión con Spring Security del backend)

---

## Ejecución del proyecto
1. Clonar el repositorio  
   ```bash
   git clone https://github.com/tu-usuario/RestInn-FrontEnd-Angular.git

2. Configurar el archivo application.properties con tus credenciales de MySQL.

3. Ejecutar la aplicación desde tu IDE o con:
  ```bash
   mvn spring-boot:run

---

## Integrantes
- [EmiSalias]
- [ManuJurado]
- [Lisandstone]
- [joacom7]