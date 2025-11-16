import React, { useState, useEffect } from 'react';

// NOTA: Para que este código funcione, debes asegurarte de importar 'frontend/styles.css'
// Y el nuevo 'frontend/Navbar.css' (que te daré más abajo)
// en tu archivo de entrada principal (ej. src/main.jsx).
// Por ejemplo:
// import './styles.css';
// import './Navbar.css';

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

// --- (¡MODIFICADO!) Componente Navbar (Ahora con menú responsive) ---
const Navbar = ({ onNavigate }) => {
  // 1. Añadimos estado para el menú
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 2. Función para cerrar el menú al hacer clic en un enlace
  const handleNavigate = (view) => {
    onNavigate(view);
    setIsMenuOpen(false); // Cierra el menú al navegar
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* Clic en el logo te lleva a la home */}
        <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate(0); }}>
          PLUS ULTRA
        </a>
      </div>

      {/* 3. Botón de Hamburguesa (solo visible en móvil) */}
      <button 
        className="navbar-toggle" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation"
      >
        {/* Esto crea el ícono de 3 líneas (la hamburguesa) */}
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* 4. Los enlaces ahora tienen una clase 'active' si el menú está abierto */}
      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <li>
          <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate(1); }}>
            Añadir Juego
          </a>
        </li>
        <li>
          <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate(4); }}>
            Estadísticas
          </a>
        </li>
      </ul>
    </nav>
  );
};


// --- Componente TarjetaJuego ---
// Reemplaza con esto:
const TarjetaJuego = ({ juego, onViewDetails, onToggleComplete, onEdit }) => (
    <div className="game-card shadow-lg">
        <img
            src={juego.imagenPortada}
            alt={`Portada de ${juego.titulo}`}
            className="game-card-img"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/cbd5e1?text=PLUS+ULTRA+GAME"; }}
        />
        
        {/* */}
        <div style={{ padding: '1rem' }}>
            <h3 className="text-xl font-bold text-blue-400 truncate mb-1" style={{ color: 'var(--color-text-primary)' }}>{juego.titulo}</h3>
            <p className="text-sm text-gray-400 mb-2" style={{ color: 'var(--color-text-secondary)', opacity: 0.9 }}>
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
        {/* */}
        
    </div>
);

// --- Componente FormularioJuego ---
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
        ...juegoInicial
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setJuego(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(juego, isEdit);
    };

    const generos = ["Acción", "Aventura", "RPG", "Estrategia", "Simulación", "Deportes"];
    const plataformas = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"];

    return (
        <form onSubmit={handleSubmit} className="form-card shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--color-accent-blue)' }}>{isEdit ? 'Editar Juego' : 'Añadir Nuevo Juego'}</h2>

            <div className="form-grid">
                <input
                    name="titulo"
                    value={juego.titulo}
                    onChange={handleChange}
                    placeholder="Título del Videojuego *"
                    required
                    className="input-field"
                />
                <input
                    name="desarrollador"
                    value={juego.desarrollador}
                    onChange={handleChange}
                    placeholder="Desarrollador *"
                    required
                    className="input-field"
                />
                <select
                    name="genero"
                    value={juego.genero}
                    onChange={handleChange}
                    className="select-field"
                >
                    {generos.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                    name="plataforma"
                    value={juego.plataforma}
                    onChange={handleChange}
                    className="select-field"
                >
                    {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                    type="number"
                    name="añoLanzamiento"
                    value={juego.añoLanzamiento}
                    onChange={handleChange}
                    placeholder="Año de Lanzamiento *"
                    required
                    min="1970"
                    max={new Date().getFullYear()}
                    className="input-field"
                />
                <input
                    name="imagenPortada"
                    value={juego.imagenPortada}
                    onChange={handleChange}
                    placeholder="URL de la Imagen de Portada"
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
                <input
                    type="checkbox"
                    name="completado"
                    checked={juego.completado}
                    onChange={handleChange}
                    id="completado"
                    style={{ height: '1.25rem', width: '1.25rem', accentColor: 'var(--color-accent-blue)' }}
                />
                <label htmlFor="completado" style={{ color: 'var(--color-text-primary)' }}>Marcar como Completado</label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Button onClick={onCancel} color="red" type="button">
                    Cancelar
                </Button>
                <Button type="submit" color="blue">
                    {isEdit ? 'Guardar Cambios' : 'Agregar Juego'}
                </Button>
            </div>
        </form>
    );
};

// --- Componente DetalleJuego / FormularioReseña / ListaReseñas ---
const DetalleJuego = ({ juego, onBack, onUpdateGame, onDeleteGame, onUpdateReviews }) => {
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
            fetchReseñas(); // Recargar reseñas
            onUpdateReviews(); // Notificar al componente principal para actualizar stats
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        // En un proyecto real, se usaría un modal/diálogo personalizado.
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
                <h4 className="text-xl font-semibold" style={{ color: '#93c5fd' }}>{isEdit ? 'Editar Reseña' : 'Escribir Nueva Reseña'}</h4>
                
                <div className="flex items-center space-x-4">
                    <label style={{ color: 'var(--color-text-primary)', opacity: 0.8 }}>Puntuación:</label>
                    <input
                        type="number"
                        name="puntuacion"
                        value={review.puntuacion}
                        onChange={handleChange}
                        min="1" max="5" required
                        className="input-field"
                        style={{ width: '4rem', padding: '0.5rem' }}
                    />
                    <StarRating puntuacion={review.puntuacion} />
                </div>
                
                <div className="flex items-center space-x-4">
                    <label style={{ color: 'var(--color-text-primary)', opacity: 0.8 }}>Horas Jugadas:</label>
                    <input
                        type="number"
                        name="horasJugadas"
                        value={review.horasJugadas}
                        onChange={handleChange}
                        min="0" required
                        className="input-field"
                        style={{ width: '6rem', padding: '0.5rem' }}
                    />
                </div>
                
                <div className="flex items-center space-x-4">
                    <label style={{ color: 'var(--color-text-primary)', opacity: 0.8 }}>Dificultad:</label>
                    <select name="dificultad" value={review.dificultad} onChange={handleChange} className="select-field" style={{ width: '8rem', padding: '0.5rem' }}>
                        <option value="Fácil">Fácil</option>
                        <option value="Normal">Normal</option>
                        <option value="Difícil">Difícil</option>
                    </select>
                </div>
                
                <div className="checkbox-group">
                    <input type="checkbox" name="recomendaria" checked={review.recomendaria} onChange={handleChange} id="recomendaria" style={{ height: '1rem', width: '1rem', accentColor: 'var(--color-accent-blue)' }}/>
                    <label htmlFor="recomendaria" style={{ color: 'var(--color-text-primary)', opacity: 0.8 }}>¿Lo recomendarías?</label>
                </div>
                
                <textarea
                    name="textoReseña"
                    value={review.textoReseña}
                    onChange={handleChange}
                    placeholder="Tu reseña detallada..."
                    rows="4"
                    required
                    className="textarea-field"
                />

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
                <div className="text-sm" style={{ color: 'var(--color-text-primary)', opacity: 0.6 }}>
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
            {/* Columna de Imagen y Info */}
            <div className="lg-col-span-1">
                {/* --- (NOTA) ---
                    He movido el botón de "Volver" al componente EstadisticasPersonales
                    y al de DetalleJuego (aquí abajo) para que no esté en el Navbar principal
                */}
                <Button onClick={onBack} color="blue" style={{ marginBottom: '1.5rem', width: '100%' }}>← Volver a la Biblioteca</Button>
                
                <img
                    src={juego.imagenPortada}
                    alt={juego.titulo}
                    className="w-full h-auto object-cover rounded-xl shadow-xl"
                    style={{ border: '4px solid var(--color-accent-blue)' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/cbd5e1?text=PLUS+ULTRA+GAME"; }}
                />
                <div className="detail-sidebar-content" style={{ marginTop: '1rem' }}>
                    <h2 className="text-3xl font-extrabold text-white">{juego.titulo}</h2>
                    <p style={{ color: 'var(--color-text-primary)', opacity: 0.6, marginTop: '0.25rem' }}>{juego.desarrollador} • {juego.añoLanzamiento}</p>
                    <p className="game-status" style={{ marginTop: '0.5rem', background: juego.completado ? 'var(--color-accent-green)' : 'var(--color-accent-yellow)' }}>
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

            {/* Columna de Descripción y Reseñas */}
            <div className="lg-col-span-2">
                <h3 className="secondary-title mb-2">Descripción</h3>
                <p style={{ color: 'var(--color-text-primary)' }} className="p-4 rounded-lg shadow-inner bg-gray-800">
                    {juego.descripcion || "No se ha proporcionado una descripción."}
                </p>

                <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <h3 className="secondary-title">Reseñas</h3>
                    {!isAddingReview && <Button onClick={() => setIsAddingReview(true)}>+ Nueva Reseña</Button>}
                </div>
                
                {error && <div style={{ background: 'var(--color-accent-red)', padding: '0.75rem', color: 'white', borderRadius: '0.5rem', marginBottom: '1rem' }}>Error: {error}</div>}
                {loading && <div style={{ color: 'var(--color-accent-blue)', textAlign: 'center' }}>Cargando reseñas...</div>}
                
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
                        <p style={{ color: 'var(--color-text-primary)', opacity: 0.6, fontStyle: 'italic', padding: '1rem', background: 'var(--color-bg-card)', borderRadius: '0.5rem' }}>Sé el primero en reseñar este juego.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Componente EstadisticasPersonales ---
const EstadisticasPersonales = ({ juegos, onBack }) => {
    const totalJuegos = juegos.length;
    const completados = juegos.filter(j => j.completado).length;
    const porcentajeCompletado = totalJuegos > 0 ? ((completados / totalJuegos) * 100).toFixed(1) : 0;

    const generos = [...new Set(juegos.map(j => j.genero))];
    const plataformaCount = juegos.reduce((acc, j) => {
        acc[j.plataforma] = (acc[j.plataforma] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="app-container">
            <Button onClick={onBack} color="blue" style={{ marginBottom: '1.5rem' }}>← Volver a la Biblioteca</Button>
            <h2 className="header-title" style={{ marginBottom: '2rem' }}>Dashboard Personal</h2>

            <div className="stats-grid">
                
                {/* Tarjeta 1: Total de Juegos */}
                <div className="stats-card stats-card-border-blue">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'white' }}>{totalJuegos}</p>
                    <p style={{ color: 'var(--color-text-primary)', opacity: 0.7, marginTop: '0.5rem' }}>Juegos en Biblioteca</p>
                </div>

                {/* Tarjeta 2: Juegos Completados */}
                <div className="stats-card stats-card-border-green">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'white' }}>{completados}</p>
                    <p style={{ color: 'var(--color-text-primary)', opacity: 0.7, marginTop: '0.5rem' }}>Juegos Completados</p>
                </div>
                
                {/* Tarjeta 3: Porcentaje Completado */}
                <div className="stats-card stats-card-border-yellow">
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'white' }}>{porcentajeCompletado}%</p>
                    <p style={{ color: 'var(--color-text-primary)', opacity: 0.7, marginTop: '0.5rem' }}>Progreso General</p>
                </div>
            </div>

            <div className="stats-card" style={{ marginTop: '2rem', textAlign: 'left' }}>
                <h3 className="secondary-title" style={{ marginBottom: '1rem' }}>Juegos por Plataforma</h3>
                <ul className="stats-list" style={{ color: 'var(--color-text-primary)' }}>
                    {Object.entries(plataformaCount).map(([plataforma, count]) => (
                        <li key={plataforma}>
                            <span>🎮 {plataforma}</span>
                            <span style={{ fontWeight: '700', color: 'white' }}>{count}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="stats-card" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <h3 className="secondary-title" style={{ marginBottom: '1rem' }}>Géneros Rastreados</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {generos.map(g => (
                        <span key={g} style={{ background: '#9333ea', color: 'white', fontSize: '0.875rem', fontWeight: '500', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                            {g}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Componente principal App ---
const App = () => {
    // 0: Biblioteca, 1: Agregar Juego, 2: Editar Juego, 3: Detalle/Reseñas, 4: Estadísticas
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

    // --- LÓGICA DE DATOS Y API ---

    const fetchJuegos = async () => {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('busqueda', searchTerm);
        if (filterGenero) params.append('genero', filterGenero);
        if (filterPlataforma) params.append('plataforma', filterPlataforma);
        if (filterCompletado) params.append('completado', filterCompletado);
        if (ordenarPor) params.append('ordenarPor', ordenarPor);
        
        const API_URL = '/api';
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
        fetchJuegos();
    }, [searchTerm, filterGenero, filterPlataforma, filterCompletado, ordenarPor, reviewUpdateTrigger]);

    const handleSaveJuego = async (juegoData, isEdit) => {
        setLoading(true);
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/juegos/${juegoData._id}` : `${API_URL}/juegos`;

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(juegoData)
            });

            if (!response.ok) throw new Error(`Error al ${isEdit ? 'actualizar' : 'agregar'} juego`);

            const updatedJuego = await response.json();
            if (isEdit && view === 3) {
                setJuegoSeleccionado(updatedJuego);
            }

            setView(0); 
            fetchJuegos(); 
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
                headers: { 'Content-Type': 'application/json' },
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
    
    const handleToggleComplete = (juego) => {
        handleUpdateGame(juego._id, { completado: !juego.completado });
    };
    
    const handleDeleteJuego = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este juego y todas sus reseñas?")) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/juegos/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar juego');
            setView(0);
            fetchJuegos();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleViewDetails = (juego) => {
        setJuegoSeleccionado(juego);
        setView(3);
    };

    const handleEditGame = (juego) => {
        setJuegoSeleccionado(juego);
        setView(2);
    };

    // --- Componente Vista Principal (BibliotecaJuegos) ---
    const BibliotecaJuegos = () => {
        const generos = ["Acción", "Aventura", "RPG", "Estrategia", "Simulación", "Deportes"];
        const plataformas = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Móvil"];

        return (
            <div className="app-container">
                {/* --- (ELIMINADO) ---
                El <header> que estaba aquí fue eliminado
                porque el Navbar global ahora lo reemplaza.
                */}

                {/* Área de Filtros y Búsqueda */}
                <div className="form-card shadow-lg" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por título o desarrollador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ marginBottom: '1am' }}
                    />
                    <div className="form-grid">
                        <select
                            value={filterGenero}
                            onChange={(e) => setFilterGenero(e.target.value)}
                            className="select-field"
                        >
                            <option value="">Todo Género</option>
                            {generos.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select
                            value={filterPlataforma}
                            onChange={(e) => setFilterPlataforma(e.target.value)}
                            className="select-field"
                        >
                            <option value="">Toda Plataforma</option>
                            {plataformas.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select
                            value={filterCompletado}
                            onChange={(e) => setFilterCompletado(e.target.value)}
                            className="select-field"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="true">Completados</option>
                            <option value="false">Pendientes</option>
                        </select>
                        <select
                            value={ordenarPor}
                            onChange={(e) => setOrdenarPor(e.target.value)}
                            className="select-field"
                        >
                            <option value="fechaCreacion">Fecha Añadido</option>
                            <option value="titulo">Título (A-Z)</option>
                            <option value="añoLanzamiento">Año Lanzamiento</option>
                        </select>
                    </div>
                </div>

                {/* Mostrar Estado */}
                {loading && <div style={{ fontSize: '1.25rem', color: 'var(--color-accent-blue)', textAlign: 'center', padding: '2.5rem 0' }}>Cargando biblioteca...</div>}
                {error && <div style={{ fontSize: '1.25rem', color: 'var(--color-accent-red)', textAlign: 'center', padding: '2.5rem 0' }}>¡Error de conexión! {error}</div>}
                
                {/* Lista de Juegos */}
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
                            <p style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', opacity: 0.7 }}>Tu biblioteca está vacía o no coincide con los filtros. ¡Añade tu primer juego!</p>
                        </div>
                    )
                )}
            </div>
        );
    };
    
    // --- Renderizado principal (Router simple) ---
    const renderContent = () => {
        switch (view) {
            // --- ¡CAMBIO AQUÍ! ---
            // Se usa "app-container" para centrar el formulario
            case 1:
                return <div className="app-container"><FormularioJuego onSave={handleSaveJuego} onCancel={() => setView(0)} /></div>;
            
            // --- ¡CAMBIO AQUÍ! ---
            // Se usa "app-container" para centrar el formulario
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
            case 4:
                return <EstadisticasPersonales juegos={juegos} onBack={() => setView(0)} />;
            case 0:
            default:
                return <BibliotecaJuegos />;
        }
    };

    // --- ¡CAMBIO AQUÍ! ---
    // Se corrigió el color de fondo para que coincida con el nuevo tema
    return (
        <div className="min-h-screen font-sans" style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-primary)' }}>
            
            {/* --- (AÑADIDO) ---
            Aquí se renderiza el Navbar global.
            Le pasamos 'setView' como la prop 'onNavigate'.
            */}
            <Navbar onNavigate={setView} />
            
            {/* Aquí se renderiza el contenido de la vista actual */}
            {renderContent()}
        </div>
    );
};


export default App;