import { Kafka, logLevel } from 'kafkajs';

console.log('producer')

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

const producer = kafka.producer();

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