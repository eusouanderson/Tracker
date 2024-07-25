import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import './TelemetryData.css';
import '../../assets/global.css';

const TelemetryData = () => {
    const [name, setName] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const API_BASE_URL = `${window.location.protocol}//${window.location.host}`;
    useEffect(() => {
        const savedName = localStorage.getItem('savedName');
        if (savedName) {
            setName(savedName);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('savedName', name);
    }, [name]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/dados-telemetry?name=${name}`);
            setData(response.data);
            setLoading(false);
            setFormSubmitted(true);
        } catch (error) {
            console.error('Erro ao buscar os dados:', error);
            setError(error);
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="telemetry-container">
            <h2>Telemetry Data</h2>
            {!formSubmitted && (
                <form onSubmit={handleSubmit} className="telemetry-form">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Digite seu nome"
                        required
                        className="telemetry-input"
                    />
                    <button type="submit" className="telemetry-button">Enviar</button>
                </form>
            )}
            {loading && <p>Carregando... Verifique se o Server foi instalado corretamente e está em execução.</p>}
            {error && <p>Erro ao buscar dados: {error.message}</p>}
            {data && !loading && (
                <div className="telemetry-data">
                    <h3>Conecção estabelecida :</h3>
                    <p>Jogador Conectado: {name}</p>
                    <p>Nome do Jogo: Euro Truck Simulator</p>
                    <h3>Vá para a página de Championships</h3>
                </div>
            )}
        </div>
    );
};

export default TelemetryData;
