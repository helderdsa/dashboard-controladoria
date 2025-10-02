import { useEffect, useState } from "react";
import "./ListaColaboradores.css";
import { advboxApiService } from "../../services/advboxApi.service";
import {
  type Colaborador,
  type Tarefa,
  type ResumoTarefasPorTipo,
} from "../../types";
import Modal from "../modal/Modal";
import { BarChart } from "@mui/x-charts";
import {
  agruparTarefasCompletasEIncompletas,
  calcularMediaDiaria,
  calcularMediaSemanalMensal,
} from "../../utils";

const ITEMS_PER_PAGE = 10;

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

  // Estado para tarefas agrupadas por tipo (completas e incompletas juntas)
  const [resumoTarefasPorTipo, setResumoTarefasPorTipo] = useState<
    ResumoTarefasPorTipo[]
  >([]);

  // Estados para médias de produtividade
  const [mediaDiaria, setMediaDiaria] = useState<number>(0);
  const [mediaSemanalMensal, setMediaSemanalMensal] = useState<number>(0);

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

      // Agrupar tarefas completas e incompletas em um único array
      const resumo = agruparTarefasCompletasEIncompletas(completas, pendentes);
      setResumoTarefasPorTipo(resumo);

      // Calcular médias de produtividade

      const mediaDiariaCalculada = calcularMediaDiaria(completas);
      const mediaSemanalMensalCalculada = calcularMediaSemanalMensal(completas);

      setMediaDiaria(mediaDiariaCalculada);
      setMediaSemanalMensal(mediaSemanalMensalCalculada);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      setTarefasPendentes([]);
      setTarefasCompletas([]);
      setResumoTarefasPorTipo([]);
      setMediaDiaria(0);
      setMediaSemanalMensal(0);
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
    setResumoTarefasPorTipo([]);
    setMediaDiaria(0);
    setMediaSemanalMensal(0);
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

            {/* Médias de Produtividade */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-800">
                📈 Médias de Produtividade
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Média Diária</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mediaDiaria}
                  </p>
                  <p className="text-xs text-gray-500">tarefas/dia</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Média Semanal</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {mediaSemanalMensal}
                  </p>
                  <p className="text-xs text-gray-500">tarefas/semana</p>
                </div>
              </div>
            </div>

            <BarChart
              xAxis={[{ data: resumoTarefasPorTipo.map((item) => item.tipo) }]}
              series={[
                { data: resumoTarefasPorTipo.map((item) => item.completas) },
                { data: resumoTarefasPorTipo.map((item) => item.incompletas) },
              ]}
              height={300}
            />

            {/* Tarefas Completas Agrupadas por Tipo */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                Tarefas por Tipo
              </h3>
              {resumoTarefasPorTipo.length === 0 ? (
                <p className="text-gray-500 italic">
                  Nenhuma tarefa encontrada
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left font-semibold">
                          Tipo de Tarefa
                        </th>
                        <th className="border border-gray-300 p-3 text-center font-semibold text-green-700">
                          Completas
                        </th>
                        <th className="border border-gray-300 p-3 text-center font-semibold text-orange-700">
                          Incompletas
                        </th>
                        <th className="border border-gray-300 p-3 text-center font-semibold">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumoTarefasPorTipo.map((item) => (
                        <tr key={item.tipo} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-medium">
                            {item.tipo}
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                              {item.completas}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                              {item.incompletas}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3 text-center font-bold">
                            {item.completas + item.incompletas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td className="border border-gray-300 p-3">TOTAL</td>
                        <td className="border border-gray-300 p-3 text-center text-green-700">
                          {resumoTarefasPorTipo.reduce(
                            (acc, item) => acc + item.completas,
                            0
                          )}
                        </td>
                        <td className="border border-gray-300 p-3 text-center text-orange-700">
                          {resumoTarefasPorTipo.reduce(
                            (acc, item) => acc + item.incompletas,
                            0
                          )}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {resumoTarefasPorTipo.reduce(
                            (acc, item) =>
                              acc + item.completas + item.incompletas,
                            0
                          )}
                        </td>
                      </tr>
                    </tfoot>
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
