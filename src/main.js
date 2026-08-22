import './styles.css';

import { loadState, completeOnboarding } from './core/storage.js';
import { speak, speakSlow } from './core/speech.js';
import { allVocabIds } from './data/vocab.js';
import { dueCardIds } from './core/srs.js';
import { initAutoSync, syncStatus, isEnabled as autoSyncEnabled } from './core/autosync.js';

import { setFilter, setQuery } from './views/vocab.js';
import { esc } from './core/ui.js';
import { NAV, parseRoute, primarySection, sectionTabs } from './core/navigation.js';
import { renderRoute } from './core/render-route.js';
import {
  handleSettingChange,
  doExport,
  doReset,
  doImport,
  handleSaveKey,
  handleForgetKey,
  handleProviderChange,
  handleSaveSync,
  handleSync,
  handleForgetSync,
} from './views/settings.js';
import * as Lesson from './views/lesson.js';
import * as Review from './views/review.js';
import * as Pronounce from './views/pronounce.js';
import * as Listening from './views/listening.js';
import * as Writing from './views/writing.js';
import * as Dialogue from './views/dialogue.js';
import * as Reading from './views/reading.js';

const app = document.getElementById('app');

let route = { name: 'dashboard', param: null };

function navigate(target) {
  const { name, param } = parseRoute(target);

  if (name === 'review-mistakes') {
    Review.startMistakeReview();
    route = { name: 'review', param: null };
    render();
    window.scrollTo(0, 0);
    return;
  }

  if (name === 'review-quick') {
    Review.startQuickReview();
    route = { name: 'review', param: null };
    render();
    window.scrollTo(0, 0);
    return;
  }

  // Уходя с экранов с внутренним состоянием — сбрасываем его.
  if (name !== 'lesson') Lesson.exitLesson();
  if (name !== 'review') Review.exitReview();
  if (name !== 'pronounce') Pronounce.exitPronounce();
  if (name !== 'listening') Listening.exitListening();
  if (name !== 'writing') Writing.exitWriting();
  if (name !== 'dialogue') Dialogue.exitDialogue();
  if (name !== 'reading') Reading.exitReading();

  if (name === 'lesson' && param) Lesson.startLesson(param);
  if (name === 'review') Review.startReview();
  if (name === 'pronounce') Pronounce.startPronounce();
  if (name === 'listening') Listening.startListening();
  if (name === 'writing') Writing.startWriting();
  if (name === 'dialogue') Dialogue.startDialogue();
  if (name === 'reading') Reading.startReading();

  route = { name, param };
  render();
  window.scrollTo(0, 0);
}

/** Короткая строка о состоянии синхронизации — чтобы она не была невидимой. */
function syncBadge() {
  const { state, at, error } = syncStatus();
  if (state === 'syncing') return '<span class="faint">↻ синхронизация…</span>';
  // Текст ошибки приходит из сети и обязан экранироваться: без этого
  // содержимое чужого ответа попадало бы в атрибут как разметка
  if (state === 'error') {
    return `<span style="color:var(--amber)" title="${esc(error || '')}">⚠ не синхронизировано</span>`;
  }
  if (state === 'ok' && at) {
    const mins = Math.round((Date.now() - at) / 60000);
    return `<span class="faint">✓ ${mins < 1 ? 'только что' : `${mins} мин назад`}</span>`;
  }
  return '<span class="faint">↕ автосинхронизация</span>';
}

function render() {
  const state = loadState();
  document.documentElement.dataset.theme = state.settings.theme === 'dark' ? 'dark' : 'light';
  const due = dueCardIds(allVocabIds()).length;
  const activeSection = primarySection(route.name);
  const tabs = sectionTabs(route.name);

  app.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="logo">English<span>Portal</span></div>
        ${NAV.map(
          (n) => `<button class="nav-item${activeSection === n.id ? ' active' : ''}" data-nav="${n.id}">
            <span>${n.icon}</span><span>${n.label}</span>
            ${n.id === 'review' && due ? `<span class="badge">${due}</span>` : ''}
          </button>`,
        ).join('')}
        <div class="sidebar-footer">
          🔥 ${state.streak} дн. подряд<br />
          ⭐ ${state.xp} XP
          ${autoSyncEnabled() ? `<br />${syncBadge()}` : ''}
          <button class="settings-link" data-nav="settings" aria-label="Открыть настройки">⚙ Настройки</button>
        </div>
      </aside>
      <main class="main">
        ${tabs.length ? `<nav class="section-tabs" aria-label="Раздел">
          ${tabs.map((tab) => `<button class="section-tab${route.name === tab.id ? ' active' : ''}" data-nav="${tab.id}">${tab.label}</button>`).join('')}
        </nav>` : ''}
        ${route.name === 'settings' ? '<button class="back-link" data-nav="progress">← К прогрессу</button>' : ''}
        ${renderRoute(route)}
      </main>
    </div>
  `;

  // Карточка воспроизведения без ввода не работает, поэтому поле забирает
  // фокус само — иначе на каждом слове пришлось бы сначала целиться в него.
  document.querySelector('[data-prod-input]')?.focus();
}

/* ---------- Делегированные обработчики ---------- */

app.addEventListener('click', (e) => {
  const target = (sel) => e.target.closest(sel);

  if (target('[data-onboarding-start]')) {
    completeOnboarding();
    render();
    return;
  }

  if (target('[data-review-mistakes]')) {
    Review.startMistakeReview();
    render();
    return;
  }

  // Озвучка — работает на любом экране
  const sp = target('[data-speak]');
  if (sp) {
    speak(sp.dataset.speak);
    return;
  }
  const spSlow = target('[data-speak-slow]');
  if (spSlow) {
    speakSlow(spSlow.dataset.speakSlow);
    return;
  }

  // Навигация
  const nav = target('[data-nav]');
  if (nav) {
    navigate(nav.dataset.nav);
    return;
  }

  // Раскрытие юнита в дорожной карте
  const toggle = target('[data-toggle-unit]');
  if (toggle) {
    const body = document.querySelector(`[data-unit-body="${toggle.dataset.toggleUnit}"]`);
    if (body) body.hidden = !body.hidden;
    return;
  }

  // Урок
  const la = target('[data-lesson-action]');
  if (la) {
    // Значение поля читает главный модуль: сам урок с DOM не работает,
    // и его логику поэтому можно проверить тестами
    const typedInput = document.querySelector('[data-typed]');
    if (typedInput) Lesson.syncTyped(typedInput.value);
    const result = Lesson.handleLessonAction(la.dataset.lessonAction);
    if (typeof result === 'string') navigate(result);
    else if (result) render();
    return;
  }
  const ans = target('[data-answer]');
  if (ans) {
    if (Lesson.handleAnswerClick(ans.dataset.answer)) render();
    return;
  }
  const choose = target('[data-choose]');
  if (choose) {
    if (Lesson.handleChoose(choose.dataset.choose)) render();
    return;
  }
  const unchoose = target('[data-unchoose]');
  if (unchoose) {
    if (Lesson.handleUnchoose(unchoose.dataset.unchoose)) render();
    return;
  }

  // Повторение
  const pick = target('[data-pick]');
  if (pick) {
    if (Review.handlePick(pick.dataset.pick)) render();
    return;
  }
  const bankPick = target('[data-bank-pick]');
  if (bankPick) {
    if (Review.handleBankPick(bankPick.dataset.bankPick)) render();
    return;
  }
  const bankUndo = target('[data-bank-undo]');
  if (bankUndo) {
    if (Review.handleBankUndo(bankUndo.dataset.bankUndo)) render();
    return;
  }
  if (target('[data-prod-check]')) {
    const input = document.querySelector('[data-prod-input]');
    if (input) Review.syncTyped(input.value);
    if (Review.handleCheck()) render();
    return;
  }
  if (target('[data-prod-giveup]')) {
    if (Review.handleGiveUp()) render();
    return;
  }
  if (target('[data-prod-speak]')) {
    Review.handleSpeak(render); // асинхронно: перерисовывает сам
    return;
  }
  const prodMode = target('[data-prod-mode]');
  if (prodMode) {
    if (Review.setAnswerMode(prodMode.dataset.prodMode)) render();
    return;
  }
  const grade = target('[data-grade]');
  if (grade) {
    if (Review.handleGrade(grade.dataset.grade)) render();
    return;
  }

  // Произношение
  if (target('[data-pron-listen]')) {
    Pronounce.handleListen(render); // асинхронно: перерисовывает сам
    return;
  }
  const pronMode = target('[data-pron-mode]');
  if (pronMode) {
    if (Pronounce.setMode(pronMode.dataset.pronMode)) render();
    return;
  }
  if (target('[data-pron-retry]')) {
    if (Pronounce.handleRetry()) render();
    return;
  }
  if (target('[data-pron-next]')) {
    if (Pronounce.handleNext()) render();
    return;
  }

  // Аудирование
  // Перерисовываем: счётчик прослушиваний и доступность кнопок зависят
  // от того, слушал ли человек, — без этого экран остаётся врать
  if (target('[data-listen-play]') || target('[data-listen-replay]')) {
    if (Listening.playCurrent(false)) render();
    return;
  }
  if (target('[data-listen-slow]')) {
    if (Listening.playCurrent(true)) render();
    return;
  }
  if (target('[data-listen-check]')) {
    const input = document.querySelector('[data-listen-input]');
    if (input) Listening.syncTyped(input.value);
    if (Listening.handleCheck()) render();
    return;
  }
  if (target('[data-listen-next]')) {
    if (Listening.handleNext()) render();
    return;
  }
  const listenMode = target('[data-listen-mode]');
  if (listenMode) {
    if (Listening.setMode(listenMode.dataset.listenMode)) render();
    return;
  }
  const audioText = target('[data-audio-text]');
  if (audioText) {
    if (Listening.openAudioText(audioText.dataset.audioText)) render();
    return;
  }
  if (target('[data-listen-textback]')) {
    if (Listening.backToTextList()) render();
    return;
  }
  if (target('[data-audio-play]')) {
    if (Listening.playAudioText(false)) render();
    return;
  }
  if (target('[data-audio-slow]')) {
    if (Listening.playAudioText(true)) render();
    return;
  }
  if (target('[data-audio-quiz]')) {
    if (Listening.startAudioQuestions()) render();
    return;
  }
  const audioAnswer = target('[data-audio-answer]');
  if (audioAnswer) {
    if (Listening.answerAudioQuestion(audioAnswer.dataset.audioAnswer)) render();
    return;
  }
  if (target('[data-audio-next]')) {
    if (Listening.nextAudioQuestion()) render();
    return;
  }

  // Письмо
  if (target('[data-writing-check]')) {
    Writing.handleCheck(render); // асинхронно: перерисовывает сам
    return;
  }
  const wLevel = target('[data-writing-level]');
  if (wLevel) {
    if (Writing.setLevel(wLevel.dataset.writingLevel)) render();
    return;
  }
  if (target('[data-writing-next]')) {
    if (Writing.nextTask()) render();
    return;
  }
  if (target('[data-writing-retry]')) {
    if (Writing.handleRetry()) render();
    return;
  }

  // Чтение
  const textCard = target('[data-text]');
  if (textCard) {
    if (Reading.openText(textCard.dataset.text)) render();
    return;
  }
  if (target('[data-reading-back]')) {
    if (Reading.backToList()) render();
    return;
  }
  if (target('[data-reading-quiz]')) {
    if (Reading.startQuestions()) render();
    return;
  }
  if (target('[data-reading-speak]')) {
    Reading.speakText();
    return;
  }
  const readingAnswer = target('[data-reading-answer]');
  if (readingAnswer) {
    if (Reading.answerQuestion(readingAnswer.dataset.readingAnswer)) render();
    return;
  }
  if (target('[data-reading-next]')) {
    if (Reading.nextQuestion()) render();
    return;
  }

  // Разговор
  const scene = target('[data-scene]');
  if (scene) {
    if (Dialogue.chooseScenario(scene.dataset.scene)) render();
    return;
  }
  if (target('[data-scene-exit]')) {
    if (Dialogue.leaveScenario()) render();
    return;
  }
  if (target('[data-chat-send]')) {
    const input = document.querySelector('[data-chat-input]');
    if (input) Dialogue.syncTyped(input.value);
    Dialogue.handleSend(render); // асинхронно: перерисовывает сам
    return;
  }
  if (target('[data-chat-hint]')) {
    if (Dialogue.toggleHint()) render();
    return;
  }
  const translate = target('[data-translate]');
  if (translate) {
    if (Dialogue.toggleTranslation(translate.dataset.translate)) render();
    return;
  }

  // Словарь
  const filter = target('[data-filter]');
  if (filter) {
    setFilter(filter.dataset.filter);
    render();
    return;
  }

  // Выбор провайдера проверки письма
  const aiProvider = target('[data-ai-provider]');
  if (aiProvider) {
    if (handleProviderChange(aiProvider.dataset.aiProvider)) render();
    return;
  }

  // Настройки
  const action = target('[data-action]');
  if (action) {
    if (action.dataset.action === 'export') doExport();
    if (action.dataset.action === 'import') document.querySelector('[data-import-file]')?.click();
    if (action.dataset.action === 'reset' && doReset()) render();
    if (action.dataset.action === 'save-key' && handleSaveKey()) render();
    if (action.dataset.action === 'forget-key' && handleForgetKey()) render();
    if (action.dataset.action === 'save-sync' && handleSaveSync()) render();
    if (action.dataset.action === 'sync') handleSync();
    if (action.dataset.action === 'forget-sync' && handleForgetSync()) render();
    return;
  }
});

app.addEventListener('change', (e) => {
  const setting = e.target.closest('[data-setting]');
  if (setting) {
    const key = setting.dataset.setting;
    const value = setting.type === 'checkbox' ? setting.checked : setting.value;
    handleSettingChange(key, value);
    render();
    return;
  }

  const file = e.target.closest('[data-import-file]');
  if (file && file.files?.[0]) {
    doImport(file.files[0], (ok) => {
      if (ok) render();
    });
  }
});

app.addEventListener('input', (e) => {
  // Поиск в словаре — без полного ре-рендера, чтобы не терять фокус
  const search = e.target.closest('[data-vocab-search]');
  if (search) {
    setQuery(search.value);
    const pos = search.selectionStart;
    render();
    const fresh = document.querySelector('[data-vocab-search]');
    if (fresh) {
      fresh.focus();
      fresh.setSelectionRange(pos, pos);
    }
    return;
  }

  const typed = e.target.closest('[data-typed]');
  if (typed) Lesson.syncTyped(typed.value);

  const dictation = e.target.closest('[data-listen-input]');
  if (dictation) Listening.syncTyped(dictation.value);

  const prod = e.target.closest('[data-prod-input]');
  if (prod) Review.syncTyped(prod.value);

  const chat = e.target.closest('[data-chat-input]');
  if (chat) Dialogue.syncTyped(chat.value);

  // Счётчик слов обновляем точечно, чтобы не терять курсор в тексте
  const essay = e.target.closest('[data-writing-input]');
  if (essay) {
    Writing.syncText(essay.value);
    Writing.refreshCounter();
  }
});

// Enter в поле перевода = «Проверить»
app.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const typed = e.target.closest('[data-typed]');
  if (typed) {
    Lesson.syncTyped(typed.value);
    if (Lesson.handleLessonAction('check')) render();
    return;
  }

  // Enter в диктанте: сначала проверка, потом переход к следующей фразе
  const dictation = e.target.closest('[data-listen-input]');
  if (dictation) {
    Listening.syncTyped(dictation.value);
    if (Listening.handleCheck()) render();
    return;
  }

  const prod = e.target.closest('[data-prod-input]');
  if (prod) {
    Review.syncTyped(prod.value);
    if (Review.handleCheck()) render();
    return;
  }

  const chat = e.target.closest('[data-chat-input]');
  if (chat) {
    Dialogue.syncTyped(chat.value);
    Dialogue.handleSend(render);
  }
});

render();

/**
 * Автосинхронизация: полная перерисовка только когда слияние принесло
 * чужие изменения, иначе обновляем один значок — иначе ре-рендер посреди
 * урока сбивал бы ввод.
 */
initAutoSync((mergedSomething) => {
  if (mergedSomething) {
    render();
    return;
  }
  const footer = document.querySelector('.sidebar-footer');
  if (footer && autoSyncEnabled()) {
    const state = loadState();
    footer.innerHTML = `🔥 ${state.streak} дн. подряд<br />⭐ ${state.xp} XP<br />${syncBadge()}`;
  }
});

/**
 * Service worker подключаем только в собранной версии: в режиме разработки
 * он кэшировал бы модули и мешал горячей перезагрузке.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // BASE_URL учитывает подпапку, из которой отдаётся сайт
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('Не удалось зарегистрировать service worker:', err);
    });
  });
}
