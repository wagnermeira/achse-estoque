# ACHSE - Sistema de Controle de Estoque (Facilities)

Sistema Full-Stack desenvolvido para gestão de materiais e ativos de manutenção. O foco do projeto é a **visualização rápida** (Catálogo Digital) e a acessibilidade para equipes de campo via **Mobile**.

## 🚀 Funcionalidades

- **Dashboard Visual:** Tabela com fotos grandes (150px) para fácil identificação de peças.
- **Responsividade Mobile:** A tabela se transforma em "Cards" automáticos ao abrir no celular.
- **Busca Inteligente:** Filtros cumulativos (Código + Descrição + Categoria) que ignoram acentos.
- **CRUD Completo:** Criar, Listar, Editar e Excluir materiais (Com Upload de Fotos).
- **Importação em Massa:** Script para ler planilha Excel (`materiais.xlsx`) e alimentar o banco.
- **Controle de Acesso:**
  - **Master:** Acesso total (Cadastrar/Editar/Excluir).
  - **Manutenção:** Apenas consulta e visualização.

## 🛠 Tecnologias Utilizadas

### Frontend
- **React + Vite:** Para uma interface ultra-rápida.
- **TypeScript:** Para segurança e organização do código.
- **CSS Modules:** Estilização modular e organizada.
- **React Router:** Navegação entre telas.

### Backend
- **Node.js + Express:** API REST.
- **SQLite:** Banco de dados leve e eficiente (arquivo local).
- **Prisma ORM:** Gerenciamento do banco de dados.
- **Multer:** Gerenciamento de upload de imagens.

---

## ⚙️ Como Rodar o Projeto

### 1. Backend (Servidor)

Abra um terminal na pasta `backend`:

```bash
cd backend

# Instalar dependências
npm install

# Configurar o Banco de Dados
npx prisma generate
npx prisma migrate dev --name init

# Rodar o servidor (Porta 3333)
npm run dev