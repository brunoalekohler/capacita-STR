import React, { useState, useMemo } from 'react';
import { Colaborador, ColaboradorDesempenho, Capacitacao, Treinamento } from '../types';
import { 
  Search, Users, Filter, UserCheck, UserX, Building, 
  ChevronRight, Calendar, Mail, FileText, User, Pencil, Plus, 
  MapPin, Check, RefreshCw, Award, GraduationCap
} from 'lucide-react';
import RelatorioColaboradorModal from './RelatorioColaboradorModal';

interface ColaboradoresTableProps {
  colaboradores: Colaborador[];
  colaboradoresDesempenho: ColaboradorDesempenho[];
  capacitacoesDisponiveis: Capacitacao[];
  treinamentosDisponiveis: Treinamento[];
  onEdit: (colaborador: Colaborador) => void;
  onAdd: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleStatus: (colaborador: Colaborador) => Promise<void>;
  sheetUrl?: string;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
}

export default function ColaboradoresTable({
  colaboradores,
  colaboradoresDesempenho,
  capacitacoesDisponiveis,
  treinamentosDisponiveis,
  onEdit,
  onAdd,
  onRefresh,
  isRefreshing,
  onToggleStatus,
  sheetUrl,
  currentUserEmail,
  currentUserName
}: ColaboradoresTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Desativado'>('Todos');
  const [unitFilter, setUnitFilter] = useState<string>('Todas');
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Generate Unique list of units for filters
  const units = useMemo(() => {
    const list = new Set<string>();
    colaboradores.forEach((c) => {
      if (c.unidade && c.unidade.trim()) {
        list.add(c.unidade.trim());
      }
    });
    return ['Todas', ...Array.from(list)];
  }, [colaboradores]);

  // Statistics
  const stats = useMemo(() => {
    let total = colaboradores.length;
    let ativos = colaboradores.filter((c) => c.status === 'Ativo').length;
    let desativados = colaboradores.filter((c) => c.status === 'Desativado').length;
    return { total, ativos, desativados };
  }, [colaboradores]);

  // Filter & Search Collaborators
  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter((colab) => {
      // Search term
      const matchesSearch = 
        colab.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colab.cpf.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) ||
        colab.emailPessoal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colab.emailEmpresarial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colab.cargo.toLowerCase().includes(searchTerm.toLowerCase());

      // Status Filter
      const matchesStatus = statusFilter === 'Todos' || colab.status === statusFilter;

      // Unit Filter
      const matchesUnit = unitFilter === 'Todas' || colab.unidade === unitFilter;

      return matchesSearch && matchesStatus && matchesUnit;
    });
  }, [colaboradores, searchTerm, statusFilter, unitFilter]);

  // Set default selection if none selected yet
  useMemo(() => {
    if (filteredColaboradores.length > 0 && !selectedColaborador) {
      setSelectedColaborador(filteredColaboradores[0]);
    } else if (filteredColaboradores.length === 0) {
      setSelectedColaborador(null);
    } else if (selectedColaborador) {
      // Update selected reference if it exists in updated list
      const updated = colaboradores.find((c) => c.rowIndex === selectedColaborador.rowIndex);
      if (updated) setSelectedColaborador(updated);
    }
  }, [filteredColaboradores, colaboradores, selectedColaborador]);

  // Find the performance/training details for the selected collaborator
  const selectedDesempenho = useMemo(() => {
    if (!selectedColaborador) return null;
    return colaboradoresDesempenho.find(
      (cd) => cd.rowIndex === selectedColaborador.rowIndex
    ) || null;
  }, [selectedColaborador, colaboradoresDesempenho]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Total de Colaboradores</span>
            <p className="text-3xl font-display font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Ativos Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Colaboradores Ativos</span>
            <p className="text-3xl font-display font-bold text-emerald-600">{stats.ativos}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Desativados Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Desativados / Demitidos</span>
            <p className="text-3xl font-display font-bold text-rose-600">{stats.desativados}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <UserX className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Filter & Control Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
            <span>Lista de Colaboradores</span>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {filteredColaboradores.length} encontrados
            </span>
          </h2>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Colaborador</span>
            </button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, e-mail, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Apenas Ativos</option>
              <option value="Desativado">Apenas Desativados</option>
            </select>
          </div>

          {/* Unit Filter */}
          <div className="sm:col-span-3">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit === 'Todas' ? 'Todas as Unidades' : unit}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results / Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Table / list (8 cols) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden lg:col-span-7 xl:col-span-8 flex flex-col">
          {filteredColaboradores.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 text-sm">Nenhum colaborador encontrado</h3>
                <p className="text-slate-400 text-xs mt-1">Experimente alterar os filtros ou refinar sua busca.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Colaborador</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Cargo / Unidade</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredColaboradores.map((colab) => {
                    const isSelected = selectedColaborador?.rowIndex === colab.rowIndex;
                    return (
                      <tr
                        key={colab.rowIndex}
                        onClick={() => setSelectedColaborador(colab)}
                        className={`group cursor-pointer hover:bg-indigo-50/20 transition-all ${isSelected ? 'bg-indigo-50/40 border-l-4 border-indigo-600 pl-3' : 'border-l-4 border-transparent'}`}
                      >
                        {/* Name and Basic details */}
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold ${colab.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {colab.nomeCompleto.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                {colab.nomeCompleto}
                              </p>
                              <p className="text-xs text-slate-400 font-medium">
                                CPF: {colab.cpf || 'Não informado'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role and Unit */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-600">{colab.cargo}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 text-slate-300" />
                              {colab.unidade}
                            </p>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border ${colab.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}
                            title={colab.status === 'Ativo' ? 'Ativo (Sem data de demissão)' : 'Desativado (Com data de demissão)'}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${colab.status === 'Ativo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{colab.status}</span>
                          </div>
                        </td>

                        {/* Edit Action */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(colab);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar funcionário"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Profile Viewer (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col h-full space-y-6">
          {selectedColaborador ? (
            <>
              {/* Profile card Header */}
              <div className="text-center space-y-3 pb-5 border-b border-slate-100">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-xl font-bold ${selectedColaborador.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {selectedColaborador.nomeCompleto.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">{selectedColaborador.nomeCompleto}</h3>
                  <p className="text-sm text-indigo-600 font-medium">{selectedColaborador.cargo}</p>
                </div>
                
                {/* Active Status Ribbon */}
                <div className="flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${selectedColaborador.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedColaborador.status === 'Ativo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>Colaborador {selectedColaborador.status}</span>
                  </span>
                </div>
              </div>

              {/* Grid of Profile Details */}
              <div className="space-y-4 flex-grow">
                {/* CPF */}
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF</span>
                    <p className="text-xs font-semibold text-slate-700">{selectedColaborador.cpf || 'Não informado'}</p>
                  </div>
                </div>

                {/* Data de Nascimento */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data de Nascimento</span>
                    <p className="text-xs font-semibold text-slate-700">{selectedColaborador.dataNascimento || 'Não informado'}</p>
                  </div>
                </div>

                {/* Unidade */}
                <div className="flex items-start space-x-3">
                  <Building className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidade Corporativa</span>
                    <p className="text-xs font-semibold text-slate-700">{selectedColaborador.unidade || 'Não informada'}</p>
                  </div>
                </div>

                {/* Admission & Dismissal Dates */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Admissão</span>
                    <p className="text-xs font-semibold text-slate-700">{selectedColaborador.admissao || 'Não informada'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Demissão</span>
                    <p className="text-xs font-semibold text-slate-700">{selectedColaborador.demissao || '—'}</p>
                  </div>
                </div>

                {/* Email Pessoal */}
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail Pessoal</span>
                    <p className="text-xs font-semibold text-slate-700 break-all">{selectedColaborador.emailPessoal || 'Não informado'}</p>
                  </div>
                </div>

                {/* Email Empresarial */}
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail Empresarial</span>
                    <p className="text-xs font-semibold text-indigo-600 break-all">{selectedColaborador.emailEmpresarial || 'Não informado'}</p>
                  </div>
                </div>

                {/* Performance & Training Summary Section */}
                {selectedDesempenho && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Desempenho & Atribuições</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Capacitacoes summary */}
                      <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100 flex items-center space-x-2.5">
                        <Award className="h-5 w-5 text-violet-600 flex-shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold text-violet-500 uppercase block leading-none">Capacitações</span>
                          <span className="text-xs font-black text-slate-700 block mt-1">
                            {selectedDesempenho.desempenhos.filter(d => d.codigo.trim() !== '').length} vinculadas
                          </span>
                        </div>
                      </div>

                      {/* Treinamentos summary */}
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center space-x-2.5">
                        <GraduationCap className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <span className="text-[9px] font-bold text-indigo-500 uppercase block leading-none font-sans">Treinamentos</span>
                          <span className="text-xs font-black text-slate-700 block mt-1">
                            {(selectedDesempenho.treinamentos || []).length} atribuídos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit and PDF buttons in details panel */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => onEdit(selectedColaborador)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all duration-200 flex items-center justify-center space-x-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Editar Cadastro Completo</span>
                </button>
                
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Gerar Relatório (PDF)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <User className="h-8 w-8 text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">Selecione um colaborador para ver a ficha de cadastro completa.</p>
            </div>
          )}
        </div>
      </div>

      {/* Relatório PDF Modal */}
      <RelatorioColaboradorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        colaboradorDesempenho={selectedDesempenho}
        capacitacoesDisponiveis={capacitacoesDisponiveis}
        treinamentosDisponiveis={treinamentosDisponiveis}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
      />
    </div>
  );
}
