/* ==========================================================================
   CLAREZA v1.07 — js/mensagens-paciente.js
   Conversa simulada entre paciente e psicólogo, persistida em
   localStorage, com resposta automática simulada e indicador de digitação.
   ========================================================================== */

(function (window, document) {
  'use strict';

  const KEY = 'paciente_mensagens';

  const AUTO_REPLIES = [
    'Recebi sua mensagem! Vou responder com calma em breve. 💬',
    'Obrigada por compartilhar isso comigo. Podemos aprofundar na nossa próxima sessão.',
    'Entendido! Fico feliz em saber. Nos vemos na consulta.',
  ];

  function seed() {
    const { storage, uid } = window.ClarezaUtils;
    if (storage.get(KEY, []).length) return;

    storage.set(KEY, [
      { id: uid('msg'), sender: 'psicologo', text: 'Olá Rafael! Como você está se sentindo essa semana?', time: '09:12' },
      { id: uid('msg'), sender: 'paciente', text: 'Oi Dra. Marina! Tive uma semana mais tranquila, consegui aplicar os exercícios de respiração.', time: '09:15' },
      { id: uid('msg'), sender: 'psicologo', text: 'Que ótima notícia! Vamos conversar mais sobre isso na nossa próxima sessão.', time: '09:16' },
    ]);
  }

  function render() {
    const { qs, storage, getInitials } = window.ClarezaUtils;
    const messages = storage.get(KEY, []);
    const container = qs('#chatMessages');
    if (!container) return;

    container.innerHTML = messages
      .map(
        (m) => `
      <div class="chat-message chat-message--${m.sender === 'paciente' ? 'sent' : 'received'}">
        <div class="chat-bubble">${m.text}</div>
        <div class="chat-message__time">${m.time}</div>
      </div>`
      )
      .join('');

    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const { qs } = window.ClarezaUtils;
    const container = qs('#chatMessages');
    if (!container) return;

    container.insertAdjacentHTML(
      'beforeend',
      `<div class="chat-message chat-message--received chat-message__typing" id="typingIndicator">
        <div class="chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>`
    );
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function addMessage(sender, text) {
    const { storage, uid } = window.ClarezaUtils;
    const messages = storage.get(KEY, []);
    const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    messages.push({ id: uid('msg'), sender, text, time });
    storage.set(KEY, messages);
  }

  function init() {
    const { qs, on } = window.ClarezaUtils;
    if (!qs('#chatMessages')) return;

    seed();
    render();

    const form = qs('#chatForm');
    const input = qs('#chatInput');

    on(form, 'submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      addMessage('paciente', text);
      input.value = '';
      render();
      showTyping();

      window.setTimeout(() => {
        hideTyping();
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        addMessage('psicologo', reply);
        render();
      }, 1400);
    });
  }

  document.addEventListener('clareza:ready', init);
})(window, document);
