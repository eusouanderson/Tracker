import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TelemetryData.css'

const TelemetryData = () => {
    const [name, setName] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Carregar o nome salvo no localStorage ao montar o componente
    useEffect(() => {
        const savedName = localStorage.getItem('savedName');
        if (savedName) {
            setName(savedName);
        }
    }, []);

    // Salvar o nome no localStorage sempre que for alterado
    useEffect(() => {
        localStorage.setItem('savedName', name);
    }, [name]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/dados-telemetry', {
                params: { name }
            });
            setData(response.data);
            setLoading(false);
            setFormSubmitted(true);
        } catch (error) {
            console.error('Error fetching data:', error);
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
                        placeholder="Enter your name"
                        required
                        className="telemetry-input"
                    />
                    <button type="submit" className="telemetry-button">Enviar</button>
                </form>
            )}
            {loading && <p>Loading...</p>}
            {error && <p>Error fetching data: {error.message}</p>}
            {data && !loading && (
                <div className="telemetry-data">
                    <h3>Game Information</h3>
                    <p>Jogador Conectado: {name}</p>
                    <p>Game Name: {data.game.gameName}</p>
                    <h3>Truck Information</h3>
                    <p>Truck Model: {data.truck.model}</p>
                    <h3>Trailer Information</h3>
                    <p>Trailer Attached: {data.trailer.attached ? 'Yes' : 'No'}</p>
                    <h3>Job Information</h3>
                    <p>Source City: {data.job.sourceCity}</p>
                    <h3>Navigation Information</h3>
                    <p>Estimated Distance: {data.navigation.estimatedDistance}</p>
                </div>
            )}
        </div>
    );
};

export default TelemetryData;
