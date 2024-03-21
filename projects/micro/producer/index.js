import { Kafka, logLevel } from 'kafkajs';

console.log('producer')

/**
 * Kafka configuration object.
 *
 * @typedef {Object} KafkaConfig
 * @property {string[]} brokers - An array of Kafka broker addresses.
 * @property {boolean} ssl - A boolean indicating whether to use SSL encryption.
 * @property {object} sasl - SASL authentication configuration.
 * @property {string} sasl.mechanism - The SASL authentication mechanism to use.
 * @property {string} sasl.username - The username for SASL authentication.
 * @property {string} sasl.password - The password for SASL authentication.
 * @property {string} logLevel - The log level for Kafka client.
 */
const kafka = new Kafka({
    brokers: ['upright-boxer-11932-eu2-kafka.upstash.io:9092'],
    ssl: true,
    sasl: {
        mechanism: 'scram-sha-256',
        username: 'dXByaWdodC1ib3hlci0xMTkzMiR0lUfQba1az2u5hzxxtEnpZHZfBNVrDw75e0M',
        password: 'YTM2NzBmODMtYWIzNy00ZmY1LWEwMTgtY2ZhMWU0YTk4YjQ2'
    },
    logLevel: logLevel.ERROR,
});

/**
 * Instantiates a new instance of Kafka producer.
 *
 * @class
 * @classdesc The Producer class is responsible for producing and sending messages to a Kafka topic.
 *
 * @returns {KafkaProducer} A new instance of KafkaProducer.
 */
const producer = kafka.producer();

/**
 * A function that sends a message to a Kafka topic using a producer.
 *
 * @async
 * @function run
 * @returns {Promise<void>} - A promise that resolves when the message is sent successfully and the producer is disconnected.
 */
const run = async () => {
    await producer.connect();

    await producer.send({
        topic: 'test',
        messages: [
            { value: 'Hello Kafka!' },
        ],
    });

    console.log("Message sent successfully");
    await producer.disconnect();
};

run().catch(e => console.error('[example/producer] e.message', e));