import React, { useRef, useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registramos los gráficos necesarios
ChartJS.register(ArcElement, Tooltip, Legend);

// --- CONFIGURACIÓN DEL SISTEMA ---
const DEFAULT_AVATAR = "https://i.imgur.com/6v8d9nS.png"; // Avatar Cyberpunk por defecto
const XP_PER_GAME = 50;
const XP_PER_COMPLETE = 150;
const XP_PER_HOUR = 10;

const PerfilView = ({ currentUser, friends = [], juegos = [], handleUploadProfilePhoto }) => {
  
  const fileInputRef = useRef(null);
  // Estado local para la previsualización inmediata de la foto
  const [localPreview, setLocalPreview] = useState(null);

  // Sincronizar el preview si el usuario cambia desde fuera (opcional)
  useEffect(() => {
    if (currentUser?.user?.profilePicUrl) {
      setLocalPreview(null); // Limpiamos preview si viene una nueva URL real del servidor
    }
  }, [currentUser]);

  if (!currentUser || !currentUser.user) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Cargando sistema...</div>;
  const user = currentUser.user;

  // --- 1. SISTEMA DE NIVELES ---
  const totalJuegos = juegos.length;
  const completados = juegos.filter(j => j.completado).length;
  const totalHoras = juegos.reduce((acc, curr) => acc + (curr.totalHorasJugadas || 0), 0);

  const currentXP = (totalJuegos * XP_PER_GAME) + (completados * XP_PER_COMPLETE) + (totalHoras * XP_PER_HOUR);
  const nivelActual = Math.floor(Math.sqrt(currentXP / 100)) || 1;
  
  const xpNextLevel = Math.pow(nivelActual + 1, 2) * 100;
  const xpPrevLevel = Math.pow(nivelActual, 2) * 100;
  const xpProgress = currentXP - xpPrevLevel;
  const xpNeeded = xpNextLevel - xpPrevLevel;
  const xpPercentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  // --- 2. GRÁFICO DONUT ---
  const completionRate = totalJuegos > 0 ? Math.round((completados / totalJuegos) * 100) : 0;
  const chartData = {
    labels: ['Completado', 'Pendiente'],
    datasets: [{
      data: [completados, totalJuegos - completados],
      backgroundColor: ['#00ff88', 'rgba(255, 255, 255, 0.05)'],
      borderWidth: 0,
      cutout: '75%',
    }]
  };
  const chartOptions = { plugins: { legend: { display: false }, tooltip: { enabled: false } } };

  // --- 3. MANEJO DE FOTO ---
  const onAvatarClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 1. Crear URL temporal para mostrarla YA (Feedback instantáneo)
      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);

      // 2. Subir al servidor
      if (handleUploadProfilePhoto) {
        handleUploadProfilePhoto(file);
      }
    }
  };

  // Función para manejar errores de imagen (si la URL del server falla, muestra default)
  const handleImageError = (e) => {
    e.target.src = DEFAULT_AVATAR;
    e.target.onerror = null; // Evita bucles infinitos
  };

  // Determinar qué imagen mostrar: Preview Local > URL del Usuario > Default
  const avatarSrc = localPreview || user.profilePicUrl || DEFAULT_AVATAR;

  const lastGame = juegos.length > 0 ? juegos[0] : null;

  return (
    <div style={styles.wrapper}>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        style={{display: 'none'}} 
        accept="image/*"
      />

      <div style={styles.dashboardGrid}>
        
        {/* --- TARJETA 1: ID CARD --- */}
        <div style={{...styles.card, ...styles.idCard}}>
            <div style={styles.avatarWrapper} onClick={onAvatarClick} title="Clic para cambiar foto">
                <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    style={styles.avatar} 
                    onError={handleImageError} // <--- ESTO EVITA QUE SE ROMPA EL DISEÑO
                />
                <div style={styles.cameraOverlay}>📷</div>
                <div style={styles.onlineBadge}></div>
            </div>
            <div style={styles.idInfo}>
                <h1 style={styles.nickname}>{user.nickname || "Agente"}</h1>
                <p style={styles.userTitle}>{user.phrase || "Miembro de Plus Ultra"}</p>
                
                <div style={styles.xpContainer}>
                    <div style={styles.levelBadge}>LVL {nivelActual}</div>
                    <div style={styles.xpBarBack}>
                        <div style={{...styles.xpBarFill, width: `${xpPercentage}%`}}></div>
                    </div>
                    <span style={styles.xpText}>{Math.floor(currentXP)} / {xpNextLevel} XP</span>
                </div>
            </div>
            <div style={styles.bgDecoration}></div>
        </div>

        {/* --- TARJETA 2: STATS --- */}
        <div style={{...styles.card, ...styles.statsCard}}>
            <div style={styles.statItem}>
                <span style={styles.statValue}>{totalJuegos}</span>
                <span style={styles.statLabel}>JUEGOS</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
                <span style={styles.statValue}>{totalHoras}h</span>
                <span style={styles.statLabel}>TIEMPO JUEGO</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
                <span style={{...styles.statValue, color: '#00ff88'}}>{completados}</span>
                <span style={styles.statLabel}>COMPLETADOS</span>
            </div>
        </div>

        {/* --- TARJETA 3: TASA DE FINALIZACIÓN --- */}
        <div style={{...styles.card, ...styles.chartCard}}>
            <h3 style={styles.cardTitle}>TASA DE FINALIZACIÓN</h3>
            <div style={styles.chartContainer}>
                <div style={styles.chartText}>
                    <span style={styles.percentNumber}>{completionRate}%</span>
                </div>
                <Doughnut data={chartData} options={chartOptions} />
            </div>
        </div>

        {/* --- TARJETA 4: HERO --- */}
        <div style={{...styles.card, ...styles.heroCard, backgroundImage: lastGame ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.9)), url(${lastGame.imagenPortada})` : 'none'}}>
            {lastGame ? (
                <div style={styles.heroContent}>
                    <span style={styles.playingTag}>• JUGADO RECIENTEMENTE</span>
                    <h2 style={styles.heroTitle}>{lastGame.titulo}</h2>
                    <div style={styles.heroStats}>
                        <span>{lastGame.genero}</span>
                        <span>|</span>
                        <span>{lastGame.plataforma}</span>
                    </div>
                    <div style={styles.progressBarContainer}>
                        <div style={{...styles.progressBarFill, width: `${(lastGame.logrosObtenidos / (lastGame.logrosTotales || 1)) * 100}%`}}></div>
                    </div>
                    <p style={{fontSize: '10px', marginTop: '5px', opacity: 0.7}}>
                         Progreso: {lastGame.logrosObtenidos}/{lastGame.logrosTotales || '?'} Logros
                    </p>
                </div>
            ) : (
                <div style={styles.emptyState}>Añade juegos para activar el módulo Hero.</div>
            )}
        </div>

        {/* --- TARJETA 5: SYNDICATE --- */}
        <div style={{...styles.card, ...styles.friendsCard}}>
            <div style={styles.cardHeaderRow}>
                <h3 style={styles.cardTitle}>SYNDICATE</h3> 
                <span style={styles.friendCountBadge}>{friends.length}</span>
            </div>
            <div style={styles.friendsList}>
                {friends.length > 0 ? (
                    friends.map((friend, i) => (
                        <div key={i} style={styles.friendRow}>
                            <img src={friend.profilePicUrl || DEFAULT_AVATAR} style={styles.miniAvatar} alt="" onError={handleImageError} />
                            <div style={styles.friendInfo}>
                                <span style={styles.friendName}>{friend.nickname || friend.email.split('@')[0]}</span>
                                <span style={{...styles.friendStatus, color: '#00f3ff'}}>CONECTADO</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{textAlign: 'center', marginTop: '15px', opacity: 0.6}}>
                        <p style={{fontSize: '10px', marginBottom: '5px'}}>Sindicato vacío.</p>
                        <p style={{fontSize: '9px', color: '#d524c9'}}>Recluta agentes en el menú.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- TARJETA 6: LOG --- */}
        <div style={{...styles.card, ...styles.logCard}}>
            <h3 style={styles.cardTitle}>REGISTRO DEL SISTEMA</h3>
            <div style={styles.terminalWindow}>
                {juegos.slice(0, 5).map((game, i) => (
                    <div key={i} style={styles.logLine}>
                        <span style={styles.logTime}>[REC]</span> 
                        <span style={styles.logText}>Juego detectado: <span style={{color: '#fff'}}>{game.titulo}</span></span>
                    </div>
                ))}
                <div style={styles.logLine}>
                   <span style={styles.logTime}>[SYS]</span>
                   <span style={{color: '#00ff88'}}>Cálculo de XP completado.</span>
                </div>
                <div style={styles.cursor}>_</div>
            </div>
        </div>

      </div>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '20px',
    color: '#fff',
    fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    display: 'flex',
    justifyContent: 'center',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(3, auto)',
    gap: '20px',
    width: '100%',
    maxWidth: '1200px',
    gridTemplateAreas: `
      "id id stats chart"
      "id id hero hero"
      "friends log hero hero"
    `,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 35, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
  cardTitle: {
    fontSize: '11px',
    letterSpacing: '2px',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: '15px',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  // ID Card
  idCard: { 
    gridArea: 'id', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    background: 'linear-gradient(145deg, rgba(20,20,35,0.9) 0%, rgba(40,10,40,0.5) 100%)',
  },
  avatarWrapper: { 
    position: 'relative', 
    marginBottom: '15px', 
    cursor: 'pointer',
    transition: 'transform 0.2s',
    width: '130px',  // Forzamos ancho
    height: '130px', // Forzamos alto
  },
  avatar: {
    width: '100%',   // Ocupa todo el contenedor
    height: '100%',  // Ocupa todo el contenedor
    borderRadius: '50%',
    border: '4px solid #fff',
    boxShadow: '0 0 25px rgba(213, 36, 201, 0.6)',
    objectFit: 'cover', // IMPORTANTE: Evita que la imagen se deforme
    backgroundColor: '#222', // Fondo oscuro por si es transparente
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    background: '#d524c9',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    border: '2px solid #fff',
    zIndex: 10,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '5px',
    width: '15px',
    height: '15px',
    backgroundColor: '#00ff88',
    borderRadius: '50%',
    border: '2px solid #1a1a1a',
    boxShadow: '0 0 10px #00ff88',
    zIndex: 10,
  },
  idInfo: { textAlign: 'center', width: '100%' },
  nickname: { fontSize: '36px', margin: '0', fontWeight: '800', letterSpacing: '1px', textShadow: '0 0 15px rgba(213, 36, 201, 0.4)' },
  userTitle: { color: '#d524c9', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '5px', marginBottom: '20px' },
  
  // XP System Styles
  xpContainer: {
    width: '80%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  levelBadge: {
    color: '#00ff88',
    fontWeight: 'bold',
    fontSize: '14px',
    alignSelf: 'flex-start',
  },
  xpBarBack: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #d524c9, #00ff88)',
    borderRadius: '4px',
    transition: 'width 0.5s ease-out',
  },
  xpText: {
    fontSize: '10px',
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: '2px',
  },

  // Stats
  statsCard: { 
    gridArea: 'stats', 
    display: 'flex', 
    justifyContent: 'space-around', 
    alignItems: 'center',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: '9px', color: '#888', marginTop: '2px', letterSpacing: '1px' },
  statDivider: { width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' },

  // Chart
  chartCard: { 
    gridArea: 'chart', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  chartContainer: { width: '80px', height: '80px', position: 'relative' },
  chartText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  percentNumber: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },

  // Hero
  heroCard: { 
    gridArea: 'hero', 
    backgroundSize: 'cover', 
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    border: '1px solid rgba(0, 255, 136, 0.2)',
  },
  heroContent: { zIndex: 2 },
  playingTag: { color: '#00ff88', fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '5px' },
  heroTitle: { fontSize: '42px', margin: '0', lineHeight: '1', textShadow: '2px 2px 10px rgba(0,0,0,0.8)', fontWeight: '800' },
  heroStats: { display: 'flex', gap: '10px', fontSize: '11px', color: '#ccc', margin: '10px 0' },
  progressBarContainer: { width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' },
  emptyState: { color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' },

  // Squad
  friendsCard: { gridArea: 'friends' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  friendCountBadge: { background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff' },
  friendsList: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '150px' }, // Scroll si hay muchos
  friendRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)' },
  miniAvatar: { width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' },
  friendInfo: { display: 'flex', flexDirection: 'column' },
  friendName: { fontSize: '12px', fontWeight: 'bold' },
  friendStatus: { fontSize: '9px', color: '#00ff88', letterSpacing: '0.5px' },

  // Log
  logCard: { gridArea: 'log', fontFamily: 'monospace', overflow: 'hidden' },
  terminalWindow: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#00ff88' },
  logLine: { display: 'flex', gap: '8px', opacity: 0.8 },
  logTime: { color: '#555' },
  cursor: { animation: 'blink 1s step-end infinite' },
};

export default PerfilView;