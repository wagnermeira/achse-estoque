// frontend/src/pages/Dashboard/Dashboard.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';
import logoImg from '../../assets/logo-achse.png';
import { NewMaterialModal } from '../../components/NewMaterialModal';

interface Material {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string;
  fotoUrl?: string;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para guardar qual material está sendo editado (ou null se for novo)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Filtros
  const [filterCode, setFilterCode] = useState('');
  const [filterDesc, setFilterDesc] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  async function loadMaterials() {
    try {
      const response = await fetch('http://localhost:3333/materiais');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Erro ao carregar", error);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  // --- FUNÇÃO DE EXCLUIR ---
  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await fetch(`http://localhost:3333/materiais/${id}`, { method: 'DELETE' });
        loadMaterials(); // Recarrega a lista
      } catch (error) {
        alert('Erro ao excluir');
      }
    }
  }

  // --- FUNÇÃO DE ABRIR MODAL PARA EDITAR ---
  function handleEdit(material: Material) {
    setEditingMaterial(material); // Guarda quem vamos editar
    setIsModalOpen(true);         // Abre a janela
  }

  // --- FUNÇÃO DE ABRIR MODAL PARA NOVO ---
  function handleNew() {
    setEditingMaterial(null); // Limpa (é um novo)
    setIsModalOpen(true);     // Abre a janela
  }

  // Lógica de Filtro
  const normalizeText = (text: string) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredMaterials = materials.filter((item) => {
    const codeMatch = normalizeText(item.codigo).includes(normalizeText(filterCode));
    const descMatch = normalizeText(item.descricao).includes(normalizeText(filterDesc));
    const catMatch = normalizeText(item.categoria).includes(normalizeText(filterCategory));
    return codeMatch && descMatch && catMatch;
  });

  return (
    <div className={styles.container}>
      <NewMaterialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadMaterials}
        materialToEdit={editingMaterial} // Passa o material (se houver)
      />

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={logoImg} alt="ACHSE" className={styles.headerLogo} />
          <span className={styles.pageTitle}>Estoque Central</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userName}>Olá, {user?.toUpperCase()}</span>
          <button onClick={logout} className={styles.logoutButton}>SAIR</button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.actionBar}>
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filtrar por Código</label>
              <input 
                type="text" 
                placeholder="Ex: ELE-001" 
                className={styles.filterInput}
                value={filterCode}
                onChange={(e) => setFilterCode(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filtrar por Descrição</label>
              <input 
                type="text" 
                placeholder="Ex: Disjuntor" 
                className={styles.filterInput}
                value={filterDesc}
                onChange={(e) => setFilterDesc(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Filtrar por Categoria</label>
              <input 
                type="text" 
                placeholder="Ex: Elétrica" 
                className={styles.filterInput}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              />
            </div>
          </div>

          {user === 'master' && (
            <button className={styles.addButton} onClick={handleNew}>
              + NOVO MATERIAL
            </button>
          )}
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Foto</th>
                <th style={{ width: '150px' }}>Código</th>
                <th>Descrição do Material</th>
                <th style={{ width: '180px' }}>Categoria</th>
                {user === 'master' && <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((material) => (
                <tr key={material.id}>
                  <td>
                    {material.fotoUrl ? (
                      <img src={material.fotoUrl} alt="Foto" className={styles.thumbImg} />
                    ) : (
                      <div className={styles.noPhoto}>SEM FOTO</div>
                    )}
                  </td>
                  <td><span className={styles.codeCell}>{material.codigo}</span></td>
                  <td>{material.descricao}</td>
                  <td>{material.categoria}</td>
                  
                  {/* BOTÕES DE AÇÃO LIGADOS AGORA */}
                  {user === 'master' && (
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className={`${styles.actionBtn} ${styles.editBtn}`} 
                        title="Editar"
                        onClick={() => handleEdit(material)}
                      >
                        ✏️
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                        title="Excluir"
                        onClick={() => handleDelete(material.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={user === 'master' ? 5 : 4} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    NENHUM MATERIAL ENCONTRADO.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}