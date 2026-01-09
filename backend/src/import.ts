// backend/src/import.ts

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  // 1. Localiza o arquivo na pasta backend
  const filePath = path.join(__dirname, '..', 'materiais.xlsx');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Erro: Não encontrei o arquivo em: ${filePath}`);
    console.log("Certifique-se de colar o 'materiais.xlsx' dentro da pasta 'backend'.");
    return;
  }

  console.log(`📂 Lendo arquivo: ${filePath}...`);

  // 2. Lê a planilha
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Pega a primeira aba
  const worksheet = workbook.Sheets[sheetName];

  // 3. Converte para JSON (Lista de objetos)
  const dados: any[] = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Encontrados ${dados.length} itens para importar.`);

  let sucesso = 0;
  let erro = 0;

  // 4. Loop para salvar no Banco
  for (const item of dados) {
    try {
      // Verifica se as colunas existem (Segurança)
      const codigo = item['CODIGO']?.toString().toUpperCase();
      const descricao = item['DESCRICAO']?.toString().toUpperCase();
      const categoria = item['CATEGORIA']?.toString().toUpperCase();

      if (!codigo || !descricao) {
        console.warn(`⚠️ Linha ignorada (sem código ou descrição):`, item);
        continue;
      }

      // UPSERT: Cria ou Atualiza se já existir
      await prisma.material.upsert({
        where: { codigo: codigo },
        update: {
          descricao: descricao,
          categoria: categoria
        },
        create: {
          codigo: codigo,
          descricao: descricao,
          categoria: categoria,
          fotoUrl: null // Começa sem foto
        }
      });

      process.stdout.write('.'); // Imprime um pontinho para mostrar progresso
      sucesso++;

    } catch (e) {
      console.error(`\n❌ Falha ao importar item: ${item['CODIGO']}`, e);
      erro++;
    }
  }

  console.log('\n\n' + '='.repeat(30));
  console.log(`✅ Importação Finalizada!`);
  console.log(`Total Importado/Atualizado: ${sucesso}`);
  console.log(`Erros: ${erro}`);
  console.log('='.repeat(30));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });