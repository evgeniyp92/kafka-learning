// var http = require('http');
const {Kafka, logLevel} = require('kafkajs')

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  // clientId: 'upstash-playground-consumer',
  clientId: 'upstash-playground-producer',
  brokers: ['upright-boxer-11932-eu2-kafka.upstash.io:9092'],
  ssl: {
    rejectUnauthorized: true
  },
  sasl: {
    mechanism: "scram-sha-256",
    username: 'dXByaWdodC1ib3hlci0xMTkzMiR0lUfQba1az2u5hzxxtEnpZHZfBNVrDw75e0M',
    password: 'YTM2NzBmODMtYWIzNy00ZmY1LWEwMTgtY2ZhMWU0YTk4YjQ2',
  }
})

// init consumer
const consumer = kafka.consumer({groupId: 'node_producer'})
// init producer
const producer = kafka.producer({allowAutoTopicCreation: false})

const write = async () => {
  await producer.connect()
  await producer.send({
    topic: 'first_topic',
    messages: [
        {value: (Math.random() * 10000).toFixed(1).toString()},
    ]
  })
  // await producer.disconnect()
}

const read = async () => {
  await consumer.connect()
  // why does the playground ignore the fromBeginning flag?
  await consumer.subscribe({topic: 'first_topic', fromBeginning: true})
  await consumer.run({
    eachMessage: ({topic, partition, message}) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      // deserialized message is at message.value
      console.log(`- ${prefix} ${message.key}#${message.value}`)
    }
  })
}

write().catch(e => console.error(e))
// read().catch(e => console.error(e))

// Code to gracefully disconnect from the Broker in the event of errors or SIGTERM and the like
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.forEach(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`)
      console.error(e)
      await consumer.disconnect()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.forEach(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect()
    } finally {
      process.kill(process.pid, type)
    }
  })
})

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('Hello World!');
// }).listen(4000);
//
// console.log('Server is running at http://localhost:8080/');