(function () {
  'use strict';
  const questions = {
    client: [
      ['How would you describe your overall experience with TexContractor?', 'كيف تصف تجربتك العامة مع الموقع؟'],
      ['Was it easy to find the type of service you needed?', 'هل وجدت نوع الخدمة بسهولة؟'],
      ['Did the location search help you find a professional serving your area?', 'هل ساعدك البحث في العثور على فني يخدم منطقتك؟'],
      ['Were the profile information and work photos useful when choosing whom to contact?', 'هل كانت معلومات الفني وصوره مفيدة للاختيار؟'],
      ['Was it easy to send a message to the professional?', 'هل كان إرسال رسالة إلى الفني سهلًا؟'],
      ['Did the professional respond within a reasonable time?', 'هل ردّ الفني خلال وقت مناسب؟'],
      ['Did you receive a clear estimate and have enough information to compare your options?', 'هل حصلت على سعر واضح ومعلومات كافية للمقارنة؟'],
      ['If the work was completed, did it match what you agreed with the professional?', 'إذا نُفّذت الخدمة، هل طابقت الاتفاق مع الفني؟'],
      ['Would you use TexContractor again or recommend it to someone else? Why?', 'هل ستستخدم الموقع مجددًا أو تنصح به؟ ولماذا؟'],
      ['What problem did you encounter, or what would you improve?', 'ما المشكلة التي واجهتك أو التحسين الذي تقترحه؟']
    ],
    professional: [
      ['How would you describe your overall experience with TexContractor?', 'كيف تصف تجربتك العامة مع الموقع؟'],
      ['Was it easy to add your profile, services and service areas?', 'هل كانت إضافة ملفك وخدماتك ومناطق عملك سهلة؟'],
      ['Could you present your work description and photos the way you wanted?', 'هل استطعت عرض وصف عملك وصورك كما تريد؟'],
      ['Was it easy to edit your profile and update your contact information?', 'هل كان تعديل بياناتك ومعلومات التواصل سهلًا؟'],
      ['Have you received new inquiries from people who found you through TexContractor?', 'هل وصلتك استفسارات جديدة عبر الموقع؟'],
      ['Were the inquiries relevant to your specialty and service area?', 'هل ناسبت الاستفسارات تخصصك ومناطق عملك؟'],
      ['Did customer messages include enough information to understand the request and discuss an estimate?', 'هل تضمنت رسائل العملاء ما يكفي لفهم الطلب ومناقشة السعر؟'],
      ['Did any inquiry through TexContractor lead to an appointment or paid work?', 'هل تحوّل استفسار عبر الموقع إلى موعد أو عمل فعلي؟'],
      ['Would you keep your profile on TexContractor and recommend the site to other professionals? Why?', 'هل ستحتفظ بملفك وتنصح فنيين آخرين بالموقع؟ ولماذا؟'],
      ['What difficulty did you encounter, and what improvement would help you most?', 'ما الصعوبة التي واجهتك والتحسين الأكثر فائدة لك؟']
    ]
  };
  function validAnswers(role, answers) {
    if (!questions[role] || !Array.isArray(answers)) return [];
    const seen = new Set();
    return answers.filter(item => {
      if (!Number.isInteger(item?.key) || item.key < 1 || item.key > 10 || seen.has(item.key) || typeof item.answer !== 'string' || !item.answer.trim() || item.answer.length > 3000) return false;
      seen.add(item.key); return true;
    }).map(item => ({ key:item.key, answer:item.answer.trim() }));
  }
  function attach(document) {
    const role = document.getElementById('feedback-role'), list = document.getElementById('feedback-questions');
    const drafts = {}; let activeRole = '', controls = [];
    function collect(strict = false) {
      return controls.filter(item => item.check.checked).map(item => {
        const answer = item.answer.value.trim();
        if (strict && !answer) throw Error('Enter an answer for each selected question, or uncheck it.');
        return { key:item.key, answer };
      });
    }
    function render() {
      list.replaceChildren(); controls = [];
      const bank = questions[role.value]; if (!bank) return;
      const selected = drafts[role.value] || [];
      bank.forEach(([english, arabic], index) => {
        const key = index + 1, saved = selected.find(item => item.key === key);
        const box = document.createElement('div'); box.className = 'feedback-question';
        const label = document.createElement('label'); label.className = 'check';
        const check = document.createElement('input'); check.type = 'checkbox'; check.id = 'feedback-select-' + key; check.checked = !!saved;
        const text = document.createElement('span'); text.textContent = key + '. ' + english;
        const translation = document.createElement('p'); translation.textContent = arabic; translation.dir = 'rtl'; translation.className = 'hint';
        const answerLabel = document.createElement('label'); answerLabel.textContent = 'Answer received / الإجابة التي وصلتك'; answerLabel.htmlFor = 'feedback-answer-' + key;
        const answer = document.createElement('textarea'); answer.id = 'feedback-answer-' + key; answer.maxLength = 3000; answer.value = saved?.answer || '';
        const sync = () => { answerLabel.hidden = !check.checked; answer.hidden = !check.checked; answer.required = check.checked; };
        check.addEventListener('change', sync); sync(); label.append(check, text); box.append(label, translation, answerLabel, answer); list.append(box); controls.push({key, check, answer});
      });
    }
    role.addEventListener('change', () => {
      if (activeRole) drafts[activeRole] = collect();
      activeRole = role.value; render();
    });
    return {
      clear() { for (const key of Object.keys(drafts)) delete drafts[key]; activeRole = ''; role.value = ''; render(); },
      set(row) { this.clear(); role.value = questions[row.feedback_role] ? row.feedback_role : ''; activeRole = role.value; if (activeRole) drafts[activeRole] = validAnswers(activeRole, row.feedback_answers); render(); },
      get() { const answers = collect(true); if (answers.length && !questions[role.value]) throw Error('Choose Client or Professional first.'); return { feedback_role:questions[role.value] ? role.value : null, feedback_answers:answers }; }
    };
  }
  window.TexFeedback = { questions, validAnswers, attach };
})();
