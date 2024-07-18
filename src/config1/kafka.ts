import { KafkaClient, Producer, ProduceRequest } from 'kafka-node';

const kafkaClient = new KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(kafkaClient);

producer.on('ready', () => {
  console.log('Kafka producer is ready');
});

producer.on('error', (err) => {
  console.error('Error with Kafka producer:', err); // Log Kafka producer errors
});

export const sendMessageToUserMS = (topic: string, message: any) => {
  const payloads: ProduceRequest[] = [
    { topic, messages: JSON.stringify(message) },
  ];

  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending message:', err); // Log send message errors
    } else {
      console.log('Message sent:', data); // Log successful message sent
    }
  });
};
