/* ==========================================================================
   CLAREZA v1.07 — js/mock-data-prontuarios.js
   Fonte única de dados simulados do módulo de PRONTUÁRIO ELETRÔNICO
   (RF11 a RF18). Não existe backend nesta versão: tudo é gerado e
   persistido em localStorage via window.ClarezaUtils.storage, apenas
   para fins de demonstração Front-End.

   Estrutura de um prontuário:
   {
     id, patientId, patientName, recordNumber, status,
     psychologist, createdAt, updatedAt,
     accessAuthorized: bool,               // RF14
     sessions: [ { id, number, date, patientReport, clinicalAnalysis,
                   therapeuticIntervention, observations, nextSessionPlan,
                   therapeuticTasks, evolution, freeNotes } ],
     changeHistory: [ { id, date, time, user, field, type } ],   // RF15
     versions: [ { id, version, date, time, responsible,
                   description, sessionId, snapshot } ],         // RF16
     accessLogs: [ { id, date, time, user, type, action } ],     // RF17
     documents: [ { id, name, type, date, size } ],              // RF18
   }
   ========================================================================== */

(function (window) {
  'use strict';

  const { storage, uid } = window.ClarezaUtils;
  const RECORDS_KEY = 'prontuarios';

  /* Helpers de data --------------------------------------------------------- */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function isoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function timeNow() {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function recordNumber(sequence) {
    const year = new Date().getFullYear();
    return `PRT-${year}-${String(sequence).padStart(4, '0')}`;
  }

  const RESPONSAVEL = 'Dra. Marina Costa';

  /* Sessão vazia (template usado ao criar um prontuário novo) -------------- */
  function blankSession(number, date) {
    return {
      id: uid('ses'),
      number,
      date,
      patientReport: '',
      clinicalAnalysis: '',
      therapeuticIntervention: '',
      observations: '',
      nextSessionPlan: '',
      therapeuticTasks: '',
      evolution: '',
      freeNotes: '',
    };
  }

  /* --------------------------------------------------------------------
     Seed — dados fictícios usados apenas para demonstração.
     -------------------------------------------------------------------- */
  function seedRecords() {
    if (storage.get(RECORDS_KEY, []).length) return;

    const today = new Date();
    const patients = window.ClarezaMockData ? window.ClarezaMockData.getPatients() : [];
    const byId = (id) => patients.find((p) => p.id === id);

    const records = [];

    /* Prontuário 1 — Ana Beatriz Lima ------------------------------------ */
    records.push({
      id: uid('pnt'),
      patientId: 'pac_1',
      patientName: byId('pac_1') ? byId('pac_1').name : 'Ana Beatriz Lima',
      recordNumber: recordNumber(1),
      status: 'ativo',
      psychologist: RESPONSAVEL,
      createdAt: isoDate(addDays(today, -60)),
      updatedAt: isoDate(addDays(today, -3)),
      accessAuthorized: true,
      sessions: [
        {
          id: uid('ses'), number: 1, date: isoDate(addDays(today, -60)),
          patientReport: 'Paciente relata dificuldade para dormir e preocupação excessiva com o trabalho.',
          clinicalAnalysis: 'Indícios de ansiedade generalizada associada à sobrecarga profissional recente.',
          therapeuticIntervention: 'Psicoeducação sobre ansiedade e introdução de técnica de respiração diafragmática.',
          observations: 'Paciente colaborativa, boa adesão à proposta terapêutica.',
          nextSessionPlan: 'Investigar rotina de sono e revisar gatilhos identificados na semana.',
          therapeuticTasks: 'Registrar em diário os episódios de preocupação e sua intensidade (0-10).',
          evolution: 'Início de tratamento. Estabelecido vínculo terapêutico inicial.',
          freeNotes: '',
        },
        {
          id: uid('ses'), number: 2, date: isoDate(addDays(today, -32)),
          patientReport: 'Relata melhora parcial do sono, mas manteve episódios de preocupação no início da semana.',
          clinicalAnalysis: 'Redução discreta dos sintomas ansiosos. Diário terapêutico trouxe bons insights.',
          therapeuticIntervention: 'Reestruturação cognitiva de pensamentos catastróficos relacionados ao trabalho.',
          observations: 'Paciente trouxe o diário completo, engajada no processo.',
          nextSessionPlan: 'Aprofundar técnicas de manejo de ansiedade antecipatória.',
          therapeuticTasks: 'Praticar respiração diafragmática 2x ao dia.',
          evolution: 'Evolução positiva. Sintomas de ansiedade em leve redução.',
          freeNotes: '',
        },
        {
          id: uid('ses'), number: 3, date: isoDate(addDays(today, -3)),
          patientReport: 'Relata semana mais tranquila, com apenas um episódio de preocupação intensa.',
          clinicalAnalysis: 'Boa resposta às intervenções cognitivo-comportamentais propostas até o momento.',
          therapeuticIntervention: 'Consolidação das estratégias de enfrentamento já trabalhadas.',
          observations: 'Demonstrou maior autonomia na identificação dos próprios gatilhos.',
          nextSessionPlan: 'Revisar metas terapêuticas de curto prazo em conjunto com a paciente.',
          therapeuticTasks: 'Continuar o diário de pensamentos, com foco nas situações de trabalho.',
          evolution: 'Quadro em evolução favorável, com redução progressiva da ansiedade relatada.',
          freeNotes: '',
        },
      ],
      changeHistory: [
        { id: uid('chg'), date: isoDate(addDays(today, -60)), time: '09:40', user: RESPONSAVEL, field: 'Registro da sessão', type: 'Nova sessão adicionada' },
        { id: uid('chg'), date: isoDate(addDays(today, -32)), time: '10:05', user: RESPONSAVEL, field: 'Análise clínica', type: 'Análise clínica alterada' },
        { id: uid('chg'), date: isoDate(addDays(today, -32)), time: '10:06', user: RESPONSAVEL, field: 'Observações relevantes', type: 'Observações relevantes atualizadas' },
        { id: uid('chg'), date: isoDate(addDays(today, -3)), time: '09:15', user: RESPONSAVEL, field: 'Registro da sessão', type: 'Nova sessão adicionada' },
        { id: uid('chg'), date: isoDate(addDays(today, -3)), time: '09:20', user: RESPONSAVEL, field: 'Evolução terapêutica', type: 'Evolução terapêutica atualizada' },
      ],
      versions: [],
      accessLogs: [
        { id: uid('log'), date: isoDate(addDays(today, -60)), time: '09:38', user: RESPONSAVEL, type: 'Criação', action: 'Criação de nova sessão' },
        { id: uid('log'), date: isoDate(addDays(today, -32)), time: '10:02', user: RESPONSAVEL, type: 'Edição', action: 'Edição do prontuário' },
        { id: uid('log'), date: isoDate(addDays(today, -3)), time: '09:10', user: RESPONSAVEL, type: 'Visualização', action: 'Visualização do prontuário' },
        { id: uid('log'), date: isoDate(addDays(today, -3)), time: '09:15', user: RESPONSAVEL, type: 'Edição', action: 'Criação de nova sessão' },
      ],
      documents: [
        { id: uid('doc'), name: 'Encaminhamento-clinico.pdf', type: 'PDF', date: isoDate(addDays(today, -32)), size: 182_000 },
      ],
    });

    /* Prontuário 2 — Carlos Eduardo Melo ---------------------------------- */
    records.push({
      id: uid('pnt'),
      patientId: 'pac_2',
      patientName: byId('pac_2') ? byId('pac_2').name : 'Carlos Eduardo Melo',
      recordNumber: recordNumber(2),
      status: 'ativo',
      psychologist: RESPONSAVEL,
      createdAt: isoDate(addDays(today, -45)),
      updatedAt: isoDate(addDays(today, -7)),
      accessAuthorized: false,
      sessions: [
        {
          id: uid('ses'), number: 1, date: isoDate(addDays(today, -45)),
          patientReport: 'Paciente busca acompanhamento após período de luto recente.',
          clinicalAnalysis: 'Processo de luto em curso, dentro do esperado para o tempo decorrido.',
          therapeuticIntervention: 'Escuta ativa e acolhimento das emoções relacionadas à perda.',
          observations: 'Paciente emocionalmente fragilizado, porém aberto ao processo terapêutico.',
          nextSessionPlan: 'Explorar rede de apoio social disponível ao paciente.',
          therapeuticTasks: 'Nenhuma tarefa específica nesta fase inicial.',
          evolution: 'Início do acompanhamento psicoterapêutico.',
          freeNotes: '',
        },
        {
          id: uid('ses'), number: 2, date: isoDate(addDays(today, -7)),
          patientReport: 'Relata retomada gradual das atividades do dia a dia.',
          clinicalAnalysis: 'Elaboração do luto progredindo de forma saudável.',
          therapeuticIntervention: 'Trabalho de ressignificação da perda e fortalecimento de vínculos.',
          observations: 'Retorno após pausa de duas semanas, sem prejuízo perceptível ao processo.',
          nextSessionPlan: 'Retomar planejamento terapêutico de médio prazo.',
          therapeuticTasks: 'Retomar contato com atividades sociais antes evitadas.',
          evolution: 'Evolução consistente com o esperado para a fase do processo de luto.',
          freeNotes: '',
        },
      ],
      changeHistory: [
        { id: uid('chg'), date: isoDate(addDays(today, -45)), time: '11:00', user: RESPONSAVEL, field: 'Registro da sessão', type: 'Nova sessão adicionada' },
        { id: uid('chg'), date: isoDate(addDays(today, -7)), time: '14:20', user: RESPONSAVEL, field: 'Planos para a próxima sessão', type: 'Planos para a próxima sessão atualizados' },
      ],
      versions: [],
      accessLogs: [
        { id: uid('log'), date: isoDate(addDays(today, -45)), time: '10:58', user: RESPONSAVEL, type: 'Criação', action: 'Criação de nova sessão' },
        { id: uid('log'), date: isoDate(addDays(today, -7)), time: '14:15', user: RESPONSAVEL, type: 'Edição', action: 'Edição do prontuário' },
      ],
      documents: [],
    });

    /* Prontuário 3 — Fernanda Souza --------------------------------------- */
    records.push({
      id: uid('pnt'),
      patientId: 'pac_3',
      patientName: byId('pac_3') ? byId('pac_3').name : 'Fernanda Souza',
      recordNumber: recordNumber(3),
      status: 'ativo',
      psychologist: RESPONSAVEL,
      createdAt: isoDate(addDays(today, -14)),
      updatedAt: isoDate(today),
      accessAuthorized: true,
      sessions: [
        {
          id: uid('ses'), number: 1, date: isoDate(addDays(today, -14)),
          patientReport: 'Relata dificuldades de relacionamento familiar e sensação de sobrecarga.',
          clinicalAnalysis: 'Padrões disfuncionais de comunicação familiar identificados no relato inicial.',
          therapeuticIntervention: 'Mapeamento da dinâmica familiar e identificação de papéis assumidos.',
          observations: 'Primeira sessão, paciente ainda reservada ao compartilhar detalhes.',
          nextSessionPlan: 'Aprofundar o histórico familiar e expectativas quanto ao processo.',
          therapeuticTasks: 'Nenhuma tarefa nesta etapa.',
          evolution: 'Sessão inicial, sem intercorrências.',
          freeNotes: '',
        },
        {
          id: uid('ses'), number: 2, date: isoDate(today),
          patientReport: 'Trouxe uma situação recente de conflito com um familiar próximo.',
          clinicalAnalysis: 'Padrão de comunicação passivo-agressivo identificado no relato do conflito.',
          therapeuticIntervention: 'Treino de comunicação assertiva com uso de role-play.',
          observations: 'Boa abertura para o exercício proposto em sessão.',
          nextSessionPlan: 'Praticar comunicação assertiva em situação real e trazer feedback.',
          therapeuticTasks: 'Aplicar ao menos uma vez a técnica de comunicação assertiva treinada.',
          evolution: 'Engajamento crescente no processo terapêutico.',
          freeNotes: '',
        },
      ],
      changeHistory: [
        { id: uid('chg'), date: isoDate(addDays(today, -14)), time: '13:05', user: RESPONSAVEL, field: 'Registro da sessão', type: 'Nova sessão adicionada' },
        { id: uid('chg'), date: isoDate(today), time: '13:12', user: RESPONSAVEL, field: 'Intervenção terapêutica', type: 'Intervenção terapêutica alterada' },
      ],
      versions: [],
      accessLogs: [
        { id: uid('log'), date: isoDate(addDays(today, -14)), time: '13:00', user: RESPONSAVEL, type: 'Criação', action: 'Criação de nova sessão' },
        { id: uid('log'), date: isoDate(today), time: '13:10', user: RESPONSAVEL, type: 'Consulta', action: 'Consulta ao histórico' },
      ],
      documents: [
        { id: uid('doc'), name: 'Avaliacao-inicial.docx', type: 'DOCX', date: isoDate(addDays(today, -14)), size: 64_500 },
        { id: uid('doc'), name: 'Termo-consentimento.pdf', type: 'PDF', date: isoDate(addDays(today, -14)), size: 98_200 },
      ],
    });

    /* Prontuário 4 — Rafael Andrade (arquivado, exemplo de status) ------- */
    records.push({
      id: uid('pnt'),
      patientId: 'pac_5',
      patientName: byId('pac_5') ? byId('pac_5').name : 'Rafael Andrade',
      recordNumber: recordNumber(4),
      status: 'arquivado',
      psychologist: RESPONSAVEL,
      createdAt: isoDate(addDays(today, -120)),
      updatedAt: isoDate(addDays(today, -1)),
      accessAuthorized: false,
      sessions: [
        {
          id: uid('ses'), number: 1, date: isoDate(addDays(today, -1)),
          patientReport: 'Paciente relata episódio pontual de estresse relacionado a mudança de rotina.',
          clinicalAnalysis: 'Reação adaptativa ao estresse, sem indícios de quadro clínico persistente.',
          therapeuticIntervention: 'Orientações sobre manejo de estresse e organização de rotina.',
          observations: 'Sessão de acompanhamento pontual.',
          nextSessionPlan: 'Reavaliar necessidade de continuidade em próximo contato.',
          therapeuticTasks: 'Organizar rotina semanal com pausas programadas.',
          evolution: 'Quadro estável, sem necessidade de intervenção intensiva no momento.',
          freeNotes: 'Prontuário mantido como referência para eventual retorno do paciente.',
        },
      ],
      changeHistory: [
        { id: uid('chg'), date: isoDate(addDays(today, -1)), time: '08:30', user: RESPONSAVEL, field: 'Registro da sessão', type: 'Nova sessão adicionada' },
      ],
      versions: [],
      accessLogs: [
        { id: uid('log'), date: isoDate(addDays(today, -1)), time: '08:28', user: RESPONSAVEL, type: 'Criação', action: 'Criação de nova sessão' },
      ],
      documents: [],
    });

    /* Gera o histórico de versões (RF16) a partir das sessões já criadas,
       simulando 2-3 revisões anteriores por prontuário. */
    records.forEach((record) => {
      const lastSession = record.sessions[record.sessions.length - 1];
      if (!lastSession) return;

      const versionCount = Math.min(3, record.sessions.length + 1);
      for (let v = 1; v <= versionCount; v++) {
        const isCurrent = v === versionCount;
        record.versions.push({
          id: uid('ver'),
          version: v,
          date: isoDate(addDays(today, -(versionCount - v) * 9 - 2)),
          time: `${pad(8 + v)}:${v % 2 === 0 ? '15' : '40'}`,
          responsible: RESPONSAVEL,
          description: isCurrent
            ? 'Versão atual do prontuário.'
            : v === 1
            ? 'Criação inicial do prontuário.'
            : 'Atualização de análise clínica e evolução terapêutica.',
          sessionId: lastSession.id,
          isCurrent,
          snapshot: isCurrent
            ? null // versão atual não tem "snapshot antigo" — usa os dados ao vivo da sessão
            : {
                clinicalAnalysis: v === 1
                  ? 'Avaliação inicial pendente de maior aprofundamento clínico.'
                  : lastSession.clinicalAnalysis,
                evolution: v === 1
                  ? 'Sessão inicial, evolução ainda não definida.'
                  : lastSession.evolution,
                observations: v === 1
                  ? 'Poucas informações disponíveis nesta fase.'
                  : lastSession.observations,
              },
        });
      }
    });

    storage.set(RECORDS_KEY, records);
  }

  function seedAll() {
    seedRecords();
  }

  /* Leitura ------------------------------------------------------------- */
  function getRecords() {
    return storage.get(RECORDS_KEY, []);
  }

  function getRecordById(id) {
    return getRecords().find((r) => r.id === id) || null;
  }

  function getRecordByPatientId(patientId) {
    return getRecords().find((r) => r.patientId === patientId) || null;
  }

  function saveRecords(list) {
    storage.set(RECORDS_KEY, list);
  }

  function nextRecordNumber() {
    return recordNumber(getRecords().length + 1);
  }

  /* Escrita ------------------------------------------------------------- */
  function createRecord({ patientId, patientName, sessionDate }) {
    const list = getRecords();
    const today = new Date();

    const newRecord = {
      id: uid('pnt'),
      patientId,
      patientName,
      recordNumber: nextRecordNumber(),
      status: 'ativo',
      psychologist: RESPONSAVEL,
      createdAt: isoDate(today),
      updatedAt: isoDate(today),
      accessAuthorized: false,
      sessions: [blankSession(1, sessionDate || isoDate(today))],
      changeHistory: [
        { id: uid('chg'), date: isoDate(today), time: timeNow(), user: RESPONSAVEL, field: 'Prontuário', type: 'Prontuário criado' },
      ],
      versions: [
        { id: uid('ver'), version: 1, date: isoDate(today), time: timeNow(), responsible: RESPONSAVEL, description: 'Criação inicial do prontuário.', sessionId: null, isCurrent: true, snapshot: null },
      ],
      accessLogs: [
        { id: uid('log'), date: isoDate(today), time: timeNow(), user: RESPONSAVEL, type: 'Criação', action: 'Criação de novo prontuário' },
      ],
      documents: [],
    };

    list.push(newRecord);
    saveRecords(list);
    return newRecord;
  }

  function updateRecord(id, patch) {
    const list = getRecords();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;
    list[index] = Object.assign({}, list[index], patch);
    saveRecords(list);
    return list[index];
  }

  function touchUpdatedAt(id) {
    updateRecord(id, { updatedAt: isoDate(new Date()) });
  }

  function addSession(recordId, sessionData) {
    const record = getRecordById(recordId);
    if (!record) return null;
    record.sessions.push(sessionData);
    updateRecord(recordId, { sessions: record.sessions });
    touchUpdatedAt(recordId);
    return sessionData;
  }

  function updateSession(recordId, sessionId, patch) {
    const record = getRecordById(recordId);
    if (!record) return null;
    const index = record.sessions.findIndex((s) => s.id === sessionId);
    if (index === -1) return null;
    record.sessions[index] = Object.assign({}, record.sessions[index], patch);
    updateRecord(recordId, { sessions: record.sessions });
    touchUpdatedAt(recordId);
    return record.sessions[index];
  }

  function addChangeEntry(recordId, entry) {
    const record = getRecordById(recordId);
    if (!record) return null;
    const item = Object.assign({ id: uid('chg') }, entry);
    record.changeHistory.unshift(item);
    updateRecord(recordId, { changeHistory: record.changeHistory });
    return item;
  }

  function addAccessLog(recordId, entry) {
    const record = getRecordById(recordId);
    if (!record) return null;
    const item = Object.assign({ id: uid('log') }, entry);
    record.accessLogs.unshift(item);
    updateRecord(recordId, { accessLogs: record.accessLogs });
    return item;
  }

  function addVersion(recordId, entry) {
    const record = getRecordById(recordId);
    if (!record) return null;
    // A versão anterior deixa de ser "atual".
    record.versions.forEach((v) => { v.isCurrent = false; });
    const item = Object.assign(
      { id: uid('ver'), version: record.versions.length + 1, isCurrent: true },
      entry
    );
    record.versions.push(item);
    updateRecord(recordId, { versions: record.versions });
    return item;
  }

  function addDocument(recordId, doc) {
    const record = getRecordById(recordId);
    if (!record) return null;
    const item = Object.assign({ id: uid('doc') }, doc);
    record.documents.unshift(item);
    updateRecord(recordId, { documents: record.documents });
    touchUpdatedAt(recordId);
    return item;
  }

  function removeDocument(recordId, docId) {
    const record = getRecordById(recordId);
    if (!record) return;
    updateRecord(recordId, { documents: record.documents.filter((d) => d.id !== docId) });
  }

  function setAccessAuthorization(recordId, authorized) {
    return updateRecord(recordId, { accessAuthorized: authorized });
  }

  window.ClarezaProntuarios = {
    seedAll,
    blankSession,
    isoDate,
    recordNumber: nextRecordNumber,
    getRecords,
    getRecordById,
    getRecordByPatientId,
    createRecord,
    updateRecord,
    addSession,
    updateSession,
    addChangeEntry,
    addAccessLog,
    addVersion,
    addDocument,
    removeDocument,
    setAccessAuthorization,
  };
})(window);
