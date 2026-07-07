import React from 'react';
import { 
  X, Printer, FileText, Award, GraduationCap, Building, 
  Calendar, Mail, User, Info, CheckCircle2, TrendingUp
} from 'lucide-react';
import { ColaboradorDesempenho, Capacitacao, Treinamento } from '../types';

interface RelatorioColaboradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaboradorDesempenho: ColaboradorDesempenho | null;
  capacitacoesDisponiveis: Capacitacao[];
  treinamentosDisponiveis: Treinamento[];
  currentUserEmail?: string | null;
}

export default function RelatorioColaboradorModal({
  isOpen,
  onClose,
  colaboradorDesempenho,
  capacitacoesDisponiveis,
  treinamentosDisponiveis,
  currentUserEmail
}: RelatorioColaboradorModalProps) {
  if (!isOpen || !colaboradorDesempenho) return null;

  // Calculate stats
  const desempenhosValidos = colaboradorDesempenho.desempenhos.filter(d => d.codigo.trim() !== '');
  const mediaNotas = desempenhosValidos.length > 0
    ? desempenhosValidos.reduce((acc, curr) => acc + (curr.nota || 0), 0) / desempenhosValidos.length
    : null;

  const totalTreinamentos = (colaboradorDesempenho.treinamentos || []).length;

  const handlePrint = () => {
    window.print();
  };

  // Format date-time for report metadata
  const generationDate = new Date().toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto no-print">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-4xl flex flex-col max-h-[90vh]">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Gerar Relatório do Colaborador
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visualize, imprima ou salve o dossiê profissional em formato PDF.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir / PDF</span>
              </button>
              
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Preview Area */}
          <div className="p-8 overflow-y-auto bg-slate-100/50 flex-1 flex justify-center">
            
            {/* The printable sheet */}
            <div 
              id="printable-report-area" 
              className="bg-white w-full max-w-3xl p-10 shadow-sm border border-slate-200 rounded-xl relative overflow-hidden text-slate-700"
              style={{ contentVisibility: 'auto' }}
            >
              {/* Custom CSS for printing injected locally to prevent leaking */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  /* Reset everything */
                  body {
                    background: white !important;
                    color: black !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  /* Hide all screen components */
                  #root, .no-print, [role="dialog"], .modal-backdrop {
                    display: none !important;
                  }
                  /* Take over page */
                  #printable-report-area {
                    display: block !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 30px !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: white !important;
                    font-size: 12px !important;
                  }
                  .print-page-break {
                    page-break-before: always !important;
                  }
                }
              ` }} />

              {/* Report Header Logo & Title */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase font-mono">
                    Aura Hub • Painel de Gestão
                  </span>
                  <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight mt-1">
                    Dossiê do Colaborador
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Relatório unificado de cadastro, desempenho em capacitações e treinamentos atribuídos.
                  </p>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colaboradorDesempenho.status === 'Ativo' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                    {colaboradorDesempenho.status === 'Ativo' ? 'CADASTRO ATIVO' : 'CADASTRO DESATIVADO'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1.5 uppercase font-bold">
                    Reg. Nº {colaboradorDesempenho.rowIndex}
                  </p>
                </div>
              </div>

              {/* Section 1: Personal and Professional Data */}
              <div className="space-y-4 mb-8">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                  <span>1. Dados Cadastrais e Profissionais</span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome Completo</span>
                    <span className="font-bold text-slate-800">{colaboradorDesempenho.nomeCompleto}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPF</span>
                    <span className="font-semibold text-slate-700">{colaboradorDesempenho.cpf || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Nascimento</span>
                    <span className="font-semibold text-slate-700">{colaboradorDesempenho.dataNascimento || 'Não informada'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cargo / Função</span>
                    <span className="font-bold text-indigo-600">{colaboradorDesempenho.cargo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unidade Corporativa</span>
                    <span className="font-semibold text-slate-700">{colaboradorDesempenho.unidade || 'Não informada'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Período de Vínculo</span>
                    <span className="font-semibold text-slate-700">
                      {colaboradorDesempenho.admissao} {colaboradorDesempenho.demissao ? `até ${colaboradorDesempenho.demissao}` : '(Ativo)'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">E-mail Empresarial</span>
                    <span className="font-semibold text-slate-700 break-all">{colaboradorDesempenho.emailEmpresarial || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">E-mail Pessoal</span>
                    <span className="font-semibold text-slate-700 break-all">{colaboradorDesempenho.emailPessoal || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Performance Evaluation in Capacitations */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end border-b border-slate-200 pb-1">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-violet-600" />
                    <span>2. Avaliações de Capacitações Lançadas</span>
                  </h2>
                  {mediaNotas !== null && (
                    <span className="text-xs font-bold text-slate-500">
                      Média Geral: <span className={`px-2 py-0.5 rounded-md font-black text-white ${mediaNotas >= 7 ? 'bg-emerald-600' : mediaNotas >= 5 ? 'bg-amber-500' : 'bg-rose-600'}`}>{mediaNotas.toFixed(1)}</span>
                    </span>
                  )}
                </div>

                {desempenhosValidos.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl py-6 text-center text-xs text-slate-400">
                    Nenhuma capacitação lançada ou vinculada a este colaborador na planilha "PAINEL DESEMPENHO".
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                          <th className="py-2.5 px-3 w-20">CÓDIGO</th>
                          <th className="py-2.5 px-3">CAPACITAÇÃO / CONTEÚDO</th>
                          <th className="py-2.5 px-3 w-16 text-center">NOTA</th>
                          <th className="py-2.5 px-3">DESCRITIVO DO DESENVOLVIMENTO / EVOLUÇÃO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {desempenhosValidos.map((des, index) => {
                          const capDetails = capacitacoesDisponiveis.find(c => c.codigo === des.codigo);
                          return (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="py-3 px-3 font-mono font-bold text-slate-500">
                                {des.codigo}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-800">
                                  {capDetails?.titulo || 'Capacitação Customizada'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {capDetails?.tipo || 'Tipo não especificado'}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg font-black text-xs ${
                                  des.nota === null 
                                    ? 'bg-slate-100 text-slate-400'
                                    : des.nota >= 7 
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : des.nota >= 5 
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {des.nota !== null ? des.nota.toFixed(1) : '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 italic leading-relaxed text-[11px] whitespace-pre-wrap">
                                {des.descricao || 'Nenhum detalhamento registrado.'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 3: Assigned Trainings */}
              <div className="space-y-4 mb-8">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  <span>3. Treinamentos Atribuídos para Cumprimento</span>
                </h2>

                {totalTreinamentos === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl py-6 text-center text-xs text-slate-400">
                    Nenhum treinamento atribuído a este colaborador no momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(colaboradorDesempenho.treinamentos || []).map((tCode, index) => {
                      const trDetails = treinamentosDisponiveis.find(t => t.codigo === tCode);
                      return (
                        <div 
                          key={index} 
                          className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-start gap-3"
                        >
                          <span className="flex-shrink-0 h-5 w-5 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-[10px] font-mono">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 text-xs block truncate">
                              {trDetails?.titulo || tCode}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                              {tCode} {trDetails ? `• ${trDetails.tipo}` : ''}
                            </span>
                            {trDetails?.descricao && (
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic leading-tight">
                                {trDetails.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Signatures & Footer Metadata */}
              <div className="mt-16 pt-10 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-12 mb-10">
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-400 h-10 mx-auto w-4/5" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assinatura do Colaborador</span>
                    <span className="text-[11px] text-slate-600 block">{colaboradorDesempenho.nomeCompleto}</span>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="border-b border-slate-400 h-10 mx-auto w-4/5" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assinatura do Gestor / Avaliador</span>
                    <span className="text-[11px] text-slate-600 block">Aura Hub Management</span>
                  </div>
                </div>

                {/* Report Metadata */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <div>
                    <span>Gerado por: </span>
                    <span className="font-bold text-slate-600">{currentUserEmail || 'Administrador'}</span>
                  </div>
                  <div className="text-right">
                    <span>Data/Hora: {generationDate}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            >
              Fechar Visualização
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
