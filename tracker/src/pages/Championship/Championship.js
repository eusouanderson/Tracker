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
    const [expandedIndex, setExpandedIndex] = useState(null); // Estado para controlar a visibilidade das informações do truck

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

    // Funções para formatação de data e ajuste de tempo
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
        const realTimeMs = timeScale * 1000; // Escala do tempo
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

    // Ordenar dados por Estimated Distance em ordem decrescente
    const sortedTelemetryData = [...telemetryData].sort((a, b) => b.navigation.estimatedDistance - a.navigation.estimatedDistance);

    const toggleTruckInfo = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
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

                            <h2>Dados do Trabalho</h2>

                            <p><span>Dados de Trabalho:</span> {data.job.income}</p>
                            <p><span>Tempo de Trabalho:</span> {formatDate(data.job.deadlineTime)}</p>
                            <p><span>Cidade Destino : </span><span>{data.job.destinationCity}</span></p>
                            <p><span>Empresa Destino : </span><span>{data.job.destinationCompany}</span></p>

                            <h2>Dados da Navegação</h2>

                            <p><span>Distância Estimada:</span> {data.navigation.estimatedDistance}</p>
                            <p><span>Tempo Estimado:</span> {formatDate(data.navigation.estimatedTime)}</p> 
                            <p><span> Limite de Velocidade: </span><span>{data.navigation.speedLimit}</span></p>

                            <button
                                className="toggle-button"
                                onClick={() => toggleTruckInfo(index)}
                            >
                                {expandedIndex === index ? 'Ocultar Dados do Caminhão e Reboque' : 'Mostrar Dados do Caminhão e Reboque'}
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
                            {expandedIndex === index && (
                                <div className="trailer-data">
                                    <h3>Dados do Reboque</h3>
                                    <p><span>ID do Reboque:</span> {data.trailer.id}</p>
                                    <p><span>Carga do Reboque:</span> {data.trailer.name}</p>
                                    <p><span>Peso do Reboque:</span> {data.trailer.mass}</p>
                                    <p><span>Saúde do Reboque:</span> {data.trailer.wear}</p>
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