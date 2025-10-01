import { useEffect, useState } from "react";
import "./ListaColaboradores.css";
import {
  advboxApiService,
  type Colaborador,
  type Tarefa,
  type TarefaPorTipo,
} from "../../services/advboxApi.service";
import Modal from "../modal/Modal";
import { BarChart } from "@mui/x-charts";

const ITEMS_PER_PAGE = 10;

// Função para agrupar tarefas por tipo e contar
const agruparTarefasPorTipo = (tarefas: Tarefa[]): TarefaPorTipo[] => {
  const agrupamento = tarefas.reduce((acc, tarefa) => {
    const tipo = tarefa.task || "Sem tipo";

    if (!acc[tipo]) {
      acc[tipo] = {
        tipo,
        quantidade: 0,
        tarefas: [],
      };
    }

    acc[tipo].quantidade++;
    acc[tipo].tarefas.push(tarefa);

    return acc;
  }, {} as Record<string, TarefaPorTipo>);

  // Converter objeto em array e ordenar por quantidade (decrescente)
  return Object.values(agrupamento).sort((a, b) => b.quantidade - a.quantidade);
};

const ListaColaboradores = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] =
    useState<Colaborador | null>(null);
  const [tarefasPendentes, setTarefasPendentes] = useState<Tarefa[]>([]);
  const [tarefasCompletas, setTarefasCompletas] = useState<Tarefa[]>([]);
  const [loadingTarefas, setLoadingTarefas] = useState(false);

  // Estados para tarefas agrupadas por tipo
  const [tarefasPendentesPorTipo, setTarefasPendentesPorTipo] = useState<
    TarefaPorTipo[]
  >([]);
  const [tarefasCompletasPorTipo, setTarefasCompletasPorTipo] = useState<
    TarefaPorTipo[]
  >([]);

  // Calcular dados paginados
  const totalPages = Math.ceil(colaboradores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentColaboradores = colaboradores.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        setLoading(true);
        const data = await advboxApiService.getAll();
        setColaboradores(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar colaboradores:", err);
        setError("Erro ao carregar dados dos colaboradores");
      } finally {
        setLoading(false);
      }
    };

    fetchColaboradores();
  }, []);

  // Funções de navegação
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Função para abrir modal e buscar tarefas do colaborador
  const handleVerDados = async (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsModalOpen(true);
    setLoadingTarefas(true);

    try {
      const tarefas = await advboxApiService.getTodasTarefas(colaborador.name);
      const pendentes = tarefas.pendentes || [];
      const completas = tarefas.completas || [];

      setTarefasPendentes(pendentes);
      setTarefasCompletas(completas);

      // Agrupar tarefas por tipo
      setTarefasPendentesPorTipo(agruparTarefasPorTipo(pendentes));
      setTarefasCompletasPorTipo(agruparTarefasPorTipo(completas));
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      setTarefasPendentes([]);
      setTarefasCompletas([]);
      setTarefasPendentesPorTipo([]);
      setTarefasCompletasPorTipo([]);
    } finally {
      setLoadingTarefas(false);
    }
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedColaborador(null);
    setTarefasPendentes([]);
    setTarefasCompletas([]);
    setTarefasPendentesPorTipo([]);
    setTarefasCompletasPorTipo([]);
  };

  if (loading) {
    return (
      <div className="lista-colaboradores">
        <h2>Lista de Colaboradores</h2>
        <div className="text-center p-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-colaboradores">
        <h2>Lista de Colaboradores</h2>
        <div className="text-center p-8 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-colaboradores">
      <h2>Lista de Colaboradores</h2>

      {/* Informações de paginação */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Mostrando {startIndex + 1} -{" "}
          {Math.min(endIndex, colaboradores.length)} de {colaboradores.length}{" "}
          colaboradores
        </p>
        <p className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </p>
      </div>

      <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-200 p-4">
          <tr>
            <th>Id</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ver Dados</th>
          </tr>
        </thead>
        <tbody>
          {currentColaboradores.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                Nenhum colaborador encontrado
              </td>
            </tr>
          ) : (
            currentColaboradores.map((colaborador) => (
              <tr key={colaborador.id}>
                <td className="border-2 border-gray-200 p-2">
                  {colaborador.id}
                </td>
                <td className="border-2 border-gray-200 p-2">
                  {colaborador.name}
                </td>
                <td className="border-2 border-gray-200 p-2">
                  {colaborador.email ? colaborador.email : "N/A"}
                </td>
                <td className="border-2 border-gray-200 p-2">
                  {colaborador.cellphone ? colaborador.cellphone : "N/A"}
                </td>
                <td className="border-2 border-gray-200 p-2 text-center">
                  <button
                    onClick={() => handleVerDados(colaborador)}
                    className="px-4 py-2 text-white font-semibold cursor-pointer bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                  >
                    Ver Dados
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Anterior
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal com dados das tarefas */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Tarefas de ${selectedColaborador?.name || ""}`}
      >
        {loadingTarefas ? (
          <div className="text-center p-8">
            <p>Carregando tarefas...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo Geral</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Tarefas</p>
                  <p className="text-2xl font-bold">
                    {tarefasCompletas.length + tarefasPendentes.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarefas Completas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tarefasCompletas.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarefas Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {tarefasPendentes.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tarefasCompletas.length + tarefasPendentes.length > 0
                      ? Math.round(
                          (tarefasCompletas.length /
                            (tarefasCompletas.length +
                              tarefasPendentes.length)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
            

            <BarChart
              xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
              series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
              height={300}
            />


            {/* Tarefas Completas Agrupadas por Tipo */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                📗 Tarefas Completas
              </h3>
              {tarefasCompletasPorTipo.length === 0 ? (
                <p className="text-gray-500 italic">
                  Nenhuma tarefa completa encontrada
                </p>
              ) : (
                <div className="space-y-4">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-lg font-semibold mb-2">
                          Tipo
                        </th>
                        <th className="text-right text-lg font-semibold mb-2">
                          Quantidade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tarefasCompletasPorTipo.map((grupo) => (
                        <tr
                          key={grupo.tipo}
                          className="border border-green-400 rounded-lg p-4 bg-green-50 mb-2"
                        >
                          <td className="text-left text-lg font-semibold mb-2 p-1 border-r border-green-300">
                            {grupo.tipo}
                          </td>
                          <td className="text-right text-lg font-semibold mb-2 p-1">
                            {grupo.quantidade}{" "}
                            {grupo.quantidade === 1 ? "tarefa" : "tarefas"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tarefas Pendentes Agrupadas por Tipo */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-orange-600">
                📙 Tarefas Pendentes
              </h3>
              {tarefasPendentesPorTipo.length === 0 ? (
                <p className="text-gray-500 italic">
                  Nenhuma tarefa pendente encontrada
                </p>
              ) : (
                <div className="space-y-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="p-4">
                        <th className="text-left text-lg font-semibold mb-2">
                          Tipo
                        </th>
                        <th className="text-right text-lg font-semibold mb-2">
                          Quantidade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tarefasPendentesPorTipo.map((grupo) => (
                        <tr
                          key={grupo.tipo}
                          className="border border-orange-200 rounded-lg p-4 bg-orange-50 mb-2"
                        >
                          <td className="text-left text-lg font-semibold mb-2 p-1 border-r-2 border-orange-200">
                            {grupo.tipo}
                          </td>
                          <td className="text-right text-lg font-semibold mb-2 p-1">
                            {grupo.quantidade}{" "}
                            {grupo.quantidade === 1 ? "tarefa" : "tarefas"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListaColaboradores;
