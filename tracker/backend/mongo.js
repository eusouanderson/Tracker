const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const Telemetry = require('./models/Telemetry');
const http = require('http');
const { Server } = require('socket.io');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Ajuste conforme necessário para segurança
    },
});
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const MONGO_URI = `mongodb+srv://eusouanderson:67983527@cluster0.fuidnmk.mongodb.net/farmSimulator?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar com o MongoDB:', err));

// Função para emitir atualizações de telemetria para todos os clientes conectados
const emitTelemetryUpdates = async () => {
    try {
        const telemetry = await Telemetry.find({});
        io.emit('telemetryUpdate', telemetry);
    } catch (error) {
        console.error("Erro ao emitir atualizações de telemetria:", error);
    }
};

// Função para atualizar os dados de telemetria
const updateTelemetryData = async (name) => {
    try {
        // Obtém os dados de telemetria da API
        const response = await axios.get('http://192.168.1.5:25555/api/ets2/telemetry');
        const telemetryData = response.data;
        telemetryData.game.gameName = name;

        let telemetry = await Telemetry.findOne({ 'game.gameName': name });

        if (telemetry) {
            // Atualiza os dados existentes
            telemetry = await Telemetry.findOneAndUpdate(
                { 'game.gameName': name },
                telemetryData,
                { new: true }
            );
            console.log("Dados de telemetria atualizados com sucesso:", telemetry);
        } else {
            // Cria um novo documento
            telemetry = await Telemetry.create(telemetryData);
            console.log("Novos dados de telemetria salvos com sucesso:", telemetry);
        }

        // Emite uma atualização após salvar os dados
        emitTelemetryUpdates();
    } catch (error) {
        console.error("Erro ao obter ou salvar dados de telemetria:", error);
    }
};

// Endpoint para buscar ou atualizar dados de telemetria
app.get('/dados-telemetry', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: 'Nome é necessário' });
        }

        // Configura a atualização periódica para o cliente conectado
        const intervalId = setInterval(() => updateTelemetryData(name), 1000);

        // Limpa o intervalo quando a conexão é desconectada
        io.on('connection', (socket) => {
            console.log('Cliente conectado:', name);

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', name);
                clearInterval(intervalId); // Para a atualização periódica
            });
        });

        res.json({ message: 'Atualização de telemetria iniciada', name });
    } catch (error) {
        console.error("Erro ao processar solicitação:", error);
        res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
});

// Endpoint para buscar todos os dados de telemetria
app.get('/todos-dados-telemetry', async (req, res) => {
    try {
        const telemetry = await Telemetry.find({});
        res.json(telemetry);
    } catch (error) {
        console.error("Erro ao buscar dados de telemetria:", error);
        res.status(500).json({ error: 'Erro ao buscar dados de telemetria' });
    }
});

// Configura o Socket.IO para lidar com conexões de clientes
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Emite atualizações para o cliente recém-conectado
    socket.emit('telemetryUpdate', []);

    // Opcional: Você pode adicionar mais lógica para lidar com eventos específicos de clientes aqui

    // Limpa a conexão quando o cliente desconecta
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
