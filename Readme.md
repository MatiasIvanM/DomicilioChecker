# Sistema de Cálculo de Distancias y Almacenamiento en MySQL

Este repositorio contiene un sistema que permite calcular distancias entre direcciones utilizando la API de Google Maps y almacenar los resultados en una base de datos MySQL. El sistema está diseñado para facilitar la obtención de información sobre empleados a partir de datos almacenados en un archivo Excel.

## Descripción

El sistema realiza las siguientes funciones:

1. **Lectura de Datos desde Excel**: Extrae información sobre empleados desde un archivo Excel (DOMICILIOS.xlsx) que debe estar en el mismo directorio que el script.
2. **Obtención de Coordenadas**: Utiliza la API de Google Maps para convertir direcciones en coordenadas geográficas.
3. **Cálculo de Distancias**: Calcula la distancia a pie desde dos puntos de referencia fijos a las direcciones de los empleados.
4. **Almacenamiento en MySQL**: Guarda o actualiza la información de los empleados en una base de datos MySQL.

## Requisitos

- **Node.js**: Asegúrate de tener instalado Node.js (versión 12 o superior).
- **MySQL**: Necesitas una base de datos MySQL configurada.
- **API de Google Maps**: Regístrate en Google Cloud y obtén una clave API para acceder a los servicios de Geocoding y Distance Matrix.
- **Archivo Excel**: Un archivo Excel llamado `DOMICILIOS.xlsx` que contenga los datos de los empleados.

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/tu_usuario/nombre_del_repositorio.git
   cd nombre_del_repositorio

2. Instala las dependencias:

   ```bash
   npm install
   pnpm install
   yarn install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con el template de `.env.template`:

## Uso

1. Asegúrate de que tu base de datos MySQL esté corriendo y que el archivo DOMICILIOS.xlsx esté disponible en el directorio del proyecto.

2. Ejecuta el script:
    ```
    node app.js
    ```

## Estructura del Proyecto
```
nombre_del_repositorio/
├── app.js                 # Archivo principal donde se ejecuta el sistema
├── .env                   # Configuraciones de entorno (no subir a GitHub)
├── errors.log             # Registro de errores
├── DOMICILIOS.xlsx        # Archivo Excel con datos de empleados
├── package.json           # Dependencias del proyecto
├── LICENSE                # Archivo de licencia
└── README.md              # Este archivo
```
## Reporte de Issues

Si deseas reportar un problema, sugerir una mejora o realizar una consulta, puedes hacerlo a través de:

    La sección de Issues en este repositorio de GitHub.
    Enviando un correo electrónico a matiasivan.sd@gmail.com o matiasivan.m@hotmail.com.