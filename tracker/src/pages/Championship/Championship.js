import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Championship.css';
import axios from 'axios';
import Header from '../../components/Header/Header.js';
import Footer from '../../components/Footer/Footer.js';

const Championships = () => {
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Conectar ao servidor Socket.IO
        const socket = io('http://localhost:5000');

        // Função para buscar dados iniciais
        const fetchTelemetryData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/todos-dados-telemetry');
                setTelemetryData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching telemetry data:', error);
                setError(error);
                setLoading(false);
            }
        };

        fetchTelemetryData();

        // Escutar por atualizações de telemetria do servidor
        socket.on('telemetryUpdate', (data) => {
            setTelemetryData(data);
        });

        // Limpar a conexão quando o componente for desmontado
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="championships-container">
            <Header />
            <h2>Championships Data</h2>
            {loading && <p>Carregando...</p>}
            {error && <p>Erro ao buscar os dados: {error.message}</p>}
            {telemetryData.length > 0 ? (
                <div className="championships-list">
                    {telemetryData.map((data, index) => (
                        <div key={index} className="championship-item">
                            <h3>Game Name: {data.game.gameName}</h3>
                            <p>Truck Model: {data.truck.model}</p>
                            <p>Truck Fuel: {data.truck.fuel}</p>
                            <p>Truck Speed: {data.truck.speed}</p>
                            <p>Trailer Attached: {data.trailer.attached ? 'Yes' : 'No'}</p>
                            <p>Source City: {data.job.sourceCity}</p>
                            <p>Estimated Distance: {data.navigation.estimatedDistance}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No data available.</p>
            )}
            <Footer />
        </div>
    );
};

export default Championships;
