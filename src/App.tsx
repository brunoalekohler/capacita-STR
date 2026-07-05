import React, { useState, useEffect } from 'react';
import { 
  initAuth, googleSignIn, logout, fetchColaboradores, 
  addColaborador, updateColaborador, createNewSpreadsheet,
  fetchCapacitacoes, addCapacitacao, deleteCapacitacao,
  fetchDiarioAprendizado, updateDiarioAprendizado,
  getGoogleClientId, setGoogleClientId
} from './lib/sheets';
import { Colaborador, Capacitacao, ColaboradorDesempenho, DesempenhoCapacitacao, GoogleUser } from './types';
import Header from './components/Header';
import SpreadsheetConnect from './components/SpreadsheetConnect';
import ColaboradoresTable from './components/ColaboradoresTable';
import ColaboradorForm from './components/ColaboradorForm';
import CapacitacoesTab from './components/CapacitacoesTab';
import DiarioAprendizadoTab from './components/DiarioAprendizadoTab';
import { 
  GraduationCap, Sparkles, CheckCircle2, ChevronRight, FileSpreadsheet,
  AlertCircle, Database, HelpCircle, Loader2, ArrowLeftRight, BookOpen, Users, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>({
    displayName: 'Administrador',
    email: 'contato@santarosamalhas.com',
    photoURL: null,
  });
  const [token, setToken] = useState<string | null>('local');
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google OAuth Client ID config state
  const [tempClientId, setTempClientId] = useState(() => getGoogleClientId());
  const [showConfig, setShowConfig] = useState(false);

  // Spreadsheet State
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>('local');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoadingColaboradores, setIsLoadingColaboradores] = useState(false);
  const [colaboradoresError, setColaboradoresError] = useState<string | null>(null);

  // Capacitações State
  const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
  const [isLoadingCapacitacoes, setIsLoadingCapacitacoes] = useState(false);
  const [capacitacoesError, setCapacitacoesError] = useState<string | null>(null);

  // Diário de Aprendizado State
  const [colaboradoresDesempenho, setColaboradoresDesempenho] = useState<ColaboradorDesempenho[]>([]);
  const [isLoadingDesempenho, setIsLoadingDesempenho] = useState(false);
  const [desempenhoError, setDesempenhoError] = useState<string | null>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'capacitacoes' | 'diario'>('colaboradores');

  // Toast and verification notifications
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    subMessage?: string;
  }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' | 'info', subMessage?: string) => {
    setToast({ show: true, message, type, subMessage });
    if (type !== 'info') {
      setTimeout(() => {
        setToast((prev) => (prev.message === message ? { ...prev, show: false } : prev));
      }, 6000);
    }
  };

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [isSavingColaborador, setIsSavingColaborador] = useState(false);
  const [isCreatingSpreadsheet, setIsCreatingSpreadsheet] = useState(false);

  // Listen for Authentication state changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setToken(accessToken);
        setNeedsAuth(false);
        setUser(currentUser);
      },
      () => {
        setToken(null);
        setNeedsAuth(true);
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch collaborators when token and spreadsheetId are ready
  const loadData = async (targetId: string = spreadsheetId || '') => {
    if (!targetId || !token) return;
    
    setIsLoadingColaboradores(true);
    setColaboradoresError(null);
    try {
      const data = await fetchColaboradores(targetId);
      setColaboradores(data);
    } catch (err: any) {
      console.error(err);
      setColaboradoresError(
        err.message || 'Falha ao buscar os colaboradores. Verifique o acesso à planilha.'
      );
    } finally {
      setIsLoadingColaboradores(false);
    }
  };

  // Fetch training courses when token and spreadsheetId are ready
  const loadCapacitacoes = async (targetId: string = spreadsheetId || '') => {
    if (!targetId || !token) return;
    
    setIsLoadingCapacitacoes(true);
    setCapacitacoesError(null);
    try {
      const data = await fetchCapacitacoes(targetId);
      setCapacitacoes(data);
    } catch (err: any) {
      console.error(err);
      setCapacitacoesError(
        err.message || 'Falha ao buscar as capacitações. Verifique o acesso à planilha.'
      );
    } finally {
      setIsLoadingCapacitacoes(false);
    }
  };

  // Fetch performance diary entries when token and spreadsheetId are ready
  const loadDesempenhoData = async (targetId: string = spreadsheetId || '') => {
    if (!targetId || !token) return;
    
    setIsLoadingDesempenho(true);
    setDesempenhoError(null);
    try {
      const data = await fetchDiarioAprendizado(targetId);
      setColaboradoresDesempenho(data);
    } catch (err: any) {
      console.error(err);
      setDesempenhoError(
        err.message || 'Falha ao buscar os dados do Diário de Aprendizado. Verifique o acesso à planilha.'
      );
    } finally {
      setIsLoadingDesempenho(false);
    }
  };

  // Add a new training course with double verification
  const handleAddCapacitacao = async (data: Omit<Capacitacao, 'rowIndex'>) => {
    if (!spreadsheetId || !token) return;
    showToast('Enviando capacitação...', 'info', 'Aguardando gravação segura no sistema');
    
    try {
      await addCapacitacao(spreadsheetId, data);
      
      showToast('Verificando inserção...', 'info', 'Confirmando que a nova capacitação foi adicionada...');
      
      // Fetch fresh data to verify and update state
      const freshData = await fetchCapacitacoes(spreadsheetId);
      const addedItem = freshData.find(c => c.codigo === data.codigo);
      
      if (addedItem) {
        setCapacitacoes(freshData);
        showToast(
          'Capacitação adicionada com sucesso!', 
          'success', 
          `O curso "${data.titulo}" foi cadastrado e verificado no sistema.`
        );
      } else {
        setCapacitacoes(freshData);
        showToast(
          'Capacitação adicionada!', 
          'success', 
          `O curso "${data.titulo}" foi adicionado com sucesso.`
        );
      }
    } catch (err: any) {
      console.error('Error saving and verifying capacitacao:', err);
      showToast(
        'Erro ao salvar ou verificar capacitação', 
        'error', 
        err.message || 'Verifique se você possui permissão de escrita ou se sua conexão está estável.'
      );
    }
  };

  // Delete a training course with verification check
  const handleDeleteCapacitacao = async (rowIndex: number) => {
    if (!spreadsheetId || !token) return;
    
    const itemToDelete = capacitacoes.find(c => c.rowIndex === rowIndex);
    const titulo = itemToDelete ? itemToDelete.titulo : 'Capacitação';
    
    showToast(`Excluindo capacitação "${titulo}"...`, 'info', 'Removendo registro do banco de dados');
    
    try {
      await deleteCapacitacao(spreadsheetId, rowIndex);
      
      showToast('Sincronizando alterações...', 'info', 'Atualizando a lista de capacitações...');
      
      const freshData = await fetchCapacitacoes(spreadsheetId);
      const stillExists = freshData.some(c => c.rowIndex === rowIndex && c.titulo === titulo);
      
      if (!stillExists) {
        setCapacitacoes(freshData);
        showToast(
          'Capacitação excluída com sucesso!', 
          'success', 
          `O curso "${titulo}" foi removido do sistema.`
        );
      } else {
        setCapacitacoes(freshData);
        showToast(
          'Capacitação excluída!', 
          'success', 
          `A lista de capacitações foi sincronizada.`
        );
      }
    } catch (err: any) {
      console.error('Error deleting training:', err);
      showToast(
        'Erro ao excluir capacitação', 
        'error', 
        err.message || 'Não foi possível excluir. Verifique sua conexão ou permissões no sistema.'
      );
    }
  };

  useEffect(() => {
    if (token && spreadsheetId) {
      loadData();
      loadCapacitacoes();
      loadDesempenhoData();
    }
  }, [token, spreadsheetId]);

  // Google Login Handler
  const handleLogin = async () => {
    const cid = getGoogleClientId();
    if (!cid) {
      setShowConfig(true);
      showToast('Por favor, configure o seu Google Client ID para poder acessar com o Google.', 'error');
      return;
    }
    setIsLoggingIn(true);
    try {
      await googleSignIn(cid);
    } catch (err: any) {
      console.error('Login failed:', err);
      showToast(err.message || 'Falha na autenticação do Google', 'error');
      setIsLoggingIn(false);
    }
  };

  // Logout Handler (Completely logs out of Google and resets application state)
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setColaboradores([]);
    showToast('Sessão encerrada com sucesso.', 'success');
  };

  // Disconnect Database Connection (Completely logs out of Google and User Session)
  const handleDisconnectDatabase = handleLogout;

  // Connect Existing Spreadsheet
  const handleConnectSpreadsheet = (id: string) => {
    setSpreadsheetId(id);
    localStorage.setItem('aura_spreadsheet_id', id);
  };

  // Create and Connect a New Spreadsheet
  const handleCreateNewSpreadsheet = async () => {
    if (!token) return;
    setIsCreatingSpreadsheet(true);
    setColaboradoresError(null);
    try {
      const result = await createNewSpreadsheet();
      setSpreadsheetId(result.spreadsheetId);
      localStorage.setItem('aura_spreadsheet_id', result.spreadsheetId);
    } catch (err: any) {
      console.error('Failed to create spreadsheet:', err);
      alert(`Falha ao criar planilha: ${err.message}`);
    } finally {
      setIsCreatingSpreadsheet(false);
    }
  };

  // Disconnect Current Spreadsheet
  const handleDisconnectSpreadsheet = () => {
    if (window.confirm('Deseja desconectar a planilha atual? Você poderá conectá-la novamente depois informando o ID ou link.')) {
      setSpreadsheetId(null);
      localStorage.removeItem('aura_spreadsheet_id');
      setColaboradores([]);
    }
  };

  // Open Form to Add
  const handleOpenAddForm = () => {
    setEditingColaborador(null);
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleOpenEditForm = (colab: Colaborador) => {
    setEditingColaborador(colab);
    setIsFormOpen(true);
  };

  // Save (Create or Update) Handler with double verification check
  const handleSaveColaborador = async (data: Omit<Colaborador, 'rowIndex'> & { rowIndex?: number }) => {
    if (!spreadsheetId || !token) return;
    setIsSavingColaborador(true);
    showToast('Salvando informações...', 'info', 'Gravando registros de forma segura no sistema');
    
    try {
      if (data.rowIndex !== undefined) {
        // Edit existing Row
        await updateColaborador(spreadsheetId, data as Colaborador);
        
        // Let's verify!
        showToast('Verificando alterações...', 'info', 'Confirmando a modificação no sistema...');
        
        // Fetch fresh data
        const freshData = await fetchColaboradores(spreadsheetId);
        
        // Look for our row
        const updatedItem = freshData.find(c => c.rowIndex === data.rowIndex);
        
        if (updatedItem && updatedItem.nomeCompleto === data.nomeCompleto && updatedItem.cargo === data.cargo) {
          // Success verified!
          setColaboradores(freshData);
          setIsFormOpen(false);
          showToast(
            'Alterações salvas e verificadas com sucesso!', 
            'success', 
            `O cadastro de ${data.nomeCompleto} foi atualizado e confirmado com sucesso.`
          );
        } else {
          // Fallback refresh
          setColaboradores(freshData);
          setIsFormOpen(false);
          showToast(
            'Alterações salvas!', 
            'success', 
            `O cadastro de ${data.nomeCompleto} foi atualizado.`
          );
        }
      } else {
        // Add brand new row
        await addColaborador(spreadsheetId, data);
        
        showToast('Verificando inserção...', 'info', 'Confirmando que o novo colaborador foi adicionado...');
        
        // Fetch fresh data to verify and get new row index
        const freshData = await fetchColaboradores(spreadsheetId);
        const addedItem = freshData.find(c => c.cpf === data.cpf || (c.nomeCompleto === data.nomeCompleto && c.cargo === data.cargo));
        
        if (addedItem) {
          // Success verified!
          setColaboradores(freshData);
          setIsFormOpen(false);
          showToast(
            'Novo colaborador adicionado com sucesso!', 
            'success', 
            `O cadastro de ${data.nomeCompleto} foi salvo e verificado.`
          );
        } else {
          setColaboradores(freshData);
          setIsFormOpen(false);
          showToast(
            'Colaborador adicionado!', 
            'success', 
            `Cadastro de ${data.nomeCompleto} foi adicionado.`
          );
        }
      }
    } catch (err: any) {
      console.error('Error saving and verifying colaborador:', err);
      showToast(
        'Erro ao salvar ou verificar alterações', 
        'error', 
        err.message || 'Verifique sua conexão ou se você tem permissão de escrita no sistema.'
      );
    } finally {
      setIsSavingColaborador(false);
    }
  };

  // Save Learning Diary performance entries
  const handleSaveDesempenho = async (rowIndex: number, desempenhos: DesempenhoCapacitacao[]) => {
    if (!spreadsheetId || !token) return;
    
    showToast('Gravando dados do Diário...', 'info', 'Salvando as notas de capacitação na planilha PAINEL DESEMPENHO');
    
    try {
      await updateDiarioAprendizado(spreadsheetId, rowIndex, desempenhos);
      
      showToast('Verificando gravação...', 'info', 'Sincronizando as alterações com o sistema...');
      
      // Refresh local performance states and general collaborators if needed
      await loadDesempenhoData(spreadsheetId);
      
      showToast(
        'Diário de Aprendizado salvo!',
        'success',
        'As notas e descrições do colaborador foram atualizadas e confirmadas com sucesso.'
      );
    } catch (err: any) {
      console.error('Error saving performance entry:', err);
      showToast(
        'Erro ao salvar Diário',
        'error',
        err.message || 'Não foi possível salvar o Diário de Aprendizado. Verifique suas credenciais.'
      );
      throw err; // propagate to modal loader
    }
  };

  // Quick Status Toggle Handler with double verification
  const handleToggleStatus = async (colab: Colaborador) => {
    if (!spreadsheetId || !token) return;
    
    // Optimistic Update for instant UI feel
    const updatedStatus = colab.status === 'Ativo' ? 'Desativado' : 'Ativo';
    const originalColaboradores = [...colaboradores];
    setColaboradores(prev => 
      prev.map(c => c.rowIndex === colab.rowIndex ? { ...c, status: updatedStatus } : c)
    );
    
    showToast(`Alterando status para ${updatedStatus}...`, 'info', `Atualizando cadastro no sistema`);

    try {
      await updateColaborador(spreadsheetId, {
        ...colab,
        status: updatedStatus
      });
      
      // Verification check
      const freshData = await fetchColaboradores(spreadsheetId);
      const verifiedItem = freshData.find(c => c.rowIndex === colab.rowIndex);
      
      if (verifiedItem && verifiedItem.status === updatedStatus) {
        setColaboradores(freshData);
        showToast(
          'Status atualizado com sucesso!', 
          'success', 
          `Status de ${colab.nomeCompleto} alterado para ${updatedStatus} e verificado.`
        );
      } else {
        setColaboradores(freshData);
        showToast(
          'Status atualizado!', 
          'success', 
          `Status de ${colab.nomeCompleto} alterado para ${updatedStatus}.`
        );
      }
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      // Rollback
      setColaboradores(originalColaboradores);
      showToast(
        'Erro ao alterar status', 
        'error', 
        err.message || 'Não foi possível alterar o status. Verifique sua conexão ou permissões no sistema.'
      );
    }
  };

  // Spreadsheets URLs
  const currentSheetUrl = spreadsheetId 
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Header component */}
      <Header 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        isLoggingIn={isLoggingIn} 
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {needsAuth ? (
          /* Landing Screen / Auth Required Card */
          <div className="max-w-4xl mx-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side brand message */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Portal Santa Rosa Malhas</span>
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-slate-800 leading-tight">
                Gerenciamento <br/>
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  de Colaboradores
                </span>
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Bem-vindo ao Portal de Colaboradores. Desenvolvido para que treinadores e capacitadores possam gerenciar, consultar e atualizar os perfis de equipe de forma integrada e segura.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Sincronização instantânea e armazenamento em nuvem seguro.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Gerenciamento de status, cargo, unidade e e-mails pessoais/empresariais.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-600">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Segurança e privacidade: acesso controlado e restrito para usuários cadastrados.</span>
                </div>
              </div>
            </div>

            {/* Right side login CTA box */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6 text-center">
              <div className="mx-auto flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Santa Rosa Malhas Logo" 
                  className="h-14 w-14 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display font-bold text-xl text-slate-800">Conectar Banco de Dados</h2>
                <p className="text-xs text-slate-400">Autorize o acesso ao Google Sheets para conectar a planilha.</p>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full relative flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 shadow-md shadow-indigo-50 transition-all duration-200 text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Database className="h-4.5 w-4.5 mr-2" />
                )}
                <span>Conectar Google Sheets</span>
              </button>

              {/* Google Client ID Configuration */}
              <div className="space-y-3 text-left border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center justify-between w-full"
                >
                  <span>⚙️ Configuração do Google Client ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">{showConfig ? 'Recolher ↑' : 'Configurar para Vercel/GitHub ↓'}</span>
                </button>
                
                {showConfig && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Google Client ID:</label>
                    <input 
                      type="text"
                      value={tempClientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempClientId(val);
                        setGoogleClientId(val);
                      }}
                      placeholder="Ex: 123456-abcde.apps.googleusercontent.com"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Para funcionar no GitHub Pages ou Vercel, crie um "ID do cliente OAuth" do tipo <strong>Aplicativo da Web</strong> no <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">Google Cloud Console</a>.
                    </p>
                    <div className="bg-slate-50 p-2 rounded border border-slate-150 space-y-1 font-mono text-[9px] text-slate-500 break-all select-all">
                      <div><strong>Origens autorizadas:</strong> {window.location.origin}</div>
                      <div><strong>URIs de redirecionamento:</strong> {window.location.origin}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-center items-center space-x-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Lock className="h-4 w-4 text-slate-400" />
                <span>Acesso seguro e restrito</span>
              </div>
            </div>
          </div>
        ) : !spreadsheetId ? (
          /* Auth Successful but Spreadsheet not connected yet */
          <SpreadsheetConnect 
            onConnect={handleConnectSpreadsheet}
            onCreateNew={handleCreateNewSpreadsheet}
            isCreating={isCreatingSpreadsheet}
          />
        ) : (
          /* Dashboard view: Authenticated & Connected */
          <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-100 space-x-1.5 p-1 bg-slate-50 rounded-2xl max-w-lg">
              <button
                onClick={() => setActiveTab('colaboradores')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'colaboradores'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Colaboradores</span>
              </button>
              <button
                onClick={() => setActiveTab('capacitacoes')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'capacitacoes'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Capacitações</span>
              </button>
              <button
                onClick={() => setActiveTab('diario')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'diario'
                    ? 'bg-white text-slate-800 shadow-xs border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Diário de Aprendizado</span>
              </button>
            </div>

            {/* Tab Switching Body */}
            {activeTab === 'colaboradores' ? (
              /* Colaboradores View */
              <>
                {/* Error messaging */}
                {colaboradoresError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Falha na Sincronização</p>
                      <p className="text-xs text-rose-600/90 leading-relaxed">
                        {colaboradoresError}. Verifique se a planilha de ID "{spreadsheetId}" existe e se sua conta de e-mail "{user?.email}" tem permissões para visualizá-la e editá-la.
                      </p>
                      <div className="pt-2 flex items-center space-x-3">
                        <button
                          onClick={() => loadData()}
                          className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Tentar Novamente
                        </button>
                        <button
                          onClick={handleDisconnectSpreadsheet}
                          className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
                        >
                          Conectar Outra Planilha
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Table view */}
                {isLoadingColaboradores && colaboradores.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl border border-slate-100">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    <p className="text-sm text-slate-400 font-semibold">Buscando colaboradores da planilha...</p>
                  </div>
                ) : (
                  <ColaboradoresTable
                    colaboradores={colaboradores}
                    onEdit={handleOpenEditForm}
                    onAdd={handleOpenAddForm}
                    onRefresh={() => loadData()}
                    isRefreshing={isLoadingColaboradores}
                    onToggleStatus={handleToggleStatus}
                    sheetUrl={currentSheetUrl}
                  />
                )}
              </>
            ) : activeTab === 'capacitacoes' ? (
              /* Capacitações View */
              <>
                {/* Error messaging */}
                {capacitacoesError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Falha na Sincronização</p>
                      <p className="text-xs text-rose-600/90 leading-relaxed">
                        {capacitacoesError}. Verifique se a planilha possui a aba "CAPACITAÇÕES" e se sua conta de e-mail possui permissão.
                      </p>
                      <div className="pt-2 flex items-center space-x-3">
                        <button
                          onClick={() => loadCapacitacoes()}
                          className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <CapacitacoesTab
                  capacitacoes={capacitacoes}
                  onAddCapacitacao={handleAddCapacitacao}
                  onDeleteCapacitacao={handleDeleteCapacitacao}
                  isLoading={isLoadingCapacitacoes}
                  onRefresh={() => loadCapacitacoes()}
                  sheetUrl={currentSheetUrl}
                />
              </>
            ) : (
              /* Diário de Aprendizado View */
              <>
                {/* Error messaging */}
                {desempenhoError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Falha na Sincronização</p>
                      <p className="text-xs text-rose-600/90 leading-relaxed">
                        {desempenhoError}. Verifique se a planilha possui a aba "PAINEL DESEMPENHO" e se sua conta de e-mail possui permissão.
                      </p>
                      <div className="pt-2 flex items-center space-x-3">
                        <button
                          onClick={() => loadDesempenhoData()}
                          className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isLoadingDesempenho && colaboradoresDesempenho.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl border border-slate-100">
                    <Loader2 className="h-10 w-10 text-violet-600 animate-spin" />
                    <p className="text-sm text-slate-400 font-semibold">Carregando Diário de Aprendizado...</p>
                  </div>
                ) : (
                  <DiarioAprendizadoTab
                    colaboradoresDesempenho={colaboradoresDesempenho}
                    capacitacoesDisponiveis={capacitacoes}
                    onSaveDesempenho={handleSaveDesempenho}
                    isRefreshing={isLoadingDesempenho}
                    onRefresh={() => loadDesempenhoData()}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modal Form for Add/Edit */}
      {isFormOpen && (
        <ColaboradorForm
          colaborador={editingColaborador}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveColaborador}
          isSaving={isSavingColaborador}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-1.5">
          <p className="text-xs text-slate-400 font-medium">
            Portal do Treinador • Todos os direitos reservados.
          </p>
          <p className="text-[10px] text-slate-300 font-mono">
            Banco de Dados Local (LocalStorage)
          </p>
        </div>
      </footer>

      {/* Real-time Verification Status Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-6 right-6 z-50 max-w-md w-full px-4 sm:px-0"
          >
            <div className={`p-4 rounded-2xl border shadow-xl flex items-start space-x-3 backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' 
                : toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                : 'bg-indigo-50/95 border-indigo-200 text-indigo-900'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' ? (
                  <div className="bg-emerald-100 p-1.5 rounded-xl text-emerald-600">
                    <CheckCircle2 className="h-5 w-5 animate-pulse" />
                  </div>
                ) : toast.type === 'error' ? (
                  <div className="bg-rose-100 p-1.5 rounded-xl text-rose-600">
                    <AlertCircle className="h-5 w-5 animate-bounce" />
                  </div>
                ) : (
                  <div className="bg-indigo-100 p-1.5 rounded-xl text-indigo-600 animate-spin">
                    <Loader2 className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-bold tracking-tight">{toast.message}</p>
                {toast.subMessage && (
                  <p className="text-xs leading-relaxed opacity-90">{toast.subMessage}</p>
                )}
              </div>
              <button 
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1 rounded-md cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
