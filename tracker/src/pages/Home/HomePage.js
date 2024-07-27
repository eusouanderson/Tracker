import React from 'react';
import Header from '../../components/Header/Header.js';
import Footer from '../../components/Footer/Footer.js';
import Register from '../../components/Register/Register.js';
import './HomePage.css'
import '../../assets/global.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <Header />
            <main className="home-main">
                <h2>Bem-vindo ao Game Tracker!</h2>
                <p>
                    Estamos empolgados em ter você aqui! Este é o seu hub para acompanhar todas as informações de telemetria do Euro Truck Simulator 2.
                </p>
                <p>
                    Para começar, certifique-se de que o servidor está instalado corretamente na pasta do Euro Truck Simulator 2.
                </p>
                <p>
                    Em seguida, cadastre seu nome uma única vez. Esse nome será usado para associar e salvar todos os seus dados de telemetria. É importante que o nome seja claro e único.
                </p>
                <p>
                    Após o cadastro, Acesse a página de Campeonato, inicie o jogo e boa sorte.
                </p>
                <Register />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;