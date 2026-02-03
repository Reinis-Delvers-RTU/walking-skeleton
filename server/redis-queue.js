import { Redis } from 'ioredis';
import postgres from 'postgres';

const redisConsumer = new Redis(6379, 'redis');
const redisProducer = new Redis(6379, 'redis');
const sql = postgres();

const QUEUE_NAME = 'users';

const consume = async () => {
  while (true) {
    const result = await redisConsumer.brpop(QUEUE_NAME, 0);
    if (result) {
      const [queue, user] = result;
      const { name } = JSON.parse(user);
      console.log('IZNEMTS NO RINDAS');
      await sql`INSERT INTO users (name) VALUES (${name})`;
      console.log('IELIKTS DATUBAZE');
    }
  }
};

consume();

export { redisProducer };
