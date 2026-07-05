import React, { useState } from 'react';
import { 
  BookOpen, Search, User, Edit2, Plus, Trash2, Award, 
  HelpCircle, CheckCircle2, ChevronRight, Loader2, RefreshCw, X, AlertCircle, Sparkles
} from 'lucide-react';
import { ColaboradorDesempenho, Capacitacao, DesempenhoCapacitacao } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DiarioAprendizadoTabProps {
  colaboradoresDesempenho: ColaboradorDesempenho[];
  capacitacoesDisponiveis: Capacitacao[];
  onSaveDesempenho: (rowIndex: number, desempenhos: DesempenhoCapacitacao[]) => Promise<void>;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function DiarioAprendizadoTab({
  colaboradoresDesempenho,
  capacitacoesDisponiveis,
  onSaveDesempenho,
  isRefreshing,
  onRefresh
}: DiarioAprendizadoTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColab, setSelectedColab] = useState<ColaboradorDesempenho | null>(null);
  const [editingDesempenhos, setEditingDesempenhos] = useState<DesempenhoCapacitacao[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Filter collaborators
  const filteredColabs = colaboradoresDesempenho.filter(colab => {
    const searchLower = searchTerm.toLowerCase();
    return (
      colab.nomeCompleto.toLowerCase().includes(searchLower) ||
      colab.cargo.toLowerCase().includes(searchLower) ||
      colab.cpf.includes(searchTerm)
    );
  });

  // Calculate Average and Count for a collaborator
  const getColabStats = (colab: ColaboradorDesempenho) => {
    const totalCapacitacoes = colab.desempenhos.length;
    const scoredCapacitacoes = colab.desempenhos.filter(d => d.nota !== null);
    const sumNotes = scoredCapacitacoes.reduce((sum, d) => sum + (d.nota || 0), 0);
    const media = scoredCapacitacoes.length > 0 
      ? (sumNotes / scoredCapacitacoes.length).toFixed(1) 
      : 'N/A';
    
    return {
      total: totalCapacitacoes,
      media
    };
  };

  // Open Edit Modal
  const handleOpenEdit = (colab: ColaboradorDesempenho) => {
    setSelectedColab(colab);
    // Clone current details to edit state (or initialize empty array if none)
    setEditingDesempenhos([...colab.desempenhos]);
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setSelectedColab(null);
    setEditingDesempenhos([]);
  };

  // Add a new empty training line (Max 10)
  const handleAddTrainingLine = () => {
    if (editingDesempenhos.length >= 10) {
      alert('O sistema permite no máximo 10 capacitações aplicadas por colaborador.');
      return;
    }
    setEditingDesempenhos([
      ...editingDesempenhos,
      { codigo: '', descricao: '', nota: null }
    ]);
  };

  // Remove a training line
  const handleRemoveTrainingLine = (index: number) => {
    setEditingDesempenhos(editingDesempenhos.filter((_, i) => i !== index));
  };

  // Update a field in a training line
  const handleUpdateLine = (index: number, field: keyof DesempenhoCapacitacao, value: any) => {
    const updated = editingDesempenhos.map((item, i) => {
      if (i === index) {
        if (field === 'nota') {
          // Handle score conversions
          if (value === '') return { ...item, [field]: null };
          const numeric = parseFloat(value);
          return { ...item, [field]: isNaN(numeric) ? null : numeric };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setEditingDesempenhos(updated);
  };

  // Save changes to Sheet
  const handleSave = async () => {
    if (!selectedColab) return;
    
    // Validate that if a code is specified, notes and desc are optional but valid
    // Let's filter out completely empty entries (where code is empty)
    const validDesempenhos = editingDesempenhos.filter(d => d.codigo.trim() !== '');

    setIsSaving(true);
    try {
      await onSaveDesempenho(selectedColab.rowIndex, validDesempenhos);
      handleCloseEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Educação Corporativa
            </span>
          </div>
          <h2 className="font-display font-black text-2xl text-slate-800 mt-2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-violet-600" />
            Diário de Aprendizado
          </h2>
          <p className="text-xs text-slate-400 mt-1">Acompanhe as capacitações aplicadas, notas de desempenho e o desenvolvimento profissional de cada colaborador.</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
          title="Atualizar diário"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Sincronizando...' : 'Atualizar Dados'}</span>
        </button>
      </div>

      {/* Stats and Search Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md shadow-indigo-100/30">
          <Award className="h-8 w-8 text-violet-200 mb-2" />
          <h4 className="text-xs font-bold text-violet-200 uppercase tracking-widest">Colaboradores Monitorados</h4>
          <p className="text-3xl font-black mt-1">{colaboradoresDesempenho.length}</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <BookOpen className="h-8 w-8 text-indigo-500 mb-2" />
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Média Geral do Portal</h4>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {(() => {
              const allNotes = colaboradoresDesempenho
                .flatMap(c => c.desempenhos)
                .filter(d => d.nota !== null)
                .map(d => d.nota as number);
              
              return allNotes.length > 0 
                ? (allNotes.reduce((sum, n) => sum + n, 0) / allNotes.length).toFixed(1)
                : '0.0';
            })()}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por colaborador ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Collaborators List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 px-6">Colaborador</th>
                <th className="py-4 px-6">Cargo / Unidade</th>
                <th className="py-4 px-6 text-center">Capacitações Aplicadas</th>
                <th className="py-4 px-6 text-center">Média Geral</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredColabs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum colaborador encontrado com as informações fornecidas.
                  </td>
                </tr>
              ) : (
                filteredColabs.map(colab => {
                  const stats = getColabStats(colab);
                  const isDesativado = colab.status === 'Desativado';
                  
                  return (
                    <tr 
                      key={colab.rowIndex} 
                      className={`hover:bg-slate-50/50 transition-colors ${isDesativado ? 'opacity-60 bg-slate-50/30' : ''}`}
                    >
                      <td className="py-4.5 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isDesativado ? 'bg-slate-200 text-slate-500' : 'bg-violet-100 text-violet-700'
                          }`}>
                            {colab.nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-sm leading-tight">
                              {colab.nomeCompleto}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">CPF: {colab.cpf}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-6">
                        <span className="font-medium text-slate-700 block text-xs">{colab.cargo}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{colab.unidade}</span>
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                          {stats.total} de 10
                        </span>
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl font-black text-sm ${
                          stats.media === 'N/A' 
                            ? 'bg-slate-50 text-slate-400' 
                            : parseFloat(stats.media) >= 7.0 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : parseFloat(stats.media) >= 5.0 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'bg-rose-50 text-rose-700'
                        }`}>
                          {stats.media}
                        </span>
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => handleOpenEdit(colab)}
                          className="inline-flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-violet-600 border border-slate-200 hover:border-violet-200 rounded-xl px-3 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar Notas</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Learning Diary Modal */}
      <AnimatePresence>
        {selectedColab && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center font-bold">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] text-violet-300 font-bold uppercase tracking-wider font-mono">
                      Editando Diário de Aprendizado
                    </span>
                    <h3 className="font-display font-black text-lg truncate leading-tight">
                      {selectedColab.nomeCompleto}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleCloseEdit}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body / Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-2.5 text-xs text-slate-500 border border-slate-100">
                  <HelpCircle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Instruções de Preenchimento:</p>
                    <p className="mt-0.5">As capacitações e notas inseridas aqui serão gravadas diretamente nas colunas correspondentes na aba <strong>PAINEL DESEMPENHO</strong> da sua planilha Google. Você pode lançar notas de 0 a 10 e detalhar o feedback de evolução.</p>
                  </div>
                </div>

                {/* Training Lines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-violet-600" />
                      Capacitações Vinculadas ({editingDesempenhos.length} de 10)
                    </h4>
                    {editingDesempenhos.length < 10 && (
                      <button
                        type="button"
                        onClick={handleAddTrainingLine}
                        className="inline-flex items-center space-x-1 text-xs text-violet-600 hover:text-white hover:bg-violet-600 border border-violet-200 hover:border-violet-600 bg-violet-50/50 px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Vincular Capacitação</span>
                      </button>
                    )}
                  </div>

                  {editingDesempenhos.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-xs text-slate-400">
                      Nenhuma capacitação vinculada a este colaborador ainda. Clique no botão acima para adicionar.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingDesempenhos.map((des, index) => {
                        // Find matching details from available capacitações for premium label
                        const currentCapDetails = capacitacoesDisponiveis.find(c => c.codigo === des.codigo);

                        return (
                          <div 
                            key={index}
                            className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 space-y-3 relative group"
                          >
                            {/* Line Number / Remove Button */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                                {index + 1}ª Capacitação
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTrainingLine(index)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                title="Desvincular capacitação"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {/* Selection Dropdown */}
                              <div className="md:col-span-3 space-y-1">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Capacitação</label>
                                <select
                                  value={des.codigo}
                                  onChange={(e) => handleUpdateLine(index, 'codigo', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-hidden"
                                >
                                  <option value="">-- Selecione uma Capacitação --</option>
                                  {capacitacoesDisponiveis.map(c => (
                                    <option key={c.codigo} value={c.codigo}>
                                      {c.codigo} - {c.titulo} ({c.tipo})
                                    </option>
                                  ))}
                                </select>
                                {currentCapDetails && (
                                  <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                                    {currentCapDetails.descricao}
                                  </p>
                                )}
                              </div>

                              {/* Score Field */}
                              <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Nota (0 - 10)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  placeholder="Nota"
                                  value={des.nota !== null ? des.nota : ''}
                                  onChange={(e) => handleUpdateLine(index, 'nota', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-hidden text-center font-bold"
                                />
                              </div>
                            </div>

                            {/* Development feedback */}
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-slate-500 uppercase">Descrição do Desenvolvimento</label>
                              <textarea
                                rows={2}
                                placeholder="Insira considerações sobre o aprendizado, rendimento e aplicação prática do conteúdo..."
                                value={des.descricao}
                                onChange={(e) => handleUpdateLine(index, 'descricao', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-hidden resize-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando no Sistema...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Salvar Diário</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
