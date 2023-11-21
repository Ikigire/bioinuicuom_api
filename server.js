const express = require("express");
// const mysql = require("mysql");
const app = express();
const port = 4000;
const awsIot = require('aws-iot-device-sdk');

thingName = 'ESP';

var iotMessage = {};

var device = awsIot.device({
  keyPath: './private.pem.key',
  certPath: './certificate.pem.crt',
  caPath: './AmazonRootCA1.pem',
  clientId: thingName,
  //host: 'a30lo353syqta8.iot.us-east-2.amazonaws.com', // para certificados VeriSign
  host: 'a30lo353syqta8-ats.iot.us-east-2.amazonaws.com'
});

device.on('connect', function () {
  //console.log('connected to AWS');
  device.subscribe('IAQ/142800F7C630');
});

device.on('close', function () {
  console.log('close');
});

device.on('subscribe', () => {
  console.log("haciendo subs");
  iotMessage = {};
})

// device.on('message', (topic, payload) => {
//   // console.log(payload.toString());

//   iotMessage = JSON.parse(payload.toString());
// });


// const connection = mysql.createConnection({
//   host: "databasebio.cibiqrienzzp.us-east-2.rds.amazonaws.com",
//   user: "admin",
//   password: "bio20cuom",
//   database: "bioCuom"
// });

// connection.connect(err => {
//   if (err) {
//     console.error("Error al conectar a la base de datos:", err);
//   } else {
//     console.log("Conexión exitosa a la base de datos.");
//   }
// });

// connection.on("error", err => {
//   console.error("Error en la conexión a la base de datos:", err);
// });

app.use(express.json());

// app.get("/checkEmail/:email", (req, res) => {
//   const email = req.params.email;
//   const query = "SELECT COUNT(*) AS count FROM Usuario WHERE email = ?";
//   connection.query(query, [email], (err, result) => {
//     if (err) {
//       console.error("Error al verificar el correo electrónico:", err);
//       return res.status(500).json({ error: "Error al verificar el correo electrónico." });
//     }

//     const emailExists = result[0].count > 0;
//     return res.status(200).json({ emailExists });
//   });
// });

// app.post("/registro", (req, res) => {
//   const { nombre, email, password } = req.body;
//   const rol = "usuario";

//   if (!nombre || !email || !password) {
//     return res.status(400).json({ error: "Todos los campos son requeridos." });
//   }

//   const insertQuery = "INSERT INTO Usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
//   connection.query(insertQuery, [nombre, email, password, rol], (insertErr, result) => {
//     if (insertErr) {
//       console.error("Error al insertar el usuario:", insertErr);
//       return res.status(500).json({ error: "Error al insertar el usuario en la base de datos." });
//     }
//     console.log("Usuario registrado:", result);
//     return res.status(200).json({ message: "Usuario registrado correctamente." });
//   });
// });

app.get('/hola', (req, res) => {
  return res.status(200).json({ 'saludo': 'Que pedo, Coma tierra' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

app.get('/mqtt/:mac', (req, res) => {
  let mac = req.params.mac;
  device.unsubscribe();
  // device.subscribe(`IAQ/${mac}`);
  device.subscribe(`IAQ/142800F7C630`);
  console.log(mac);

  device.on('message', (topic, payload) => {
    // console.log(payload.toString());
  
    iotMessage = JSON.parse(payload.toString());
    return res.status(200).json(iotMessage);
  });

  // return res.status(200).json(iotMessage);
});



