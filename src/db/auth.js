// Sistema de Autenticação e Gestão de Usuários - Meu Financeiro IA

import { APP_CONFIG } from '../config/constants.js';

// Utilitário de hash seguro com Web Crypto API (SHA-256)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_meu_financeiro_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class AuthService {
  constructor() {
    this.storageKey = `${APP_CONFIG.storagePrefix}users`;
    this.sessionKey = `${APP_CONFIG.storagePrefix}current_session`;
    this.currentUser = null;
  }

  // Carrega lista interna de usuários cadastrados
  _getUsers() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler usuários:', e);
      return [];
    }
  }

  _saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // Inicializa sessão ao carregar a página
  async init() {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const users = this._getUsers();
        const user = users.find(u => u.id === session.userId);
        if (user) {
          this.currentUser = { ...user };
          delete this.currentUser.passwordHash;
          return this.currentUser;
        }
      }
    } catch (e) {
      console.warn('Sessão expirada ou inválida:', e);
      this.logout();
    }
    return null;
  }

  // Cadastro de Novo Usuário
  async signup(name, email, password, initialData = {}) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password || !name) {
      throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }
    if (password.length < 6) {
      throw new Error('A senha deve conter pelo menos 6 caracteres.');
    }

    const users = this._getUsers();
    if (users.some(u => u.email === cleanEmail)) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    const passwordHash = await hashPassword(password);
    const userId = generateUUID();

    const newUser = {
      id: userId,
      email: cleanEmail,
      fullName: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      theme: 'system',
      monthlyIncome: initialData.monthlyIncome || 0,
      emergencyFundMonths: initialData.emergencyFundMonths || 6,
      onboardingCompleted: false,
      isDemo: false,
    };

    users.push(newUser);
    this._saveUsers(users);

    // Auto login
    return this.login(cleanEmail, password);
  }

  // Login
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this._getUsers();
    const user = users.find(u => u.email === cleanEmail);

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const inputHash = await hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // Salva token de sessão
    const session = {
      userId: user.id,
      token: generateUUID(),
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));

    this.currentUser = { ...user };
    delete this.currentUser.passwordHash;
    return this.currentUser;
  }

  // Logout
  logout() {
    localStorage.removeItem(this.sessionKey);
    this.currentUser = null;
  }

  // Recuperação de Senha
  async requestPasswordReset(email) {
    const cleanEmail = email.trim().toLowerCase();
    const users = this._getUsers();
    const user = users.find(u => u.email === cleanEmail);
    if (!user) {
      // Para segurança, retorna sucesso genérico
      return { success: true, message: 'Se houver uma conta com este e-mail, as instruções foram preparadas.' };
    }
    return { success: true, userId: user.id, message: 'Link de redefinição validado. Defina sua nova senha.' };
  }

  async resetPassword(userIdOrEmail, newPassword) {
    if (newPassword.length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
    }
    const users = this._getUsers();
    const userIndex = users.findIndex(u => u.id === userIdOrEmail || u.email === userIdOrEmail.toLowerCase());
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado.');
    }
    users[userIndex].passwordHash = await hashPassword(newPassword);
    this._saveUsers(users);
    return { success: true, message: 'Senha alterada com sucesso! Você já pode entrar.' };
  }

  // Atualizar perfil
  async updateProfile(updates = {}) {
    if (!this.currentUser) throw new Error('Nenhum usuário logado.');
    const users = this._getUsers();
    const index = users.findIndex(u => u.id === this.currentUser.id);
    if (index === -1) throw new Error('Usuário não encontrado.');

    const allowed = ['fullName', 'currency', 'dateFormat', 'theme', 'monthlyIncome', 'emergencyFundMonths', 'onboardingCompleted'];
    allowed.forEach(key => {
      if (updates[key] !== undefined) {
        users[index][key] = updates[key];
        this.currentUser[key] = updates[key];
      }
    });

    this._saveUsers(users);
    return this.currentUser;
  }

  // Obter usuário atual
  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

export const auth = new AuthService();
