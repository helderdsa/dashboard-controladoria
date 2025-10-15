import React, { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { lerArquivoXlsx } from '../utils/xlsxReader';
import { calcularMediasResponsaveis, calcularMediasResponsaveisPeticao, type MediaResponsavel } from '../utils/calcularMedias';
import type { PeticaoInicial } from '../types';

const RelatorioPeticaoInicial = () => {
  const [peticoesOriginais, setPeticoesOriginais] = useState<PeticaoInicial[]>([]);
  const [peticoesFiltradas, setPeticoesFiltradas] = useState<PeticaoInicial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const itemsPerPage = 20;

  // Usa dados filtrados para cálculos
  const peticoes = peticoesFiltradas;
  
  // Cálculos de paginação
  const totalPages = Math.ceil(peticoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = peticoes.slice(startIndex, endIndex);

  // Função para filtrar dados por data
  const aplicarFiltroData = (dados: PeticaoInicial[]) => {
    if (!dataInicio && !dataFim) {
      return dados;
    }

    return dados.filter(item => {
      if (!item.data) return false;

      const dataItem = item.data;
      let incluir = true;

      if (dataInicio) {
        const inicio = new Date(dataInicio);
        incluir = incluir && dataItem >= inicio;
      }

      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999); // Inclui o dia inteiro
        incluir = incluir && dataItem <= fim;
      }

      return incluir;
    });
  };

  // Aplica filtro sempre que os dados originais ou filtros mudam
  React.useEffect(() => {
    const dadosFiltrados = aplicarFiltroData(peticoesOriginais);
    setPeticoesFiltradas(dadosFiltrados);
    setCurrentPage(1); // Reset para primeira página
  }, [peticoesOriginais, dataInicio, dataFim]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset para primeira página

    try {
      const data = await lerArquivoXlsx(file);
      setPeticoesOriginais(data);
      console.log('Dados carregados:', data);
    } catch (err) {
      setError('Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '-';
    return date.toLocaleDateString('pt-BR');
  };

  const clearData = () => {
    setPeticoesOriginais([]);
    setPeticoesFiltradas([]);
    setError(null);
    setCurrentPage(1);
    setDataInicio('');
    setDataFim('');
  };

  const limparFiltros = () => {
    setDataInicio('');
    setDataFim('');
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Gera array de números de página para mostrar
  const getPageNumbers = () => {
    const delta = 2; // Quantas páginas mostrar de cada lado
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Prepara dados para o gráfico de responsáveis pela análise
  const getAnaliseData = () => {
    const respCount: Record<string, number> = {};
    
    peticoes.forEach((peticao) => {
      const resp = peticao.respAnalise?.trim() || 'Não informado';
      respCount[resp] = (respCount[resp] || 0) + 1;
    });

    const sortedData = Object.entries(respCount)
      .sort(([,a], [,b]) => b - a)
      .map(([nome, total]) => ({ nome, total, tipo: 'individual' }));

    // Adiciona o total no final
    const totalAcoes = peticoes.length;
    sortedData.push({ nome: 'TOTAL', total: totalAcoes, tipo: 'total' });

    return sortedData;
  };

  // Prepara dados para o gráfico de cidades (PieChart)
  const getCidadesData = () => {
    const cidadeCount: Record<string, number> = {};
    
    peticoes.forEach((peticao) => {
      const cidade = peticao.localidade?.trim();
      // Exclui registros com "ESTADUAL" e "Não informado" (vazios ou null)
      if (cidade && 
          cidade.length > 0 && 
          cidade.toLowerCase() !== 'estadual' && 
          cidade.toLowerCase() !== 'não informado') {
        cidadeCount[cidade] = (cidadeCount[cidade] || 0) + 1;
      }
    });

    return Object.entries(cidadeCount)
      .sort(([,a], [,b]) => b - a)
      .map(([cidade, total], index) => ({ 
        id: index,
        label: cidade, 
        value: total 
      }));
  };

  // Prepara dados para o gráfico de responsáveis pela petição
  const getPeticaoData = () => {
    const respCount: Record<string, number> = {};
    
    peticoes.forEach((peticao) => {
      const resp = peticao.respPeticao?.trim();
      // Só inclui se o responsável estiver preenchido
      if (resp && resp.length > 0 && resp.toLowerCase() !== 'não informado') {
        respCount[resp] = (respCount[resp] || 0) + 1;
      }
    });

    return Object.entries(respCount)
      .sort(([,a], [,b]) => b - a)
      .map(([nome, total]) => ({ nome, total }));
  };

  // Prepara dados para o gráfico de torta de tipos de ação
  const getTiposAcaoPieData = () => {
    const acaoCount: Record<string, number> = {};
    
    peticoes.forEach((peticao) => {
      const acao = peticao.acao?.trim();
      // Só inclui se o tipo de ação estiver preenchido
      if (acao && acao.length > 0 && acao.toLowerCase() !== 'não informado') {
        acaoCount[acao] = (acaoCount[acao] || 0) + 1;
      }
    });

    return Object.entries(acaoCount)
      .sort(([,a], [,b]) => b - a)
      .map(([tipo, total], index) => ({ 
        id: index,
        label: tipo, 
        value: total 
      }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Relatório de Petição Inicial
          </h1>
          <p className="text-gray-600">
            Faça upload de uma planilha Excel (.xlsx) com os dados das petições iniciais
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Carregar Planilha
            </h2>
            {peticoes.length > 0 && (
              <button
                onClick={clearData}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpar Dados
              </button>
            )}
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center ${
                loading ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <div className="w-12 h-12 mb-4 text-gray-400">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {loading ? 'Processando...' : 'Clique para fazer upload'}
              </p>
              <p className="text-sm text-gray-500">
                Arquivos .xlsx ou .xls até 10MB
              </p>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Filtros de Data */}
        {peticoesOriginais.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Filtros por Data
              </h2>
              <div className="text-sm text-gray-500">
                {peticoesOriginais.length} registros originais → {peticoes.length} filtrados
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="data-inicio" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  id="data-inicio"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="data-fim" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  id="data-fim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Limpar Filtros
                </button>
                <div className="text-sm text-gray-600 flex items-center">
                  {(dataInicio || dataFim) && (
                    <span>
                      {dataInicio && `De: ${new Date(dataInicio).toLocaleDateString('pt-BR')}`}
                      {dataInicio && dataFim && ' | '}
                      {dataFim && `Até: ${new Date(dataFim).toLocaleDateString('pt-BR')}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {peticoes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">
                Total de Registros{(dataInicio || dataFim) ? ' (Filtrados)' : ''}
              </div>
              <div className="text-3xl font-bold text-blue-600 mt-1">
                {peticoes.length}
                {(dataInicio || dataFim) && (
                  <div className="text-sm text-gray-500 font-normal">
                    de {peticoesOriginais.length}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">Fases Distintas</div>
              <div className="text-3xl font-bold text-purple-600 mt-1">
                {new Set(peticoes.map(p => p.fase).filter(Boolean)).size}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500">Localidades Distintas</div>
              <div className="text-3xl font-bold text-orange-600 mt-1">
                {new Set(peticoes.map(p => p.localidade).filter(Boolean)).size}
              </div>
            </div>
          </div>
        )}

        {/* Médias dos Responsáveis */}
        {peticoes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-700">
              Médias de Produtividade - Responsáveis pela Análise
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Análises
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Média Diária
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Média Semanal
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Ativos
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semanas Ativas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calcularMediasResponsaveis(peticoes).map((media: MediaResponsavel, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {media.responsavel}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {media.totalAnalises}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <span className="font-medium text-green-600">
                          {media.mediaDiaria.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <span className="font-medium text-purple-600">
                          {media.mediaSemanal.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {media.diasAtivos}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {media.semanasAtivas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Médias dos Responsáveis pela Petição */}
        {peticoes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-700">
              Médias de Produtividade - Responsáveis pela Petição
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Petições
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Média Diária
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Média Semanal
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Ativos
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semanas Ativas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calcularMediasResponsaveisPeticao(peticoes).map((media: MediaResponsavel, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {media.responsavel}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {media.totalAnalises}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <span className="font-medium text-green-600">
                          {media.mediaDiaria.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <span className="font-medium text-purple-600">
                          {media.mediaSemanal.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {media.diasAtivos}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {media.semanasAtivas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gráficos */}
        {peticoes.length > 0 && (
          <div className="space-y-8 mb-8">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              {/* Gráfico 1: Responsáveis pela Análise */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Ações Analisadas por Responsável
                </h3>
                <div className="h-80 w-full">
                  <BarChart
                    dataset={getAnaliseData()}
                    xAxis={[{ 
                      scaleType: 'band', 
                      dataKey: 'nome',
                      categoryGapRatio: 0.3
                    }]}
                    series={[{ 
                      dataKey: 'total', 
                      color: '#3b82f6'
                    }]}
                    height={330}
                  />
                </div>
              </div>

              {/* Gráfico 2: Responsáveis pela Petição */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Petições por Responsável
                </h3>
                <div className="h-80 w-full">
                  <BarChart
                    dataset={getPeticaoData()}
                    xAxis={[{ 
                      scaleType: 'band', 
                      dataKey: 'nome',
                      categoryGapRatio: 0.3
                    }]}
                    series={[{ 
                      dataKey: 'total', 
                      color: '#f59e0b'
                    }]}
                    height={330}
                  />
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                {/* Gráfico 3: Localidades/Cidades */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-700">
                    Distribuição por Localidade
                  </h3>
                  <div className="w-full flex justify-center items-center">
                    <PieChart
                      series={[
                        {
                          data: getCidadesData(),
                          innerRadius: 20,
                        },
                      ]}
                      height={300}
                    />
                  </div>
                </div>

                {/* Gráfico 4: Tipos de Ação */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-700">
                    Distribuição por Tipo de Ação
                  </h3>
                  <div className="w-full flex justify-center items-center">
                    <PieChart
                      series={[
                        {
                          data: getTiposAcaoPieData(),
                          innerRadius: 20,
                        },
                      ]}
                      sx={{
                        height: '100%',
                      }}
                      slotProps={{
                        legend: {
                          sx: {
                            overflowY: 'scroll',
                            flexWrap: 'nowrap',
                            height: '100%',
                          },
                        },
                      }}
                      height={300}
                    />
                  </div>
                </div>
            </div>

          </div>
        )}

        {/* Table */}
        {peticoes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Dados das Petições Iniciais
              </h3>
              {totalPages > 1 && (
                <div className="text-sm text-gray-500">
                  Exibindo {currentItems.length} de {peticoes.length} registros
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome do Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resp. Análise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resp. Petição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((peticao, index) => (
                    <tr key={startIndex + index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(peticao.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {peticao.nomeCliente || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {peticao.acao || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {peticao.localidade || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          peticao.fase 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {peticao.fase || 'Não informado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {peticao.respAnalise || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {peticao.respPeticao || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={peticao.observacoes}>
                        {peticao.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{startIndex + 1}</span> até{' '}
                      <span className="font-medium">{Math.min(endIndex, peticoes.length)}</span> de{' '}
                      <span className="font-medium">{peticoes.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={goToPrevious}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Anterior</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {getPageNumbers().map((pageNumber, index) => {
                        if (pageNumber === '...') {
                          return (
                            <span key={`dots-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          );
                        }
                        
                        const page = pageNumber as number;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Próximo</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {peticoes.length === 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h8v8H6V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum dado carregado
            </h3>
            <p className="text-gray-500">
              Faça upload de uma planilha Excel para visualizar os dados das petições iniciais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatorioPeticaoInicial;