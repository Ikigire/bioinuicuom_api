const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bio.inocuom20@gmail.com',
            pass: 'lyqs desd ixci dppo'
        }
    });
}

/**
 * 
 * @param {String} code Código que hará válida la opración
 * @param {int} messageType Define el tipo de mensaje 1 (default) para mensaje de bienvenida, 2 para mensaje de recuperación de contraseña
 * @returns String (HTML formateado con el mensaje y el código a enviar)
 */
const createHtmlBody = (code, messageType = 1) => {
    let message = '';

    switch (messageType) {
        case 1:
            message = `
            <p>
                !Bienvenido a nuestro servicio de Monitoreo Inteligente de la Calidad del Aire¡
            </p>
            <br>
            <p>
                Agradecemos tu preferencia, sabemos lo importante que es para ti la higiene de tus espacios cerrados,
                con nuestro servicio podrás monitorear valores en tiempo actual y revisar históricos de tus dispositivos,
                esperamos que el servicio sea útil a tus necesidades.
            </p>
            `;
            break;

        case 2:
            message = `
            <p>
                Parece que se te olvidó la contraseña
            </p>
            <br>
            <p>
                No te preocupes a cualquiera le puede pasar, con este servicio podrás restablecer tu contraseña cuando se te haya olvidado, solo tienes que seguir las intrucciones de la aplicación
            </p>
            `;
            break;
        default:
            throw new Error("El tipo de mensaje recibido no es válido")
            // break;
    }
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo código para ti</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }

            body {
                background: #1D6FB8;
            }

            .container {
                width: 300px;
                background: white;
                text-align: center;
                padding: 35px 10px;
                margin: 30px auto;
                border-radius: 15px;
                box-shadow: 0 0 25px rgba(35, 70, 101, 0.3),
                    0 0 50px rgba(35, 70, 101, 0.6),
                    0 0 100px rgba(35, 70, 101, 0.9);
            }

            .container hr {
                width: 25%;
                height: 3px;
                background: rgb(29, 111, 184);
                border-radius: 20%;
                margin: 15px 0;
            }

            .container h1 {
                font-weight: 600;
                letter-spacing: 2px;
                color: #1D6FB8;
                text-shadow: 2px 0 #000;
            }

            .container h4 {
                font-weight: 400;
            }
            
            .container h4::before {
                content: '✌️';
            }
            
            .container h4 {
                font-weight: 400;
            }

            .container p {
                line-height: 25px;
            }

            .message {
                text-align: justify;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>BIO-INOCUOM</h1>
            <hr>
            <div class="message">
                ${message}
            </div>
            <hr>
            <div>
                <br>
                <p>Ingresa el siguiente código en la aplicación</p>
                <h4>Code: <strong>${code}</strong></h4>
            </div>
            <hr>
            <div class="despedida">
                <h4>Atte:</h4>

                <p>
                    El equipo de Bio-Inocuom
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}
const sendEmail = (email, code, messageType = 1) => {
    const transporter = createTransporter();

    let subject = '';

    switch (messageType) {
        case 1:
            subject = 'Bienvenido, Valide su correo por favor';
            break;

        case 2:
            subject = 'Se ha solicitado un cambio de contraseña';
            break;

        default:
            throw new Error("El tipo de mensaje especificado no está contemplado en las opciones");
            // break;
    }

    console.log("Asunto listo");
    const mailOptions = {
        from: 'biocuom_support@biocuom.com',
        to: email,
        subject,
        html: createHtmlBody(code, messageType)
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = ({ sendEmail })