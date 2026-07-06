import { Colaborador, Capacitacao, Treinamento, ColaboradorDesempenho, DesempenhoCapacitacao, GoogleUser } from '../types';

let cachedAccessToken: string | null = sessionStorage.getItem('aura_oauth_token');
const defaultLocalUser: GoogleUser = {
  displayName: 'Administrador',
  email: 'contato@santarosamalhas.com',
  photoURL: null,
};
let cachedUser: GoogleUser | null = JSON.parse(sessionStorage.getItem('aura_user_info') || 'null') || defaultLocalUser;

// --- LOCALSTORAGE FALLBACK DB SETUP ---

const DEFAULT_COLABORADORES: Colaborador[] = [
  {
    nomeCompleto: 'Ana Souza Silva',
    cpf: '123.456.789-00',
    dataNascimento: '15/04/1992',
    admissao: '01/02/2022',
    demissao: '',
    status: 'Ativo',
    unidade: 'Matriz São Paulo',
    cargo: 'Analista de Recursos Humanos',
    emailPessoal: 'ana.souza.pessoal@email.com',
    emailEmpresarial: 'ana.silva@empresa.com',
    rowIndex: 2
  },
  {
    nomeCompleto: 'Carlos Eduardo Santos',
    cpf: '987.654.321-11',
    dataNascimento: '22/08/1988',
    admissao: '10/06/2021',
    demissao: '15/05/2025',
    status: 'Desativado',
    unidade: 'Filial Rio de Janeiro',
    cargo: 'Desenvolvedor Full Stack',
    emailPessoal: 'carlos.santos88@email.com',
    emailEmpresarial: 'carlos.eduardo@empresa.com',
    rowIndex: 3
  },
  {
    nomeCompleto: 'Mariana Oliveira Lima',
    cpf: '456.789.123-22',
    dataNascimento: '03/11/1995',
    admissao: '15/10/2023',
    demissao: '',
    status: 'Ativo',
    unidade: 'Filial Belo Horizonte',
    cargo: 'Designer de Interfaces UX/UI',
    emailPessoal: 'mari.oliveira@email.com',
    emailEmpresarial: 'mariana.lima@empresa.com',
    rowIndex: 4
  }
];

const DEFAULT_CAPACITACOES: Capacitacao[] = [
  {
    codigo: 'CAP-001',
    titulo: 'Integração Santa Rosa',
    descricao: 'Treinamento inicial de novos colaboradores e normas de segurança.',
    tipo: 'Onboarding',
    rowIndex: 2
  },
  {
    codigo: 'CAP-002',
    titulo: 'Operação de Teares Circulares',
    descricao: 'Instruções técnicas para operação segura de teares circulares.',
    tipo: 'Técnico',
    rowIndex: 3
  }
];

const DEFAULT_TREINAMENTOS: Treinamento[] = [
  {
    codigo: 'TRE-001',
    titulo: 'Segurança no Trabalho',
    descricao: 'Treinamento essencial sobre normas de segurança e uso de EPIs.',
    tipo: 'Obrigatório',
    rowIndex: 2
  },
  {
    codigo: 'TRE-002',
    titulo: 'Qualidade em Malharia',
    descricao: 'Treinamento sobre padrões de qualidade de tecidos e inspeção de defeitos.',
    tipo: 'Técnico',
    rowIndex: 3
  }
];

const DEFAULT_DIARIO_PERFORMANCE: Record<string, DesempenhoCapacitacao[]> = {
  '123.456.789-00': [
    { codigo: 'CAP-001', descricao: 'Se destacou na integração', nota: 9.5 }
  ],
  '987.654.321-11': [
    { codigo: 'CAP-001', descricao: 'Concluído com ressalvas', nota: 7.0 }
  ],
  '456.789.123-22': [
    { codigo: 'CAP-001', descricao: 'Excelente desempenho', nota: 10.0 }
  ]
};

const DEFAULT_DIARIO_TREINAMENTOS: Record<string, string[]> = {
  '123.456.789-00': ['TRE-001'],
  '987.654.321-11': ['TRE-001', 'TRE-002'],
  '456.789.123-22': ['TRE-002']
};

const getLocalColaboradores = (): Colaborador[] => {
  const stored = localStorage.getItem('aura_local_colaboradores');
  if (!stored) {
    localStorage.setItem('aura_local_colaboradores', JSON.stringify(DEFAULT_COLABORADORES));
    return DEFAULT_COLABORADORES;
  }
  return JSON.parse(stored);
};

const saveLocalColaboradores = (data: Colaborador[]) => {
  localStorage.setItem('aura_local_colaboradores', JSON.stringify(data));
};

const getLocalCapacitacoes = (): Capacitacao[] => {
  const stored = localStorage.getItem('aura_local_capacitacoes');
  if (!stored) {
    localStorage.setItem('aura_local_capacitacoes', JSON.stringify(DEFAULT_CAPACITACOES));
    return DEFAULT_CAPACITACOES;
  }
  return JSON.parse(stored);
};

const saveLocalCapacitacoes = (data: Capacitacao[]) => {
  localStorage.setItem('aura_local_capacitacoes', JSON.stringify(data));
};

const getLocalTreinamentos = (): Treinamento[] => {
  const stored = localStorage.getItem('aura_local_treinamentos');
  if (!stored) {
    localStorage.setItem('aura_local_treinamentos', JSON.stringify(DEFAULT_TREINAMENTOS));
    return DEFAULT_TREINAMENTOS;
  }
  return JSON.parse(stored);
};

const saveLocalTreinamentos = (data: Treinamento[]) => {
  localStorage.setItem('aura_local_treinamentos', JSON.stringify(data));
};

const getLocalDiario = (): Record<string, DesempenhoCapacitacao[]> => {
  const stored = localStorage.getItem('aura_local_diario');
  if (!stored) {
    localStorage.setItem('aura_local_diario', JSON.stringify(DEFAULT_DIARIO_PERFORMANCE));
    return DEFAULT_DIARIO_PERFORMANCE;
  }
  return JSON.parse(stored);
};

const saveLocalDiario = (data: Record<string, DesempenhoCapacitacao[]>) => {
  localStorage.setItem('aura_local_diario', JSON.stringify(data));
};

const getLocalDiarioTreinamentos = (): Record<string, string[]> => {
  const stored = localStorage.getItem('aura_local_diario_treinamentos');
  if (!stored) {
    localStorage.setItem('aura_local_diario_treinamentos', JSON.stringify(DEFAULT_DIARIO_TREINAMENTOS));
    return DEFAULT_DIARIO_TREINAMENTOS;
  }
  return JSON.parse(stored);
};

const saveLocalDiarioTreinamentos = (data: Record<string, string[]>) => {
  localStorage.setItem('aura_local_diario_treinamentos', JSON.stringify(data));
};

// Flag to prevent infinite re-triggering during active popup sign-in
let isSigningIn = false;

// Initialize Google OAuth Client ID
export const getGoogleClientId = (): string => {
  return localStorage.getItem('aura_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '740959969668-sbs39fiuuj9ka0jot933vac658fha1ku.apps.googleusercontent.com';
};

export const setGoogleClientId = (clientId: string): void => {
  localStorage.setItem('aura_google_client_id', clientId.trim());
};

// Helper to dynamically load the Google Identity Services script
export const initGoogleGisAuth = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Browser only'));
    
    const checkGis = () => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve((window as any).google.accounts.oauth2);
      } else {
        setTimeout(checkGis, 100);
      }
    };

    if (!(window as any).google?.accounts?.oauth2) {
      if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => checkGis();
        script.onerror = () => reject(new Error('Falha ao carregar o script Google GIS'));
        document.head.appendChild(script);
      } else {
        checkGis();
      }
    } else {
      resolve((window as any).google.accounts.oauth2);
    }
  });
};

// Initialize auth state listener using local cached data
export const initAuth = (
  onAuthSuccess?: (user: GoogleUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  const token = sessionStorage.getItem('aura_oauth_token');
  const userStr = sessionStorage.getItem('aura_user_info');
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      cachedAccessToken = token;
      cachedUser = user;
      if (onAuthSuccess) onAuthSuccess(user, token);
    } catch (e) {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  } else {
    cachedAccessToken = null;
    cachedUser = null;
    if (onAuthFailure) onAuthFailure();
  }
  return () => {};
};

export const googleSignIn = async (providedClientId?: string): Promise<{ user: GoogleUser; accessToken: string } | null> => {
  const clientId = providedClientId || getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Client ID não configurado. Por favor, adicione o seu Client ID nas configurações de desenvolvedor abaixo.');
  }

  isSigningIn = true;
  const oauth2 = await initGoogleGisAuth();

  return new Promise((resolve, reject) => {
    try {
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse: any) => {
          isSigningIn = false;
          if (tokenResponse.error) {
            reject(new Error(`Erro de login do Google: ${tokenResponse.error_description || tokenResponse.error}`));
            return;
          }
          if (!tokenResponse.access_token) {
            reject(new Error('Não foi possível obter o token de acesso.'));
            return;
          }

          cachedAccessToken = tokenResponse.access_token;
          sessionStorage.setItem('aura_oauth_token', cachedAccessToken!);

          // Fetch user info from Google Endpoint
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { 'Authorization': `Bearer ${cachedAccessToken}` }
            });
            if (userInfoRes.ok) {
              const info = await userInfoRes.json();
              cachedUser = {
                displayName: info.name || info.given_name || 'Treinador Google',
                email: info.email || '',
                photoURL: info.picture || null,
              };
              sessionStorage.setItem('aura_user_info', JSON.stringify(cachedUser));
            } else {
              cachedUser = {
                displayName: 'Treinador Google',
                email: '',
                photoURL: null,
              };
            }
          } catch (e) {
            console.warn('Could not fetch user info, using fallback name:', e);
            cachedUser = {
              displayName: 'Treinador Google',
              email: '',
              photoURL: null,
            };
          }

          resolve({ user: cachedUser, accessToken: cachedAccessToken! });
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      isSigningIn = false;
      reject(err);
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || sessionStorage.getItem('aura_oauth_token');
};

export const logout = async () => {
  cachedAccessToken = null;
  cachedUser = null;
  sessionStorage.removeItem('aura_oauth_token');
  sessionStorage.removeItem('aura_user_info');
};

// Helper for Google API Requests
async function sheetsApiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado ou token expirado. Por favor, faça login novamente.');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`https://sheets.googleapis.com/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Erro na API do Google Sheets (${response.status})`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json();
}

// Cache the resolved sheet name by spreadsheetId to avoid repeated metadata calls
let cachedSheetNameMap: Record<string, string> = {};

export async function getFirstSheetName(spreadsheetId: string): Promise<string> {
  if (cachedSheetNameMap[spreadsheetId]) {
    return cachedSheetNameMap[spreadsheetId];
  }
  try {
    const details = await getSpreadsheetDetails(spreadsheetId);
    const title = details.sheets?.[0]?.properties?.title || 'Colaboradores';
    cachedSheetNameMap[spreadsheetId] = title;
    return title;
  } catch (err) {
    console.warn('Could not fetch spreadsheet metadata, defaulting to "Colaboradores"', err);
    return 'Colaboradores';
  }
}

// 1. Fetch Collaborators from Google Sheets (Columns A:J)
export async function fetchColaboradores(spreadsheetId: string): Promise<Colaborador[]> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    return getLocalColaboradores();
  }
  try {
    const sheetName = await getFirstSheetName(spreadsheetId);
    let data;
    try {
      data = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:J`);
    } catch (err: any) {
      console.warn(`Failed fetching sheet "${sheetName}". Trying default range 'A:J'`, err);
      data = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/A:J`);
    }

    const rows = data.values as string[][] | undefined;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Skip the header row (index 0 is row 1)
    const colaboradores: Colaborador[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Google sheets might return shorter array if end columns are blank
      const val = (index: number) => (row[index] !== undefined ? row[index].trim() : '');

      colaboradores.push({
        nomeCompleto: val(0),
        cpf: val(1),
        dataNascimento: val(2),
        admissao: val(3),
        demissao: val(4),
        status: val(5).toLowerCase() === 'desativado' ? 'Desativado' : 'Ativo',
        unidade: val(6),
        cargo: val(7),
        emailPessoal: val(8),
        emailEmpresarial: val(9),
        rowIndex: i + 1, // 1-indexed row number in the sheet
      });
    }

    return colaboradores;
  } catch (error) {
    console.error('Error fetching colaboradores:', error);
    throw error;
  }
}

// 2. Add a New Collaborator (Append to A:J)
export async function addColaborador(
  spreadsheetId: string,
  colaborador: Omit<Colaborador, 'rowIndex'>
): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const list = getLocalColaboradores();
    const nextRowIndex = list.length > 0 ? Math.max(...list.map(c => c.rowIndex)) + 1 : 2;
    const newColab: Colaborador = { ...colaborador, rowIndex: nextRowIndex };
    list.push(newColab);
    saveLocalColaboradores(list);
    return;
  }
  const sheetName = await getFirstSheetName(spreadsheetId);
  const values = [
    [
      colaborador.nomeCompleto,
      colaborador.cpf,
      colaborador.dataNascimento,
      colaborador.admissao,
      colaborador.demissao,
      colaborador.status,
      colaborador.unidade,
      colaborador.cargo,
      colaborador.emailPessoal,
      colaborador.emailEmpresarial,
    ],
  ];

  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:J:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({
        range: `${sheetName}!A:J`,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  try {
    await ensurePainelDesempenhoSheet(spreadsheetId);
    const pad = Array(30).fill('');
    const padTrein = Array(50).fill('');
    const performanceValues = [
      [
        colaborador.nomeCompleto,
        colaborador.cpf,
        colaborador.dataNascimento,
        colaborador.admissao,
        colaborador.demissao,
        colaborador.status,
        colaborador.unidade,
        colaborador.cargo,
        colaborador.emailPessoal,
        colaborador.emailEmpresarial,
        ...pad,
        ...padTrein
      ]
    ];
    await sheetsApiRequest(
      `v4/spreadsheets/${spreadsheetId}/values/PAINEL DESEMPENHO!A:CL:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify({
          range: 'PAINEL DESEMPENHO!A:CL',
          majorDimension: 'ROWS',
          values: performanceValues,
        }),
      }
    );
  } catch (err) {
    console.warn('Could not sync newly added collaborator to PAINEL DESEMPENHO:', err);
  }
}

// 3. Update an Existing Collaborator (Update a Specific Row A{rowIndex}:J{rowIndex})
export async function updateColaborador(
  spreadsheetId: string,
  colaborador: Colaborador
): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const list = getLocalColaboradores();
    const idx = list.findIndex(c => c.rowIndex === colaborador.rowIndex);
    if (idx !== -1) {
      list[idx] = colaborador;
      saveLocalColaboradores(list);
    }
    return;
  }
  const sheetName = await getFirstSheetName(spreadsheetId);
  const values = [
    [
      colaborador.nomeCompleto,
      colaborador.cpf,
      colaborador.dataNascimento,
      colaborador.admissao,
      colaborador.demissao,
      colaborador.status,
      colaborador.unidade,
      colaborador.cargo,
      colaborador.emailPessoal,
      colaborador.emailEmpresarial,
    ],
  ];

  const rowRange = `${sheetName}!A${colaborador.rowIndex}:J${colaborador.rowIndex}`;

  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rowRange)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range: rowRange,
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  try {
    await ensurePainelDesempenhoSheet(spreadsheetId);
    const performanceRowRange = `PAINEL DESEMPENHO!A${colaborador.rowIndex}:J${colaborador.rowIndex}`;
    await sheetsApiRequest(
      `v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(performanceRowRange)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: performanceRowRange,
          majorDimension: 'ROWS',
          values,
        }),
      }
    );
  } catch (err) {
    console.warn('Could not sync updated collaborator to PAINEL DESEMPENHO:', err);
  }
}

// 4. Create a Brand New Spreadsheet with Proper Headers
export async function createNewSpreadsheet(title: string = 'Portal do Treinador - Colaboradores'): Promise<{ spreadsheetId: string }> {
  const result = await sheetsApiRequest('v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  const spreadsheetId = result.spreadsheetId;
  const sheetName = 'Colaboradores';

  // 1. Rename the first sheet to 'Colaboradores'
  const firstSheetId = result.sheets?.[0]?.properties?.sheetId || 0;
  await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: firstSheetId,
              title: sheetName,
            },
            fields: 'title',
          },
        },
      ],
    }),
  });

  // 2. Set headers and some lovely sample data
  const headers = [
    [
      'Nome Completo',
      'CPF',
      'Data de Nascimento',
      'Admissão',
      'Demissão',
      'Status',
      'Unidade',
      'Cargo',
      'Email Pessoal',
      'Email Empresarial',
    ],
    [
      'Ana Souza Silva',
      '123.456.789-00',
      '15/04/1992',
      '01/02/2022',
      '',
      'Ativo',
      'Matriz São Paulo',
      'Analista de Recursos Humanos',
      'ana.souza.pessoal@email.com',
      'ana.silva@empresa.com',
    ],
    [
      'Carlos Eduardo Santos',
      '987.654.321-11',
      '22/08/1988',
      '10/06/2021',
      '15/05/2025',
      'Desativado',
      'Filial Rio de Janeiro',
      'Desenvolvedor Full Stack',
      'carlos.santos88@email.com',
      'carlos.eduardo@empresa.com',
    ],
    [
      'Mariana Oliveira Lima',
      '456.789.123-22',
      '03/11/1995',
      '15/10/2023',
      '',
      'Ativo',
      'Filial Belo Horizonte',
      'Designer de Interfaces UX/UI',
      'mari.oliveira@email.com',
      'mariana.lima@empresa.com',
    ],
  ];

  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:J4?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range: `${sheetName}!A1:J4`,
        majorDimension: 'ROWS',
        values: headers,
      }),
    }
  );

  return { spreadsheetId };
}

// 5. Fetch Spreadsheet Metadata (to display title, sheets, etc.)
export async function getSpreadsheetDetails(spreadsheetId: string) {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    return {
      sheets: [
        { properties: { title: 'Colaboradores', sheetId: 0 } },
        { properties: { title: 'CAPACITAÇÕES', sheetId: 1 } },
        { properties: { title: 'PAINEL DESEMPENHO', sheetId: 2 } },
        { properties: { title: 'TREINAMENTOS', sheetId: 4 } },
        { properties: { title: 'LOGIN', sheetId: 3 } }
      ]
    };
  }
  return sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}`);
}

// 6. Ensure CAPACITAÇÕES sheet exists, create it if not
export async function ensureCapacitacoesSheet(spreadsheetId: string): Promise<void> {
  try {
    const details = await getSpreadsheetDetails(spreadsheetId);
    const hasCapacitacoes = details.sheets?.some(
      (s: any) => s.properties?.title?.toUpperCase() === 'CAPACITAÇÕES'
    );
    if (!hasCapacitacoes) {
      // Create the sheet
      await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'CAPACITAÇÕES',
                },
              },
            },
          ],
        }),
      });

      // Initialize headers: A1 = Código, B1 = Título, C1 = Descrição, D1 = Tipo de Capacitação
      const headers = [
        ['Código', 'Título', 'Descrição', 'Tipo de Capacitação'],
        ['CAP-001', 'Integração Santa Rosa', 'Treinamento inicial de novos colaboradores e normas de segurança.', 'Onboarding'],
        ['CAP-002', 'Operação de Teares Circulares', 'Instruções técnicas para operação segura de teares circulares.', 'Técnico']
      ];
      await sheetsApiRequest(
        `v4/spreadsheets/${spreadsheetId}/values/CAPACITAÇÕES!A1:D3?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          body: JSON.stringify({
            range: 'CAPACITAÇÕES!A1:D3',
            majorDimension: 'ROWS',
            values: headers,
          }),
        }
      );
    }
  } catch (err) {
    console.error('Error ensuring CAPACITAÇÕES sheet exists:', err);
  }
}

// 7. Fetch Capacitações
export async function fetchCapacitacoes(spreadsheetId: string): Promise<Capacitacao[]> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    return getLocalCapacitacoes();
  }
  try {
    await ensureCapacitacoesSheet(spreadsheetId);
    
    const data = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/CAPACITAÇÕES!A:D`);
    const rows = data.values as string[][] | undefined;
    if (!rows || rows.length <= 1) {
      return [];
    }

    const list: Capacitacao[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const val = (index: number) => (row[index] !== undefined ? row[index].trim() : '');
      // Ensure we have at least code or title
      if (!val(0) && !val(1)) continue;
      
      list.push({
        codigo: val(0),
        titulo: val(1),
        descricao: val(2),
        tipo: val(3),
        rowIndex: i + 1,
      });
    }
    return list;
  } catch (error) {
    console.error('Error fetching capacitacoes:', error);
    throw error;
  }
}

// 8. Add Capacitacão
export async function addCapacitacao(
  spreadsheetId: string,
  cap: Omit<Capacitacao, 'rowIndex'>
): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const list = getLocalCapacitacoes();
    const nextRowIndex = list.length > 0 ? Math.max(...list.map(c => c.rowIndex)) + 1 : 2;
    const newCap: Capacitacao = { ...cap, rowIndex: nextRowIndex };
    list.push(newCap);
    saveLocalCapacitacoes(list);
    return;
  }
  await ensureCapacitacoesSheet(spreadsheetId);
  
  const values = [
    [
      cap.codigo,
      cap.titulo,
      cap.descricao,
      cap.tipo,
    ],
  ];

  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/CAPACITAÇÕES!A:D:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({
        range: 'CAPACITAÇÕES!A:D',
        majorDimension: 'ROWS',
        values,
      }),
    }
  );
}

// 9. Delete Capacitação row physically by shifting subsequent rows up
export async function deleteCapacitacao(spreadsheetId: string, rowIndex: number): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    let list = getLocalCapacitacoes();
    list = list.filter(c => c.rowIndex !== rowIndex);
    list.forEach((c, index) => {
      c.rowIndex = index + 2;
    });
    saveLocalCapacitacoes(list);
    return;
  }
  const details = await getSpreadsheetDetails(spreadsheetId);
  const sheet = details.sheets?.find(
    (s: any) => s.properties?.title?.toUpperCase() === 'CAPACITAÇÕES'
  );
  if (!sheet) {
    throw new Error('Aba "CAPACITAÇÕES" não encontrada na planilha.');
  }
  
  const sheetId = sheet.properties.sheetId;
  const startIndex = rowIndex - 1;
  const endIndex = rowIndex;

  await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: startIndex,
              endIndex: endIndex,
            },
          },
        },
      ],
    }),
  });
}

// 10. Ensure PAINEL DESEMPENHO sheet exists, create it and populate with existing collaborators if not
export async function ensurePainelDesempenhoSheet(spreadsheetId: string): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    return;
  }
  try {
    const details = await getSpreadsheetDetails(spreadsheetId);
    const hasPainel = details.sheets?.some(
      (s: any) => s.properties?.title?.toUpperCase() === 'PAINEL DESEMPENHO'
    );
    if (!hasPainel) {
      // Create the sheet
      await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'PAINEL DESEMPENHO',
                },
              },
            },
          ],
        }),
      });

      // Build Headers: Cols A to J (General), Cols K to AN (10 Capacitações), and Cols AO to CL (50 Treinamentos)
      const headers = [
        'Nome Completo',
        'CPF',
        'Data de Nascimento',
        'Admissão',
        'Demissão',
        'Status',
        'Unidade',
        'Cargo',
        'Email Pessoal',
        'Email Empresarial'
      ];

      for (let i = 1; i <= 10; i++) {
        headers.push(`Capacitação ${i} - Código`);
        headers.push(`Capacitação ${i} - Desenvolvimento`);
        headers.push(`Capacitação ${i} - Nota`);
      }

      for (let i = 1; i <= 50; i++) {
        headers.push(`Treinamento ${i}`);
      }

      const rowsToWrite = [headers];

      // Let's get any existing collaborators to populate
      try {
        const existingColabs = await fetchColaboradores(spreadsheetId);
        for (const col of existingColabs) {
          const colRow = [
            col.nomeCompleto,
            col.cpf,
            col.dataNascimento,
            col.admissao,
            col.demissao,
            col.status,
            col.unidade,
            col.cargo,
            col.emailPessoal,
            col.emailEmpresarial,
            ...Array(30).fill(''), // empty performance slots
            ...Array(50).fill('')  // empty training slots
          ];
          rowsToWrite.push(colRow);
        }
      } catch (err) {
        console.warn('Could not read existing collaborators while initializing PAINEL DESEMPENHO, writing only headers', err);
      }

      await sheetsApiRequest(
        `v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('PAINEL DESEMPENHO')}!A1:CL${rowsToWrite.length}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          body: JSON.stringify({
            range: `PAINEL DESEMPENHO!A1:CL${rowsToWrite.length}`,
            majorDimension: 'ROWS',
            values: rowsToWrite,
          }),
        }
      );
    } else {
      // Check if headers need updating to include Treinamento columns
      try {
        const firstRowData = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/PAINEL DESEMPENHO!A1:CL1`);
        const firstRow = firstRowData.values?.[0] || [];
        if (firstRow.length < 90 || !firstRow.includes('Treinamento 1')) {
          const headers = [
            'Nome Completo',
            'CPF',
            'Data de Nascimento',
            'Admissão',
            'Demissão',
            'Status',
            'Unidade',
            'Cargo',
            'Email Pessoal',
            'Email Empresarial'
          ];

          for (let i = 1; i <= 10; i++) {
            headers.push(`Capacitação ${i} - Código`);
            headers.push(`Capacitação ${i} - Desenvolvimento`);
            headers.push(`Capacitação ${i} - Nota`);
          }

          for (let i = 1; i <= 50; i++) {
            headers.push(`Treinamento ${i}`);
          }

          await sheetsApiRequest(
            `v4/spreadsheets/${spreadsheetId}/values/PAINEL DESEMPENHO!A1:CL1?valueInputOption=USER_ENTERED`,
            {
              method: 'PUT',
              body: JSON.stringify({
                range: 'PAINEL DESEMPENHO!A1:CL1',
                majorDimension: 'ROWS',
                values: [headers],
              }),
            }
          );
        }
      } catch (err) {
        console.warn('Could not update PAINEL DESEMPENHO headers:', err);
      }
    }
  } catch (err) {
    console.error('Error ensuring PAINEL DESEMPENHO sheet exists:', err);
  }
}

// 11. Fetch Learning Diary (Diário de Aprendizado)
export async function fetchDiarioAprendizado(spreadsheetId: string): Promise<ColaboradorDesempenho[]> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const colabs = getLocalColaboradores();
    const diary = getLocalDiario();
    const diaryTreinamentos = getLocalDiarioTreinamentos();
    return colabs.map(c => {
      const desempenhos = diary[c.cpf] || [];
      const treinamentos = diaryTreinamentos[c.cpf] || [];
      return {
        ...c,
        desempenhos,
        treinamentos
      };
    });
  }
  try {
    await ensurePainelDesempenhoSheet(spreadsheetId);
    
    const data = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('PAINEL DESEMPENHO')}!A:CL`);
    const rows = data.values as string[][] | undefined;
    if (!rows || rows.length === 0) {
      return [];
    }

    const list: ColaboradorDesempenho[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const val = (index: number) => (row[index] !== undefined ? row[index].trim() : '');

      // Skip empty or incomplete rows
      if (!val(0)) continue;

      const desempenhos: DesempenhoCapacitacao[] = [];
      for (let j = 0; j < 10; j++) {
        const codeIdx = 10 + 3 * j;
        const descIdx = 11 + 3 * j;
        const notaIdx = 12 + 3 * j;

        const code = row[codeIdx] !== undefined ? row[codeIdx].trim() : '';
        const desc = row[descIdx] !== undefined ? row[descIdx].trim() : '';
        const notaRaw = row[notaIdx] !== undefined ? row[notaIdx].trim() : '';
        const nota = notaRaw !== '' ? parseFloat(notaRaw.replace(',', '.')) : null;

        if (code || desc || nota !== null) {
          desempenhos.push({ codigo: code, descricao: desc, nota });
        }
      }

      const treinamentos: string[] = [];
      for (let j = 0; j < 50; j++) {
        const idx = 40 + j;
        const trainCode = row[idx] !== undefined ? row[idx].trim() : '';
        if (trainCode) {
          treinamentos.push(trainCode);
        }
      }

      list.push({
        nomeCompleto: val(0),
        cpf: val(1),
        dataNascimento: val(2),
        admissao: val(3),
        demissao: val(4),
        status: val(5).toLowerCase() === 'desativado' ? 'Desativado' : 'Ativo',
        unidade: val(6),
        cargo: val(7),
        emailPessoal: val(8),
        emailEmpresarial: val(9),
        rowIndex: i + 1,
        desempenhos,
        treinamentos
      });
    }

    return list;
  } catch (error) {
    console.error('Error in fetchDiarioAprendizado:', error);
    throw error;
  }
}

// 12. Update Learning Diary (Diário de Aprendizado) for a Collaborator
export async function updateDiarioAprendizado(
  spreadsheetId: string,
  rowIndex: number,
  desempenhos: DesempenhoCapacitacao[]
): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const colabs = getLocalColaboradores();
    const colab = colabs.find(c => c.rowIndex === rowIndex);
    if (colab) {
      const diary = getLocalDiario();
      diary[colab.cpf] = desempenhos;
      saveLocalDiario(diary);
    }
    return;
  }
  await ensurePainelDesempenhoSheet(spreadsheetId);

  const flatValues: string[] = [];
  for (let j = 0; j < 10; j++) {
    if (desempenhos[j]) {
      flatValues.push(desempenhos[j].codigo || '');
      flatValues.push(desempenhos[j].descricao || '');
      flatValues.push(desempenhos[j].nota !== null ? desempenhos[j].nota.toString() : '');
    } else {
      flatValues.push('');
      flatValues.push('');
      flatValues.push('');
    }
  }

  const range = `PAINEL DESEMPENHO!K${rowIndex}:AN${rowIndex}`;
  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [flatValues],
      }),
    }
  );
}

// 13. Ensure LOGIN sheet exists, create it and populate with default admin user if not
export async function ensureLoginSheet(spreadsheetId: string): Promise<void> {
  try {
    const details = await getSpreadsheetDetails(spreadsheetId);
    const hasLogin = details.sheets?.some(
      (s: any) => s.properties?.title?.toUpperCase() === 'LOGIN'
    );
    if (!hasLogin) {
      // Create the LOGIN sheet
      await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'LOGIN',
                },
              },
            },
          ],
        }),
      });

      // Initialize headers: A1 = Usuário, B1 = Nome Completo, C1 = Senha
      // Default admin user: admin, Administrador, 1234
      const defaultRows = [
        ['Usuário', 'Nome Completo', 'Senha'],
        ['admin', 'Administrador', '1234']
      ];
      await sheetsApiRequest(
        `v4/spreadsheets/${spreadsheetId}/values/LOGIN!A1:C2?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          body: JSON.stringify({
            range: 'LOGIN!A1:C2',
            majorDimension: 'ROWS',
            values: defaultRows,
          }),
        }
      );
    }
  } catch (err) {
    console.error('Error ensuring LOGIN sheet exists:', err);
  }
}

// 14. Verify user credentials against the LOGIN sheet
export async function verifyCredentials(
  spreadsheetId: string,
  usuario: string,
  senha: string
): Promise<GoogleUser> {
  await ensureLoginSheet(spreadsheetId);

  const data = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/LOGIN!A:C`);
  const rows = data.values as string[][] | undefined;

  if (!rows || rows.length <= 1) {
    throw new Error('Nenhum usuário cadastrado na aba LOGIN.');
  }

  const normalizedUser = usuario.trim().toLowerCase();
  const normalizedPass = senha.trim();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const u = row[0]?.trim() || '';
    const n = row[1]?.trim() || '';
    const p = row[2]?.trim() || '';

    if (u.toLowerCase() === normalizedUser && p === normalizedPass) {
      return {
        displayName: n || u,
        email: u + '@santarosamalhas.com',
        photoURL: null
      };
    }
  }

  throw new Error('Usuário ou senha inválidos.');
}

// 15. Ensure TREINAMENTOS sheet exists, create it and populate with defaults if not
export async function ensureTreinamentosSheet(spreadsheetId: string): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    return;
  }
  try {
    const details = await getSpreadsheetDetails(spreadsheetId);
    const hasTreinamentos = details.sheets?.some(
      (s: any) => s.properties?.title?.toUpperCase() === 'TREINAMENTOS'
    );
    if (!hasTreinamentos) {
      // Create the sheet
      await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'TREINAMENTOS',
                },
              },
            },
          ],
        }),
      });

      // Initialize headers: A1 = Código do treinamento, B1 = título, C1 = Descrição, D1 = Tipo de treinamento
      const headers = [
        ['Código do treinamento', 'título', 'Descrição', 'Tipo de treinamento'],
        ['TRE-001', 'Segurança no Trabalho', 'Treinamento essencial sobre normas de segurança e uso de EPIs.', 'Obrigatório'],
        ['TRE-002', 'Qualidade em Malharia', 'Treinamento sobre padrões de qualidade de tecidos e inspeção de defeitos.', 'Técnico']
      ];
      await sheetsApiRequest(
        `v4/spreadsheets/${spreadsheetId}/values/TREINAMENTOS!A1:D3?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          body: JSON.stringify({
            range: 'TREINAMENTOS!A1:D3',
            majorDimension: 'ROWS',
            values: headers,
          }),
        }
      );
    }
  } catch (err) {
    console.error('Error ensuring TREINAMENTOS sheet exists:', err);
  }
}

// 16. Fetch Treinamentos
export async function fetchTreinamentos(spreadsheetId: string): Promise<Treinamento[]> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    return getLocalTreinamentos();
  }
  try {
    await ensureTreinamentosSheet(spreadsheetId);
    
    const data = await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}/values/TREINAMENTOS!A:D`);
    const rows = data.values as string[][] | undefined;
    if (!rows || rows.length <= 1) {
      return [];
    }

    const list: Treinamento[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const val = (index: number) => (row[index] !== undefined ? row[index].trim() : '');
      if (!val(0) && !val(1)) continue;
      
      list.push({
        codigo: val(0),
        titulo: val(1),
        descricao: val(2),
        tipo: val(3),
        rowIndex: i + 1,
      });
    }
    return list;
  } catch (error) {
    console.error('Error fetching treinamentos:', error);
    throw error;
  }
}

// 17. Add Treinamento
export async function addTreinamento(
  spreadsheetId: string,
  train: Omit<Treinamento, 'rowIndex'>
): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const list = getLocalTreinamentos();
    const nextRowIndex = list.length > 0 ? Math.max(...list.map(t => t.rowIndex)) + 1 : 2;
    const newTrain: Treinamento = { ...train, rowIndex: nextRowIndex };
    list.push(newTrain);
    saveLocalTreinamentos(list);
    return;
  }
  await ensureTreinamentosSheet(spreadsheetId);
  
  const values = [
    [
      train.codigo,
      train.titulo,
      train.descricao,
      train.tipo,
    ],
  ];

  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/TREINAMENTOS!A:D:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({
        range: 'TREINAMENTOS!A:D',
        majorDimension: 'ROWS',
        values,
      }),
    }
  );
}

// 18. Delete Treinamento row physically
export async function deleteTreinamento(spreadsheetId: string, rowIndex: number): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    let list = getLocalTreinamentos();
    list = list.filter(t => t.rowIndex !== rowIndex);
    list.forEach((t, index) => {
      t.rowIndex = index + 2;
    });
    saveLocalTreinamentos(list);
    return;
  }
  const details = await getSpreadsheetDetails(spreadsheetId);
  const sheet = details.sheets?.find(
    (s: any) => s.properties?.title?.toUpperCase() === 'TREINAMENTOS'
  );
  if (!sheet) {
    throw new Error('Aba "TREINAMENTOS" não encontrada na planilha.');
  }
  
  const sheetId = sheet.properties.sheetId;
  const startIndex = rowIndex - 1;
  const endIndex = rowIndex;

  await sheetsApiRequest(`v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: startIndex,
              endIndex: endIndex,
            },
          },
        },
      ],
    }),
  });
}

// 19. Update assigned trainings (Treinamentos) for a Collaborator
export async function updateTreinamentosAtribuidos(
  spreadsheetId: string,
  rowIndex: number,
  treinamentos: string[]
): Promise<void> {
  if (spreadsheetId === 'local' || !cachedAccessToken || cachedAccessToken === 'local') {
    const colabs = getLocalColaboradores();
    const colab = colabs.find(c => c.rowIndex === rowIndex);
    if (colab) {
      const diary = getLocalDiarioTreinamentos();
      diary[colab.cpf] = treinamentos;
      saveLocalDiarioTreinamentos(diary);
    }
    return;
  }
  await ensurePainelDesempenhoSheet(spreadsheetId);

  // Pad the array up to 50 items
  const flatValues: string[] = [];
  for (let j = 0; j < 50; j++) {
    flatValues.push(treinamentos[j] || '');
  }

  const range = `PAINEL DESEMPENHO!AO${rowIndex}:CL${rowIndex}`;
  await sheetsApiRequest(
    `v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [flatValues],
      }),
    }
  );
}


