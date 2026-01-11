// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Configurações
app.use(cors()); // Permite que o Frontend acesse o Backend
app.use(express.json());

// --- SEGURANÇA (MIDDLEWARE) ---
app.use((req, res, next) => {
  // 1. Libera o acesso às fotos (senão as imagens somem do site)
  // O navegador precisa baixar as fotos sem enviar senha
  if (req.path.startsWith('/uploads')) {
    return next();
  }

  // 2. Verifica a Chave de Segurança
  const apiKey = req.headers['x-api-key'];
  
  // Essa é a senha interna entre o Site e a API.
  // Se alguém tentar acessar a API sem isso, é bloqueado.
  const SENHA_MESTRA = 'achse-segredo-supremo-2026';

  if (apiKey !== SENHA_MESTRA) {
    return res.status(401).json({ error: 'Acesso Negado: Você não tem a chave da API.' });
  }

  next(); // Se a senha bater, deixa passar para as rotas abaixo.
});

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único: Data + NomeOriginal (ex: 123456-disjuntor.jpg)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Servir as imagens estáticas
app.use('/uploads', express.static(uploadDir));

// --- ROTAS (ENDPOINTS) ---

// 1. LISTAR TODOS (READ)
app.get('/materiais', async (req, res) => {
  try {
    const materiais = await prisma.material.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(materiais);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
});

// 2. CRIAR NOVO (CREATE)
app.post('/materiais', upload.single('foto'), async (req, res) => {
  try {
    const { codigo, descricao, categoria } = req.body;
    const file = req.file;

    let fotoUrl = null;
    if (file) {
      // Salva apenas o caminho relativo
      fotoUrl = `/uploads/${file.filename}`;
    }

    const novoMaterial = await prisma.material.create({
      data: {
        codigo,
        descricao,
        categoria,
        fotoUrl
      }
    });

    res.json(novoMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar material. Verifique se o código já existe.' });
  }
});

// 3. ATUALIZAR (UPDATE)
app.put('/materiais/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, descricao, categoria } = req.body;
    const file = req.file;

    let dadosAtualizados: any = {
      codigo,
      descricao,
      categoria
    };

    if (file) {
      dadosAtualizados.fotoUrl = `/uploads/${file.filename}`;
    }

    const materialAtualizado = await prisma.material.update({
      where: { id: Number(id) },
      data: dadosAtualizados
    });

    res.json(materialAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar material' });
  }
});

// 4. DELETAR (DELETE)
app.delete('/materiais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({
      where: { id: Number(id) }
    });

    // Tenta apagar a foto física se existir
    if (material?.fotoUrl) {
      const nomeArquivo = material.fotoUrl.replace('/uploads/', '');
      const caminhoFoto = path.join(uploadDir, nomeArquivo);
      if (fs.existsSync(caminhoFoto)) {
        fs.unlinkSync(caminhoFoto);
      }
    }

    await prisma.material.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Material deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar material' });
  }
});

// Iniciar o servidor
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend rodando em http://localhost:${PORT}`);
});