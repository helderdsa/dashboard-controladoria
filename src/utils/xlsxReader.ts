import * as XLSX from 'xlsx';
import type { PeticaoInicial } from '../types';

// Mapeamento de headers para propriedades do objeto
const headerMap: Record<string, keyof PeticaoInicial> = {
  // Data
  'data': 'data',
  'controle de acoes analisadas peticao inicial': 'data',
  
  // Responsável pela análise
  'resp. pela análise': 'respAnalise',
  'resp pela analise': 'respAnalise',
  
  // Responsável pela petição
  'resp. pela petição': 'respPeticao',
  'resp pela peticao': 'respPeticao',

  
  // Nome do cliente
  'nome do cliente': 'nomeCliente',
  
  // Ação
  'ação': 'acao',
  'acao': 'acao',
  
  // Localidade
  'localidade': 'localidade',
  
  // Fase
  'fase': 'fase',

  
  // Observações
  'observações': 'observacoes',
  'observacoes': 'observacoes',
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/g, ' ') // substitui caracteres especiais por espaço
    .replace(/\s+/g, ' ') // remove espaços extras
    .trim();
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  
  // Se já é uma data
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }
  
  const str = String(value).trim();
  if (!str) return null;

  // Tenta formato dd/mm/yyyy
  const brazilianDateMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brazilianDateMatch) {
    const [, day, month, year] = brazilianDateMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Tenta parsing padrão ISO
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }

  // Se é um número (serial do Excel)
  const num = Number(str);
  if (!isNaN(num) && num > 0) {
    // Conversão de serial do Excel para JS Date
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (date.getFullYear() > 1900) {
      return date;
    }
  }

  return null;
}

function normalizarAcao(acao: string): string {
  if (!acao) return acao;
  
  const acaoLower = acao.toLowerCase().trim();
  
  // Regras de normalização baseadas na lógica fornecida
  
  // 13° salário
  if (acaoLower.includes('13') && acaoLower.includes('2018')) {
    return '13° 2018';
  }
  if (acaoLower.includes('13') && acaoLower.includes('2019')) {
    return '13° 2019';
  }
  
  // Abono de permanência
  if (acaoLower.includes('abono') || acaoLower.includes('permanência') || acaoLower.includes('permanencia')) {
    return 'Abono de permanência';
  }
  
  // Nível
  if (acaoLower.includes('nível') || acaoLower.includes('nivel')) {
    return 'Nivel';
  }
  
  // Policard
  if (acaoLower.includes('policard') || acaoLower.includes('policar')) {
    return 'Policard';
  }
  
  // ADTS
  if (acaoLower.includes('adts')) {
    return 'ADTS';
  }
  
  // Danos IPERN (deve vir antes de "danos" genérico)
  if (acaoLower.includes('danos') && acaoLower.includes('ipern')) {
    return 'Danos IPERN';
  }
  
  // Danos genérico
  if (acaoLower.includes('danos')) {
    return 'Danos';
  }
  
  // Férias
  if (acaoLower.includes('terço') || acaoLower.includes('férias') || acaoLower.includes('ferias')) {
    return 'Férias';
  }
  
  // Letras
  if (acaoLower.includes('letras')) {
    return 'Letras';
  }
  
  // Licença prêmio
  if (acaoLower.includes('prêmio') || acaoLower.includes('premio')) {
    return 'Licência Prêmio';
  }
  
  // Piso salarial
  if (acaoLower.includes('piso salarial') || acaoLower.includes('piso')) {
    return 'Piso Salarial';
  }
  
  // Pensão
  if (acaoLower.includes('penção') || acaoLower.includes('pensão') || acaoLower.includes('pensao')) {
    return 'Pensão';
  }
  
  // Reajuste salarial
  if (acaoLower.includes('reajuste salarial') || acaoLower.includes('reajsute salarial')) {
    return 'Reajuste Salarial';
  }
  
  // Retroativo letra
  if (acaoLower.includes('retroativo') && acaoLower.includes('letra')) {
    return 'Retroativo Letra';
  }
  
  // Retroativo nível
  if (acaoLower.includes('retroativo') && (acaoLower.includes('nível') || acaoLower.includes('nivel'))) {
    
    return 'Retroativo Nível';
  }
  
  // Se não corresponde a nenhuma regra, retorna a ação original com primeira letra maiúscula
  return acao.charAt(0).toUpperCase() + acao.slice(1).toLowerCase();
}

export function lerArquivoXlsx(file: File): Promise<PeticaoInicial[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('Planilhas encontradas:', workbook.SheetNames);
        
        let allValidData: PeticaoInicial[] = [];
        
        // Processa todas as planilhas
        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          console.log(`\n--- Processando planilha ${sheetIndex + 1}: "${sheetName}" ---`);
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Converte para array bruto primeiro para manipular
          const rawArray: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, // Retorna array de arrays ao invés de objetos
            defval: '',
            raw: false 
          });

          if (rawArray.length < 2) {
            console.log(`Planilha "${sheetName}" não tem dados suficientes`);
            return;
          }

          // A primeira linha é o título, a segunda linha são os cabeçalhos
          const headers = rawArray[1]; // Linha 2 (índice 1) contém os cabeçalhos
          const dataRows = rawArray.slice(2); // A partir da linha 3 (índice 2) são os dados

          console.log('Headers encontrados:', headers);
          console.log('Headers normalizados:', headers.map(h => normalizeHeader(h)));
          console.log('Mapeamento de headers:', headers.map(h => ({ 
            original: h, 
            normalizado: normalizeHeader(h), 
            mapeado: headerMap[normalizeHeader(h)] 
          })));

          // Converte as linhas de dados em objetos usando os cabeçalhos
          const mappedData: PeticaoInicial[] = dataRows.map((row) => {
            const peticao: PeticaoInicial = {};
            
            headers.forEach((header: string, colIndex: number) => {
              const value = row[colIndex];
              const normalizedHeader = normalizeHeader(header);
              const propertyKey = headerMap[normalizedHeader];
              
              if (propertyKey && value !== undefined && value !== '') {
                if (propertyKey === 'data') {
                  peticao[propertyKey] = parseDate(value);
                } else if (propertyKey === 'acao') {
                  // Aplica normalização especial para ações
                  const cleanValue = String(value || '').trim();
                  if (cleanValue.length > 0) {
                    (peticao as any)[propertyKey] = normalizarAcao(cleanValue);
                  }
                } else {
                  const cleanValue = String(value || '').trim();
                  // Só adiciona se o valor não for apenas espaços em branco
                  if (cleanValue.length > 0) {
                    (peticao as any)[propertyKey] = cleanValue;
                  }
                }
              }
            });
            
            return peticao;
          });

          console.log(`Total de linhas processadas na planilha "${sheetName}":`, mappedData.length);

          // Filtra registros que têm nome do cliente preenchido (obrigatório)
          const validDataFromSheet = mappedData.filter(item => 
            item.nomeCliente && item.nomeCliente.trim().length > 0
          );

          console.log(`Registros válidos na planilha "${sheetName}":`, validDataFromSheet.length);
          
          // Adiciona os dados válidos desta planilha ao array geral
          allValidData = allValidData.concat(validDataFromSheet);
        });

        console.log('\n--- RESUMO FINAL ---');
        console.log('Total de registros válidos de todas as planilhas:', allValidData.length);
        
        // Estatísticas por mês
        const monthStats = allValidData.reduce((acc, item) => {
          if (item.data) {
            const monthKey = `${item.data.getFullYear()}-${String(item.data.getMonth() + 1).padStart(2, '0')}`;
            acc[monthKey] = (acc[monthKey] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
        
        console.log('Distribuição por mês:', monthStats);
        
        // Estatísticas de ações normalizadas
        const actionStats = allValidData.reduce((acc, item) => {
          if (item.acao) {
            acc[item.acao] = (acc[item.acao] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
        
        console.log('\n--- ESTATÍSTICAS DE AÇÕES NORMALIZADAS ---');
        console.log('Tipos de ação encontrados após normalização:');
        Object.entries(actionStats)
          .sort(([,a], [,b]) => b - a)
          .forEach(([acao, count]) => {
            console.log(`  "${acao}": ${count} registro(s)`);
          });

        resolve(allValidData);
      } catch (error) {
        console.error('Erro ao processar arquivo XLSX:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    reader.readAsArrayBuffer(file);
  });
}