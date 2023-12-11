require('dotenv').config(); // Leyendo variables de entorno
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors')

const UsuarioRouter = require('./routes/usuario.routes');
const MqttRouter = require('./routes/mqtt.routes');


// creación y configuración de la app con Express
const app = express();  // creación de la app
const port = process.env.API_PORT;      // definición de puerto para la app
app.use(cors());

// console.log( process.env );

// Mostrar todas las peticiones y errores en consola
app.use(logger('dev'));

// Verificador de entradas en el cuerpo de las peticiones
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// DEFINICIÓN DE ENDPOINTS
// Base resp
app.get('/', (req, res) => {
    res.json({ message: "Hello  world" });
});
// Usuario
app.use('/usuarios', UsuarioRouter)
// Mqtt
app.use('/mqtt', MqttRouter)

app.listen(port, () => {
    console.log(`Escuchando por peticiones en localhost${port}`);
});