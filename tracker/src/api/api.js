const express = require('express');
const axios = require('axios');

const app = express();


app.get('/dados-telemetry', async (req, res) => {
    try {
        const response = await axios.get('http://192.168.1.5:25555/api/ets2/telemetry');
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter dados de telemetria' });
    }
});

app.listen(5000, () => {
    console.log('Servidor está rodando em http://localhost:5000/dados-telemetry');
});
