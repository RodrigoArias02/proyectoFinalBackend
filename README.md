Proyecto Final - Backend Ecommerce
-----------------------------------

Bienvenido al repositorio del backend para el Ecommerce Final. Este proyecto proporciona la lógica y funcionalidades necesarias para un sistema de Ecommerce, incluyendo la gestión de productos, autenticación de usuarios, carritos de compra, chat, y más.

Enlaces Importantes
~~~~~~~~~~~~~~~~~~~

- [Inicio (Home)](#)
- [Login](#/login)
- [Registro](#/registro)
- [Administrar Productos](#/administrar-productos)
- [Chat](#/chat)
- [Ver Productos](#/ver-productos)

Descripción
~~~~~~~~~~~

El Ecommerce Final tiene las siguientes características principales:

- **Inicio (Home):** Página principal del Ecommerce.
- **Login:** Permite iniciar sesión en el sistema.
- **Registro:** Lugar para crear una cuenta de usuario.
- **Administrar Productos:** Sección solo accesible para Admins y Premiums. Permite dar de alta, baja y modificar productos.
- **Chat:** Espacio de chat para la comunidad, accesible solo para usuarios iniciados (no disponible para Admins).
- **Ver Productos:** Sección para explorar y añadir productos al carrito.

Funcionalidades
~~~~~~~~~~~~~~~

- **Filtros y Paginación:** Los usuarios pueden filtrar productos por categoría y electrodomésticos, además de paginar los resultados.
- **Login con GitHub:** Posibilidad de iniciar sesión con GitHub.
- **Recuperación de Contraseña:** Si se olvida la contraseña, se puede solicitar un cambio que se envía por correo electrónico.
- **Registro de Usuarios:** Los usuarios pueden registrarse como Admin, Usuario o Premium.
- **Carrito de Compras:** Se crea automáticamente un carrito al registrarse, donde se pueden añadir productos.
- **Perfil de Usuario:** Después de iniciar sesión, los usuarios pueden ver su perfil y detalles de su cuenta.
- **Administrador de Productos:** Para usuarios Premium y Admins, permite agregar, editar y eliminar productos.
- **Chat en Tiempo Real:** Interfaz de chat con timestamps para mensajes.

Instalación
~~~~~~~~~~~

Para ejecutar el backend localmente, sigue estos pasos:

1. Clona el repositorio:

```bash
git clone https://github.com/RodrigoArias02/proyectoFinalBackend.git

Variables de Entorno
--------------------

- ``PORT``: Puerto en el que se ejecuta el servidor.
- ``MONGO_URL``: URL de conexión a MongoDB.
- ``DBNAME``: Nombre de la base de datos.
- ``SECRETSESSION``: Secreto para las sesiones.
- ``CLIENTSECRETGITHUB``: Secreto de cliente para GitHub.
- ``CLIENTIDGITHUB``: ID de cliente para GitHub.
- ``ENTORNO``: Entorno de la aplicación.
- ``URL``: URL de la aplicación.
- ``USEREMAIL``: Correo electrónico para envío de correo.
- ``PASSEMAIL``: Contraseña del correo electrónico.