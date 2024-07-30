import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Header from '../../components/Header/Header.js';
import Footer from '../../components/Footer/Footer.js';
import Score from '../../components/Score/Score.js'; // Importa o componente Score
import Popup from '../../components/Popup/Popup';
import '../../assets/global.css';

const Championships = () => {
    const [telemetryData, setTelemetryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [expandedJobIndex, setExpandedJobIndex] = useState(null);
    const [showTrailerData, setShowTrailerData] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');


    

    const API_BASE_URL = `${window.location.protocol}//${window.location.host}`;

    useEffect(() => {
        const socket = io(API_BASE_URL);

        const fetchTelemetryData = async () => {
            try {
                const URL = `${API_BASE_URL}/todos-dados-telemetry`;
                console.log('Fetching initial telemetry data from URL:', URL);
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

        const interval = setInterval(fetchTelemetryData, 1000);

        const handleTelemetryUpdate = (data) => {
            console.log('Received telemetry update:', data); 
            if (!data || !data.gamer) {
                console.warn('Invalid telemetry data:', data);
                return;
            }

            setTelemetryData(prevData => {
                const existingDataIndex = prevData.findIndex(d => d.gamer?.user === data.gamer?.user);
                if (existingDataIndex !== -1) {
                    const newData = [...prevData];
                    newData[existingDataIndex] = data;
                    return newData;
                } else {
                    return [...prevData, data];
                }
            });
        };

        socket.on('telemetryUpdate', handleTelemetryUpdate);
        console.log('Socket.IO connection established with API_BASE_URL:', API_BASE_URL);

        return () => {
            clearInterval(interval);
            socket.disconnect();
            console.log('Socket.IO connection disconnected');
        };
    }, [API_BASE_URL]);

    const isValidDate = (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    const formatDate = (dateString) => {
        return isValidDate(dateString)
            ? new Date(dateString).toLocaleString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
            : 'Data inválida';
    };

    const adjustGameTime = (gameTime, timeScale) => {
        if (!isValidDate(gameTime)) return 'Data inválida';

        const time = new Date(gameTime);
        const realTimeMs = timeScale * 1000;
        const adjustedTime = new Date(time.getTime() + realTimeMs);
        return adjustedTime.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatPlacement = (placement) => {
        if (placement && typeof placement === 'object') {
            return `X: ${placement.x}, Y: ${placement.y}, Z: ${placement.z}, Heading: ${placement.heading}, Pitch: ${placement.pitch}, Roll: ${placement.roll}`;
        }
        return 'Dados inválidos';
    };

    const sortedTelemetryData = telemetryData
        .sort((a, b) => {
            return 0; 
        });

    const toggleTruckInfo = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const toggleJobInfo = (index) => {
        setExpandedJobIndex(expandedJobIndex === index ? null : index);
    };

    const toggleTrailerInfo = (index) => {
        setShowTrailerData(showTrailerData === index ? null : index);
    };

    const showPopup = (message) => {
        setPopupMessage(message);
    };

    const closePopup = () => {
        setPopupMessage('');
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
                            <h1>{index + 1}° Posição - Motorista: {data.gamer?.user || 'Desconhecido'}</h1>
                            <p><span>Jogador Conectado:</span> {data.gamer?.connected ? 'Sim' : 'Não'}</p>
                            <p><span>Jogo Ativo:</span> {data.game?.connected ? 'Sim' : 'Não'} </p>
                            <p><span>Tempo de Jogo:</span> {formatDate(data.game?.time)}</p>
                            <p><span>Tempo Ajustado:</span> {adjustGameTime(data.game?.time, data.game?.timeScale)}</p>
                            <p><span>Jogo Pausado:</span> {data.game?.paused ? 'Sim' : 'Não'}</p>
                            <p><span>Próximo Tempo Para Descanso:</span> {formatDate(data.game?.nextRestStopTime) || 'Nenhum'}</p>
                            <p><span>Versão do Plugin de Telemetria:</span> {data.game?.telemetryPluginVersion}</p>
                            <Score data={data} />

                            <button
                                className="toggle-button"
                                onClick={() => toggleJobInfo(index)}
                            >
                                {expandedJobIndex === index ? 'Ocultar Dados do Trabalho' : 'Mostrar Dados do Trabalho'}
                            </button>

                            {expandedJobIndex === index && (
                                <div className="job-data">
                                    <h3>Dados do Trabalho</h3>
                                    <p><span>Empresa de Origem:</span> {data.job?.sourceCompany ?? 'N/A'}</p>
                                    <p><span>Cidade de Origem:</span> {data.job?.sourceCity ?? 'N/A'}</p>
                                    <p><span>Empresa de Destino:</span> {data.job?.destinationCompany ?? 'N/A'}</p>
                                    <p><span>Cidade de Destino:</span> {data.job?.destinationCity ?? 'N/A'}</p>
                                    <p><span>Distância Estimada:</span> {data.navigation?.estimatedDistance ?? 'N/A'}</p>
                                    <p><span>Velocidade Limite:</span> {data.navigation?.speedLimit ?? 'N/A'}</p>
                                    <p><span>Renda:</span> {data.job?.income ?? 'N/A'}</p>
                                    <p><span>Prazo:</span> {data.job?.deadlineTime ? new Date(parseInt(data.job?.deadlineTime.$date?.$numberLong)).toLocaleString() : 'N/A'}</p>
                                    <p><span>Tempo Restante:</span> {data.job?.remainingTime ? new Date(parseInt(data.job?.remainingTime.$date?.$numberLong)).toLocaleString() : 'N/A'}</p>
                                    <p><span>Tempo Estimado:</span> {data.navigation?.estimatedTime ? new Date(parseInt(data.navigation?.estimatedTime.$date?.$numberLong)).toLocaleString() : 'N/A'}</p>
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
                                    <p><span>Marca:</span> {data.truck?.make}</p>
                                    <p><span>Modelo:</span> {data.truck?.model}</p>
                                    <p><span>Velocidade:</span> {data.truck?.speed} km/h</p>
                                    <p><span>Controle de Cruzeiro:</span> {data.truck?.cruiseControlOn ? 'Ligado' : 'Desligado'}</p>
                                    <p><span>Velocidade de Cruzeiro:</span> {data.truck?.cruiseControlSpeed} km/h</p>
                                    <p><span>Consumo de Combustível:</span> {data.truck?.fuelAverageConsumption} L/100km</p>
                                    <p><span>Combustível:</span> {data.truck?.fuel} L</p>
                                    <p><span>Capacidade do Combustível:</span> {data.truck?.fuelCapacity} L</p>
                                    <p><span>Rotação do Motor:</span> {data.truck?.engineRpm}</p>
                                    <p><span>Rotação Máxima do Motor:</span> {data.truck?.engineRpmMax}</p>
                                    <p><span>Temperatura do Óleo:</span> {data.truck?.oilTemperature} °C</p>
                                    <p><span>Pressão do Óleo:</span> {data.truck?.oilPressure}</p>
                                    <p><span>Temperatura da Água:</span> {data.truck?.waterTemperature} °C</p>
                                    <p><span>Voltagem da Bateria:</span> {data.truck?.batteryVoltage} V</p>
                                    <p><span>Pressão do Ar:</span> {data.truck?.airPressure} psi</p>
                                    <p><span>Desgaste do Motor:</span> {data.truck?.wearEngine}</p>
                                    <p><span>Desgaste da Transmissão:</span> {data.truck?.wearTransmission}</p>
                                    <p><span>Desgaste da Cabine:</span> {data.truck?.wearCabin}</p>
                                    <p><span>Desgaste do Chassi:</span> {data.truck?.wearChassis}</p>
                                    <p><span>Desgaste das Rodas:</span> {data.truck?.wearWheels}</p>
                                </div>
                            )}

                            <button
                                className="toggle-button"
                                onClick={() => toggleTrailerInfo(index)}
                            >
                                {showTrailerData === index ? 'Ocultar Dados do Reboque' : 'Mostrar Dados do Reboque'}
                            </button>

                            {showTrailerData === index && data.trailer && (
                                <div className="trailer-data">
                                    <h3>Dados do Reboque</h3>
                                    <p><span>ID:</span> {data.trailer.id}</p>
                                    <p><span>Nome:</span> {data.trailer.name}</p>
                                    <p><span>Massa:</span> {data.trailer.mass} kg</p>
                                    <p><span>Desgaste:</span> {data.trailer.wear}</p>
                                    <p><span>Posição (x, y, z):</span> {`(${data.trailer.placement?.x}, ${data.trailer.placement?.y}, ${data.trailer.placement?.z})`}</p>
                                    <p><span>Orientação (heading, pitch, roll):</span> {`(${data.trailer.placement?.heading}, ${data.trailer.placement?.pitch}, ${data.trailer.placement?.roll})`}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                !loading && <p className="no-data">Nenhum dado disponível.</p>
            )}
            <Popup message={popupMessage} onClose={closePopup} />
            <Footer />
        </div>
    );
};

export default Championships;
