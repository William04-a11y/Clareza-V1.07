/* ==========================================================================
   CLAREZA v1.07 — js/auth.js
   Autenticação simulada (sem backend/banco de dados). Usuários e sessão
   são mantidos em localStorage apenas para fins de demonstração.
   ========================================================================== */

(function (window) {
  'use strict';

  const { qs, on, storage, validators, validateForm, maskCPF, maskCRP, attachMask } = window.ClarezaUtils;

  const MOCK_USERS_KEY = 'users';
  const SESSION_KEY = 'session';
  const REMEMBER_KEY = 'remembered_email';

  function getBase() {
    return document.body.dataset.base || '';
  }

  /* Garante que existam usuários de demonstração no primeiro acesso ------- */
  function seedMockUsers() {
    const existing = storage.get(MOCK_USERS_KEY);
    if (existing && existing.length) return;

    storage.set(MOCK_USERS_KEY, [
      {
        name: 'Dra. Marina Costa',
        email: 'psicologo@clareza.demo',
        password: '123456',
        role: 'psicologo',
        cpf: '390.533.447-05',
        birthDate: '1988-04-12',
        crp: '06/123456',
      },
      {
        name: 'Rafael Andrade',
        email: 'paciente@clareza.demo',
        password: '123456',
        role: 'paciente',
        cpf: '111.444.777-35',
        birthDate: '1995-09-23',
      },
    ]);
  }

  function findUser(email, password) {
    const users = storage.get(MOCK_USERS_KEY, []);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  }

  function emailExists(email) {
    const users = storage.get(MOCK_USERS_KEY, []);
    return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  function createUser(user) {
    const users = storage.get(MOCK_USERS_KEY, []);
    users.push(user);
    storage.set(MOCK_USERS_KEY, users);
  }

  function redirectByRole(role) {
    const base = getBase();
    window.location.href =
      role === 'psicologo'
        ? `${base}pages/psicologo/dashboard.html`
        : `${base}pages/paciente/dashboard.html`;
  }

  /* Exibe uma mensagem (sucesso/erro/aviso) num container de feedback ----- */
  function showFeedback(containerSelector, type, { title = '', message = '' } = {}) {
    const container = qs(containerSelector);
    if (!container) return;
    container.innerHTML = window.ClarezaComponents.renderAlert(type, { title, message, dismissible: true });
  }

  /* --------------------------------------------------------------------
     Formulário de login
     -------------------------------------------------------------------- */
  function initLoginForm() {
    const form = qs('#loginForm');
    if (!form) return;

    // Pré-preenche o e-mail se "Lembrar-me" foi marcado anteriormente.
    const rememberedEmail = storage.get(REMEMBER_KEY, '');
    if (rememberedEmail && form.elements.email) {
      form.elements.email.value = rememberedEmail;
      form.elements.remember.checked = true;
    }

    on(form, 'submit', (event) => {
      event.preventDefault();

      const isValid = validateForm(form, {
        email: [validators.required, validators.email],
        password: [validators.required],
      });
      if (!isValid) return;

      const { email, password, remember } = form.elements;
      const user = findUser(email.value.trim(), password.value);

      if (!user) {
        showFeedback('#loginFeedback', 'danger', {
          title: 'Não foi possível entrar',
          message: 'E-mail ou senha incorretos. Utilize as credenciais de demonstração indicadas abaixo.',
        });
        return;
      }

      if (remember && remember.checked) {
        storage.set(REMEMBER_KEY, user.email);
      } else {
        storage.remove(REMEMBER_KEY);
      }

      storage.set(SESSION_KEY, { name: user.name, email: user.email, role: user.role });

      showFeedback('#loginFeedback', 'success', {
        title: 'Login realizado com sucesso',
        message: 'Redirecionando para o seu painel...',
      });

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Entrando...';
      }

      window.setTimeout(() => redirectByRole(user.role), 900);
    });
  }

  /* --------------------------------------------------------------------
     Formulário de cadastro — Paciente
     -------------------------------------------------------------------- */
  function initCadastroPacienteForm() {
    const form = qs('#cadastroPacienteForm');
    if (!form) return;

    attachMask(form.elements.cpf, maskCPF);

    on(form, 'submit', (event) => {
      event.preventDefault();

      const isValid = validateForm(form, {
        name: [validators.required],
        birthDate: [validators.required, validators.pastDate],
        cpf: [validators.required, validators.cpf],
        email: [validators.required, validators.email],
        password: [validators.required, validators.minLength(6)],
        confirmPassword: [
          validators.required,
          validators.match(form.elements.password.value, 'senhas'),
        ],
        terms: [validators.checked],
      });
      if (!isValid) return;

      const { name, birthDate, cpf, email, password } = form.elements;

      if (emailExists(email.value.trim())) {
        showFeedback('#cadastroFeedback', 'warning', {
          title: 'E-mail já cadastrado',
          message: 'Já existe uma conta de demonstração com este e-mail. Tente entrar em vez de cadastrar.',
        });
        return;
      }

      const newUser = {
        name: name.value.trim(),
        birthDate: birthDate.value,
        cpf: cpf.value.trim(),
        email: email.value.trim(),
        password: password.value,
        role: 'paciente',
      };

      createUser(newUser);
      storage.set(SESSION_KEY, { name: newUser.name, email: newUser.email, role: newUser.role });

      showFeedback('#cadastroFeedback', 'success', {
        title: 'Conta criada com sucesso',
        message: 'Redirecionando para o seu painel...',
      });

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando conta...';
      }

      window.setTimeout(() => redirectByRole('paciente'), 900);
    });
  }

  /* --------------------------------------------------------------------
     Formulário de cadastro — Psicólogo
     -------------------------------------------------------------------- */
  function initCadastroPsicologoForm() {
    const form = qs('#cadastroPsicologoForm');
    if (!form) return;

    attachMask(form.elements.cpf, maskCPF);
    attachMask(form.elements.crp, maskCRP);

    on(form, 'submit', (event) => {
      event.preventDefault();

      const isValid = validateForm(form, {
        name: [validators.required],
        birthDate: [validators.required, validators.pastDate, validators.minAge(18)],
        cpf: [validators.required, validators.cpf],
        crp: [validators.required, validators.crp],
        email: [validators.required, validators.email],
        password: [validators.required, validators.minLength(6)],
        confirmPassword: [
          validators.required,
          validators.match(form.elements.password.value, 'senhas'),
        ],
        terms: [validators.checked],
      });
      if (!isValid) return;

      const { name, birthDate, cpf, crp, email, password } = form.elements;

      if (emailExists(email.value.trim())) {
        showFeedback('#cadastroFeedback', 'warning', {
          title: 'E-mail já cadastrado',
          message: 'Já existe uma conta de demonstração com este e-mail. Tente entrar em vez de cadastrar.',
        });
        return;
      }

      const newUser = {
        name: name.value.trim(),
        birthDate: birthDate.value,
        cpf: cpf.value.trim(),
        crp: crp.value.trim(),
        email: email.value.trim(),
        password: password.value,
        role: 'psicologo',
      };

      createUser(newUser);
      storage.set(SESSION_KEY, { name: newUser.name, email: newUser.email, role: newUser.role });

      showFeedback('#cadastroFeedback', 'success', {
        title: 'Conta criada com sucesso',
        message: 'Redirecionando para o seu painel...',
      });

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando conta...';
      }

      window.setTimeout(() => redirectByRole('psicologo'), 900);
    });
  }

  /* --------------------------------------------------------------------
     Recuperação de senha (simulada — não há backend nem envio real)
     -------------------------------------------------------------------- */
  function initRecuperacaoForm() {
    const form = qs('#recuperarSenhaForm');
    if (!form) return;

    on(form, 'submit', (event) => {
      event.preventDefault();

      const isValid = validateForm(form, {
        email: [validators.required, validators.email],
      });
      if (!isValid) return;

      const formStep = qs('#recuperarSenhaStepForm');
      const successStep = qs('#recuperarSenhaStepSucesso');
      const emailSpan = qs('#recuperarSenhaEmailEnviado');

      if (emailSpan) emailSpan.textContent = form.elements.email.value.trim();

      // Mensagem intencionalmente genérica (não confirma se o e-mail
      // existe ou não na base) — mesmo padrão usado em produtos reais.
      if (formStep && successStep) {
        formStep.style.display = 'none';
        successStep.style.display = 'block';
        successStep.setAttribute('tabindex', '-1');
        successStep.focus();
      }
    });

    const resendBtn = qs('#recuperarSenhaReenviar');
    on(resendBtn, 'click', () => {
      showFeedback('#recuperarSenhaFeedback', 'info', {
        message: 'Um novo link de recuperação foi reenviado (simulação).',
      });
    });
  }

  /* --------------------------------------------------------------------
     Proteção simples de rota: páginas internas exigem sessão mock.
     -------------------------------------------------------------------- */
  function guardPrivatePage() {
    const layout = document.body.dataset.layout;
    if (layout !== 'app') return;

    const session = storage.get(SESSION_KEY);
    if (!session) {
      window.location.href = `${getBase()}pages/auth/login.html`;
    }
  }

  /* Retorna a sessão mock atual ({ name, email, role }) ou null. -------- */
  function getSession() {
    return storage.get(SESSION_KEY, null);
  }

  window.ClarezaAuth = {
    seedMockUsers,
    initLoginForm,
    initCadastroPacienteForm,
    initCadastroPsicologoForm,
    initRecuperacaoForm,
    guardPrivatePage,
    getSession,
  };
})(window);
