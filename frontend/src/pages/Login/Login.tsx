// frontend/src/pages/Login/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para mudar de página
import { useAuth } from '../../contexts/AuthContext'; // Nossa lógica de segurança
import styles from './Login.module.css';
import logoImg from '../../assets/logo-achse.png';

export function Login() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth(); // Pegamos a função de login do contexto
  const navigate = useNavigate(); // Hook para navegação

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tenta fazer o login com a nossa lógica hardcoded
    const success = login(user, password);

    if (success) {
      navigate('/dashboard'); // Se deu certo, vai pra Dashboard
    } else {
      alert('Acesso negado. Verifique usuário e senha.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <img src={logoImg} alt="ACHSE" className={styles.logo} />
        
        <span className={styles.brandSlogan}>
          Plataforma Integrada de Facilities e Manutenção
        </span>
        
        <p className={styles.formTitle}>Acesse sua conta</p>

        <form onSubmit={handleLogin} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="user" className={styles.label}>Usuário</label>
            <input 
              id="user"
              type="text" 
              className={styles.input}
              placeholder="Digite seu usuário"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Senha</label>
            <input 
              id="password"
              type="password" 
              className={styles.input}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>
            ENTRAR
          </button>

        </form>

        <p className={styles.footer}>© 2025 ACHSE Technology. V 1.0</p>
      </div>
    </div>
  );
}