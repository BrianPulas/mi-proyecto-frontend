import React from 'react';
// 1. Importa 'Link' para la navegación
import { Link } from 'react-router-dom';
import './Navbar.css'; // 2. Importaremos CSS propio para el layout

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
  <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(0); }} className="logo-link-themed">
    <span className="logo-P">P</span>
    <span className="logo-L">L</span>
    <span className="logo-U">U</span>
    <span className="logo-S">S</span>
    <span className="logo-space"> </span> {/* Espacio */}
    <span className="logo-U2">U</span>
    <span className="logo-L2">L</span>
    <span className="logo-T">T</span>
    <span className="logo-R">R</span>
    <span className="logo-A">A</span>
  </a>
</div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          {/* Un enlace de ejemplo, puedes cambiarlo */}
          <Link to="/add-game">Añadir Juego</Link>
        </li>
        <li>
          <Link to="/profile">Perfil</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;