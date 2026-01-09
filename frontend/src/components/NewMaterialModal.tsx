// frontend/src/components/NewMaterialModal.tsx

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import styles from './NewMaterialModal.module.css';

const CATEGORIAS = [
  'CHAVEIRO', 'CIVIL', 'ELÉTRICA', 'ELETRÔNICA', 'EPI', 
  'ESCRITÓRIO', 'FERRAMENTA', 'HIDRÁULICA', 'LIMPEZA', 
  'MECÂNICA', 'MOBILIÁRIO', 'PINTURA', 'REFRIGERAÇÃO', 
  'SDAI', 'SERRALHERIA'
];

interface Material {
  id: number;
  codigo: string;
  descricao: string;
  categoria: string;
  fotoUrl?: string;
}

interface NewMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialToEdit?: Material | null; // Novo: Recebe o material para editar
}

export function NewMaterialModal({ isOpen, onClose, onSuccess, materialToEdit }: NewMaterialModalProps) {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Efeito Mágico: Quando o modal abre, verifica se é Edição ou Criação
  useEffect(() => {
    if (isOpen) {
      if (materialToEdit) {
        // Modo Edição: Preenche os campos
        setCodigo(materialToEdit.codigo);
        setDescricao(materialToEdit.descricao);
        setCategoria(materialToEdit.categoria);
      } else {
        // Modo Criação: Limpa os campos
        setCodigo('');
        setDescricao('');
        setCategoria('');
      }
      setFoto(null); // Foto sempre começa vazia (só muda se o user selecionar nova)
    }
  }, [isOpen, materialToEdit]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('codigo', codigo.toUpperCase());
      formData.append('descricao', descricao.toUpperCase());
      formData.append('categoria', categoria);
      if (foto) {
        formData.append('foto', foto);
      }

      let url = 'http://localhost:3333/materiais';
      let method = 'POST';

      // Se tiver ID, muda para EDIÇÃO (PUT)
      if (materialToEdit) {
        url = `http://localhost:3333/materiais/${materialToEdit.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        alert(materialToEdit ? 'Material atualizado!' : 'Material cadastrado!');
        onSuccess();
        onClose();
      } else {
        alert('Erro ao salvar.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {materialToEdit ? 'Editar Material' : 'Novo Material'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Código</label>
            <input 
              required
              className={styles.input}
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descrição</label>
            <input 
              required
              className={styles.input}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Categoria</label>
            <select 
              required 
              className={styles.select}
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
            >
              <option value="">SELECIONE</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {materialToEdit ? 'Trocar Foto (Opcional)' : 'Foto do Material'}
            </label>
            <input 
              type="file" 
              accept="image/*"
              className={styles.fileInput}
              onChange={e => {
                if (e.target.files) setFoto(e.target.files[0]);
              }}
            />
          </div>

          <footer className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
            <button type="submit" disabled={isLoading} className={styles.btnSave}>
              {isLoading ? 'Salvando...' : 'SALVAR'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}