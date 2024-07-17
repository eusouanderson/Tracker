import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import TelemetryData from '../components/TelemetryData/TelemetryData';

const HomePage = () => {
    return (
        <div>
            <Header />
            <main>
                <h2>Bem-vindo ao Game Tracker!</h2>
                <p>Aqui você pode acompanhar a telemetria dos seus jogos favoritos.</p>
                <TelemetryData />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
