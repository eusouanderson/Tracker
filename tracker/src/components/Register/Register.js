import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/global.css';
import { Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
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
            const response = await axios.get(`${API_BASE_URL}/dados-telemetry`, {
                params: {
                    name: name,
                    password: password
                }
            });
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
            <h2>Registro</h2>
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
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
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
                    <Link to="/championships">Ir para Campeonatos</Link>
                </div>
            )}
        </div>
    );
};

export default Register;
