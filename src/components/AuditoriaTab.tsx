import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, FormInput, Table, RefreshCw, ExternalLink, 
  Search, Info, ShieldAlert, CheckCircle2, ChevronRight
} from 'lucide-react';
import { AuditoriaData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AuditoriaTabProps {
  auditoriaData: AuditoriaData | null;
  isLoading: boolean;
  onRefresh: () => void;
  sheetUrl?: string | null;
}

export default function AuditoriaTab({
  auditoriaData,
  isLoading,
  onRefresh,
  sheetUrl
}: AuditoriaTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'cadastro' | 'visualizacao'>('cadastro');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract records & filter
  const headers = auditoriaData?.headers || [];
  const rows = auditoriaData?.rows || [];

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row => 
      row.some(cell => cell.toLowerCase().includes(term))
    );
  }, [rows, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Tab Header with Switcher */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ClipboardCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Módulo de Auditorias
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie cadastros de auditorias via formulário integrado ou visualize relatórios.
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('cadastro')}
            className={`flex items-center space-x-1.5 py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'cadastro'
                ? 'bg-white text-teal-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FormInput className="h-3.5 w-3.5" />
            <span>Cadastro</span>
          </button>
          <button
            onClick={() => setActiveSubTab('visualizacao')}
            className={`flex items-center space-x-1.5 py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'visualizacao'
                ? 'bg-white text-teal-600 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Visualização ({rows.length})</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'cadastro' ? (
          <motion.div
            key="cadastro-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-[75vh]"
          >
            {/* Topbar for the form */}
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-700">Preenchimento de Formulário de Auditoria</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Preencha as informações necessárias no formulário oficial abaixo. Elas serão salvas automaticamente na aba de Auditorias.
                  </p>
                </div>
              </div>

              <a
                href="https://forms.gle/HT1W22UcBFWVMXCv9"
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 text-xs text-white bg-teal-600 hover:bg-teal-700 font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <span>Abrir em Nova Aba</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Form Iframe taking almost 100% */}
            <div className="flex-1 w-full bg-slate-50 relative">
              <iframe
                src="https://forms.gle/HT1W22UcBFWVMXCv9"
                className="absolute inset-0 w-full h-full border-0"
                title="Formulário de Auditoria"
                allow="geolocation"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="visualizacao-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search input */}
              <div className="relative md:col-span-6 lg:col-span-7">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar em todas as colunas de auditoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-xs font-medium"
                />
              </div>

              {/* Action buttons */}
              <div className="md:col-span-6 lg:col-span-5 flex items-center justify-end gap-3">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-100 px-4 py-3 rounded-2xl transition-all text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
                  <span>Atualizar Tabela</span>
                </button>

                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-2xl transition-all text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Acessar Planilha Google</span>
                  </a>
                )}
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  <span className="text-xs font-bold text-slate-700">Registros Encontrados</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                  {filteredRows.length} de {rows.length} registros
                </span>
              </div>

              {isLoading ? (
                <div className="py-24 text-center">
                  <RefreshCw className="h-8 w-8 text-teal-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 mt-3 font-semibold">Buscando dados da aba "AUDITORIA"...</p>
                </div>
              ) : headers.length === 0 ? (
                <div className="py-16 text-center max-w-md mx-auto space-y-3">
                  <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Table className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Planilha não inicializada</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                      A aba <strong>"AUDITORIA"</strong> não possui registros ou ainda não foi criada. O sistema tentará criá-la ao carregar os dados se o login com a conta Google estiver ativo.
                    </p>
                  </div>
                  <button
                    onClick={onRefresh}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                  >
                    <span>Carregar novamente</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-4 px-6 w-12 text-center">#</th>
                        {headers.map((header, idx) => (
                          <th key={idx} className="py-4 px-6 whitespace-nowrap min-w-[150px]">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={headers.length + 1} className="py-12 text-center text-slate-400">
                            Nenhum registro de auditoria corresponde aos critérios de pesquisa.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-400 text-center bg-slate-50/20">
                              {rowIndex + 1}
                            </td>
                            {headers.map((_, colIndex) => {
                              const value = row[colIndex] || '';
                              // Highlights for common audit answers like "Conforme", "Sim", "Não"
                              const isConforme = value.toLowerCase() === 'conforme' || value.toLowerCase() === 'sim';
                              const isNaoConforme = value.toLowerCase() === 'não conforme' || value.toLowerCase() === 'nao conforme' || value.toLowerCase() === 'não';
                              
                              return (
                                <td key={colIndex} className="py-3.5 px-6 font-medium max-w-xs truncate" title={value}>
                                  {isConforme ? (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      <span>{value}</span>
                                    </span>
                                  ) : isNaoConforme ? (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                      <span>{value}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-700">{value}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
