require("dotenv").config();
const sql = require("mssql");
const axios = require("axios");
const mysql = require("mysql2/promise");
const fs = require("fs");

const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

function logError(errorMsg) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${errorMsg}\n\n`;
  fs.appendFile("errors.log", logMessage, (err) => {
    if (err) console.error("Error al escribir en el log:", err.message);
  });
}

async function guardarResultados(resultados) {
  const connection = await mysql.createConnection(mysqlConfig);

  try {
    for (const resultado of resultados) {
      const query = `
        INSERT INTO empleados_paro (legajo, apellido_nombre, barrio, partido, direccion, sucursal, distancia_ave, distancia_sm)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(query, [
        resultado.legajo,
        resultado.apellidoNombre,
        resultado.barrio,
        resultado.partido,
        resultado.direccion,
        resultado.sucursal,
        resultado.distanciaAve,
        resultado.distanciaSm,
      ]);
    }
  } catch (err) {
    const errorMessage = `Error al guardar resultados en MySQL: ${err.message}`;
    console.error(errorMessage);
    logError(errorMessage);
  } finally {
    await connection.end();
  }
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function obtenerDatos() {
  try {
    await sql.connect(config);
    const result =
      await sql.query`SELECT Legajo, ApelllidoNombre, Activo, Calle, Numero, Barrio, Partido, Provincia, Sucursal FROM Employees_RRHH WHERE Activo = 1`;
    const resultados = result.recordset.map((row) => ({
      legajo: row.Legajo,
      apellidoNombre: row.ApelllidoNombre,
      barrio: row.Barrio,
      partido: row.Partido,
      sucursal: row.Sucursal,
      direccion: `${row.Calle} ${row.Numero}, ${row.Barrio}, ${row.Partido}, Argentina`,
    }));
    console.log("🚀 ~ obtenerDatos ~ resultados:", resultados)
    return resultados;
  } catch (err) {
    const errorMessage = `Error al obtener datos: ${err.message}`;
    console.error(errorMessage);
    logError(errorMessage);
    return null;
  } finally {
    await sql.close();
  }
}

async function obtenerCoordenadas(direccion) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    direccion
  )}&format=json&addressdetails=1`;
  try {
    const response = await axios.get(url);
    return response.data[0]
      ? {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          direccion,
        }
      : null;
  } catch (err) {
    const errorMessage = `Error al obtener coordenadas para ${direccion}: ${err.message}`;
    console.error(errorMessage);
    logError(errorMessage);
    return null;
  }
}

async function calcularDistanciaCaminando(origen, destino) {
  const ORS_API_KEY = process.env.ORS_API_KEY;
  const url = `https://api.openrouteservice.org/v2/directions/foot-walking`;
  try {
    const response = await axios.post(
      url,
      {
        coordinates: [
          [origen.lon, origen.lat],
          [destino.lon, destino.lat],
        ],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.routes[0].summary.distance;
  } catch (err) {
    const errorMessage = `Error al calcular la distancia: ${err.response.data}`;
    console.error(errorMessage);
    logError(errorMessage);
    return null;
  }
}

async function calcularDistancias() {
  const coordenadasAve = { lat: -31.4067958284536, lon: -64.19401851900112 };
  const coordenadasSm = { lat: -31.41562607511101, lon: -64.18391632244898 };

  const resultados = [];
  const datos = await obtenerDatos();

  if (!datos) {
    console.error("No se pudieron obtener direcciones.");
    return;
  }

  for (let i = 0; i < datos.length; i++) {
    const coordenadas = await obtenerCoordenadas(datos[i].direccion);
    if (coordenadas) {
      const distanciaAve = await calcularDistanciaCaminando(
        coordenadas,
        coordenadasAve
      );
      const distanciaSm = await calcularDistanciaCaminando(
        coordenadas,
        coordenadasSm
      );

      const resultado = {
        legajo: datos[i].legajo,
        apellidoNombre: datos[i].apellidoNombre,
        barrio: datos[i].barrio,
        partido: datos[i].partido,
        direccion: datos[i].direccion,
        sucursal: datos[i].sucursal,
        distanciaAve: distanciaAve !== null ? distanciaAve : null,
        distanciaSm: distanciaSm !== null ? distanciaSm : null,
      };

      resultados.push(resultado);
      console.log("Resultado:", resultado);
    } else {
      const errorMessage = `Error al obtener coordenadas para ${datos[i].direccion}`;
      console.error(errorMessage);
      logError(errorMessage);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  await guardarResultados(resultados);
  console.log("Cálculo de distancias completado.");
}

// Ejecutar la función al iniciar el script
calcularDistancias().catch((error) => {
  console.error("Error en el proceso:", error);
});
