import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import PerfilView from './components/PerfilView'; 
import SettingsView from './components/SettingsView'; 
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_URL = '/api';
const BACKEND_URL = 'http://localhost:3000';
const DEFAULT_AVATAR = "https://i.imgur.com/6v8d9nS.png";

// --- HELPER PARA ARREGLAR URLS DE IMÁGENES ---
const getImageUrl = (path) => {
    if (!path) return DEFAULT_AVATAR;
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
    if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`;
    return `${BACKEND_URL}/${cleanPath}`;
};

// --- Componentes de Utilidad ---
const StarRating = ({ puntuacion }) => (
  <div className="star-rating">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < puntuacion ? 'filled' : 'empty'}>★</span>
    ))}
  </div>
);

const Button = ({ children, onClick, color = 'blue', type = 'button', style, className }) => (
    <button onClick={onClick} type={type} className={`button button-${color} ${className || ''}`} style={style}>
        {children}
    </button>
);

const ProgressBar = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

// --- Formularios de Auth ---
function FormularioLogin({ onAuthSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');
      onAuthSuccess(data);
    } catch (err) { setError(err.message); }
  };
  return (
    <form onSubmit={handleSubmit} className="form-card form-card-translucent shadow-lg" style={{ maxWidth: '400px' }}>
      <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>Iniciar Sesión</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <p style={{ color: 'var(--color-red-text)', backgroundColor: 'var(--color-red-bg)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>{error}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="input-field" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required className="input-field" />
        <Button type="submit" color="blue" style={{ width: '100%', marginTop: '0.5rem' }}>Entrar</Button>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        ¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onGoToRegister(); }}>Regístrate</a>
      </p>
    </form>
  );
};

function FormularioRegistro({ onAuthSuccess, onGoToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al registrar usuario');
      onAuthSuccess(data);
    } catch (err) { setError(err.message); }
  };
  return (
    <form onSubmit={handleSubmit} className="form-card form-card-translucent shadow-lg" style={{ maxWidth: '400px' }}>
      <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>Crear Cuenta</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <p style={{ color: 'var(--color-red-text)', backgroundColor: 'var(--color-red-bg)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>{error}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="input-field" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required className="input-field" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Contraseña" required className="input-field" />
        <Button type="submit" color="green" style={{ width: '100%', marginTop: '0.5rem' }}>Registrarse</Button>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onGoToLogin(); }}>Inicia Sesión</a>
      </p>
    </form>
  );
};

// --- Navbar ---
const Navbar = ({ onNavigate, currentUser, onLogout, onUploadProfilePhoto }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [friendQuery, setFriendQuery] = useState('');
  const [friendAddMessage, setFriendAddMessage] = useState('');
  const profileMenuRef = useRef(null);
  
  const handleNavClick = (view) => { onNavigate(view); setIsMenuOpen(false); };
  const handleLogoutClick = () => { onLogout(); setIsMenuOpen(false); setIsProfileMenuOpen(false); };
  const toggleProfileMenu = (e) => { e.preventDefault(); setIsProfileMenuOpen(prev => !prev); };
  
  const handleAddFriend = async (e) => {
    e.preventDefault();
    setFriendAddMessage('');
    const value = friendQuery.trim();
    if (!value) return;
    try {
      const res = await fetch(`${API_URL}/friends/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {}) },
        body: JSON.stringify({ email: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setFriendAddMessage(`Agregado: ${data.friend?.nickname || data.friend?.email}`);
      setFriendQuery('');
    } catch (err) { setFriendAddMessage(err.message); }
  };
  useEffect(() => {
    const onDocClick = (e) => { if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setIsProfileMenuOpen(false); };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(0); }}>
          <img src="/plus-ultra-logo.png" alt="Plus Ultra Logo" className="navbar-logo-img" />
        </a>
      </div>
      <button className="navbar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(1); }}>Añadir Juego</a></li>
        <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(4); }}>Estadísticas</a></li>
        {currentUser ? (
          <li className="navbar-profile-container" ref={profileMenuRef}>
            <a href="#" onClick={toggleProfileMenu} className="navbar-profile">
              <img src={getImageUrl(currentUser.user.profilePicUrl)} alt={currentUser.user.nickname} onError={(e) => e.target.src = DEFAULT_AVATAR} />
              <span>{currentUser.user.nickname}</span>
            </a>
            {isProfileMenuOpen && (
              <div className="profile-menu">
                <h3 className="secondary-title" style={{ marginBottom: '0.75rem' }}>Panel de Usuario</h3>
                <div className="profile-menu-row"><button className="button button-blue" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); handleNavClick(7); setIsProfileMenuOpen(false); }}>Perfil</button></div>
                <div className="profile-menu-row"><button className="button button-blue" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); handleNavClick(8); setIsProfileMenuOpen(false); }}>Configuración</button></div>
                <div className="profile-menu-divider" />
                <div className="profile-menu-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Amigos</div>
                  <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={friendQuery} onChange={(e) => setFriendQuery(e.target.value)} placeholder="Email del amigo" style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }} />
                    <button type="submit" className="button button-blue">Agregar</button>
                  </form>
                  {friendAddMessage && <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{friendAddMessage}</div>}
                </div>
                <div className="profile-menu-divider" />
                <div className="profile-menu-row"><button className="button button-red" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}>Cerrar sesión</button></div>
              </div>
            )}
          </li>
        ) : (
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(5); }} style={{color: 'var(--color-blue-text)'}}>Iniciar Sesión</a></li>
        )}
      </ul>
    </nav>
  );
};


// --- Componente TarjetaJuego ---
const TarjetaJuego = ({ juego, onViewDetails, onToggleComplete, onEdit }) => (
    <div className="game-card" style={{ backgroundImage: `url(${juego.imagenPortada})` }}>
        <div className="game-card-content">
            <h3 className="game-card-title">{juego.titulo}</h3>
            <p className="game-card-info">{juego.genero} • {juego.añoLanzamiento}</p>
            <div className="game-card-stats-row">
                <div className="stat-mini"><span>Horas</span><strong>{juego.totalHorasJugadas || 0}h</strong></div>
                <div className="stat-item"><span style={{fontSize:'0.7rem', color:'#ccc'}}>NOTA</span><strong style={{color:'gold'}}>{juego.puntuacionMedia ? juego.puntuacionMedia.toFixed(1) : '-'}</strong></div>
            </div>
            {(juego.logrosTotales > 0) && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'#ccc', marginBottom:'2px'}}><span>Logros</span><span>{juego.logrosObtenidos}/{juego.logrosTotales}</span></div>
                    <div className="progress-container-card"><div className="progress-fill-card" style={{ width: `${(juego.logrosObtenidos / juego.logrosTotales) * 100}%` }}></div></div>
                </div>
            )}
            <div className="card-button-group" style={{ flexDirection: 'row', marginTop: 'auto' }}>
                <Button onClick={() => onViewDetails(juego)} color="blue" style={{ flex: 1, fontSize: '0.8rem', padding:'6px' }}>Ver</Button>
                <Button onClick={() => onToggleComplete(juego)} color={juego.completado ? 'red' : 'green'} style={{ flex: 1, fontSize: '0.8rem', padding:'6px' }}>{juego.completado ? '↩' : '✔'}</Button>
                <Button onClick={() => onEdit(juego)} color="blue" style={{ flex: 0.5, fontSize: '0.8rem', padding:'6px' }}>✏️</Button>
            </div>
        </div>
    </div>
);

// --- Componente FormularioJuego ---
const FormularioJuego = ({ juegoInicial = {}, onSave, onCancel }) => {
    const isEdit = !!juegoInicial._id;
    const [juego, setJuego] = useState({
        titulo: '', genero: 'RPG', plataforma: 'PC', añoLanzamiento: new Date().getFullYear(),
        desarrollador: '', imagenPortada: '', descripcion: '', completado: false,
        logrosObtenidos: 0, logrosTotales: 0, ...juegoInicial
    });
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    useEffect(() => {
        if (isEdit || !juego.titulo.trim()) { setSearchResults([]); return; }
        setLoadingSearch(true);
        const searchTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search-game/${juego.titulo}`);
                if (!response.ok) throw new Error('Error');
                const data = await response.json();
                setSearchResults(data);
            } catch (error) { setSearchResults([]); } finally { setLoadingSearch(false); }
        }, 500); 
        return () => clearTimeout(searchTimer);
    }, [juego.titulo, isEdit]); 

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setJuego(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value) }));
    };
    const handleSelectGame = (game) => {
        setJuego(prev => ({ ...prev, titulo: game.name, añoLanzamiento: game.released, imagenPortada: game.background_image, }));
        setSearchResults([]);
    };
    const handleSubmit = (e) => { e.preventDefault(); onSave(juego, isEdit); };
    const generos = ["Acción", "Aventura", "RPG", "Estrategia", "Simulación", "Deportes"];
    const plataformas = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"];

    return (
        <form onSubmit={handleSubmit} className="form-card shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>{isEdit ? 'Editar Juego' : 'Añadir Nuevo Juego'}</h2>
            <div className="form-grid">
                <div style={{ position: 'relative' }}> 
                    <input name="titulo" value={juego.titulo} onChange={handleChange} placeholder="Título del Videojuego *" required className="input-field" autoComplete="off" disabled={isEdit} />
                    { (loadingSearch || searchResults.length > 0) && (
                        <div className="search-results-container">
                            {loadingSearch && <div className="search-loading">Buscando...</div>}
                            {searchResults.map(game => (
                                <div key={game.id} className="search-result-item" onClick={() => handleSelectGame(game)}>
                                    {game.background_image ? (<img src={game.background_image} alt="" />) : null}
                                    <span>{game.name} ({game.released})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <input name="desarrollador" value={juego.desarrollador} onChange={handleChange} placeholder="Desarrollador *" required className="input-field" />
                <select name="genero" value={juego.genero} onChange={handleChange} className="select-field">{generos.map(g => <option key={g} value={g}>{g}</option>)}</select>
                <select name="plataforma" value={juego.plataforma} onChange={handleChange} className="select-field">{plataformas.map(p => <option key={p} value={p}>{p}</option>)}</select>
                <input type="number" name="añoLanzamiento" value={juego.añoLanzamiento} onChange={handleChange} placeholder="Año de Lanzamiento *" required min="1970" max={new Date().getFullYear()} className="input-field" />
                <input name="imagenPortada" value={juego.imagenPortada} onChange={handleChange} placeholder="URL de la Imagen de Portada" className="input-field" />
                <input type="number" name="logrosObtenidos" value={juego.logrosObtenidos} onChange={handleChange} placeholder="Logros Obtenidos" min="0" className="input-field" />
                <input type="number" name="logrosTotales" value={juego.logrosTotales} onChange={handleChange} placeholder="Logros Totales" min="0" className="input-field" />
            </div>
            <textarea name="descripcion" value={juego.descripcion} onChange={handleChange} placeholder="Descripción del juego" rows="3" className="textarea-field" />
            <div className="checkbox-group">
                <input type="checkbox" name="completado" checked={juego.completado} onChange={handleChange} id="completado" style={{ height: '1.25rem', width: '1.25rem', accentColor: 'var(--color-blue-text)' }} />
                <label htmlFor="completado" style={{ color: 'var(--color-text-primary)' }}>Marcar como Completado</label>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <Button onClick={onCancel} color="red" type="button">Cancelar</Button>
                <Button type="submit" color="blue">{isEdit ? 'Guardar Cambios' : 'Agregar Juego'}</Button>
            </div>
        </form>
    );
};

// --- DetalleJuego (NUEVO DISEÑO "HERO") ---
const DetalleJuego = ({ juego, onBack, onUpdateGame, onDeleteGame, onUpdateReviews }) => {
    const [reseñas, setReseñas] = useState([]);
    const [isAddingReview, setIsAddingReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchReseñas = async () => {
        setLoading(true); setError(null);
        try {
            const response = await fetch(`${API_URL}/reseñas/juego/${juego._id}`);
            if (!response.ok) throw new Error('Error al cargar las reseñas');
            const data = await response.json();
            setReseñas(data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    useEffect(() => { if (juego._id) fetchReseñas(); }, [juego._id]);

    const handleReviewSubmit = async (reseñaData) => {
        setLoading(true);
        try {
            const method = reseñaData._id ? 'PUT' : 'POST';
            const url = reseñaData._id ? `${API_URL}/reseñas/${reseñaData._id}` : `${API_URL}/reseñas`;
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...reseñaData, juegoId: juego._id })
            });
            if (!response.ok) throw new Error(`Error al ${method === 'POST' ? 'crear' : 'actualizar'} reseña`);
            setIsAddingReview(false);
            fetchReseñas(); 
            onUpdateReviews(); 
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    const handleDeleteReview = async (id) => {
        if(!window.confirm("¿Borrar reseña?")) return;
        setLoading(true);
        try {
             const response = await fetch(`${API_URL}/reseñas/${id}`, { method: 'DELETE' });
             if (!response.ok) throw new Error('Error al eliminar');
             fetchReseñas(); onUpdateReviews();
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }

    const ReviewForm = ({ reviewInitial = {}, onSave, onCancel }) => {
        const isEdit = !!reviewInitial._id;
        const [review, setReview] = useState({ puntuacion: 3, textoReseña: '', horasJugadas: 0, dificultad: 'Normal', recomendaria: true, ...reviewInitial });
        const handleChange = (e) => { const { name, value, type, checked } = e.target; setReview(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value })); };
        return (
            <form onSubmit={(e) => { e.preventDefault(); onSave(review); }} className="review-form space-y-3">
                <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{isEdit ? 'Editar Reseña' : 'Escribir Nueva Reseña'}</h4>
                <div className="flex items-center space-x-4"><label style={{color:'var(--color-text-secondary)'}}>Puntuación:</label><input type="number" name="puntuacion" value={review.puntuacion} onChange={handleChange} min="1" max="5" className="input-field" style={{width:'4rem'}}/ ><StarRating puntuacion={review.puntuacion}/></div>
                <div className="flex items-center space-x-4"><label style={{color:'var(--color-text-secondary)'}}>Horas:</label><input type="number" name="horasJugadas" value={review.horasJugadas} onChange={handleChange} min="0" className="input-field" style={{width:'6rem'}}/></div>
                <div className="flex items-center space-x-4"><label style={{color:'var(--color-text-secondary)'}}>Dificultad:</label><select name="dificultad" value={review.dificultad} onChange={handleChange} className="select-field"><option value="Fácil">Fácil</option><option value="Normal">Normal</option><option value="Difícil">Difícil</option></select></div>
                <div className="checkbox-group"><input type="checkbox" name="recomendaria" checked={review.recomendaria} onChange={handleChange} id="recomendaria" style={{ height: '1rem', width: '1rem', accentColor: 'var(--color-blue-text)' }}/><label htmlFor="recomendaria" style={{ color: 'var(--color-text-secondary)' }}>Recomendado</label></div>
                <textarea name="textoReseña" value={review.textoReseña} onChange={handleChange} placeholder="Reseña..." rows="3" className="textarea-field"/>
                <div className="flex justify-end space-x-3"><Button onClick={onCancel} color="red">Cancelar</Button><Button type="submit" color="blue">Guardar</Button></div>
            </form>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            {/* 1. BANNER "HERO" GIGANTE */}
            <div className="detail-hero-section" style={{ backgroundImage: `url(${juego.imagenPortada})` }}>
                <div className="detail-hero-overlay">
                    <button className="back-button-floating" onClick={onBack}>← Volver a Biblioteca</button>
                </div>
            </div>

            {/* 2. CONTENIDO FLOTANTE (GLASS) */}
            <div className="detail-content-wrapper">
                {/* Header: Carátula flotante + Título */}
                <div className="detail-header-grid">
                    <div className="detail-cover-container">
                        <img 
                            src={juego.imagenPortada} 
                            alt={juego.titulo} 
                            className="detail-cover-art" 
                            onError={(e) => { e.target.src = "https://placehold.co/600x900/1e293b/cbd5e1?text=GAME"; }}
                        />
                    </div>
                    <div className="detail-title-block">
                        <h1 className="detail-title-large">{juego.titulo}</h1>
                        <div className="detail-meta-badges">
                            <span className="meta-badge">{juego.genero}</span>
                            <span className="meta-badge">{juego.plataforma}</span>
                            <span className="meta-badge">{juego.añoLanzamiento}</span>
                            <span className="meta-badge" style={{borderColor: 'var(--color-blue-text)', color: 'var(--color-blue-text)'}}>
                                {juego.desarrollador}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CUERPO: 2 Columnas */}
                <div className="detail-body-grid">
                    {/* Izquierda: Descripción y Reseñas */}
                    <div className="glass-panel">
                        <h3 className="panel-title">Acerca del Juego</h3>
                        <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '2rem' }}>
                            {juego.descripcion || "Sin descripción disponible."}
                        </p>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="panel-title" style={{margin:0, border:0}}>Reseñas de Agentes</h3>
                            {!isAddingReview && <Button onClick={() => setIsAddingReview(true)} color="blue">+ Escribir Reseña</Button>}
                        </div>
                        
                        {isAddingReview && <ReviewForm onSave={handleReviewSubmit} onCancel={() => setIsAddingReview(false)} />}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {reseñas.length > 0 ? reseñas.map(r => (
                                <div key={r._id} style={{ background:'rgba(0,0,0,0.2)', padding:'1rem', borderRadius:'8px', borderLeft:'3px solid var(--color-blue-text)' }}>
                                     <div className="flex justify-between items-center mb-1">
                                         <StarRating puntuacion={r.puntuacion} />
                                         <span style={{fontSize:'0.8rem', color: r.recomendaria ? '#00ff88':'#ff4444'}}>{r.recomendaria ? 'Recomendado':'No Recomendado'}</span>
                                     </div>
                                     <p style={{ color: '#eee', fontStyle: 'italic' }}>"{r.textoReseña}"</p>
                                     <div className="flex justify-end mt-2">
                                         <button onClick={() => handleDeleteReview(r._id)} style={{color:'#ff4444', background:'transparent', border:'none', fontSize:'0.8rem', cursor:'pointer'}}>Eliminar</button>
                                     </div>
                                </div>
                            )) : <p style={{ color: '#888', fontStyle: 'italic' }}>No hay reseñas todavía.</p>}
                        </div>
                    </div>

                    {/* Derecha: Panel de Estado y Acciones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="glass-panel" style={{ textAlign: 'center' }}>
                            <h3 className="panel-title" style={{ justifyContent: 'center', display: 'flex' }}>Estado de Misión</h3>
                            <div style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: juego.completado ? '#00ff88' : '#ffbb00',
                                padding: '1rem',
                                border: `2px dashed ${juego.completado ? '#00ff88' : '#ffbb00'}`,
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                {juego.completado ? 'MISIÓN CUMPLIDA' : 'EN PROGRESO'}
                            </div>
                            <Button 
                                onClick={() => onUpdateGame(juego._id, { completado: !juego.completado })} 
                                color={juego.completado ? 'green' : 'blue'}
                                style={{ width: '100%', marginBottom: '0.5rem' }}
                            >
                                {juego.completado ? 'Marcar como Pendiente' : 'Marcar como Completado'}
                            </Button>
                        </div>

                        <div className="glass-panel">
                            <h3 className="panel-title">Estadísticas</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{color:'#888'}}>Horas Registradas:</span>
                                <span style={{fontWeight:'bold', color:'white'}}>{juego.totalHorasJugadas || 0}h</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{color:'#888'}}>Puntuación Media:</span>
                                <span style={{fontWeight:'bold', color:'gold'}}>{juego.puntuacionMedia?.toFixed(1) || '-'}</span>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#888', marginBottom:'2px'}}>
                                    <span>Progreso de Logros</span>
                                    <span>{juego.logrosObtenidos}/{juego.logrosTotales}</span>
                                </div>
                                <ProgressBar value={juego.logrosObtenidos} max={juego.logrosTotales} />
                            </div>
                        </div>

                        <Button onClick={() => onDeleteGame(juego._id)} color="red" style={{ width: '100%' }}>
                            ELIMINAR JUEGO (ZONA DE PELIGRO)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- EstadisticasPersonales ---
const EstadisticasPersonales = ({ onBack }) => {
    const [stats, setStats] = useState(null);
    useEffect(() => { fetch(`${API_URL}/stats/dashboard`).then(r=>r.json()).then(setStats).catch(console.error); }, []);
    if (!stats) return <div className="app-container">Cargando...</div>;
    
    const getPieChartData = (dataArray) => {
        const labels = dataArray.map(item => item._id); 
        const data = dataArray.map(item => item.count); 
        return {
            labels,
            datasets: [{ data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'], borderColor: 'var(--color-bg-card)', borderWidth: 2 }]
        };
    };
    const chartOptions = { plugins: { legend: { labels: { color: 'var(--color-text-primary)' } } } };
    const plataformaChartData = getPieChartData(stats.plataformas);
    const generoChartData = getPieChartData(stats.generos);

    return (
        <div className="app-container">
            <Button onClick={onBack} color="blue" style={{ marginBottom: '1.5rem' }}>← Volver a la Biblioteca</Button>
            <h2 className="header-title">Dashboard Personal</h2>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stats-card"><p style={{ fontSize: '3rem' }}>{stats.totalJuegos}</p><p>Juegos</p></div>
                <div className="stats-card"><p style={{ fontSize: '3rem' }}>{stats.completados}</p><p>Completados</p></div>
                <div className="stats-card"><p style={{ fontSize: '3rem' }}>{stats.totalHoras}</p><p>Horas Totales</p></div>
                <div className="stats-card"><p style={{ fontSize: '3rem' }}>{stats.mediaPuntuacion.toFixed(1)} ★</p><p>Puntuación Media</p></div>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '2rem' }}>
                 <div className="stats-card" style={{ padding: '2rem' }}><h3 className="secondary-title" style={{marginBottom:'1rem'}}>Juegos por Plataforma</h3><div style={{maxHeight:'300px', display:'flex', justifyContent:'center'}}><Pie data={plataformaChartData} options={chartOptions} /></div></div>
                 <div className="stats-card" style={{ padding: '2rem' }}><h3 className="secondary-title" style={{marginBottom:'1rem'}}>Juegos por Género</h3><div style={{maxHeight:'300px', display:'flex', justifyContent:'center'}}><Pie data={generoChartData} options={chartOptions} /></div></div>
            </div>
        </div>
    );
};

// --- App Principal ---
const App = () => {
    const [view, setView] = useState(0); 
    const [juegos, setJuegos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenero, setFilterGenero] = useState('');
    const [filterPlataforma, setFilterPlataforma] = useState('');
    const [filterCompletado, setFilterCompletado] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('fechaCreacion');
    const [reviewUpdateTrigger, setReviewUpdateTrigger] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [friends, setFriends] = useState([]);

    // Carga inicial
    useEffect(() => { const u = localStorage.getItem('plusUltraUser'); if(u) setCurrentUser(JSON.parse(u)); }, []);
    
    // Fetch Juegos
    const fetchJuegos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/juegos?busqueda=${searchTerm}`);
            const data = await res.json();
            setJuegos(data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    useEffect(() => { if (view === 0) fetchJuegos(); }, [view, searchTerm, reviewUpdateTrigger]);

    // Handlers
    const handleSaveJuego = async (juegoData, isEdit) => {
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/juegos/${juegoData._id}` : `${API_URL}/juegos`;
            const res = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser?.token}` }, 
                body: JSON.stringify(juegoData) 
            });
            if (!res.ok) throw new Error('Error al guardar');
            setSuccessMessage(isEdit ? 'Actualizado' : 'Creado');
            
            if(isEdit) {
                const updated = await res.json();
                setJuegoSeleccionado(updated);
                setView(3); 
            } else {
                setView(0);
            }
        } catch (err) { alert(err.message); }
    };

    const handleUpdateGame = async (id, data) => { 
        try {
            const res = await fetch(`${API_URL}/juegos/${id}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser?.token}` }, 
                body: JSON.stringify(data) 
            });
            if(!res.ok) throw new Error('Error');
            const updated = await res.json();
            // Si estamos viendo detalles, actualizar el seleccionado
            if(juegoSeleccionado && juegoSeleccionado._id === id) setJuegoSeleccionado(updated);
            fetchJuegos();
        } catch(e) { console.error(e); }
    };

    const handleDeleteJuego = async (id) => { 
        if(!window.confirm("¿Borrar juego?")) return;
        try {
            await fetch(`${API_URL}/juegos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${currentUser?.token}` } });
            setView(0);
        } catch(e) { console.error(e); }
    };

    const handleViewDetails = (juego) => { setJuegoSeleccionado(juego); setView(3); };
    const handleEditGame = (juego) => { setJuegoSeleccionado(juego); setView(2); };
    const handleLogout = () => { localStorage.removeItem('plusUltraUser'); setCurrentUser(null); setView(5); };
    
    // Perfil Updates
    const handleUpdateProfilePic = () => {}; 
    const handleUpdateNickname = () => {};   
    const handleUploadProfilePhoto = () => {}; 

    const renderContent = () => {
        switch (view) {
            case 1: 
                return <div className="app-container"><FormularioJuego key="add" onSave={handleSaveJuego} onCancel={() => setView(0)} /></div>;
            case 2: 
                return <div className="app-container"><FormularioJuego key="edit" juegoInicial={juegoSeleccionado} onSave={handleSaveJuego} onCancel={() => setView(3)} /></div>;
            case 3: return <DetalleJuego juego={juegoSeleccionado} onBack={() => setView(0)} onUpdateGame={handleUpdateGame} onDeleteGame={handleDeleteJuego} onUpdateReviews={() => setReviewUpdateTrigger(p => p + 1)} />;
            case 4: return <EstadisticasPersonales onBack={() => setView(0)} />;
            case 5: return <div className="login-container"><FormularioLogin onAuthSuccess={(u)=>{setCurrentUser(u); setView(0);}} onGoToRegister={()=>setView(6)} /></div>;
            case 6: return <div className="login-container"><FormularioRegistro onAuthSuccess={(u)=>{setCurrentUser(u); setView(0);}} onGoToLogin={()=>setView(5)} /></div>;
            case 7: return <PerfilView currentUser={currentUser} friends={friends} juegos={juegos} />;
            case 8: return <SettingsView currentUser={currentUser} onBack={() => setView(0)} />;
            case 0: default: 
                return (
                    <div className="home-background">
                        {/* --- BARRA DE BÚSQUEDA INTEGRADA --- */}
                        <div className="search-toolbar-container">
                            <div className="search-glass-bar">
                                {/* Buscador */}
                                <div className="search-input-group">
                                    <span className="search-icon">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar juego..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className="search-input-transparent" 
                                    />
                                </div>

                                {/* Separador Vertical */}
                                <div className="search-divider hidden md:block"></div>

                                {/* Filtros */}
                                <div className="filters-group">
                                    <select value={filterGenero} onChange={(e) => setFilterGenero(e.target.value)} className="filter-select">
                                        <option value="">Género</option>
                                        {["Acción", "Aventura", "RPG", "Estrategia", "Simulación", "Deportes"].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    
                                    <select value={filterPlataforma} onChange={(e) => setFilterPlataforma(e.target.value)} className="filter-select">
                                        <option value="">Plataforma</option>
                                        {["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>

                                    <select value={filterCompletado} onChange={(e) => setFilterCompletado(e.target.value)} className="filter-select">
                                        <option value="">Estado</option>
                                        <option value="true">Completados</option>
                                        <option value="false">Pendientes</option>
                                    </select>

                                    <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="filter-select">
                                        <option value="fechaCreacion">Más Recientes</option>
                                        <option value="titulo">Nombre (A-Z)</option>
                                        <option value="añoLanzamiento">Año</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* --- CONTENIDO DE LA BIBLIOTECA --- */}
                        <div className="app-container">
                            {successMessage && <div className="success-banner" style={{marginBottom:'1rem', padding:'1rem', background:'var(--color-green-bg)', color:'var(--color-green-text)', textAlign:'center', borderRadius:'8px'}}>{successMessage}</div>}
                            
                            {loading && <div style={{ fontSize: '1.25rem', color: 'var(--color-blue-text)', textAlign: 'center', padding: '2.5rem 0' }}>Cargando biblioteca...</div>}
                            {error && <div style={{ fontSize: '1.25rem', color: 'var(--color-red-text)', textAlign: 'center', padding: '2.5rem 0' }}>¡Error de conexión! {error}</div>}
                            
                            {!loading && !error && (
                                juegos.length > 0 ? (
                                    <div className="game-grid">
                                        {juegos.map(juego => (
                                            <TarjetaJuego key={juego._id} juego={juego} onViewDetails={handleViewDetails} onToggleComplete={(game) => handleUpdateGame(game._id, { completado: !game.completado })} onEdit={handleEditGame} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="form-card shadow-lg" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
                                        <p style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>Tu biblioteca está vacía o no coincide con los filtros. ¡Añade tu primer juego!</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-primary)' }}>
            <Navbar onNavigate={setView} currentUser={currentUser} onLogout={handleLogout} />
            {renderContent()}
        </div>
    );
};

export default App;