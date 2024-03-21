import { Kafka, logLevel } from 'kafkajs';

console.log('consumer')

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

const consumer = kafka.consumer({ groupId: 'node_consumer' });

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