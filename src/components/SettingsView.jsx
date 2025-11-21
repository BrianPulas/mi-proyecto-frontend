import React, { useState } from 'react';

const SettingsView = ({ currentUser, onBack, handleUpdateNickname }) => {
  const user = currentUser?.user || {};
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    nickname: user.nickname || '',
    phrase: user.phrase || '',
    theme: 'dark', // 'dark' | 'light'
    streamerMode: false,
    animations: true,
    soundEffects: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Manejador de cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Simulación de guardar cambios
  const handleSave = async () => {
    setIsSaving(true);
    // Aquí llamaríamos a tu API real
    if (formData.nickname !== user.nickname && handleUpdateNickname) {
        await handleUpdateNickname(formData.nickname);
    }
    
    setTimeout(() => {
      setIsSaving(false);
      alert("Ajustes del sistema actualizados correctamente.");
    }, 1000);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* --- HEADER --- */}
        <div style={styles.header}>
          <h1 style={styles.title}>CONFIGURACIÓN DEL SISTEMA</h1>
          <button onClick={onBack} style={styles.backButton}>← VOLVER</button>
        </div>

        <div style={styles.contentLayout}>
          
          {/* --- SIDEBAR (PESTAÑAS) --- */}
          <div style={styles.sidebar}>
            <button 
              style={activeTab === 'account' ? styles.tabActive : styles.tab} 
              onClick={() => setActiveTab('account')}
            >
              👤 CUENTA
            </button>
            <button 
              style={activeTab === 'interface' ? styles.tabActive : styles.tab} 
              onClick={() => setActiveTab('interface')}
            >
              🖥️ INTERFAZ
            </button>
            <button 
              style={activeTab === 'privacy' ? styles.tabActive : styles.tab} 
              onClick={() => setActiveTab('privacy')}
            >
              🔒 PRIVACIDAD
            </button>
            <button 
              style={activeTab === 'danger' ? styles.tabActive : styles.tabDanger} 
              onClick={() => setActiveTab('danger')}
            >
              ⚠️ ZONA DE PELIGRO
            </button>
          </div>

          {/* --- PANEL DE CONTENIDO --- */}
          <div style={styles.panel}>
            
            {/* PESTAÑA 1: CUENTA */}
            {activeTab === 'account' && (
              <div style={styles.sectionAnim}>
                <h2 style={styles.sectionTitle}>IDENTIDAD DEL AGENTE</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre en clave (Nickname)</label>
                  <input 
                    type="text" 
                    name="nickname" 
                    value={formData.nickname} 
                    onChange={handleChange} 
                    style={styles.input} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Frase de Estado</label>
                  <input 
                    type="text" 
                    name="phrase" 
                    value={formData.phrase} 
                    onChange={handleChange} 
                    placeholder="Ej: Cazador de Trofeos"
                    style={styles.input} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Correo Electrónico (Solo lectura)</label>
                  <input 
                    type="text" 
                    value={user.email || ''} 
                    disabled 
                    style={{...styles.input, opacity: 0.5, cursor: 'not-allowed'}} 
                  />
                </div>
              </div>
            )}

            {/* PESTAÑA 2: INTERFAZ */}
            {activeTab === 'interface' && (
              <div style={styles.sectionAnim}>
                <h2 style={styles.sectionTitle}>VISUALIZACIÓN HUD</h2>
                
                <div style={styles.rowGroup}>
                  <div>
                    <label style={styles.labelTitle}>Tema del Sistema</label>
                    <p style={styles.labelDesc}>Alternar entre modo Noche Neon y Día (Experimental).</p>
                  </div>
                  <div style={styles.toggleContainer}>
                     <button 
                        style={formData.theme === 'dark' ? styles.toggleActive : styles.toggleBtn}
                        onClick={() => setFormData({...formData, theme: 'dark'})}
                     >DARK</button>
                     <button 
                        style={formData.theme === 'light' ? styles.toggleActive : styles.toggleBtn}
                        onClick={() => setFormData({...formData, theme: 'light'})}
                     >LIGHT</button>
                  </div>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.rowGroup}>
                  <div>
                    <label style={styles.labelTitle}>Animaciones de Alto Rendimiento</label>
                    <p style={styles.labelDesc}>Desactiva esto si notas lentitud en el dashboard.</p>
                  </div>
                  <label style={styles.switch}>
                    <input 
                      type="checkbox" 
                      name="animations" 
                      checked={formData.animations} 
                      onChange={handleChange}
                    />
                    <span style={styles.slider}></span>
                  </label>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: PRIVACIDAD */}
            {activeTab === 'privacy' && (
              <div style={styles.sectionAnim}>
                <h2 style={styles.sectionTitle}>SEGURIDAD DE DATOS</h2>
                
                <div style={styles.rowGroup}>
                  <div>
                    <label style={styles.labelTitle}>Modo Streamer</label>
                    <p style={styles.labelDesc}>Oculta información sensible (Email) de la pantalla.</p>
                  </div>
                  <label style={styles.switch}>
                    <input 
                      type="checkbox" 
                      name="streamerMode" 
                      checked={formData.streamerMode} 
                      onChange={handleChange}
                    />
                    <span style={styles.slider}></span>
                  </label>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Visibilidad del Perfil</label>
                    <select style={styles.select}>
                        <option>Público (Recomendado)</option>
                        <option>Solo Amigos</option>
                        <option>Privado</option>
                    </select>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: DANGER ZONE */}
            {activeTab === 'danger' && (
              <div style={styles.sectionAnim}>
                <h2 style={{...styles.sectionTitle, color: '#ff4444'}}>ZONA DE PELIGRO</h2>
                <p style={{color: '#ccc', marginBottom: '20px'}}>Estas acciones son irreversibles. Ten cuidado, agente.</p>
                
                <div style={styles.dangerBox}>
                    <div style={{flex: 1}}>
                        <h4 style={{margin: 0, color: 'white'}}>Borrar Caché Local</h4>
                        <p style={{fontSize: '12px', color: '#888', margin: '5px 0'}}>Soluciona problemas visuales recargando datos.</p>
                    </div>
                    <button style={styles.btnWarning} onClick={() => window.location.reload()}>REINICIAR</button>
                </div>

                <div style={{...styles.dangerBox, border: '1px solid #ff4444'}}>
                    <div style={{flex: 1}}>
                        <h4 style={{margin: 0, color: '#ff4444'}}>Eliminar Cuenta</h4>
                        <p style={{fontSize: '12px', color: '#888', margin: '5px 0'}}>Borrara todos tus juegos, reseñas y XP.</p>
                    </div>
                    <button style={styles.btnDanger}>ELIMINAR</button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={onBack}>CANCELAR</button>
            <button style={styles.saveBtn} onClick={handleSave}>
                {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
        </div>

      </div>
    </div>
  );
};

// --- ESTILOS NEON/HUD ---
const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Rajdhani', sans-serif",
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  container: {
    width: '100%',
    maxWidth: '1000px',
    backgroundColor: 'rgba(15, 15, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    boxShadow: '0 0 40px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '20px 30px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(90deg, rgba(20,20,30,1) 0%, rgba(40,10,40,1) 100%)',
  },
  title: {
    fontSize: '24px',
    margin: 0,
    letterSpacing: '2px',
    color: '#fff',
    textShadow: '0 0 10px rgba(255,255,255,0.3)',
  },
  backButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  // Layout
  contentLayout: {
    display: 'flex',
    minHeight: '500px',
  },
  sidebar: {
    width: '250px',
    background: 'rgba(0,0,0,0.3)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    padding: '15px 25px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    letterSpacing: '1px',
    transition: 'all 0.2s',
    borderLeft: '3px solid transparent',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: '#00ff88', // Verde neon
    padding: '15px 25px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    borderLeft: '3px solid #00ff88',
  },
  tabDanger: {
    background: 'transparent',
    border: 'none',
    color: '#ff4444',
    padding: '15px 25px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: 'auto', // Empuja al fondo
  },
  // Panel Principal
  panel: {
    flex: 1,
    padding: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
    marginBottom: '30px',
    color: '#d524c9', // Rosa neon
    letterSpacing: '1px',
  },
  sectionAnim: {
    animation: 'fadeIn 0.3s ease-out',
  },
  // Formularios
  formGroup: { marginBottom: '25px' },
  label: { display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' },
  input: {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s',
  },
  select: {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  // Switches y Toggles
  rowGroup: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  labelTitle: { fontSize: '14px', fontWeight: 'bold', display: 'block' },
  labelDesc: { fontSize: '12px', color: '#666', marginTop: '4px' },
  
  toggleContainer: {
    background: '#0a0a0a',
    borderRadius: '20px',
    padding: '4px',
    display: 'flex',
  },
  toggleBtn: {
    padding: '6px 15px',
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '16px',
  },
  toggleActive: {
    padding: '6px 15px',
    background: '#333',
    border: 'none',
    color: '#fff',
    fontSize: '12px',
    cursor: 'default',
    borderRadius: '16px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },

  // Switch Custom CSS
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '24px',
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#333',
    transition: '.4s',
    borderRadius: '34px',
  },
  // Nota: Los pseudo-elementos (::before) para el switch requieren CSS real, 
  // pero en inline styles podemos simularlo o usar una librería. 
  // Para simplificar, este switch es visual básico, funcionalmente es un checkbox.

  divider: { height: '1px', background: '#222', margin: '20px 0' },

  // Danger Zone
  dangerBox: {
    background: 'rgba(255, 68, 68, 0.05)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  btnWarning: {
    background: 'transparent',
    border: '1px solid #ffa500',
    color: '#ffa500',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  btnDanger: {
    background: '#ff4444',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    padding: '20px 40px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    background: 'rgba(0,0,0,0.2)',
  },
  cancelBtn: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '14px',
  },
  saveBtn: {
    background: 'linear-gradient(90deg, #d524c9, #00ff88)',
    border: 'none',
    padding: '10px 30px',
    borderRadius: '4px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
    transition: 'transform 0.2s',
  }
};

// Hack simple para estilos CSS avanzados (Pseudo-clases) dentro de JSX
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  input[type=checkbox]:checked + span { background-color: #00ff88; }
  input[type=checkbox]:checked + span:before { transform: translateX(26px); }
  span.slider:before {
    position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px;
    background-color: white; transition: .4s; border-radius: 50%;
  }
`;
document.head.appendChild(styleSheet);

export default SettingsView;