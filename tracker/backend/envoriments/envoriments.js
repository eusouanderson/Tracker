const dotenv = require('dotenv');

dotenv.config();

const envoriments = {
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_CLUSTER: process.env.MONGO_CLUSTER,
    PORT_SERVER: 5000,
    API_URL: process.env.API_URL,
    API_SERVER: process.env.API_SERVER,
    JWT_SECRET: process.env.JWT_SECRET,
};

console.log(envoriments);

module.exports = envoriments;
