import { Kafka, logLevel } from 'kafkajs';

console.log('consumer')

/**
 * Kafka Connection configuration.
 *
 * @constructor
 * @param {Object} config - Configuration options for the Kafka connection.
 * @param {string[]} config.brokers - An array of broker addresses to connect to.
 * @param {boolean} [config.ssl=false] - Enable SSL connection.
 * @param {Object} [config.sasl] - SASL (Simple Authentication and Security Layer) configuration.
 * @param {string} [config.sasl.mechanism] - The SASL mechanism to use.
 * @param {string} [config.sasl.username] - The SASL username for authentication.
 * @param {string} [config.sasl.password] - The SASL password for authentication.
 * @param {string} [config.logLevel='error'] - The log level for logging Kafka client events and messages.
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
 * Creates a Kafka consumer with the given configuration.
 *
 * @param {Object} configuration - The configuration for the consumer.
 * @param {string} configuration.groupId - The unique identifier for the consumer group.
 *
 * @returns {Object} - The Kafka consumer object.
 */
const consumer = kafka.consumer({ groupId: 'node_consumer' });

/**
 * Runs the consumer and starts listening for messages on the specified topic.
 *
 * @async
 * @function run
 * @returns {Promise<void>}
 *
 * @description
 * The `run` function connects to the consumer, subscribes to the specified topic, and
 * starts listening for messages. When a new message is received, the `eachMessage` callback
 * function is invoked with the message details containing the topic, partition, and message data.
 * The function logs the partition, offset, and value of each message to the console.
 *
 * @example
 * await run();
 */
const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'test', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });
        },
    });
};

run().catch(e => console.error('[example/consumer] e.message', e));