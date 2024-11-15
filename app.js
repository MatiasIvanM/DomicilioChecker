require("dotenv").config();
const axios = require("axios");
const mysql = require("mysql2/promise");
const fs = require("fs");
const xlsx = require("xlsx");
const ProgressBar = require("progress"); // Importar la biblioteca de progreso

const mysqlConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// * Función para guardar ERRORES en un archivo log
function logError(errorMsg, detalles = {}) {
  const timestamp = new Date().toISOString();
  const logMessage =
    `${timestamp} - ${errorMsg}\n` +
    `Legajo: ${detalles.legajo || "N/A"}\n` +
    `Nombre: ${detalles.nombre || "N/A"}\n` +
    `Dirección: ${detalles.direccion || "N/A"}\n\n`;
  fs.appendFile("errors.log", logMessage, (err) => {
    if (err) console.error("Error al escribir en el log:", err.message);
  });
}

// * Función para guardar domicilios para revisar en un archivo log
function guardarDomiciliosParaRevisar(domicilio, legajo, nombre) {
  const fecha = new Date().toISOString().split("T")[0]; // Solo la fecha (YYYY-MM-DD)

  // Crear un objeto para representar la fila
  const newRow = {
    Fecha: fecha,
    Legajo: legajo,
    Nombre: nombre,
    Domicilio: domicilio,
  };

  // Verifica si el archivo Excel ya existe
  const filePath = "DomiciliosParaRevisar.xlsx";
  let workbook;
  let worksheet;

  if (fs.existsSync(filePath)) {
    // Si existe, lee el archivo
    workbook = xlsx.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const existingData = xlsx.utils.sheet_to_json(worksheet);

    // Agrega la nueva fila a los datos existentes
    existingData.push(newRow);

    // Crea una nueva hoja de cálculo
    worksheet = xlsx.utils.json_to_sheet(existingData);
    workbook.Sheets[workbook.SheetNames[0]] = worksheet;
  } else {
    // Si no existe, crea un nuevo libro de trabajo y hoja
    workbook = xlsx.utils.book_new();
    worksheet = xlsx.utils.json_to_sheet([newRow]);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Domicilios");
  }

  // Escribe el libro de trabajo de vuelta en el archivo
  xlsx.writeFile(workbook, filePath);
}

async function guardarResultados(resultados) {
  const connection = await mysql.createConnection(mysqlConfig);
  const bar = new ProgressBar("Guardando resultados [:bar] :percent :etas", {
    total: resultados.length,
    width: 40,
  });

  try {
    for (const resultado of resultados) {
      const checkQuery = `
        SELECT COUNT(*) as count FROM empleados_paro WHERE legajo = ?`;
      const [checkResult] = await connection.execute(checkQuery, [
        resultado.legajo,
      ]);
      const exists = checkResult[0].count > 0;

      const insertValues = [
        resultado.legajo,
        resultado.apellidoNombre,
        resultado.barrio || null,
        resultado.partido || null,
        resultado.direccion,
        resultado.localidad || null,
        resultado.sitio,
        resultado.distanciaAve || null,
        resultado.distanciaSm || null,
      ];

      if (exists) {
        const updateQuery = `
          UPDATE empleados_paro
          SET apellido_nombre = ?, barrio = ?, partido = ?, direccion = ?, localidad = ?, sitio = ?, distancia_ave = ?, distancia_sm = ?
          WHERE legajo = ?`;

        await connection.execute(updateQuery, [
          resultado.apellidoNombre,
          resultado.barrio || null,
          resultado.partido || null,
          resultado.direccion,
          resultado.localidad || null,
          resultado.sitio,
          resultado.distanciaAve || null,
          resultado.distanciaSm || null,
          resultado.legajo,
        ]);
      } else {
        const insertQuery = `
          INSERT INTO empleados_paro (legajo, apellido_nombre, barrio, partido, direccion, localidad, sitio, distancia_ave, distancia_sm)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await connection.execute(insertQuery, insertValues);
      }

      bar.tick();
    }
  } catch (err) {
    const errorMessage = `Error al guardar resultados en MySQL: ${err.message}`;
    console.error(errorMessage);
    logError(errorMessage, {
      legajo: resultados.legajo,
      nombre: resultados.apellidoNombre,
      direccion: resultados.direccion,
    });
  } finally {
    await connection.end();
  }
}

function obtenerDatosDesdeExcel(rutaArchivo) {
  const workbook = xlsx.readFile(rutaArchivo);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const datos = xlsx.utils.sheet_to_json(hoja);

  const datosfiltrados= datos.map((fila) => ({
    legajo: fila.Legajo,
    apellidoNombre: fila["Apellido y Nombre"],
    barrio: fila.Barrio || null,
    partido: fila.Partido || null,
    localidad: fila.Localidad || null,
    provincia: fila.Provincia || null,
    sitio: fila.Sitio || null,
    direccion: `${fila.Calle} ${fila.Nº}, ${fila.Barrio}, ${fila.Localidad}, ${fila.Provincia}, Argentina`,
  }));

 console.log("🚀 ~ datosfiltrados:", datosfiltrados)

 return datosfiltrados;
}

async function obtenerCoordenadasGoogle(direccion) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    direccion
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await axios.get(url);
    const location = response.data.results[0]?.geometry.location;
    return location
      ? { lat: location.lat, lon: location.lng, direccion }
      : null;
  } catch (err) {
    const errorMessage = `Error al obtener coordenadas para ${direccion}: ${err.message}`;
    console.error(errorMessage);
    logError(errorMessage);
    return null;
  }
}

async function calcularDistancia(origen, destino) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origen.lat},${origen.lon}&destinations=${destino.lat},${destino.lon}&mode=walking&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await axios.get(url);
    if (response.data.rows[0].elements[0].status === "OK") {
      return response.data.rows[0].elements[0].distance.value; // Devuelve la distancia en metros
    } else {
      const errorMessage = `No se pudo calcular la distancia: ${response.data.rows[0].elements[0].status}`;
      console.error(errorMessage);
      logError(errorMessage);
      return null;
    }
  } catch (err) {
    const errorMessage = `Error al calcular la distancia: ${err.message}`;
    console.error(errorMessage);
    logError(errorMessage);
    return null;
  }
}



async function calcularDistancias() {
  const coordenadasAve = {
    lat: parseFloat(process.env.COORDENADAS_AVE_LAT),
    lon: parseFloat(process.env.COORDENADAS_AVE_LON),
  };
  const coordenadasSm = {
    lat: parseFloat(process.env.COORDENADAS_SM_LAT),
    lon: parseFloat(process.env.COORDENADAS_SM_LON),
  };

  const resultados = [];
  const datos = obtenerDatosDesdeExcel("DOMICILIOS.xlsx");

  if (!datos || datos.length === 0) {
    console.error("No se encontraron datos en el archivo Excel.");
    return;
  }

  const bar = new ProgressBar("Obteniendo coordenadas [:bar] :percent :etas", {
    total: datos.length,
    width: 40,
  });

  // Palabras clave para la verificación
  const palabrasClave = [
    "mza",
    "mz",
    "mzn",
    "mzna",
    "MANZANA",
    "casa",
    "lote",
    // Puedes agregar más palabras clave según sea necesario
  ];

  for (let i = 0; i < datos.length; i++) {
    const coordenadas = await obtenerCoordenadasGoogle(datos[i].direccion);
    if (coordenadas) {
      const distanciaAve = await calcularDistancia(coordenadas, coordenadasAve);
      const distanciaSm = await calcularDistancia(coordenadas, coordenadasSm);

      const resultado = {
        legajo: datos[i].legajo,
        apellidoNombre: datos[i].apellidoNombre,
        direccion: datos[i].direccion,
        barrio: datos[i].barrio,
        partido: datos[i].partido,
        localidad: datos[i].localidad,
        sitio: datos[i].sitio,
        distanciaAve: distanciaAve !== null ? distanciaAve : null,
        distanciaSm: distanciaSm !== null ? distanciaSm : null,
      };

      resultados.push(resultado);

      // Verificar si el domicilio contiene palabras clave
      const direccionSplit = resultado.direccion.toLowerCase().split(/\s+/); // Divide la dirección en palabras
      const contienePalabraClave = palabrasClave.some(
        (palabra) => direccionSplit.includes(palabra.toLowerCase()) // Comprueba si alguna palabra clave está en la dirección
      );

      if (contienePalabraClave) {
        guardarDomiciliosParaRevisar(
          resultado.direccion,
          resultado.legajo,
          resultado.apellidoNombre
        );
      }
    } else {
      const errorMessage = `Error al obtener coordenadas para ${datos[i].direccion}`;
      console.error(errorMessage);
      logError(errorMessage);
    }

    bar.tick();
  }

  await guardarResultados(resultados);
  console.log("Cálculo de distancias completado.");
}
calcularDistancias().catch((error) => {
  console.error("Error en el proceso:", error);
});
