const { mqtt5, iot } = require('aws-iot-device-sdk-v2');
// const { ICrtError } = require("aws-crt");
const { once } = require("events");
const { toUtf8 } = require('@aws-sdk/util-utf8-browser');

function getConfiguration() {
    let builder = iot.AwsIotMqtt5ClientConfigBuilder.newDirectMqttBuilderWithMtlsFromPath(
        process.env.IOT_HOST,
        process.env.certPath,
        process.env.keyPath,
    )
    
    builder.withConnectProperties({
        keepAliveIntervalSeconds: 1200
    });
    
    return builder.build();
}

async function closeClient(client) {
    let unsuback = await client.unsubscribe({
        topicFilters: [
            "hello/world/qos1"
        ]
    });
    console.log('Unsuback result: ' + JSON.stringify(unsuback));

    const stopped = once(client, "stopped");

    client.stop();

    await stopped;

    client.close();
}

function createClient(config) {
    const client = new mqtt5.Mqtt5Client(config);

    // client.on('error', (error) => {
    //     console.log("\n\nError event: " + error.toString());
    // });

    client.on('attemptingConnect', (eventData) => {
        console.log("\n\nAttempting Connect event");
    });

    client.on('connectionSuccess', (eventData) => {
        console.log("\n\nConnection Success event");
        console.log ("\n\nConnack: " + JSON.stringify(eventData.connack));
        console.log ("\n\nSettings: " + JSON.stringify(eventData.settings));
    });

    // client.on('connectionFailure', (eventData) => {
    //     console.log("\n\nConnection failure event: " + eventData.error.toString());
    //     if (eventData.connack) {
    //         console.log ("Connack: " + JSON.stringify(eventData.connack));
    //     }
    // });

    client.on('disconnection', (eventData) => {
        console.log("\n\nDisconnection event: " + eventData.error.toString());
        if (eventData.disconnect !== undefined) {
            console.log('\n\nDisconnect packet: ' + JSON.stringify(eventData.disconnect));
        }
    });

    client.on('stopped', (eventData) => {
        console.log("\n\nStopped event");
    });

    return client;
}

module.exports = {
    getIotInfo: async (req, res) => {
        // default value: 142800F7C630
        const { mac } = req.params;

        if (!mac.trim().length){
            return res.status(400).json({
                errorType: 'Bad request',
                message: `La mac de dispositivo no fue incluido`
            });
        }
        let client = createClient(getConfiguration());
        
        const connectionSuccess = once(client, 'connectionSuccess');

        client.on('error', (error) => {
            console.log("\n\nError event: " + error.toString());
            closeClient();
            res.status(404).json({
                errorType: 'Topic no encontrado',
                message: `${eventData.error.toString()}`
            });
        });
        

        client.on("messageReceived",async (eventData) => {
            console.log("\n\nMessage Received event: " + JSON.stringify(eventData.message));

            if (eventData.message.payload) {
                console.log("  with payload: " + toUtf8(new Uint8Array(eventData.message.payload)));
            }
            await closeClient(client);

            return res.status(200).json(JSON.parse(toUtf8(new Uint8Array(eventData.message.payload))));
        } );

        client.on('connectionFailure', (eventData) => {
            console.log("\n\nConnection failure event: " + eventData.error.toString());
            if (eventData.connack) {
                console.log ("Connack: " + JSON.stringify(eventData.connack));
            }
            
            return res.status(200).json(JSON.parse(toUtf8(new Uint8Array(eventData.message.payload))));
        });

        client.start();

        await connectionSuccess;

        const subscription = await client.subscribe({
            subscriptions: [
                {
                    qos: mqtt5.QoS.AtLeastOnce,
                    topicFilter: `IAQ/${mac}`
                }
            ]
        });

        console.log('\n\nSuback result: ' + JSON.stringify(subscription));
    }
}