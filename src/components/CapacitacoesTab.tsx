import React, { useState, useMemo } from 'react';
import { Capacitacao } from '../types';
import { 
  Search, Plus, BookOpen, FileText, Tag, Hash, 
  Loader2, AlertCircle, Sparkles, FolderKanban, Check, X, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CapacitacoesTabProps {
  capacitacoes: Capacitacao[];
  onAddCapacitacao: (data: Omit<Capacitacao, 'rowIndex'>) => Promise<void>;
  onDeleteCapacitacao: (rowIndex: number) => Promise<void>;
  isLoading: boolean;
  onRefresh: () => void;
  sheetUrl?: string;
}

export default function CapacitacoesTab({
  capacitacoes,
  onAddCapacitacao,
  onDeleteCapacitacao,
  isLoading,
  onRefresh,
  sheetUrl
}: CapacitacoesTabProps) {
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  // Creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'Técnico' // Default category
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Deletion confirmation state
  const [capToDelete, setCapToDelete] = useState<Capacitacao | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger search on "Procurar" button or Enter key
  const handleSearchTrigger = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearchTerm(searchInput);
  };

  // Filtered Capacitacoes
  const filteredCapacitacoes = useMemo(() => {
    return capacitacoes.filter((cap) => {
      const term = activeSearchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        cap.codigo.toLowerCase().includes(term) ||
        cap.titulo.toLowerCase().includes(term) ||
        cap.descricao.toLowerCase().includes(term) ||
        cap.tipo.toLowerCase().includes(term)
      );
    });
  }, [capacitacoes, activeSearchTerm]);

  // Next code auto-generation
  const nextGeneratedCode = useMemo(() => {
    const numbers = capacitacoes.map(c => {
      const match = c.codigo.match(/CAP-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `CAP-${String(maxNumber + 1).padStart(3, '0')}`;
  }, [capacitacoes]);

  // Form validator
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.titulo.trim()) {
      errors.titulo = 'O título é obrigatório.';
    }
    if (!formData.descricao.trim()) {
      errors.descricao = 'A descrição é obrigatória.';
    }
    if (!formData.tipo.trim()) {
      errors.tipo = 'O tipo de capacitação é obrigatório.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onAddCapacitacao({
        codigo: nextGeneratedCode,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        tipo: formData.tipo.trim(),
      });
      // Reset form and close
      setFormData({ titulo: '', descricao: '', tipo: 'Técnico' });
      setFormErrors({});
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add training:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete callback handler
  const handleDeleteConfirm = async () => {
    if (!capToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteCapacitacao(capToDelete.rowIndex);
      setCapToDelete(null);
    } catch (err) {
      console.error('Failed to delete training:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header and Actions Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span>Capacitações Cadastradas</span>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {capacitacoes.length} no total
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Gerencie os treinamentos e qualificações técnicas da Santa Rosa Malhas.</p>
          </div>
        </div>

        {/* Search form bar matching "espaço para pesquisar capacitação | Procurar | Criar nova" */}
        <form onSubmit={handleSearchTrigger} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquise por código, título, descrição ou tipo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveSearchTerm('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 md:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Procurar</span>
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Criar nova</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grid of Trainings */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Buscando capacitações do sistema...</p>
        </div>
      ) : filteredCapacitacoes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="bg-slate-50 p-4 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-slate-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-slate-800">Nenhuma capacitação encontrada</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {activeSearchTerm 
                ? `Nenhum resultado corresponde à sua pesquisa "${activeSearchTerm}". Tente outros termos.` 
                : 'Ainda não há capacitações cadastradas. Clique em "Criar nova" para adicionar a primeira.'
              }
            </p>
          </div>
          {activeSearchTerm && (
            <button
              onClick={() => {
                setSearchInput('');
                setActiveSearchTerm('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Limpar Busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCapacitacoes.map((cap) => (
            <div 
              key={cap.codigo || cap.rowIndex}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-indigo-50/75 border border-indigo-100/50 text-indigo-700 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                    <Hash className="h-3 w-3" />
                    <span>{cap.codigo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-50 text-slate-500 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-100">
                      {cap.tipo}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapToDelete(cap)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                      title="Excluir Capacitação"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                    {cap.titulo}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {cap.descricao}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium font-mono">
                <span>Código: {cap.codigo}</span>
                <span className="text-indigo-500 font-semibold uppercase font-sans tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Ativo no portal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />

            {/* Modal Box */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="font-display font-semibold text-lg">Criar Nova Capacitação</h3>
                    <p className="text-[10px] text-slate-300 font-mono tracking-wider">Código sugerido: {nextGeneratedCode}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body - scrollable */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Auto Generated Code display */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Código Único</span>
                    <span className="text-sm font-bold font-mono text-slate-700">{nextGeneratedCode}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">Gerado Auto</span>
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <label htmlFor="titulo" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Título da Capacitação <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    placeholder="Ex: NR-12 Segurança do Trabalho"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all ${
                      formErrors.titulo ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {formErrors.titulo && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{formErrors.titulo}</span>
                    </p>
                  )}
                </div>

                {/* Tipo de Capacitação */}
                <div className="space-y-1.5">
                  <label htmlFor="tipo" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Tipo de Capacitação <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {['Técnico', 'Comportamental', 'Onboarding'].map((typePreset) => (
                      <button
                        key={typePreset}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipo: typePreset }))}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                          formData.tipo === typePreset
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {typePreset}
                      </button>
                    ))}
                  </div>
                  <input
                    id="tipo"
                    type="text"
                    placeholder="Ou digite outra categoria..."
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all ${
                      formErrors.tipo ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {formErrors.tipo && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{formErrors.tipo}</span>
                    </p>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <label htmlFor="descricao" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Descrição <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="descricao"
                    rows={4}
                    placeholder="Descreva os objetivos, conteúdo programático e metas deste treinamento..."
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 transition-all resize-none ${
                      formErrors.descricao ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {formErrors.descricao && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{formErrors.descricao}</span>
                    </p>
                  )}
                </div>

                {/* Buttons Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Salvar Capacitação</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Deletion Confirmation Modal */}
        {capToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setCapToDelete(null)} />

            {/* Modal Box */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="bg-rose-50 px-6 py-4 flex items-center space-x-3 text-rose-800 border-b border-rose-100 flex-shrink-0">
                <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-rose-900">Excluir Capacitação</h3>
                  <p className="text-[10px] text-rose-700/80 font-mono tracking-wider">Código: {capToDelete.codigo}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Tem certeza que deseja excluir a capacitação <strong className="text-slate-800">{capToDelete.titulo}</strong> (<span className="font-mono text-xs text-indigo-600 font-semibold">{capToDelete.codigo}</span>)?
                </p>
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5 text-amber-800 text-xs leading-relaxed">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Atenção:</strong> Esta ação removerá a capacitação permanentemente de todos os registros do sistema.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-end space-x-2 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setCapToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-100 hover:shadow-rose-200 flex items-center space-x-1.5 cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Sim, Excluir</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
