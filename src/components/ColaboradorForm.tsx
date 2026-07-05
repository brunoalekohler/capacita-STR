import React, { useState, useEffect } from 'react';
import { Colaborador } from '../types';
import { X, Save, User, FileText, Calendar, Building, ShieldCheck, Mail } from 'lucide-react';

interface ColaboradorFormProps {
  colaborador?: Colaborador | null; // If passed, we are EDITING. If null, we are ADDING.
  onClose: () => void;
  onSave: (data: Omit<Colaborador, 'rowIndex'> & { rowIndex?: number }) => Promise<void>;
  isSaving: boolean;
}

export default function ColaboradorForm({ colaborador, onClose, onSave, isSaving }: ColaboradorFormProps) {
  const [formData, setFormData] = useState<Omit<Colaborador, 'rowIndex'>>({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    admissao: '',
    demissao: '',
    status: 'Ativo',
    unidade: '',
    cargo: '',
    emailPessoal: '',
    emailEmpresarial: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (colaborador) {
      const demissaoVal = colaborador.demissao || '';
      setFormData({
        nomeCompleto: colaborador.nomeCompleto || '',
        cpf: colaborador.cpf || '',
        dataNascimento: colaborador.dataNascimento || '',
        admissao: colaborador.admissao || '',
        demissao: demissaoVal,
        status: demissaoVal.trim() !== '' ? 'Desativado' : 'Ativo',
        unidade: colaborador.unidade || '',
        cargo: colaborador.cargo || '',
        emailPessoal: colaborador.emailPessoal || '',
        emailEmpresarial: colaborador.emailEmpresarial || '',
      });
    }
  }, [colaborador]);

  // Handle Input Changes and Simple Masks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Apply simple mask for CPF: 000.000.000-00
    if (name === 'cpf') {
      const cleanCPF = value.replace(/\D/g, '');
      if (cleanCPF.length <= 11) {
        let masked = cleanCPF;
        if (cleanCPF.length > 9) {
          masked = `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9)}`;
        } else if (cleanCPF.length > 6) {
          masked = `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
        } else if (cleanCPF.length > 3) {
          masked = `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
        }
        finalValue = masked;
      } else {
        return; // limit input
      }
    }

    // Apply simple date mask: DD/MM/YYYY
    if (name === 'dataNascimento' || name === 'admissao' || name === 'demissao') {
      const cleanDate = value.replace(/\D/g, '');
      if (cleanDate.length <= 8) {
        let masked = cleanDate;
        if (cleanDate.length > 4) {
          masked = `${cleanDate.slice(0, 2)}/${cleanDate.slice(2, 4)}/${cleanDate.slice(4)}`;
        } else if (cleanDate.length > 2) {
          masked = `${cleanDate.slice(0, 2)}/${cleanDate.slice(2)}`;
        }
        finalValue = masked;
      } else {
        return; // limit input
      }
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: finalValue,
      };
      if (name === 'demissao') {
        updated.status = finalValue.trim() !== '' ? 'Desativado' : 'Ativo';
      }
      return updated;
    });

    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = 'Nome completo é obrigatório';
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.status) newErrors.status = 'Status é obrigatório';
    if (!formData.unidade.trim()) newErrors.unidade = 'Unidade é obrigatória';
    if (!formData.cargo.trim()) newErrors.cargo = 'Cargo é obrigatório';

    // Simple email checks
    if (formData.emailPessoal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailPessoal)) {
      newErrors.emailPessoal = 'E-mail pessoal inválido';
    }
    if (formData.emailEmpresarial && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailEmpresarial)) {
      newErrors.emailEmpresarial = 'E-mail empresarial inválido';
    }

    // Date length checks (if entered)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (formData.dataNascimento && !dateRegex.test(formData.dataNascimento)) {
      newErrors.dataNascimento = 'Formato inválido (use DD/MM/AAAA)';
    }
    if (formData.admissao && !dateRegex.test(formData.admissao)) {
      newErrors.admissao = 'Formato inválido (use DD/MM/AAAA)';
    }
    if (formData.demissao && !dateRegex.test(formData.demissao)) {
      newErrors.demissao = 'Formato inválido (use DD/MM/AAAA)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSave({
      ...formData,
      rowIndex: colaborador?.rowIndex,
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-indigo-400" />
            <h3 className="font-display font-semibold text-lg">
              {colaborador ? 'Editar Colaborador' : 'Adicionar Colaborador'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                placeholder="Ex: Amanda Santos"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.nomeCompleto ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.nomeCompleto && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.nomeCompleto}</span>}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                CPF <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.cpf ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.cpf && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.cpf}</span>}
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Data de Nascimento
              </label>
              <input
                type="text"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.dataNascimento ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.dataNascimento && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.dataNascimento}</span>}
            </div>

            {/* Admissão */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Data de Admissão
              </label>
              <input
                type="text"
                name="admissao"
                value={formData.admissao}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.admissao ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.admissao && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.admissao}</span>}
            </div>

            {/* Demissão */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Data de Demissão
              </label>
              <input
                type="text"
                name="demissao"
                value={formData.demissao}
                onChange={handleChange}
                placeholder="DD/MM/AAAA (vazio se ativo)"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.demissao ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.demissao && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.demissao}</span>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm"
              >
                <option value="Ativo">Ativo</option>
                <option value="Desativado">Desativado</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Definido automaticamente baseado na Data de Demissão.</p>
            </div>

            {/* Unidade da Empresa */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                Unidade da Empresa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="unidade"
                value={formData.unidade}
                onChange={handleChange}
                placeholder="Ex: Matriz São Paulo"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.unidade ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.unidade && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.unidade}</span>}
            </div>

            {/* Cargo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                Cargo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Ex: Analista de Treinamento"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.cargo ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.cargo && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.cargo}</span>}
            </div>

            {/* Email Pessoal */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Pessoal
              </label>
              <input
                type="text"
                name="emailPessoal"
                value={formData.emailPessoal}
                onChange={handleChange}
                placeholder="Ex: joao@email.com"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.emailPessoal ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.emailPessoal && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.emailPessoal}</span>}
            </div>

            {/* Email Empresarial */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Empresarial
              </label>
              <input
                type="text"
                name="emailEmpresarial"
                value={formData.emailEmpresarial}
                onChange={handleChange}
                placeholder="Ex: joao.silva@empresa.com"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.emailEmpresarial ? 'border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 transition-all text-sm`}
              />
              {errors.emailEmpresarial && <span className="text-rose-500 text-xs font-medium mt-1 block">{errors.emailEmpresarial}</span>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-200 text-sm flex items-center space-x-2 shadow-md shadow-slate-100 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Colaborador</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
