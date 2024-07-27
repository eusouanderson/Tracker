import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import '../../assets/global.css';

const Header = () => {
    return (
        <header className="game-header">
            <h1>Game Tracker</h1>
            <nav>
                <ul>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/championships">Campeonatos</Link></li>
                    {/* Adicione outros links conforme necessário */}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
