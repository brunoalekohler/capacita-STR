export interface Colaborador {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  admissao: string;
  demissao: string;
  status: 'Ativo' | 'Desativado';
  unidade: string;
  cargo: string;
  emailPessoal: string;
  emailEmpresarial: string;
  rowIndex: number; // 1-indexed row number in Google Sheets (header is 1, first data row is 2)
}

export interface Capacitacao {
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: string;
  rowIndex: number;
}

export interface Treinamento {
  codigo: string;
  titulo: string;
  descricao: string;
  tipo: string;
  rowIndex: number;
}

export interface SpreadsheetConfig {
  spreadsheetId: string;
  sheetName: string;
}

export interface DesempenhoCapacitacao {
  codigo: string;
  descricao: string;
  nota: number | null;
}

export interface ColaboradorDesempenho extends Colaborador {
  desempenhos: DesempenhoCapacitacao[];
  treinamentos: string[];
}

export interface GoogleUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

