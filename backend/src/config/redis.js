const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'sugar-jasper-tender-43550.db.redis.io',
        port: 19017
    }
});

module.exports = redisClient;