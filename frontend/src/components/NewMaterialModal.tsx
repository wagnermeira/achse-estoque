// frontend/src/components/NewMaterialModal.tsx

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import styles from './NewMaterialModal.module.css';

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
  materialToEdit: Material | null;
}

export function NewMaterialModal({ isOpen, onClose, onSuccess, materialToEdit }: NewMaterialModalProps) {
  // Estados do Formulário
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // URL da API
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Quando o modal abre ou o material muda, preenche os campos
  useEffect(() => {
    if (materialToEdit) {
      setCodigo(materialToEdit.codigo);
      setDescricao(materialToEdit.descricao);
      setCategoria(materialToEdit.categoria);
      // Se tiver foto antiga, monta o preview (com suporte a url relativa ou absoluta)
      if (materialToEdit.fotoUrl) {
        const fullUrl = materialToEdit.fotoUrl.startsWith('http') 
          ? materialToEdit.fotoUrl 
          : `${API_URL}${materialToEdit.fotoUrl}`;
        setPreview(fullUrl);
      } else {
        setPreview(null);
      }
    } else {
      // Limpa tudo se for novo material
      limparCampos();
    }
  }, [materialToEdit, isOpen]);

  function limparCampos() {
    setCodigo('');
    setDescricao('');
    setCategoria('');
    setFoto(null);
    setPreview(null);
  }

  // Lida com a seleção de arquivo de foto
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFoto(file);
      
      // Cria um preview local da imagem selecionada
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }

  // Salvar (Criar ou Editar)
  async function handleSave(event: FormEvent) {
    event.preventDefault();

    if (!codigo || !descricao || !categoria) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    setIsLoading(true);

    try {
      // Prepara os dados (FormData é obrigatório para envio de arquivos)
      const formData = new FormData();
      formData.append('codigo', codigo.toUpperCase()); // Salva sempre maiúsculo
      formData.append('descricao', descricao.toUpperCase());
      formData.append('categoria', categoria.toUpperCase());
      
      if (foto) {
        formData.append('foto', foto);
      }

      // Define se é POST (Novo) ou PUT (Editar)
      const method = materialToEdit ? 'PUT' : 'POST';
      const url = materialToEdit 
        ? `${API_URL}/materiais/${materialToEdit.id}` 
        : `${API_URL}/materiais`;

      // --- O PULO DO GATO (SEGURANÇA) ---
      const response = await fetch(url, {
        method: method,
        body: formData,
        headers: {
          // NÃO coloque 'Content-Type': 'application/json' aqui, pois quebraria o envio da foto.
          // Apenas a chave de segurança:
          'x-api-key': 'achse-segredo-supremo-2026'
        }
      });

      if (!response.ok) {
         if (response.status === 401) throw new Error('Acesso Negado (401)');
         const errData = await response.json();
         throw new Error(errData.error || 'Erro ao salvar');
      }

      // Sucesso!
      onSuccess(); // Recarrega a lista no Dashboard
      onClose();   // Fecha o modal
      limparCampos();

    } catch (error: any) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{materialToEdit ? 'Editar Material' : 'Novo Material'}</h2>
          <button onClick={onClose} className={styles.closeBtn}>X</button>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Código *</label>
            <input 
              value={codigo} 
              onChange={e => setCodigo(e.target.value)}
              placeholder="Ex: ELE-001"
              disabled={!!materialToEdit} // Não deixa mudar código na edição para evitar conflitos
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descrição *</label>
            <input 
              value={descricao} 
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex: Disjuntor 10A"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Categoria *</label>
            <input 
              value={categoria} 
              onChange={e => setCategoria(e.target.value)}
              placeholder="Ex: Elétrica"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Foto (Opcional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
            />
            {preview && (
              <div className={styles.previewContainer}>
                <img src={preview} alt="Preview" className={styles.previewImg} />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'SALVAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}