/* ==========================================================================
   CLAREZA v1.07 — utils.js
   Funções utilitárias puras, sem dependências externas.
   Exposto em window.ClarezaUtils para uso simples via <script> comum.
   ========================================================================== */

(function (window) {
  'use strict';

  /* Seletores rápidos ---------------------------------------------------- */
  const qs  = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const on = (el, event, handler, options) => {
    if (!el) return;
    el.addEventListener(event, handler, options);
  };

  /* Criação de elementos a partir de string HTML -------------------------
     Retorna o primeiro elemento filho do template. Útil para os
     "componentes" em /components, que exportam funções que geram HTML. */
  function htmlToElement(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstElementChild;
  }

  /* Armazenamento mock (substitui backend/banco de dados) ----------------
     Toda a "persistência" desta versão de demonstração vive no
     localStorage do navegador, sob o prefixo "clareza:". */
  const STORAGE_PREFIX = 'clareza:';

  const storage = {
    get(key, fallback = null) {
      try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        console.warn('[Clareza] Falha ao ler storage:', key, err);
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      } catch (err) {
        console.warn('[Clareza] Falha ao gravar storage:', key, err);
      }
    },
    remove(key) {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    },
  };

  /* Validação de CPF (algoritmo oficial de dígitos verificadores) -------- */
  function isValidCPF(rawValue) {
    const cpf = String(rawValue || '').replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    // Rejeita sequências repetidas (000.000.000-00, 111.111.111-11 etc.)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calcDigit = (base) => {
      let sum = 0;
      for (let i = 0; i < base.length; i++) {
        sum += parseInt(base[i], 10) * (base.length + 1 - i);
      }
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };

    const digit1 = calcDigit(cpf.slice(0, 9));
    if (digit1 !== parseInt(cpf[9], 10)) return false;

    const digit2 = calcDigit(cpf.slice(0, 10));
    if (digit2 !== parseInt(cpf[10], 10)) return false;

    return true;
  }

  /* Validação simples de formulário --------------------------------------- */
  const validators = {
    required: (value) => (typeof value === 'string' ? value.trim().length > 0 : Boolean(value)) || 'Este campo é obrigatório.',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Informe um e-mail válido.',
    minLength: (min) => (value) =>
      value.length >= min || `Este campo precisa ter pelo menos ${min} caracteres.`,
    match: (otherValue, label = 'campos') => (value) =>
      value === otherValue || `Os ${label} não coincidem.`,
    checked: (value) => value === true || 'É necessário aceitar para continuar.',
    cpf: (value) => isValidCPF(value) || 'Informe um CPF válido.',
    crp: (value) => /^\d{2}\/\d{4,6}$/.test(String(value).trim()) || 'Formato esperado: 06/012345.',
    pastDate: (value) => {
      if (!value) return true; // "required" cuida do campo vazio
      const date = new Date(`${value}T00:00:00`);
      return date <= new Date() || 'A data informada não pode ser no futuro.';
    },
    minAge: (min) => (value) => {
      if (!value) return true;
      const birth = new Date(`${value}T00:00:00`);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const hasNotHadBirthdayThisYear =
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
      if (hasNotHadBirthdayThisYear) age -= 1;
      return age >= min || `É necessário ter pelo menos ${min} anos.`;
    },
  };

  /**
   * Valida um <form> com base em um mapa { name: [validators...] }.
   * Marca/desmarca a classe "has-error" no .field pai e exibe a mensagem
   * no elemento .field__error correspondente. Suporta inputs de texto,
   * data, select e checkbox.
   */
  function validateForm(form, rules) {
    let isValid = true;

    Object.entries(rules).forEach(([fieldName, fieldValidators]) => {
      const input = form.elements[fieldName];
      if (!input) return;

      const fieldWrapper = input.closest('.field');
      const errorEl = fieldWrapper ? qs('.field__error', fieldWrapper) : null;
      const value = input.type === 'checkbox' ? input.checked : input.value;

      let message = '';
      for (const validate of fieldValidators) {
        const result = validate(value);
        if (result !== true) {
          message = result;
          break;
        }
      }

      if (message) {
        isValid = false;
        if (fieldWrapper) fieldWrapper.classList.add('has-error');
        if (errorEl) errorEl.textContent = message;
      } else if (fieldWrapper) {
        fieldWrapper.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';
      }
    });

    return isValid;
  }

  /* Formatação -------------------------------------------------------------- */
  function formatDate(isoOrDate, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
    const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }

  function getInitials(fullName = '') {
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }

  /* Debounce ------------------------------------------------------------- */
  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  /* ID único simples para mocks ------------------------------------------ */
  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  /* Máscaras de digitação -------------------------------------------------
     Aplicadas via listener "input"; formatam o valor conforme o usuário
     digita, mantendo apenas dígitos internamente. */
  function maskCPF(value) {
    return String(value)
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskCRP(value) {
    const digits = String(value).replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  /**
   * Liga um listener "input" que reescreve o valor do campo aplicando
   * a máscara informada, preservando a posição do cursor no final.
   */
  function attachMask(input, maskFn) {
    if (!input) return;
    on(input, 'input', () => {
      input.value = maskFn(input.value);
    });
  }

  /* Mostrar/ocultar senha ---------------------------------------------------
     Procura por botões [data-toggle-password="idDoInput"] e alterna o
     type do input associado entre "password" e "text". */
  const ICON_EYE = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="10" cy="10" r="2.4" stroke="currentColor" stroke-width="1.4"/></svg>';
  const ICON_EYE_OFF = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2.5 2.5l15 15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M8.3 4.4C8.9 4.2 9.4 4 10 4c5.5 0 8.5 6 8.5 6-.5 1-1.4 2.4-2.7 3.6M5.7 5.9C3.4 7.3 1.5 10 1.5 10s3 6 8.5 6c1 0 1.9-.2 2.7-.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.1 8.2a2.4 2.4 0 0 0 3.4 3.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

  function initPasswordToggles(scope = document) {
    qsa('[data-toggle-password]', scope).forEach((button) => {
      // Evita ligar o mesmo botão duas vezes se a função for chamada de novo.
      if (button.dataset.toggleBound === 'true') return;
      button.dataset.toggleBound = 'true';
      button.innerHTML = ICON_EYE;
      button.setAttribute('aria-label', 'Mostrar senha');
      button.setAttribute('aria-pressed', 'false');

      on(button, 'click', () => {
        const input = document.getElementById(button.getAttribute('data-toggle-password'));
        if (!input) return;

        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        button.innerHTML = isHidden ? ICON_EYE_OFF : ICON_EYE;
        button.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
        button.setAttribute('aria-pressed', String(isHidden));
      });
    });
  }

  /* Toast flutuante genérico -----------------------------------------------
     Cria (se necessário) o container fixo .toast-stack e injeta um toast
     que se remove sozinho após alguns segundos. Usa o markup gerado por
     components/alert.js (renderToast). */
  function showToast(type, message, duration = 3600) {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }

    const markup = window.ClarezaComponents && window.ClarezaComponents.renderToast
      ? window.ClarezaComponents.renderToast(type, message)
      : `<div class="toast toast--${type}" role="status">${message}</div>`;

    const toastEl = htmlToElement(markup);
    stack.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.transition = 'opacity 200ms ease';
      toastEl.style.opacity = '0';
      setTimeout(() => toastEl.remove(), 220);
    }, duration);
  }

  /* Formata bytes em KB/MB legíveis, usado em listas de anexos. --------- */
  function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /* Formata "HH:MM" a partir de uma data ISO (yyyy-mm-dd) + hora "HH:MM". */
  function formatDateTime(isoDate, time) {
    return `${formatDate(isoDate)}${time ? ` às ${time}` : ''}`;
  }

  window.ClarezaUtils = {
    qs,
    qsa,
    on,
    htmlToElement,
    storage,
    validators,
    validateForm,
    isValidCPF,
    formatDate,
    formatDateTime,
    formatFileSize,
    getInitials,
    debounce,
    uid,
    maskCPF,
    maskCRP,
    attachMask,
    initPasswordToggles,
    showToast,
  };
})(window);
