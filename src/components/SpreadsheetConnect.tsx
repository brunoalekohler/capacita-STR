import React, { useState } from 'react';
import { Database, Plus, Search, Lock, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface SpreadsheetConnectProps {
  onConnect: (spreadsheetId: string) => void;
  onCreateNew: () => Promise<void>;
  isCreating: boolean;
}

export default function SpreadsheetConnect({ onConnect, onCreateNew, isCreating }: SpreadsheetConnectProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputValue.trim()) {
      setError('Por favor, insira a chave ou ID do banco de dados.');
      return;
    }

    // Try parsing ID
    let sheetId = inputValue.trim();
    const urlPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = sheetId.match(urlPattern);
    
    if (match && match[1]) {
      sheetId = match[1];
    }

    if (sheetId.length < 10) {
      setError('ID de banco de dados inválido. Verifique o identificador fornecido.');
      return;
    }

    onConnect(sheetId);
  };

  return (
    <div className="max-w-2xl mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-6 py-10 text-white text-center relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <Database className="h-12 w-12 mx-auto text-indigo-200 mb-3 animate-pulse" />
          <h2 className="font-display font-bold text-2xl tracking-tight">Conecte seu Banco de Dados</h2>
          <p className="text-indigo-100/90 text-sm mt-2 max-w-md mx-auto">
            O Portal do Treinador sincroniza dados em tempo real diretamente com o repositório seguro corporativo.
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Option A: Paste Link */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">1</span>
              <h3 className="font-semibold text-slate-800 text-sm">Conectar a um banco de dados existente</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cole a chave ou ID do banco de dados"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              
              <div className="bg-indigo-50/75 border border-indigo-100 rounded-xl p-3 text-xs text-slate-600">
                <strong className="text-indigo-700 block mb-1">💡 Link da Planilha de Santa Rosa Malhas:</strong>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1U4Rblh2OEae98PnzmtzoWdmCxAGXVnSgDaCGgFqDqRc/edit?usp=sharing" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-indigo-600 hover:text-indigo-800 font-semibold underline break-all"
                >
                  https://docs.google.com/spreadsheets/d/1U4Rblh2OEae98PnzmtzoWdmCxAGXVnSgDaCGgFqDqRc/edit?usp=sharing
                </a>
              </div>
              
              {error && (
                <p className="text-xs text-rose-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-4 py-3 text-sm transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Conectar Banco de Dados</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>



          {/* Mapping Info */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              Mapeamento de Campos do Sistema (Campos Requeridos)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">1:</span> <span>Nome Completo</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">2:</span> <span>CPF</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">3:</span> <span>Data Nasc.</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">4:</span> <span>Admissão</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">5:</span> <span>Demissão</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">6:</span> <span>Status</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">7:</span> <span>Unidade</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">8:</span> <span>Cargo</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="font-bold text-indigo-600">9:</span> <span>Email Pessoal</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 col-span-2 md:col-span-1">
                <span className="font-bold text-indigo-600">10:</span> <span>Email Empresarial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
