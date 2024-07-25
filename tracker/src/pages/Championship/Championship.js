import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Header from '../../components/Header/Header.js';
import Footer from '../../components/Footer/Footer.js';
import '../../assets/global.css';

const Championships = () => {
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [expandedJobIndex, setExpandedJobIndex] = useState(null);
    const [showTrailerData, setShowTrailerData] = useState(null);

    const API_BASE_URL = `${window.location.protocol}//${window.location.host}`;

    useEffect(() => {
        const socket = io(API_BASE_URL);

        const fetchTelemetryData = async () => {
            try {
                const URL = `${API_BASE_URL}/todos-dados-telemetry`;
                console.log('URL:', URL);
                const response = await axios.get(URL);
                setTelemetryData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching telemetry data:', error);
                setError(error);
                setLoading(false);
            }
        };

        fetchTelemetryData();

        socket.on('telemetryUpdate', (data) => {
            setTelemetryData(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [API_BASE_URL]); 

    const calculateScore = (data) => {
        let score = 0;

        if (data.game.connected && data.game.gameName !== "null") {
            const gameTime = new Date(data.game.time);
            const currentTime = new Date();
            const timeDiff = (currentTime - gameTime) / (1000 * 60 * 60);
            score += timeDiff * 100000;

            const deadlineTime = new Date(data.job.deadlineTime);
            if (currentTime <= deadlineTime) {
                score += 200; // Ajustado para 200
            }

            // Penalidades
            if (data.truck.fuel < (data.truck.fuelCapacity * 0.10)) {
                score -= 2000; // Mantido alto
            }

            const damagePercentage = (
                data.truck.wearEngine +
                data.truck.wearTransmission +
                data.truck.wearCabin +
                data.truck.wearChassis +
                data.truck.wearWheels
            ) / 5;
            score -= damagePercentage * 1000 * 0.2; // Mantido alto

            // Bônus
            if (data.truck.speed <= data.navigation.speedLimit) {
                score += data.truck.speed * 100;
            }

            if (data.truck.fuelAverageConsumption < 10) {
                score += 100; // Ajustado para 100
            }
        }

        return score;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const adjustGameTime = (gameTime, timeScale) => {
        const time = new Date(gameTime);
        const realTimeMs = timeScale * 1000;
        const adjustedTime = new Date(time.getTime() * realTimeMs);
        return adjustedTime.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const sortedTelemetryData = telemetryData
        .map(data => ({ ...data, score: calculateScore(data) })) // Adiciona a pontuação a cada entrada de dados
        .sort((a, b) => b.score - a.score); // Ordena pela pontuação em ordem decrescente

    const toggleTruckInfo = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const toggleJobInfo = (index) => {
        setExpandedJobIndex(expandedJobIndex === index ? null : index);
    };

    const toggleTrailerInfo = (index) => {
        setShowTrailerData(showTrailerData === index ? null : index);
    };

    return (
        <div className="championships-container">
            <Header />
            <h2>Dados dos Campeonatos</h2>
            {loading && <p className="loading">Carregando...</p>}
            {error && <p className="error">Erro ao buscar os dados: {error.message}</p>}
            {sortedTelemetryData.length > 0 ? (
                <div className="championships-list">
                    {sortedTelemetryData.map((data, index) => (
                        <div key={index} className="championship-item">
                            <h1>{index + 1}° Posição - Motorista: {data.game.gameName}</h1>
                            <p><span>Jogador Conectado:</span> {data.game.connected ? 'Sim' : 'Não'}</p>
                            <p><span>Tempo de Jogo:</span> {formatDate(data.game.time)}</p>
                            <p><span>Tempo Ajustado:</span> {adjustGameTime(data.game.time, data.game.timeScale)}</p>
                            <p><span>Jogo Pausado:</span> {data.game.paused ? 'Sim' : 'Não'}</p>
                            <p><span>Próximo Tempo Para Descanso:</span> {formatDate(data.game.nextRestStopTime)}</p>
                            <p><span>Versão do Plugin de Telemetria:</span> {data.game.telemetryPluginVersion}</p>
                            <p className='score'><span>Pontuação:</span> {data.score.toFixed(2)}</p>

                            <button
                                className="toggle-button"
                                onClick={() => toggleJobInfo(index)}
                            >
                                {expandedJobIndex === index ? 'Ocultar Dados do Trabalho' : 'Mostrar Dados do Trabalho'}
                            </button>

                            {expandedJobIndex === index && (
                                <div className="job-data">
                                    <h2>Dados do Trabalho</h2>
                                    <p><span>Dados de Trabalho:</span> {data.job.income}</p>
                                    <p><span>Tempo de Trabalho:</span> {formatDate(data.job.deadlineTime)}</p>
                                    <p><span>Cidade Destino : </span><span>{data.job.destinationCity}</span></p>
                                    <p><span>Empresa Destino : </span><span>{data.job.destinationCompany}</span></p>
                                </div>
                            )}

                            <button
                                className="toggle-button"
                                onClick={() => toggleTruckInfo(index)}
                            >
                                {expandedIndex === index ? 'Ocultar Dados do Caminhão' : 'Mostrar Dados do Caminhão'}
                            </button>

                            {expandedIndex === index && (
                                <div className="truck-data">
                                    <h3>Dados do Caminhão</h3>
                                    <p><span>ID do Caminhão:</span> {data.truck.id}</p>
                                    <p><span>Marca do Caminhão:</span> {data.truck.make}</p>
                                    <p><span>Velocidade do Caminhão:</span> {data.truck.speed}</p>
                                    <p><span>Controle de Cruzeiro:</span> {data.truck.cruiseControlSpeed} <span>(km/h)</span></p>
                                    <p><span>Controle de Cruzeiro Ativado:</span> {data.truck.cruiseControlOn ? 'Sim' : 'Não'} </p>
                                    <p><span>Quilometragem do Caminhão:</span> {data.truck.odometer}</p>
                                    <p><span>Marcha do Caminhão:</span> {data.truck.gear} <span>(N°)</span></p>
                                    <p><span>Modelo do Caminhão:</span> {data.truck.model}</p>
                                    <p><span>Saúde do Caminhão:</span> {data.truck.health}</p>
                                    <p><span>Combustível do Caminhão:</span> {data.truck.fuel}</p>
                                    <p><span>Capacidade de Combustível do Caminhão:</span> {data.truck.fuelCapacity}</p>
                                    <p><span>Reboque Conectado:</span> {data.trailer.attached ? 'Sim' : 'Não'}</p>
                                    <p><span>Cidade de Origem:</span> {data.job.sourceCity}</p>
                                    <p><span>Distância Estimada:</span> {data.navigation.estimatedDistance}</p>
                                </div>
                            )}

                            <button
                                className="toggle-button"
                                onClick={() => toggleTrailerInfo(index)}
                            >
                                {showTrailerData === index ? 'Ocultar Dados do Reboque' : 'Mostrar Dados do Reboque'}
                            </button>

                            {showTrailerData === index && (
                                <div className="trailer-data">
                                    <h3>Dados do Reboque</h3>
                                    <p><span>ID do Reboque:</span> {data.trailer.id}</p>
                                    <p><span>Marca do Reboque:</span> {data.trailer.make}</p>
                                    <p><span>Modelo do Reboque:</span> {data.trailer.model}</p>
                                    <p><span>Capacidade do Reboque:</span> {data.trailer.capacity}</p>
                                    <p><span>Carga Atual:</span> {data.trailer.currentLoad}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>Nenhum dado disponível.</p>
            )}
            <Footer />
        </div>
    );
};

export default Championships;
