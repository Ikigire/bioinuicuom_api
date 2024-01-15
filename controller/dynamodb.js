const { dynamodb, tableName, ddbDocumentClient } = require("../utils/db.utils");


module.exports = {
    getHistoricalData: (req, res) => {
        const { mac } = req.params;

        let { page, pageElements, from, to, order } = req.query;

        if (to == undefined || !to) {
            to = + Date.now();
        }

        if (from == undefined || !from) {
            from = + new Date(0);
            from
        }

        if (page == undefined || !page) {
            page = 1;
        } else {
            page = +page
        }
        
        if (pageElements == undefined || !pageElements) {
            pageElements = 50;
        } else {
            pageElements = +pageElements
        }
        
        if (order == undefined || !order) {
            order = "asc";
        } else {
            order = new String(order).toLowerCase();
        }

        console.log("Mac recibida: ", mac);
        console.log("From: ", from, 'To: ', to);

        dynamodb
            .scan({
                TableName: tableName,
                // FilterExpression: `idDispositivo = :id`,
                FilterExpression: `idDispositivo = :id AND fh BETWEEN :inicio AND :fin`,
                ExpressionAttributeValues: {
                    ':id': { S: mac },
                    ':inicio': { N: '' + from },
                    ':fin': { N: '' + to }
                }
            })
            .promise()
            .then(data => {
                // console.log("Última página: ", data.Items.length / 50);
                const totalPages = Math.ceil(data.Items.length / 50);
                let pageItems = [];

                data.Items = data.Items.sort((a, b) => {
                    if (a.fh.N < b.fh.N) {
                        return order === 'asc' ? -1 : 1;
                    }
                    return order === 'asc' ? 1 : -1;
                });
                // const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                // const queryPos = + (new String(req.originalUrl).indexOf('?'));
                // const endpoint = new String(req.originalUrl).substring(0, queryPos);
                // let next = req.protocol + '://' + req.get('host') + endpoint + `?page=${page + 1}&pageElements=${pageElements}`;
                let next = page + 1;
                let prev = page - 1;
                
                if ( prev == 0 )
                    prev = null;

                if (page < totalPages) {
                    pageItems = data.Items.slice((page - 1) * pageElements, page * pageElements);
                } else if (page === totalPages) {
                    pageItems = data.Items.slice((page - 1) * pageElements);
                    next = null;
                } else {
                    if ( totalPages == 0 ){
                        return res.status(400).json({
                            errorType: 'idDispositivo no entontrado',
                            message: `No fue posible encontrar registros del dispositivo con el idDispositivo ${mac}`
                        });
                    }
                    
                    return res.status(400).json({
                        errorType: 'Pagination out of bounds',
                        message: `No fue posible conectarse con DynmoDB, para corregir este error póngase en contacto con el desarrollador`
                    });
                }

                // console.log("Datos a enviar: ", pageItems.length);

                return res.status(200).json({
                    data: pageItems,
                    page,
                    totalPages,
                    next,
                    prev
                });
            })
            .catch(error => {
                console.log(error);
                // if (!hasResturned){
                //     hasResturned = true;
                //     return;
                // }
                // return res.status(409).json(error);
                return res.status(409).json({
                    errorType: 'No es posible conectarse con DynamoDB',
                    message: `No fue posible conectarse con DynmoDB, para corregir este error póngase en contacto con el desarrollador`,
                    ...error
                });
            })
        // return res.status(409)json({
        //     errorType: 'No es posible conectarse con DynamoDB',
        //     message: `No fue posible conectarse con DynmoDB, para corregir este error póngase en contacto con el desarrollador`
        // });
    },
    getDatesRange: (req, res) => {
        const { mac } = req.params;

        dynamodb
            .scan({
                TableName: tableName,
                // FilterExpression: `idDispositivo = :id`,
                FilterExpression: `idDispositivo = :id`,
                ExpressionAttributeValues: {
                    ':id': { S: mac }
                }
            })
            .promise()
            .then(data => {
                
                // Ordenamiento ascendente
                data.Items = data.Items.sort((a, b) => {
                    if (a.fh.N < b.fh.N) {
                        return -1;
                    }
                    return 1;

                });

                const first_register = data.Items[0].fh.N;
                const last_register = data.Items[ data.Items.length - 1 ].fh.N;

                return res.status(200).json({
                    idDispositivo: mac,
                    first_register,
                    last_register
                });
            })
            .catch(error => {
                console.log(error);
                // if (!hasResturned){
                //     hasResturned = true;
                //     return;
                // }
                // return res.status(409).json(error);
                return res.status(409).json({
                    errorType: 'No es posible conectarse con DynamoDB',
                    message: `No fue posible conectarse con DynmoDB, para corregir este error póngase en contacto con el desarrollador`,
                    ...error
                });
            })
    }
}