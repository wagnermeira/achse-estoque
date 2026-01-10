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

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
// As fotos ficarão salvas na pasta 'uploads' dentro do backend
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
      // --- CONFIGURAÇÃO DE URL DA FOTO ---
      
      // OPÇÃO A: MODO LOCAL (PC)
      // Se estiver rodando no VSCode, descomente a linha abaixo:
      // fotoUrl = `http://localhost:3333/uploads/${file.filename}`;

      // OPÇÃO B: MODO VPS/PRODUÇÃO (ATUAL)
      // Usa caminho relativo. O navegador/Nginx se vira para completar o domínio.
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
      // --- CONFIGURAÇÃO DE URL DA FOTO ---

      // OPÇÃO A: MODO LOCAL (PC)
      // fotoUrl = `http://localhost:3333/uploads/${file.filename}`;

      // OPÇÃO B: MODO VPS/PRODUÇÃO (ATUAL)
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