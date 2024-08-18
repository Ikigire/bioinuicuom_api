const { dynamodb, tableName } = require("../utils/db.utils");

const getGraphicData = async (req, res) => {
    try {
        const { mac } = req.params;
        const { order = 'asc', period } = req.query;

        if (!period) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'Es necesario especificar un periodo de tiempo válido: [24h, w, 2w, m, 6m, y] con el nombre "period"'
            });
        }

        const now = Date.now();
        let range, interval, periodName;
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

        const from = now - range * interval;

        const data = await dynamodb.scan({
            TableName: tableName,
            FilterExpression: `idDispositivo = :id AND fh BETWEEN :inicio AND :fin`,
            ExpressionAttributeValues: {
                ':id': { S: mac },
                ':inicio': { N: `${from}` },
                ':fin': { N: `${now}` }
            }
        }).promise();

        if (!data.Items.length) {
            return res.status(204).json({
                message: 'La petición se completó con éxito, sin embargo no hay datos para ese periodo de tiempo, seleccione uno mayor'
            });
        }

        const calculateStatistics = (data) => {
            const results = [];

            for (let actual = 0; actual < range; actual++) {
                const periodData = data.filter(value => {
                    const timestamp = parseInt(value.fh.N);
                    return timestamp <= now - interval * actual && timestamp > now - interval * (actual + 1);
                });

                const temperature = periodData.map(value => parseFloat(value.t.S ?? value.t.N));
                const humidity = periodData.map(value => parseFloat(value.h.S ?? value.h.N));
                const co2 = periodData.map(value => parseFloat(value.c.S ?? value.c.N));
                const voc = periodData.map(value => parseFloat(value.v.S ?? value.v.N));

                results.push({
                    name: `${periodName} ${actual + 1}`,
                    temp: temperature,
                    humidity: humidity,
                    co2: co2,
                    voc: voc
                });
            }
            return results;
        };
        const results = calculateStatistics(data.Items);
        return res.status(200).json({
            results
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorType: 'No fue posible completar la operación',
            message: error.message
        });
    }
};

const getHistoricalData = async (req, res) => {
    try {
        const { mac } = req.params;
        let { page = 1, pageElements = 50, from = new Date(0).getTime(), to = Date.now(), order = 'asc' } = req.query;

        const data = await dynamodb.scan({
            TableName: tableName,
            FilterExpression: `idDispositivo = :id AND fh BETWEEN :inicio AND :fin`,
            ExpressionAttributeValues: {
                ':id': { S: mac },
                ':inicio': { N: `${from}` },
                ':fin': { N: `${to}` }
            }
        }).promise();

        if (!data.Items.length) {
            return res.status(404).json({
                errorType: 'idDispositivo no encontrado',
                message: `No fue posible encontrar registros del dispositivo con el idDispositivo ${mac}`
            });
        }

        const totalPages = Math.ceil(data.Items.length / pageElements);
        const sortedItems = data.Items.sort((a, b) => order === 'asc' ? a.fh.N - b.fh.N : b.fh.N - a.fh.N);
        const paginatedItems = sortedItems.slice((page - 1) * pageElements, page * pageElements);

        return res.status(200).json({
            data: paginatedItems,
            page,
            totalPages,
            next: page < totalPages ? page + 1 : null,
            prev: page > 1 ? page - 1 : null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorType: 'No es posible conectarse con DynamoDB',
            message: `No fue posible conectarse con DynamoDB, para corregir este error póngase en contacto con el desarrollador`,
            ...error
        });
    }
};

const getDatesRange = async (req, res) => {
    try {
        const { mac } = req.params;

        const data = await dynamodb.scan({
            TableName: tableName,
            FilterExpression: `idDispositivo = :id`,
            ExpressionAttributeValues: {
                ':id': { S: mac }
            }
        }).promise();

        if (!data.Items.length) {
            return res.status(404).json({
                errorType: 'idDispositivo no encontrado',
                message: `No fue posible encontrar registros del dispositivo con el idDispositivo ${mac}`
            });
        }

        const dates = data.Items.map(item => new Date(parseInt(item.fh.N)).toISOString().split('T')[0]);
        const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(a) - new Date(b));

        return res.status(200).json({
            firstDate: uniqueDates[0],
            lastDate: uniqueDates[uniqueDates.length - 1]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorType: 'No fue posible completar la operación',
            message: error.message
        });
    }
};

module.exports = {
    getGraphicData,
    getHistoricalData,
    getDatesRange
};
