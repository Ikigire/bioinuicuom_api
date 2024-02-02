const { dynamodb, tableName, ddbDocumentClient } = require("../utils/db.utils");


module.exports = {
    getGraphicData: (req, res) => {
        const { mac } = req.params;

        let { order, period } = req.query;

        if (!period)
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'Es necesario especificar un periodo de tiempo pueden ser lo siguientes [24h, w, 2w, m, 6m, y] con el nombre "period"'
            })

        let from = 0, to = Date.now();
        let range = 24, interval = 1000 * 60 * 60;
        let intervalName = 'hour'



        switch (period.toLowerCase()) {
            case '24h':
                from = + to - range * interval;
                break;

            case 'w':
                interval *= 24;
                range = 7;
                from = +to - interval * range;
                intervalName = 'day'
                break;

            case '2w':
                interval *= 24;
                range = 14;
                from = +to - interval * range;
                intervalName = 'day'
                break;

            case 'm':
                interval *= 24 * 7;
                range = 4;
                from = +to - interval * range;
                intervalName = 'week'
                break;

            case '6m':
                interval *= 24 * 7 * 4;
                range = 6;
                from = +to - interval * range;
                intervalName = 'month'
                break;

            case 'y':
                interval *= 24 * 7 * 4;
                range = 12;
                from = +to - interval * range;
                intervalName = 'month'
                break;

            default:
                return res.status(400).json({
                    errorType: 'La petición no se puede completar',
                    message: `El periodo de tiempo ${period} no está habilitado aún seleccione otro`
                });
        }

        console.log("Periodo recibido:", period);
        console.log("\n", interval, intervalName, range);

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
                let results = [];
                let temperature = [], humidity = [];
                let actual = 0;
                console.log(`Datos para trabajar ${data.Items.length}\n`, data.Items.slice(0, 5));

                if (data.Items.length <= 0)
                    return res.status(204).json({
                        message: 'La petición se completo con éxito, sin embargo no hay datos para ese periodo de tiempo, seleccione uno mayor'
                    });


                while (actual < range) {

                    // console.log(`Revisando en el rango de ${to - interval * actual} a ${to - interval * (actual + 1)}`);
                    let filteredData = data.Items.filter((value) =>
                        (parseInt(value.fh.N) <= to - interval * actual && parseInt(value.fh.N) > to - interval * (actual + 1))
                    );

                    temperature = filteredData.map(value => parseFloat(value.t.S ?? value.t.N).toFixed(2));

                    humidity = filteredData.map(value => parseFloat(value.h.S ?? value.h.N).toFixed(2));

                    console.log(`\nTemperaturas vuelta numero ${actual}:`, temperature.length, temperature.slice(0, 5));

                    let maxTemp = 0;
                    let maxHumi = 0;
                    let minTemp = 0;
                    let minHumi = 0;
                    let meanTemp = 0;
                    let meanHumi = 0;

                    if (filteredData.length) {
                        maxTemp = Math.max(...temperature).toFixed(2);
                        maxHumi = Math.max(...humidity).toFixed(2);
                        // console.log(`Máxima temperatura del valor actual ${actual} ${maxTemp}`)
                        // console.log(`Máxima humedad del valor actual ${actual} ${maxHumi}`)

                        minTemp = Math.min(...temperature).toFixed(2);
                        minHumi = Math.min(...humidity).toFixed(2);
                        // console.log(`Mínima temperatura del valor actual ${actual} ${minTemp}`)
                        // console.log(`Mínima humedad del valor actual ${actual} ${minHumi}`)

                        meanTemp = (temperature.reduce((prev, next) => parseFloat(prev) + parseFloat(next), 0) / temperature.length).toFixed(2);
                        meanHumi = (humidity.reduce((prev, next) => parseFloat(prev) + parseFloat(next), 0) / humidity.length).toFixed(2);
                        // console.log(`Promedio temperatura del valor actual ${actual} ${meanTemp}`)
                        // console.log(`Promedio humedad del valor actual ${actual} ${meanHumi}\n`)
                    }

                    actual++;
                    results.push({
                        name: `${intervalName} ${actual}`,
                        max: {
                            temp: maxTemp,
                            humidity: maxHumi
                        },
                        min: {
                            temp: minTemp,
                            humidity: minHumi
                        },
                        mean: {
                            temp: meanTemp,
                            humidity: meanHumi,
                        }
                    });
                }

                // Ordenando los datos
                data.Items = data.Items.sort((a, b) => {
                    if (a.fh.N < b.fh.N) {
                        return order === 'asc' ? -1 : 1;
                    }
                    return order === 'asc' ? 1 : -1;
                });

                // let meanTemp = (+data.Items.reduce((prev, next) => ({ t: { S: parseFloat(prev.t.S) + parseFloat(next.t.S) } }), { t: { S: 0 } })),
                //     meanHumi = (+data.Items.reduce((prev, next) => ({ h: { S: parseFloat(prev.h.S) + parseFloat(next.h.S) } }), { h: { S: 0 } }));

                let meanTemp = (data.Items.map((val) => parseFloat(val.t.S ?? val.t.N)).reduce((prev, next) => prev + next, 0) / data.Items.length).toFixed(2),
                    meanHumi = (data.Items.map((val) => parseFloat(val.h.S ?? val.h.N)).reduce((prev, next) => prev + next, 0) / data.Items.length).toFixed(2);

                console.log(`Suma de temp: ${meanTemp}\nSuma de Humi: ${meanHumi}`);

                let medianTemp = 0, medianHumi = 0;

                if (data.Items.length % 2 == 0) {
                    medianTemp = ((+data.Items[data.Items.length / 2].t.S + +data.Items[data.Items.length / 2 + 1].t.S) / 2).toFixed(2);
                    medianHumi = ((+data.Items[data.Items.length / 2].h.S + +data.Items[data.Items.length / 2 + 1].h.S) / 2).toFixed(2);
                } else {
                    medianTemp = (+data.Items[Math.trunc(data.Items.length / 2)].t.S).toFixed(2);
                    medianHumi = (+data.Items[Math.trunc(data.Items.length / 2)].h.S).toFixed(2);
                }

                let hashMapTemp = {},
                    hashMapHumi = {};

                data.Items.forEach((val) => {
                    if (!hashMapTemp[Math.trunc(+val.t.S ?? +val.t.N).toString()]) {
                        hashMapTemp[Math.trunc(+val.t.S ?? +val.t.N).toString()] = 1;
                    } else {
                        hashMapTemp[Math.trunc(+val.t.S ?? +val.t.N).toString()] += 1;
                    }

                    if (!hashMapHumi[Math.trunc(+val.h.S ?? +val.h.N).toString()]) {
                        hashMapHumi[Math.trunc(+val.h.S ?? +val.h.N).toString()] = 1;
                    } else {
                        hashMapHumi[Math.trunc(+val.h.S ?? +val.h.N).toString()] += 1;
                    }
                })

                let temps = Object.keys(hashMapTemp), tempCounts = Object.values(hashMapTemp);
                let modeTemp = temps[tempCounts.indexOf(Math.max(...tempCounts))];

                let humis = Object.keys(hashMapHumi), humisCounts = Object.values(hashMapHumi);
                let modehumi = humis[humisCounts.indexOf(Math.max(...humisCounts))];

                return res.status(200).json({
                    mean: {
                        temp: meanTemp,
                        humidity: meanHumi
                    },
                    mode: {
                        temp: modeTemp,
                        humidity: modehumi
                    },
                    median: {
                        temp: medianTemp,
                        humidity: medianHumi
                    },
                    results
                })
            })
            .catch(error => {
                console.log(error);
                return res.status(409).json({
                    errorType: 'No fue posible completar la operación',
                    message: error.message,
                    ...error
                });
            })
    },
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

                if (prev == 0)
                    prev = null;

                if (page < totalPages) {
                    pageItems = data.Items.slice((page - 1) * pageElements, page * pageElements);
                } else if (page === totalPages) {
                    pageItems = data.Items.slice((page - 1) * pageElements);
                    next = null;
                } else {
                    if (totalPages == 0) {
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
                const last_register = data.Items[data.Items.length - 1].fh.N;

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