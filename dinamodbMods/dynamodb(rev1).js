const { dynamodb, tableName } = require("../utils/db.utils");

const TIME_PERIODS = {
    '24h': { range: 24, interval: 1000 * 60 * 60, intervalName: 'hour' },
    'w': { range: 7, interval: 1000 * 60 * 60 * 24, intervalName: 'day' },
    '2w': { range: 14, interval: 1000 * 60 * 60 * 24, intervalName: 'day' },
    'm': { range: 4, interval: 1000 * 60 * 60 * 24 * 7, intervalName: 'week' },
    '6m': { range: 6, interval: 1000 * 60 * 60 * 24 * 7 * 4, intervalName: 'month' },
    'y': { range: 12, interval: 1000 * 60 * 60 * 24 * 7 * 4, intervalName: 'month' }
};

const getGraphicData = async (req, res) => {
    try {
        const { mac } = req.params;
        const { period } = req.query;

        if (!period) {
            return res.status(400).json({
                errorType: 'Bad Request',
                message: 'Es necesario especificar un periodo de tiempo pueden ser lo siguientes [24h, w, 2w, m, 6m, y] con el nombre "period"'
            });
        }

        if (!TIME_PERIODS[period.toLowerCase()]) {
            return res.status(400).json({
                errorType: 'La petición no se puede completar',
                message: `El periodo de tiempo ${period} no está habilitado aún seleccione otro`
            });
        }

        const { range, interval, intervalName } = TIME_PERIODS[period.toLowerCase()];
        const from = Date.now() - range * interval;

        const data = await dynamodb.scan({
            TableName: tableName,
            FilterExpression: `idDispositivo = :id AND fh BETWEEN :inicio AND :fin`,
            ExpressionAttributeValues: {
                ':id': { S: mac },
                ':inicio': { N: `${from}` },
                ':fin': { N: `${Date.now()}` }
            }
        }).promise();

        if (!data.Items.length) {
            return res.status(204).json({
                message: 'La petición se completó con éxito, sin embargo no hay datos para ese periodo de tiempo, seleccione uno mayor'
            });
        }

        const results = data.Items.map(item => ({
            timestamp: item.fh.N,
            temperature: parseFloat(item.t.S ?? item.t.N),
            humidity: parseFloat(item.h.S ?? item.h.N),
            co2: parseFloat(item.c.S ?? item.c.N),
            voc: parseFloat(item.v.S ?? item.v.N)
        }));

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
            errorType: 'No fue posible conectar con DynamoDB',
            message: `No fue posible conectar con DynamoDB, para corregir este error póngase en contacto con el desarrollador`,
            ...error
        });
    }
};

module.exports = {
    getGraphicData,
    getHistoricalData,
    getDatesRange
};
