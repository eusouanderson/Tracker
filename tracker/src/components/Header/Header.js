import React from 'react';
import { Link } from 'react-router-dom'; 
import './Header.css';

const Header = () => {
    return (
        <header className="game-header">
            <h1>Game Tracker</h1>
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/championships">Championships</Link></li>
                    {/* Adicione outros links conforme necessário */}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
