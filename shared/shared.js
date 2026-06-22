
// --- CUSTOM MODALS ---
window.showCustomModal = function(options) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-modal-overlay';
  
  const box = document.createElement('div');
  box.className = 'custom-modal-box';
  
  const titleEl = document.createElement('h3');
  if (options.title) {
    titleEl.className = 'custom-modal-title';
    titleEl.textContent = options.title;
    box.appendChild(titleEl);
  }
  
  const descEl = document.createElement('p');
  if (options.desc) {
    descEl.className = 'custom-modal-desc';
    descEl.textContent = options.desc;
    box.appendChild(descEl);
  }
  
  const actionsEl = document.createElement('div');
  actionsEl.className = 'custom-modal-actions';
  const uniqueId = Date.now() + Math.random().toString(36).substring(2, 11);
  options.buttons.forEach((btn, i) => {
    const btnEl = document.createElement('button');
    btnEl.className = `custom-modal-btn ${btn.style || 'secondary'}`;
    btnEl.id = `modal-btn-${uniqueId}-${i}`;
    btnEl.textContent = btn.text;
    actionsEl.appendChild(btnEl);
  });
  box.appendChild(actionsEl);
  
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  
  // Force reflow for animation
  overlay.offsetHeight;
  overlay.classList.add('show');
  
  const close = () => {
    overlay.classList.remove('show');
    document.removeEventListener('keydown', escapeHandler, true);
    setTimeout(() => overlay.remove(), 300);
  };
  
  let cancelAction = null;
  options.buttons.forEach((btn, i) => {
    if (btn.text.toLowerCase().includes('cancelar')) {
      cancelAction = () => { close(); if (btn.action) btn.action(); };
    }
    document.getElementById(`modal-btn-${uniqueId}-${i}`).addEventListener('click', () => {
      close();
      if (btn.action) btn.action();
    });
  });

  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (cancelAction) cancelAction();
      else close();
    }
  };
  // Use capture to ensure modal grabs escape first
  document.addEventListener('keydown', escapeHandler, true);
};

// --- THEME MANAGEMENT ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
  
  // Add toggle button to body
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.title = "Cambiar Tema";
  btn.innerHTML = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
  btn.onclick = () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    btn.innerHTML = isLight ? '🌙' : '☀️';
  };
  document.body.appendChild(btn);
}

// --- STATS & ACHIEVEMENTS MANAGEMENT ---
window.QuizStats = {
  data: {
    quizzesCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    topics: {},
    achievements: [],
    historyQuizzes: [],
    historyQuestions: []
  },
  
  ACHIEVEMENTS: {
    FIRST_BLOOD: { id: 'FIRST_BLOOD', icon: '🩸', title: 'Primera Sangre', desc: 'Responde tu primera pregunta.' },
    WARM_UP: { id: 'WARM_UP', icon: '🏃', title: 'Calentamiento', desc: 'Completa tu primer simulacro.' },
    CENTURION: { id: 'CENTURION', icon: '💯', title: 'Centurión', desc: 'Responde 100 preguntas en total.' },
    SCHOLAR: { id: 'SCHOLAR', icon: '🦉', title: 'Erudito', desc: 'Responde 500 preguntas en total.' },
    PERFECT: { id: 'PERFECT', icon: '🏆', title: 'Perfeccionista', desc: 'Obtén un 100% de precisión en un simulacro.' },
    TEN_QUIZZES: { id: 'TEN_QUIZZES', icon: '🔟', title: 'Constante', desc: 'Completa 10 simulacros.' },
    FIFTY_QUIZZES: { id: 'FIFTY_QUIZZES', icon: '🔥', title: 'Máquina', desc: 'Completa 50 simulacros.' },
    SNIPER: { id: 'SNIPER', icon: '🎯', title: 'Francotirador', desc: 'Acierta 50 preguntas en total.' },
    SPEEDRUNNER: { id: 'SPEEDRUNNER', icon: '⚡', title: 'Speedrunner', desc: 'Completa un test de 10 preguntas o más en menos de 1 minuto.' },
    NIGHT_OWL: { id: 'NIGHT_OWL', icon: '🦇', title: 'Búho Nocturno', desc: 'Completa un test entre la medianoche y las 5 AM.' },
    CMMI_MASTER: { id: 'CMMI_MASTER', icon: '⚙️', title: 'Maestro CMMI', desc: 'Completa 5 tests sobre CMMI.' },
    ISO_MASTER: { id: 'ISO_MASTER', icon: '📐', title: 'Gurú ISO 9000', desc: 'Completa 5 tests sobre ISO 9000.' }
  },

  load() {
    const saved = localStorage.getItem('quiz_stats');
    if (saved) {
      try {
        this.data = { ...this.data, ...JSON.parse(saved) };
      } catch (e) { console.error('Stats corrupted, resetting', e); this.reset(); }
    }
  },

  save() {
    localStorage.setItem('quiz_stats', JSON.stringify(this.data));
  },

  addAnswer(payload) {
    // support legacy signature
    let isCorrect, topic, text, justification, correctAnswer;
    if (typeof payload === 'boolean') {
      isCorrect = arguments[0];
      topic = arguments[1] || 'general';
      text = 'Pregunta desconocida';
      justification = '';
      correctAnswer = '';
    } else {
      isCorrect = payload.isCorrect;
      topic = payload.topic || 'general';
      text = payload.text || 'Pregunta desconocida';
      justification = payload.justification || '';
      correctAnswer = payload.correctAnswer || '';
    }

    this.data.questionsAnswered++;
    if (isCorrect) this.data.correctAnswers++;
    
    if (!this.data.topics[topic]) {
      this.data.topics[topic] = { total: 0, correct: 0 };
    }
    this.data.topics[topic].total++;
    if (isCorrect) this.data.topics[topic].correct++;
    
    // add to history
    this.data.historyQuestions.unshift({ date: Date.now(), topic, isCorrect, text, justification, correctAnswer });
    if (this.data.historyQuestions.length > 50) this.data.historyQuestions.pop();

    this.save();
    
    // Check achievements
    if (this.data.questionsAnswered >= 1) this.unlock('FIRST_BLOOD');
    if (this.data.correctAnswers >= 50) this.unlock('SNIPER');
    if (this.data.questionsAnswered >= 100) this.unlock('CENTURION');
    if (this.data.questionsAnswered >= 500) this.unlock('SCHOLAR');
  },

  addQuizCompleted(payload) {
    let pct, correct, total, elapsed, topic, quizName, questions;
    if (typeof payload === 'number') {
      pct = payload;
      correct = 0; total = 0; elapsed = 0; topic = 'general'; quizName = 'Simulacro'; questions = [];
    } else {
      pct = payload.pct;
      correct = payload.correct;
      total = payload.total;
      elapsed = payload.elapsed;
      topic = payload.topic || 'general';
      quizName = payload.quizName || 'Simulacro';
      questions = payload.questions || [];
    }

    this.data.quizzesCompleted++;
    
    this.data.historyQuizzes.unshift({ date: Date.now(), topic, quizName, pct, correct, total, elapsed, questions });
    if (this.data.historyQuizzes.length > 20) this.data.historyQuizzes.pop();

    this.save();
    
    if (this.data.quizzesCompleted >= 1) this.unlock('WARM_UP');
    if (this.data.quizzesCompleted >= 10) this.unlock('TEN_QUIZZES');
    if (this.data.quizzesCompleted >= 50) this.unlock('FIFTY_QUIZZES');
    if (pct >= 100) this.unlock('PERFECT');
    
    // Time achievements
    if (total >= 10 && elapsed < 60) this.unlock('SPEEDRUNNER');
    
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) this.unlock('NIGHT_OWL');
    
    // Topic achievements
    const topicQuizzes = this.data.historyQuizzes.filter(q => q.topic === topic).length;
    if (topic === 'cmmi' && topicQuizzes >= 5) this.unlock('CMMI_MASTER');
    if (topic === 'iso9000' && topicQuizzes >= 5) this.unlock('ISO_MASTER');
  },

  reset() {
    this.data = {
      quizzesCompleted: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      topics: {},
      achievements: [],
      historyQuizzes: [],
      historyQuestions: []
    };
    this.save();
  },

  unlock(id) {
    if (!this.data.achievements.includes(id)) {
      this.data.achievements.push(id);
      this.save();
      this.showToast(this.ACHIEVEMENTS[id]);
    }
  },

  showToast(ach) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    
    const iconSpan = document.createElement('span');
    iconSpan.style.fontSize = '2rem';
    iconSpan.textContent = ach.icon;
    toast.appendChild(iconSpan);
    
    const textDiv = document.createElement('div');
    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = 'font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;';
    labelDiv.textContent = 'Logro Desbloqueado';
    
    const titleDiv = document.createElement('div');
    titleDiv.style.fontSize = '1.1rem';
    titleDiv.textContent = ach.title;
    
    textDiv.appendChild(labelDiv);
    textDiv.appendChild(titleDiv);
    toast.appendChild(textDiv);
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  },

  renderIndexWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const accuracy = this.data.questionsAnswered > 0 
      ? Math.round((this.data.correctAnswers / this.data.questionsAnswered) * 100) 
      : 0;

    container.innerHTML = '';
    const widget = document.createElement('div');
    widget.className = 'stats-widget';
    
    const createItem = (value, label, href, title) => {
      const el = href ? document.createElement('a') : document.createElement('div');
      el.className = 'stat-item';
      if (href) { el.href = href; el.style.textDecoration = 'none'; }
      if (title) { el.title = title; }
      
      const valSpan = document.createElement('span');
      valSpan.className = 'stat-value';
      valSpan.textContent = value;
      
      const lblSpan = document.createElement('span');
      lblSpan.className = 'stat-label';
      lblSpan.textContent = label;
      
      el.appendChild(valSpan);
      el.appendChild(lblSpan);
      return el;
    };
    
    widget.appendChild(createItem(this.data.quizzesCompleted, 'Tests', 'estadisticas/index.html?tab=tests'));
    widget.appendChild(createItem(this.data.questionsAnswered, 'Preguntas', 'estadisticas/index.html?tab=preguntas'));
    widget.appendChild(createItem(`${accuracy}%`, 'Precisión'));
    widget.appendChild(createItem(this.data.achievements.length, 'Logros 🏆', 'estadisticas/index.html?tab=logros', `${this.data.achievements.length} de ${Object.keys(this.ACHIEVEMENTS).length}`));
    
    container.appendChild(widget);
  }
};

// Initialize on load

// --- PAUSED TEST MANAGEMENT ---
function initResumeButton() {
  const saved = localStorage.getItem('paused_test');
  if (saved) {
    try {
      const progress = JSON.parse(saved);
      // Remove existing if any
      const existing = document.querySelector('.resume-test-btn');
      if (existing) existing.remove();
      
      const btn = document.createElement('button');
      btn.className = 'resume-test-btn';
      btn.innerHTML = '▶️ Reanudar Test';
      btn.title = 'Reanudar el test pausado';

      
      btn.onclick = () => {
        let basePath = window.location.pathname;
        if (basePath.endsWith('index.html')) {
          basePath = basePath.substring(0, basePath.lastIndexOf('/index.html'));
        } else if (basePath.endsWith('/')) {
          basePath = basePath.substring(0, basePath.length - 1);
        }
        
        let targetPath = progress.path;
        if (targetPath.endsWith('index.html')) {
          targetPath = targetPath.substring(0, targetPath.lastIndexOf('/index.html'));
        } else if (targetPath.endsWith('/')) {
          targetPath = targetPath.substring(0, targetPath.length - 1);
        }

        if (basePath === targetPath && typeof window.resumePausedTest === 'function') {
          window.resumePausedTest(progress.state);
        } else {
          // Navigating to the paused test
          window.location.href = progress.path + '?resume=true';
        }
      };
      
      document.body.appendChild(btn);
    } catch (e) {
      console.error(e);
    }
  } else {
    const existing = document.querySelector('.resume-test-btn');
    if (existing) existing.remove();
  }
}

function checkPausedTestOnLoad() {
  const saved = localStorage.getItem('paused_test');
  if (saved && !sessionStorage.getItem('prompted_resume') && !window.location.search.includes('resume=true')) {
    sessionStorage.setItem('prompted_resume', 'true');
    try {
      const progress = JSON.parse(saved);
      window.showCustomModal({
        title: 'Test en progreso',
        desc: 'Tienes un test guardado. ¿Deseas reanudarlo ahora?',
        buttons: [
          {
            text: 'Sí, reanudar',
            style: 'primary',
            action: () => {
              let basePath = window.location.pathname;
              if (basePath.endsWith('index.html')) basePath = basePath.substring(0, basePath.lastIndexOf('/index.html'));
              else if (basePath.endsWith('/')) basePath = basePath.substring(0, basePath.length - 1);
              let targetPath = progress.path;
              if (targetPath.endsWith('index.html')) targetPath = targetPath.substring(0, targetPath.lastIndexOf('/index.html'));
              else if (targetPath.endsWith('/')) targetPath = targetPath.substring(0, targetPath.length - 1);

              if (basePath === targetPath && typeof window.resumePausedTest === 'function') {
                window.resumePausedTest(progress.state);
              } else {
                window.location.href = progress.path + '?resume=true';
              }
            }
          },
          {
            text: 'No, descartar',
            style: 'danger',
            action: () => {
              localStorage.removeItem('paused_test');
              const existing = document.querySelector('.resume-test-btn');
              if (existing) existing.remove();
            }
          },
          {
            text: 'Más tarde',
            style: 'secondary'
          }
        ]
      });
    } catch(e) {
      console.error(e);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initResumeButton();
  initTheme();
  window.QuizStats.load();
  checkPausedTestOnLoad();
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('format-btn')) {
    const parent = e.target.closest('.category-format-switch');
    if (parent) {
      parent.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      if (typeof window.buildCategoryGrid === 'function') {
        window.buildCategoryGrid();
      } else if (typeof buildCategoryGrid === 'function') {
        buildCategoryGrid();
      }
    }
  }
});
