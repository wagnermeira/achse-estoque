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

  // --- CONFIGURAÇÃO DE AMBIENTE (ENV) ---
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Filtros
  const [filterCode, setFilterCode] = useState('');
  const [filterDesc, setFilterDesc] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // --- BUSCAR MATERIAIS (COM SEGURANÇA) ---
  async function loadMaterials() {
    try {
      const response = await fetch(`${API_URL}/materiais`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'achse-segredo-supremo-2026' // <--- A CHAVE AQUI
        }
      });
      
      if (response.status === 401) {
        alert('Erro de Segurança: Acesso não autorizado.');
        return;
      }

      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Erro ao carregar materiais", error);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  // --- EXCLUIR (COM SEGURANÇA) ---
  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      try {
        await fetch(`${API_URL}/materiais/${id}`, { 
          method: 'DELETE',
          headers: {
            'x-api-key': 'achse-segredo-supremo-2026' // <--- A CHAVE AQUI
          }
        });
        loadMaterials();
      } catch (error) {
        alert('Erro ao excluir');
      }
    }
  }

  // --- FUNÇÕES AUXILIARES ---
  function handleEdit(material: Material) {
    setEditingMaterial(material);
    setIsModalOpen(true);
  }

  function handleNew() {
    setEditingMaterial(null);
    setIsModalOpen(true);
  }

  // Resolve a URL da imagem (se for relativo, adiciona o domínio da API)
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url; // Se já for completa (legado), mantém
    return `${API_URL}${url}`; // Monta: http://localhost:3333/uploads/foto.jpg
  };

  const normalizeText = (text: string) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // --- FILTROS ---
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
        materialToEdit={editingMaterial}
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
                <th style={{ width: '180px' }}>Foto</th>
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
                      <img
                        src={getImageUrl(material.fotoUrl)}
                        alt="Foto"
                        className={styles.thumbImg}
                      />
                    ) : (
                      <div className={styles.noPhoto}>SEM FOTO</div>
                    )}
                  </td>
                  <td><span className={styles.codeCell}>{material.codigo}</span></td>
                  <td>{material.descricao}</td>
                  <td>{material.categoria}</td>

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