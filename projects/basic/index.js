// var http = require('http');
const {Kafka, logLevel} = require('kafkajs')

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: 'upstash-playground-consumer',
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

const consumer = kafka.consumer({groupId: 'consumer'})

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({topic: 'third_topic', fromBeginning: true})
  await consumer.run({
    eachMessage: (value) => {
      console.log(value)
    }
  })
}

run().catch(e => console.error(e))

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end('Hello World!');
// }).listen(4000);
//
// console.log('Server is running at http://localhost:8080/');