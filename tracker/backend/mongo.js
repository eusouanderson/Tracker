const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const Telemetry = require('./models/Telemetry'); 

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());


const MONGO_URI = `mongodb+srv://eusouanderson:67983527@cluster0.fuidnmk.mongodb.net/farmSimulator?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar com o MongoDB:', err));


app.get('/dados-telemetry', async (req, res) => {
    try {
        
        const response = await axios.get('http://127.0.0.1:25555/api/ets2/telemetry ');
        const telemetryData = response.data;

        
        const telemetry = await Telemetry.create(telemetryData);
        console.log("Dados de telemetria salvos com sucesso:", telemetry);

        res.json(telemetry);
    } catch (error) {
        console.error("Erro ao obter e salvar dados de telemetria:", error);
        res.status(500).json({ error: 'Erro ao obter e salvar dados de telemetria' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
