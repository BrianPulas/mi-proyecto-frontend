import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
// Gráficos de pastel (Pie) para estadísticas
import { Pie } from 'react-chartjs-2';
// --- ¡MODIFICADO! Añadimos los elementos para Gráficos de Barras (aunque Pie es el principal) ---
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


const API_URL = '/api';

// --- Componente Utilidad: StarRating ---
const StarRating = ({ puntuacion }) => (
  <div className="star-rating">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < puntuacion ? 'filled' : 'empty'}>
        ★
      </span>
    ))}
  </div>
);

// --- Componente Utilidad: Botón ---
const Button = ({ children, onClick, color = 'blue', type = 'button' }) => (
    <button
        onClick={onClick}
        type={type}
        className={`button ${color === 'blue' ? 'button-blue' : color === 'red' ? 'button-red' : 'button-green'}`}
    >
        {children}
    </button>
);

// --- (¡NUEVO!) Componente Utilidad: Barra de Progreso ---
const ProgressBar = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="progress-bar-container">
            <div 
                className="progress-bar-fill" 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

// --- FormularioLogin ---
function FormularioLogin({ onAuthSuccess, onGoToRegister }) {
  // ... (Sin cambios)
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
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message); 
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-card form-card-translucent shadow-lg" style={{ maxWidth: '400px' }}>
      <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>
        Iniciar Sesión
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <p style={{ color: 'var(--color-red-text)', backgroundColor: 'var(--color-red-bg)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>{error}</p>}
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="input-field" />
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required className="input-field" />
        <Button type="submit" color="blue" style={{ width: '100%', marginTop: '0.5rem' }}>
          Entrar
        </Button>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        ¿No tienes cuenta?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onGoToRegister(); }}>
          Regístrate
        </a>
      </p>
    </form>
  );
};

// --- FormularioRegistro ---
function FormularioRegistro({ onAuthSuccess, onGoToLogin }) {
  // ... (Sin cambios)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-card form-card-translucent shadow-lg" style={{ maxWidth: '400px' }}>
      <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>
        Crear Cuenta
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <p style={{ color: 'var(--color-red-text)', backgroundColor: 'var(--color-red-bg)', padding: '0.5rem', borderRadius: '6px', textAlign: 'center' }}>{error}</p>}
        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="input-field" />
        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (min. 6 caracteres)" required className="input-field" />
        <input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Contraseña" required className="input-field" />
        <Button type="submit" color="green" style={{ width: '100%', marginTop: '0.5rem' }}>
          Registrarse
        </Button>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        ¿Ya tienes cuenta?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onGoToLogin(); }}>
          Inicia Sesión
        </a>
      </p>
    </form>
  );
};


// --- Componente Navbar ---
const Navbar = ({ onNavigate, currentUser, onLogout, onUpdateProfilePic, onUpdateNickname, onUploadProfilePhoto }) => {
  // ... (Sin cambios)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [friendQuery, setFriendQuery] = useState('');
  const [friendAddMessage, setFriendAddMessage] = useState('');
  const profileMenuRef = useRef(null);
  const handleNavClick = (view) => {
    onNavigate(view);
    setIsMenuOpen(false); 
  };
  const handleLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
  const toggleProfileMenu = (e) => {
    e.preventDefault();
    setIsProfileMenuOpen(prev => !prev);
  };
  const handleAddFriend = async (e) => {
    e.preventDefault();
    setFriendAddMessage('');
    const value = friendQuery.trim();
    if (!value) return;
    try {
      const res = await fetch(`${API_URL}/friends/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
        },
        body: JSON.stringify({ email: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al agregar amigo');
      setFriendAddMessage(`Agregado: ${data.friend?.nickname || data.friend?.email}`);
      setFriendQuery('');
    } catch (err) {
      setFriendAddMessage(err.message);
    }
  };
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
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
          <>
            <li className="navbar-profile-container" ref={profileMenuRef}>
              <a href="#" onClick={toggleProfileMenu} className="navbar-profile">
                <img src={currentUser.user.profilePicUrl || '/vite.svg'} alt={currentUser.user.nickname} />
                <span>{currentUser.user.nickname}</span>
              </a>
              {isProfileMenuOpen && (
                <div className="profile-menu">
                  <h3 className="secondary-title" style={{ marginBottom: '0.75rem' }}>Panel de Usuario</h3>
                  <div className="profile-menu-row">
                    <button className="button button-blue" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); handleNavClick(7); setIsProfileMenuOpen(false); }}>Perfil</button>
                  </div>
                  <div className="profile-menu-row">
                    <button className="button button-blue" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); handleNavClick(8); setIsProfileMenuOpen(false); }}>Configuración</button>
                  </div>
                  <div className="profile-menu-divider" />
                  <div className="profile-menu-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Amigos</div>
                    <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={friendQuery}
                        onChange={(e) => setFriendQuery(e.target.value)}
                        placeholder="Email del amigo"
                        aria-label="Email del amigo"
                        style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-input)', color: 'var(--color-text-primary)' }}
                      />
                      <button type="submit" className="button button-blue" style={{ whiteSpace: 'nowrap' }}>Agregar</button>
                    </form>
                    {friendAddMessage && (
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{friendAddMessage}</div>
                    )}
                  </div>
                  <div className="profile-menu-divider" />
                  <div className="profile-menu-row">
                    <button className="button button-red" style={{ width: '100%' }} onClick={(e) => { e.preventDefault(); handleLogoutClick(); }}>Cerrar sesión</button>
                  </div>
                </div>
              )}
            </li>
          </>
        ) : (
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleNavClick(5); }} style={{color: 'var(--color-blue-text)'}}>Iniciar Sesión</a></li>
        )}
      </ul>
    </nav>
  );
};


// --- (¡MODIFICADO!) Componente TarjetaJuego ---
const TarjetaJuego = ({ juego, onViewDetails, onToggleComplete, onEdit }) => (
    <div className="game-card shadow-lg">
        <img
            src={juego.imagenPortada}
            alt={`Portada de ${juego.titulo}`}
            className="game-card-img"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/cbd5e1?text=PLUS+ULTRA+GAME"; }}
        />
        <div style={{ padding: '1rem' }}>
            <h3 className="text-xl font-bold text-blue-400 truncate mb-1" style={{ color: 'var(--color-text-primary)' }}>{juego.titulo}</h3>
            
            {/* --- ¡NUEVO! Sección de Stats --- */}
            <div className="game-card-stats">
                <div className="stat-item">
                    <span>Horas Jugadas</span>
                    <strong>{juego.totalHorasJugadas || 0}</strong>
                </div>
                <div className="stat-item">
                    <span>Puntuación</span>
                    {/* --- MODIFICADO: Añade toFixed(1) para consistencia --- */}
                    <strong>{juego.puntuacionMedia ? `${juego.puntuacionMedia.toFixed(1)} ★` : 'N/A'}</strong>
                </div>
            </div>
            {/* Si hay logros, muestra la barra */}
            {(juego.logrosTotales > 0) && (
                <div className="game-card-achievements">
                    <span>Logros: {juego.logrosObtenidos} / {juego.logrosTotales}</span>
                    <ProgressBar value={juego.logrosObtenidos} max={juego.logrosTotales} />
                </div>
            )}
            {/* --- Fin de Stats --- */}

            <p className="text-sm text-gray-400 mb-2" style={{ color: 'var(--color-text-secondary)', opacity: 0.9, marginTop: '1rem' }}>
                {juego.genero} • {juego.plataforma} ({juego.añoLanzamiento})
            </p>
            <div className={`game-status ${juego.completado ? 'game-status-completed' : 'game-status-pending'}`}>
                {juego.completado ? 'COMPLETADO' : 'PENDIENTE'}
            </div>
            <div className="card-button-group">
                <Button onClick={() => onViewDetails(juego)} color="blue">
                    Ver Detalles / Reseñas
                </Button>
                <Button onClick={() => onToggleComplete(juego)} color={juego.completado ? 'red' : 'green'}>
                    {juego.completado ? 'Marcar como Pendiente' : 'Marcar como Completado'}
                </Button>
                <Button onClick={() => onEdit(juego)} color="blue">
                    Editar
                </Button>
            </div>
        </div>
    </div>
);

// --- (¡MODIFICADO!) Componente FormularioJuego ---
const FormularioJuego = ({ juegoInicial = {}, onSave, onCancel }) => {
    const isEdit = !!juegoInicial._id;
    const [juego, setJuego] = useState({
        titulo: '',
        genero: 'RPG',
        plataforma: 'PC',
        añoLanzamiento: new Date().getFullYear(),
        desarrollador: '',
        imagenPortada: '',
        descripcion: '',
        completado: false,
        // --- ¡NUEVO! ---
        logrosObtenidos: 0,
        logrosTotales: 0,
        ...juegoInicial
    });

    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    useEffect(() => {
        if (isEdit || !juego.titulo.trim()) {
            setSearchResults([]); 
            return;
        }
        setLoadingSearch(true);
        const searchTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search-game/${juego.titulo}`);
                if (!response.ok) throw new Error('Error en la búsqueda');
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error(error);
                setSearchResults([]);
            } finally {
                setLoadingSearch(false);
            }
        }, 500); 
        return () => clearTimeout(searchTimer);
    }, [juego.titulo, isEdit]); 

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setJuego(prev => ({
            ...prev,
            // --- ¡MODIFICADO! Asegura que los números sean 0 si están vacíos ---
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
        }));
    };
    const handleSelectGame = (game) => {
        setJuego(prev => ({
            ...prev,
            titulo: game.name,
            añoLanzamiento: game.released,
            imagenPortada: game.background_image,
        }));
        setSearchResults([]);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(juego, isEdit);
    };
    const generos = ["Acción", "Aventura", "RPG", "Estrategia", "Simulación", "Deportes"];
    const plataformas = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"];

    return (
        <form onSubmit={handleSubmit} className="form-card shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>
              {isEdit ? 'Editar Juego' : 'Añadir Nuevo Juego'}
            </h2>
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
                <select name="genero" value={juego.genero} onChange={handleChange} className="select-field">
                    {generos.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select name="plataforma" value={juego.plataforma} onChange={handleChange} className="select-field">
                    {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" name="añoLanzamiento" value={juego.añoLanzamiento} onChange={handleChange} placeholder="Año de Lanzamiento *" required min="1970" max={new Date().getFullYear()} className="input-field" />
                <input name="imagenPortada" value={juego.imagenPortada} onChange={handleChange} placeholder="URL de la Imagen de Portada" className="input-field" />

                {/* --- ¡NUEVOS CAMPOS DE LOGROS! --- */}
                <input
                    type="number"
                    name="logrosObtenidos"
                    value={juego.logrosObtenidos}
                    onChange={handleChange}
                    placeholder="Logros Obtenidos"
                    min="0"
                    className="input-field"
                />
                <input
                    type="number"
                    name="logrosTotales"
                    value={juego.logrosTotales}
                    onChange={handleChange}
                    placeholder="Logros Totales"
                    min="0"
                    className="input-field"
                />
            </div>
            <textarea
                name="descripcion"
                value={juego.descripcion}
                onChange={handleChange}
                placeholder="Descripción del juego"
                rows="3"
                className="textarea-field"
            />
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

// --- Componente DetalleJuego / FormularioReseña / ListaReseñas ---
const DetalleJuego = ({ juego, onBack, onUpdateGame, onDeleteGame, onUpdateReviews }) => {
    // ... (Sin cambios)
    const [reseñas, setReseñas] = useState([]);
    const [isAddingReview, setIsAddingReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchReseñas = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/reseñas/juego/${juego._id}`);
            if (!response.ok) throw new Error('Error al cargar las reseñas');
            const data = await response.json();
            setReseñas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (juego._id) {
            fetchReseñas();
        }
    }, [juego._id]);
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta reseña?")) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/reseñas/${reviewId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar reseña');
            fetchReseñas();
            onUpdateReviews();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const ReviewForm = ({ reviewInitial = {}, onSave, onCancel }) => {
        const isEdit = !!reviewInitial._id;
        const [review, setReview] = useState({
            puntuacion: 3,
            textoReseña: '',
            horasJugadas: 0,
            dificultad: 'Normal',
            recomendaria: true,
            ...reviewInitial
        });
        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setReview(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
            }));
        };
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(review);
        };
        return (
            <form onSubmit={handleSubmit} className="review-form space-y-3">
                <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{isEdit ? 'Editar Reseña' : 'Escribir Nueva Reseña'}</h4>
                <div className="flex items-center space-x-4">
                    <label style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}>Puntuación:</label>
                    <input type="number" name="puntuacion" value={review.puntuacion} onChange={handleChange} min="1" max="5" required className="input-field" style={{ width: '4rem', padding: '0.5rem' }} />
                    <StarRating puntuacion={review.puntuacion} />
                </div>
                <div className="flex items-center space-x-4">
                    <label style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}>Horas Jugadas:</label>
                    <input type="number" name="horasJugadas" value={review.horasJugadas} onChange={handleChange} min="0" required className="input-field" style={{ width: '6rem', padding: '0.5rem' }} />
                </div>
                <div className="flex items-center space-x-4">
                    <label style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}>Dificultad:</label>
                    <select name="dificultad" value={review.dificultad} onChange={handleChange} className="select-field" style={{ width: '8rem', padding: '0.5rem' }}>
                        <option value="Fácil">Fácil</option>
                        <option value="Normal">Normal</option>
                        <option value="Difícil">Difícil</option>
                    </select>
                </div>
                <div className="checkbox-group">
                    <input type="checkbox" name="recomendaria" checked={review.recomendaria} onChange={handleChange} id="recomendaria" style={{ height: '1rem', width: '1rem', accentColor: 'var(--color-blue-text)' }}/>
                    <label htmlFor="recomendaria" style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}>¿Lo recomendarías?</label>
                </div>
                <textarea name="textoReseña" value={review.textoReseña} onChange={handleChange} placeholder="Tu reseña detallada..." rows="4" required className="textarea-field" />
                <div className="flex justify-end space-x-3">
                    <Button onClick={onCancel} color="red" type="button">Cancelar</Button>
                    <Button type="submit" color="blue">{isEdit ? 'Guardar Reseña' : 'Enviar Reseña'}</Button>
                </div>
            </form>
        );
    };
    const ReviewCard = ({ reseña }) => {
        const [isEditing, setIsEditing] = useState(false);
        if (isEditing) {
            return <ReviewForm reviewInitial={reseña} onSave={(data) => { handleReviewSubmit(data); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />;
        }
        return (
            <div className="review-card">
                <div className="flex justify-between items-center mb-2">
                    <StarRating puntuacion={reseña.puntuacion} />
                    <span className="text-sm font-medium" style={{ color: reseña.recomendaria ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}>
                        {reseña.recomendaria ? 'Recomendado ✅' : 'No Recomendado ❌'}
                    </span>
                </div>
                <p style={{ color: 'var(--color-text-primary)', opacity: 0.9 }} className="italic mb-3">"{reseña.textoReseña}"</p>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                    <p style={{ marginBottom: '0.25rem' }}>Horas Jugadas: <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>{reseña.horasJugadas}</span></p>
                    <p>Dificultad: <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>{reseña.dificultad}</span></p>
                </div>
                <div className="flex space-x-2 justify-end" style={{ marginTop: '0.75rem' }}>
                    <Button onClick={() => setIsEditing(true)} color="blue">Editar</Button>
                    <Button onClick={() => handleDeleteReview(reseña._id)} color="red">Eliminar</Button>
                </div>
            </div>
        );
    };

    return (
        <div className="detail-layout">
            <div className="lg-col-span-1">
                <Button onClick={onBack} color="blue" style={{ marginBottom: '1.5rem', width: '100%' }}>← Volver a la Biblioteca</Button>
                <img
                    src={juego.imagenPortada}
                    alt={juego.titulo}
                    className="w-full h-auto object-cover rounded-xl shadow-xl"
                    style={{ border: '1px solid var(--color-border)' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/cbd5e1?text=PLUS+ULTRA+GAME"; }}
                />
                <div className="detail-sidebar-content" style={{ marginTop: '1rem' }}>
                    <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{juego.titulo}</h2>
                    <p style={{ color: 'var(--color-text-secondary)', opacity: 0.8, marginTop: '0.25rem' }}>{juego.desarrollador} • {juego.añoLanzamiento}</p>
                    <p className={`game-status ${juego.completado ? 'game-status-completed' : 'game-status-pending'}`} style={{ marginTop: '0.5rem' }}>
                        {juego.completado ? 'COMPLETADO' : 'PENDIENTE'}
                    </p>
                    <div className="flex space-x-2" style={{ marginTop: '0.75rem' }}>
                        <Button onClick={() => onUpdateGame(juego._id, { completado: !juego.completado })} color={juego.completado ? 'red' : 'green'}>
                            {juego.completado ? 'Desmarcar' : 'Completar'}
                        </Button>
                        <Button onClick={() => onDeleteGame(juego._id)} color="red">
                            Eliminar Juego
                        </Button>
                    </div>
                </div>
            </div>
            <div className="lg-col-span-2">
                <h3 className="secondary-title mb-2">Descripción</h3>
                <p style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-input)' }} className="p-4 rounded-lg shadow-inner">
                    {juego.descripcion || "No se ha proporcionado una descripción."}
                </p>
                <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <h3 className="secondary-title">Reseñas</h3>
                    {!isAddingReview && <Button onClick={() => setIsAddingReview(true)}>+ Nueva Reseña</Button>}
                </div>
                {error && <div style={{ background: 'var(--color-accent-red)', padding: '0.75rem', color: 'white', borderRadius: '0.5rem', marginBottom: '1rem' }}>Error: {error}</div>}
                {loading && <div style={{ color: 'var(--color-blue-text)', textAlign: 'center' }}>Cargando reseñas...</div>}
                {isAddingReview && (
                    <ReviewForm 
                        onSave={handleReviewSubmit}
                        onCancel={() => setIsAddingReview(false)}
                    />
                )}
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reseñas.length > 0 ? (
                        reseñas.map(r => <ReviewCard key={r._id} reseña={r} />)
                    ) : (
                        <p style={{ color: 'var(--color-text-secondary)', opacity: 0.8, fontStyle: 'italic', padding: '1rem', background: 'var(--color-bg-card)', borderRadius: '0.5rem' }}>Sé el primero en reseñar este juego.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- (¡REEMPLAZADO!) Componente EstadisticasPersonales ---
const EstadisticasPersonales = ({ onBack }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    // --- ¡NUEVO! Estado para el feed ---
    const [feed, setFeed] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/stats/dashboard`);
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Error al cargar estadísticas:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []); 

    // --- ¡NUEVO! Cargar el feed de actividad también ---
    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setFeedLoading(true);
                const response = await fetch(`${API_URL}/feed`);
                const data = await response.json();
                setFeed(Array.isArray(data) ? data.slice(0, 6) : []); // Solo las 6 más recientes
            } catch (err) {
                setFeed([]);
            } finally {
                setFeedLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const getPieChartData = (dataArray) => {
        if (!dataArray || dataArray.length === 0) return { labels: [], datasets: [] }; // Evita error si está vacío
        const labels = dataArray.map(item => item._id); 
        const data = dataArray.map(item => item.count); 
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                borderColor: 'var(--color-bg-card)',
                borderWidth: 2,
            }]
        };
    };

    const chartOptions = {
        plugins: {
            legend: {
                labels: {
                    color: 'var(--color-text-primary)'
                }
            }
        }
    };

    if (loading) {
        return <div className="app-container" style={{textAlign: 'center', fontSize: '1.25rem'}}>Cargando dashboard...</div>;
    }
    if (!stats) {
        return <div className="app-container">Error al cargar datos.</div>;
    }

    const porcentajeCompletado = stats.totalJuegos > 0 ? ((stats.completados / stats.totalJuegos) * 100).toFixed(0) : 0;
    const porcentajeLogros = stats.totalLogrosPosibles > 0 ? ((stats.totalLogrosObtenidos / stats.totalLogrosPosibles) * 100).toFixed(0) : 0;
    
    const plataformaChartData = getPieChartData(stats.plataformas);
    const generoChartData = getPieChartData(stats.generos);

    return (
        <div className="app-container">
            <Button onClick={onBack} color="blue" style={{ marginBottom: '1.5rem' }}>← Volver a la Biblioteca</Button>
            <h2 className="header-title" style={{ marginBottom: '2rem' }}>Dashboard Personal</h2>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stats-card">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.totalJuegos}</p>
                    <p style={{ color: 'var(--color-text-secondary)', opacity: 0.7, marginTop: '0.5rem' }}>Juegos en Biblioteca</p>
                </div>
                <div className="stats-card">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.completados}</p>
                    <p style={{ color: 'var(--color-text-secondary)', opacity: 0.7, marginTop: '0.5rem' }}>Juegos Completados</p>
                </div>
                <div className="stats-card">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stats.totalHoras}</p>
                    <p style={{ color: 'var(--color-text-secondary)', opacity: 0.7, marginTop: '0.5rem' }}>Horas Totales</p>
                </div>
                <div className="stats-card">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                        {stats.mediaPuntuacion.toFixed(1)} ★
                    </p>
                    <p style={{ color: 'var(--color-text-secondary)', opacity: 0.7, marginTop: '0.5rem' }}>Puntuación Media</p>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>
                <div className="stats-card">
                    <h3 className="secondary-title" style={{marginBottom: '1rem'}}>Tasa de Finalización</h3>
                    <ProgressBar value={stats.completados} max={stats.totalJuegos} />
                    <span style={{fontSize: '2rem', marginTop: '0.5rem', display: 'block'}}>{porcentajeCompletado}%</span>
                </div>
                 <div className="stats-card">
                    <h3 className="secondary-title" style={{marginBottom: '1rem'}}>Logros Completados</h3>
                    <ProgressBar value={stats.totalLogrosObtenidos} max={stats.totalLogrosPosibles} />
                    <span style={{fontSize: '2rem', marginTop: '0.5rem', display: 'block'}}>{porcentajeLogros}%</span>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '2rem' }}>
                <div className="stats-card" style={{ padding: '2rem' }}>
                    <h3 className="secondary-title" style={{ marginBottom: '1rem' }}>Juegos por Plataforma</h3>
                    {stats.plataformas.length > 0 ? (
                        <div style={{ maxHeight: '300px', display: 'flex', justifyContent: 'center' }}>
                            <Pie data={plataformaChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p style={{color: 'var(--color-text-secondary)'}}>Añade juegos para ver este gráfico.</p>
                    )}
                </div>
                <div className="stats-card" style={{ padding: '2rem' }}>
                    <h3 className="secondary-title" style={{ marginBottom: '1rem' }}>Juegos por Género</h3>
                    {stats.generos.length > 0 ? (
                        <div style={{ maxHeight: '300px', display: 'flex', justifyContent: 'center' }}>
                            <Pie data={generoChartData} options={chartOptions} />
                        </div>
                    ) : (
                         <p style={{color: 'var(--color-text-secondary)'}}>Añade juegos para ver este gráfico.</p>
                    )}
                </div>
            </div>

            {/* --- ¡NUEVO! Feed de Actividad en el Dashboard --- */}
            <h3 className="secondary-title" style={{ marginTop: '2.5rem' }}>Actividad Reciente</h3>
            {feedLoading ? (
                <div className="stats-card" style={{marginTop: '1rem'}}>Cargando actividad...</div>
            ) : feed.length === 0 ? (
                <div className="stats-card" style={{marginTop: '1rem', color: 'var(--color-text-secondary)'}}>Aún no hay actividad</div>
            ) : (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginTop: '1rem' }}>
                    {feed.map((activity) => (
                        <div key={activity._id} className="stats-card" style={{ textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div className="activity-icon" style={{fontSize: '1.25rem', marginTop: '0.2rem'}}>🔥</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{activity.text}</div>
                                {activity.gameId?.titulo && (
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Juego: {activity.gameId.titulo}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Componente del Feed de Actividad (como pestaña lateral izquierda con hover) ---
const ActivityFeed = ({ onViewDetails, juegos = [], friends = [] }) => {
  // ... (Sin cambios)
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/feed`);
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        console.error("Error al cargar el feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []); 

  return (
    <div className="activity-feed-tab" aria-label="Actividad Reciente">
      <div className="activity-feed-content shadow-lg">
        <div className="activity-feed-header">Actividad Reciente</div>
        <div className="activity-summary">
          <div className="activity-summary-item">
            <span className="summary-label">Juegos</span>
            <span className="summary-value">{juegos.length}</span>
          </div>
          <div className="activity-summary-item">
            <span className="summary-label">Completados</span>
            <span className="summary-value">{juegos.filter(j => j.completado).length}</span>
          </div>
          <div className="activity-summary-item">
            <span className="summary-label">Pendientes</span>
            <span className="summary-value">{juegos.filter(j => !j.completado).length}</span>
          </div>
        </div>
        <div className="friends-section">
          <div className="friends-header">Amigos</div>
          {friends && friends.length > 0 ? (
            <div className="friends-list">
              {friends.map((f) => (
                <div key={f.id} className="friend-item">
                  <img src={f.profilePicUrl || '/vite.svg'} alt={f.nickname || 'usuario'} />
                  <div className="friend-info">
                    <div className="friend-name">{f.nickname || f.email}</div>
                    <div className="friend-status">{f.status || 'Sin estado'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="friends-empty">Aún no has agregado amigos.</div>
          )}
        </div>
        {loading ? (
          <div style={{color: 'var(--color-text-secondary)', textAlign: 'center', padding: '0.75rem'}}>Cargando feed...</div>
        ) : activities.length === 0 ? (
          <p style={{color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '0.5rem 0.75rem'}}>Aún no hay actividad.</p>
        ) : (
          <div className="activity-list">
            {activities.map(activity => (
              <div
                key={activity._id}
                className="activity-item"
                onClick={() => activity.gameId ? onViewDetails(activity.gameId) : null}
                style={{ cursor: activity.gameId ? 'pointer' : 'default' }}
              >
                <span className="activity-icon">🔥</span>
                <p>{activity.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// --- Componente principal App ---
const App = () => {
    // ... (Sin cambios en el estado)
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

    // ... (Sin cambios en los hooks useEffect y funciones de datos)
    useEffect(() => {
        const storedUser = localStorage.getItem('plusUltraUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []); 

    useEffect(() => {
        const loadFriends = async () => {
            if (!currentUser?.token) { setFriends([]); return; }
            try {
                const res = await fetch(`${API_URL}/friends/list`, { headers: { 'Authorization': `Bearer ${currentUser.token}` } });
                const data = await res.json();
                setFriends(data.friends || []);
            } catch (_ERR) {
                setFriends([]);
                void _ERR;
            }
        };
        loadFriends();
    }, [currentUser]);
    
    const fetchJuegos = async () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (searchTerm) params.append('busqueda', searchTerm);
        if (filterGenero) params.append('genero', filterGenero);
        if (filterPlataforma) params.append('plataforma', filterPlataforma);
        if (filterCompletado) params.append('completado', filterCompletado);
        if (ordenarPor) params.append('ordenarPor', ordenarPor);
        const url = `${API_URL}/juegos?${params.toString()}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar la biblioteca');
            const data = await response.json();
            setJuegos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 0) {
            fetchJuegos();
        }
    }, [view, searchTerm, filterGenero, filterPlataforma, filterCompletado, ordenarPor, reviewUpdateTrigger]);

    useEffect(() => {
        if (view === 0 && successMessage) {
            const t = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(t);
        }
    }, [view, successMessage]);

    const handleSaveJuego = async (juegoData, isEdit) => {
        setLoading(true);
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/juegos/${juegoData._id}` : `${API_URL}/juegos`;
            const response = await fetch(url, {
                method: method,
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentUser?.token}`
                },
                body: JSON.stringify(juegoData)
            });
            if (!response.ok) {
              const errData = await response.json(); 
              throw new Error(errData.error || `Error al ${isEdit ? 'actualizar' : 'agregar'} juego`);
            }
            const updatedJuego = await response.json();
            if (isEdit && view === 3) {
                setJuegoSeleccionado(updatedJuego);
            }
            setSuccessMessage(isEdit ? 'Juego actualizado con éxito' : 'Juego añadido con éxito');
            setView(0);
        } catch (err) {
            setError(err.message); 
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdateGame = async (id, updateData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/juegos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser?.token}` },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) throw new Error('Error al actualizar estado');
            const updatedJuego = await response.json();
            if (juegoSeleccionado && juegoSeleccionado._id === id) {
                setJuegoSeleccionado(updatedJuego);
            }
            fetchJuegos(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteJuego = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este juego y todas sus reseñas?")) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/juegos/${id}`, { 
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${currentUser?.token}` }
            });
            if (!response.ok) throw new Error('Error al eliminar juego');
            setView(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (juego) => {
        if (!juego || !juego._id) return;
        await handleUpdateGame(juego._id, { completado: !juego.completado });
    };
    
    const handleViewDetails = (juego) => {
        let juegoASeleccionar = juego;
        if (typeof juego === 'string' || juego instanceof String) {
          juegoASeleccionar = juegos.find(j => j._id === juego);
          if (!juegoASeleccionar) {
            console.error("Juego no encontrado en la lista");
            return;
          }
        }
        setJuegoSeleccionado(juegoASeleccionar);
        setView(3);
    };

    const handleEditGame = (juego) => {
        setJuegoSeleccionado(juego);
        setView(2);
    };

    const handleLoginOrRegister = (authData) => {
        localStorage.setItem('plusUltraUser', JSON.stringify(authData));
        setCurrentUser(authData);
        setView(0);
    };

    const handleLogout = () => {
        localStorage.removeItem('plusUltraUser');
        setCurrentUser(null);
        setView(5); 
    };

    const handleUpdateProfilePic = async (newUrl) => {
        if (!currentUser) return;
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ profilePicUrl: newUrl })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar perfil');
            const updated = { ...currentUser, user: { ...currentUser.user, profilePicUrl: data.user.profilePicUrl, nickname: data.user.nickname, phrase: data.user.phrase } };
            setCurrentUser(updated);
            localStorage.setItem('plusUltraUser', JSON.stringify(updated));
        } catch (err) { alert(err.message); }
    };

    const handleUpdateNickname = async (newNickname) => {
        if (!currentUser) return;
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
                body: JSON.stringify({ nickname: newNickname })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al actualizar apodo');
            const updated = { ...currentUser, user: { ...currentUser.user, profilePicUrl: data.user.profilePicUrl, nickname: data.user.nota, phrase: data.user.phrase } };
            setCurrentUser(updated);
            localStorage.setItem('plusUltraUser', JSON.stringify(updated));
        } catch (err) { alert(err.message); }
    };

    const handleUploadProfilePhoto = async (file) => {
        if (!currentUser || !file) return;
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const response = await fetch(`${API_URL}/auth/profile/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.token}` },
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al subir la foto');
            const updated = { ...currentUser, user: { ...currentUser.user, profilePicUrl: data.user.profilePicUrl, nickname: data.user.nickname, phrase: data.user.phrase } };
            setCurrentUser(updated);
            localStorage.setItem('plusUltraUser', JSON.stringify(updated));
        } catch (err) { alert(err.message); }
    };

    // --- Componente Vista Principal (BibliotecaJuegos) ---
    const BibliotecaJuegos = () => {
        const generos = ["Acción", "Aventura", "RPG", "Estrategia", "Simulación", "Deportes"];
        const plataformas = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"];
        return (
            <div className="app-container">
                {successMessage && (
                  <div className="success-banner" style={{ backgroundColor: 'var(--color-green-bg)', color: 'var(--color-green-text)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '1rem', textAlign: 'center' }}>
                    {successMessage}
                  </div>
                )}
                {/* --- ¡MODIFICADO! ActivityFeed ya no se renderiza aquí --- */}
                {/* <ActivityFeed onViewDetails={handleViewDetails} juegos={juegos} currentUser={currentUser} friends={friends} /> */}
                <div className="form-card shadow-lg" style={{ marginTop: '2rem', marginBottom: '1.5rem', padding: '1rem' }}>
                    <input type="text" placeholder="Buscar por título o desarrollador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ marginBottom: '1rem' }} />
                    <div className="form-grid">
                        <select value={filterGenero} onChange={(e) => setFilterGenero(e.target.value)} className="select-field">
                            <option value="">Todo Género</option>
                            {generos.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select value={filterPlataforma} onChange={(e) => setFilterPlataforma(e.target.value)} className="select-field">
                            <option value="">Toda Plataforma</option>
                            {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select value={filterCompletado} onChange={(e) => setFilterCompletado(e.target.value)} className="select-field">
                            <option value="">Todos los Estados</option>
                            <option value="true">Completados</option>
                            <option value="false">Pendientes</option>
                        </select>
                        <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="select-field">
                            <option value="fechaCreacion">Fecha Añadido</option>
                            <option value="titulo">Título (A-Z)</option>
                            <option value="añoLanzamiento">Año Lanzamiento</option>
                        </select>
                    </div>
                </div>
                {loading && <div style={{ fontSize: '1.25rem', color: 'var(--color-blue-text)', textAlign: 'center', padding: '2.5rem 0' }}>Cargando biblioteca...</div>}
                {error && <div style={{ fontSize: '1.25rem', color: 'var(--color-red-text)', textAlign: 'center', padding: '2.5rem 0' }}>¡Error de conexión! {error}</div>}
                {!loading && !error && (
                    juegos.length > 0 ? (
                        <div className="game-grid">
                            {juegos.map(juego => (
                                <TarjetaJuego
                                    key={juego._id}
                                    juego={juego}
                                    onViewDetails={handleViewDetails}
                                    onToggleComplete={handleToggleComplete}
                                    onEdit={handleEditGame}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="form-card shadow-lg" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
                            <p style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}>Tu biblioteca está vacía o no coincide con los filtros. ¡Añade tu primer juego!</p>
                        </div>
                    )
                )}
            </div>
        );
    };
    
 // --- PerfilView ---
 const PerfilView = () => {
    // ... (sin cambios)
    const [nickname, setNickname] = useState(currentUser?.user?.nickname || '');
    const [phrase, setPhrase] = useState(currentUser?.user?.phrase || '');
    const [url, setUrl] = useState(currentUser?.user?.profilePicUrl || '');
    const [file, setFile] = useState(null);
    const avatarSrc = (currentUser?.user?.profilePicUrl && currentUser.user.profilePicUrl.trim()) ? currentUser.user.profilePicUrl : '/vite.svg';
    const saveNickname = async (e) => { e.preventDefault(); const nick = (nickname || '').trim(); if (!nick) return; await handleUpdateNickname(nick); };
    const savePhrase = async (e) => { e.preventDefault(); const text = (phrase || '').trim(); if (!currentUser) return; try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` }, body: JSON.stringify({ phrase: text })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar frase');
      const updated = { ...currentUser, user: { ...currentUser.user, profilePicUrl: data.user.profilePicUrl, nickname: data.user.nickname, phrase: data.user.phrase } };
      setCurrentUser(updated);
      localStorage.setItem('plusUltraUser', JSON.stringify(updated));
    } catch (err) { alert(err.message); }
    };
    const saveUrl = async (e) => { e.preventDefault(); const clean = (url || '').trim(); if (!clean) return; await handleUpdateProfilePic(clean); };
    const uploadFile = async (e) => { e.preventDefault(); if (!file) return; await handleUploadProfilePhoto(file); setFile(null); };

    return (
      <div className="app-container">
        <div className="form-card shadow-lg" style={{ maxWidth: '900px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Tu Perfil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
            <div>
              <img src={avatarSrc} alt="avatar" style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--color-border)' }} />
              <div style={{ marginTop: '1rem' }}>
                <form onSubmit={uploadFile} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <button className="button button-blue" type="submit">Subir foto</button>
                </form>
                <form onSubmit={saveUrl} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <input type="text" className="input-field" placeholder="URL de imagen" value={url} onChange={(e) => setUrl(e.target.value)} />
                  <button className="button button-green" type="submit">Guardar URL</button>
                </form>
              </div>
            </div>
            <div>
              <form onSubmit={saveNickname}>
                <label>Apodo</label>
                <input className="input-field" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <button className="button button-green" type="submit" style={{ marginTop: '0.5rem' }}>Guardar apodo</button>
              </form>
              <form onSubmit={savePhrase} style={{ marginTop: '1rem' }}>
                <label>Frase de perfil</label>
                <textarea className="textarea-field" rows={3} value={phrase} onChange={(e) => setPhrase(e.target.value)} />
                <button className="button button-green" type="submit" style={{ marginTop: '0.5rem' }}>Guardar frase</button>
              </form>
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>Amigos</div>
                {friends && friends.length > 0 ? (
                  <div className="friends-list">
                    {friends.map((f) => (
                      <div key={f.id} className="friend-item">
                        <img src={f.profilePicUrl || '/vite.svg'} alt={f.nickname || 'usuario'} />
                        <div className="friend-info">
                          <div className="friend-name">{f.nickname || f.email}</div>
                          <div className="friend-status">{f.phrase || ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="friends-empty">Aún no has agregado amigos.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Nueva Vista: Configuración ---
  const SettingsView = () => {
    // ... (sin cambios)
    const [theme, setTheme] = useState(() => localStorage.getItem('plusUltraTheme') || 'dark');
    useEffect(() => {
      const body = document.body;
      if (theme === 'light') {
        body.classList.add('light');
      } else {
        body.classList.remove('light');
      }
      localStorage.setItem('plusUltraTheme', theme);
    }, [theme]);
    return (
      <div className="app-container">
        <div className="form-card shadow-lg" style={{ maxWidth: '700px' }}>
          <h2>Configuración</h2>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tema</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="button button-blue" onClick={() => setTheme('dark')}>Oscuro</button>
              <button className="button button-blue" onClick={() => setTheme('light')}>Claro</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
    
    // --- Renderizado principal (Router simple) ---
    const renderContent = () => {
        switch (view) {
            case 1:
                return <div className="app-container"><FormularioJuego onSave={handleSaveJuego} onCancel={() => setView(0)} /></div>;
            case 2:
                return <div className="app-container"><FormularioJuego juegoInicial={juegoSeleccionado} onSave={handleSaveJuego} onCancel={() => setView(0)} /></div>;
            case 3:
                return <DetalleJuego 
                            juego={juegoSeleccionado} 
                            onBack={() => setView(0)}
                            onUpdateGame={handleUpdateGame} 
                            onDeleteGame={handleDeleteJuego}
                            onUpdateReviews={() => setReviewUpdateTrigger(prev => prev + 1)}
                        />;
            
            // --- ¡MODIFICADO! ---
            case 4:
                return <EstadisticasPersonales onBack={() => setView(0)} />;

            case 5:
              return (
                <div className="login-container">
                  <FormularioLogin 
                    onAuthSuccess={handleLoginOrRegister} 
                    onGoToRegister={() => setView(6)}
                  />
                </div>
              );
            case 6:
              return (
                <div className="login-container">
                  <FormularioRegistro
                    onAuthSuccess={handleLoginOrRegister} 
                    onGoToLogin={() => setView(5)}
                  />
                </div>
              );
            
            // --- ¡MODIFICADO! Se añade el wrapper .home-background ---
            case 0:
            default:
                return (
                  <div className="home-background">
                    <BibliotecaJuegos />
                  </div>
                );

            case 7:
                return (
                  <PerfilView 
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    handleUpdateNickname={handleUpdateNickname}
                    handleUpdateProfilePic={handleUpdateProfilePic}
                    handleUploadProfilePhoto={handleUploadProfilePhoto}
                    friends={friends}
                  />
                );
            case 8:
                return <SettingsView />;
        }
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-primary)' }}>
            
            <Navbar 
                onNavigate={setView} 
                currentUser={currentUser}
                onLogout={handleLogout}
                onUpdateProfilePic={handleUpdateProfilePic}
                onUpdateNickname={handleUpdateNickname}
                onUploadProfilePhoto={handleUploadProfilePhoto}
            />
            
            {renderContent()}
        </div>
    );
};


export default App;