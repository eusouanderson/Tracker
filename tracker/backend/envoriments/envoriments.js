const dotenv = require('dotenv');

dotenv.config();

const envoriments = {
    MONGO_USER: 'eusouanderson',
    MONGO_PASSWORD: '67983527',
    MONGO_CLUSTER: 'cluster0.fuidnmk.mongodb.net',
    PORT_SERVER: 3000,
    API_URL: 'http://localhost:5000',
    API_SERVER: 'http://localhost:8080/api/ets2/telemetry',
    JWT_SECRET: process.env.JWT_SECRET,
};



module.exports = envoriments;
