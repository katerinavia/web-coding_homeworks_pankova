import { teams, matches, getTeam, getMatch } from './data.js';
import { notifyAboutMatch } from './notifications.js';

const STORAGE = { favorites: 'mhl-favorite-teams', city: 'mhl-selected-city', match: 'mhl-selected-match', seat: 'mhl-selected-seat' };
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const saveJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const currentPage = document.body.dataset.page || 'tickets';
const root = document.body.dataset.root || '';
const asset = (file) => `${root}assets/images/${file}`;
const pageUrl = (file) => `${root}${file}`;
const favorites = () => readJSON(STORAGE.favorites, []);
const selectedMatch = () => getMatch(localStorage.getItem(STORAGE.match) || 'm1');
const selectedSeat = () => readJSON(STORAGE.seat, { sector: 1, row: 3, seat: 4, price: 1500 });

function teamImage(team, extra = '') {
  return `<img class="team-logo ${extra}" src="${asset(team.image)}" alt="Логотип: ${team.name}">`;
}
function header() {
  return `<header class="site-header"><div class="site-header__inner">
    <a class="brand" href="${pageUrl('index.html')}" aria-label="МХЛ — главная">${teamImage({ image: 'mhl-logo.png', name: 'МХЛ' }, 'site-logo')}</a>
    <nav class="main-navigation" aria-label="Основная навигация">
      <a class="navigation-link ${currentPage === 'tickets' ? 'is-active' : ''}" href="${pageUrl('index.html')}">Билеты</a>
      <a class="navigation-link ${currentPage === 'teams' ? 'is-active' : ''}" href="${pageUrl('pages/team.html')}">Команды</a>
      <a class="navigation-link ${currentPage === 'favorites' ? 'is-active' : ''}" href="${pageUrl('pages/favorites.html')}">Избранное <span class="favorites-count" data-favorites-count></span></a>
      <button class="navigation-link nav-button" type="button" data-open-support>Поддержка</button>
    </nav><a class="login-link" href="#" data-login>войти</a>
  </div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="site-footer__inner"><span class="footer-note">Молодёжная хоккейная лига</span><a class="footer-link" href="#top">Наверх</a><button class="footer-link nav-button" type="button" data-open-support>Поддержка</button></div></footer>`;
}
function modalShells() {
  return `<div class="modal-backdrop" data-modal="city" hidden><section class="modal" role="dialog" aria-modal="true" aria-labelledby="city-modal-title"><button class="modal-close" type="button" data-close-modal aria-label="Закрыть">×</button><h2 id="city-modal-title">Выберите город</h2><div class="modal-options"><button class="city-option" type="button" data-city="Москва">Москва</button><button class="city-option" type="button" data-city="Санкт-Петербург">Санкт-Петербург</button></div></section></div>
  <div class="modal-backdrop" data-modal="support" hidden><section class="modal support-modal" role="dialog" aria-modal="true" aria-labelledby="support-title"><button class="modal-close" type="button" data-close-modal aria-label="Закрыть">×</button><h2 id="support-title">Поддержка</h2><p>Если у вас возникли вопросы, обратитесь по номеру:</p><a href="tel:+79212222222">+7-921-222-22-22</a><p>или по почте:</p><a href="mailto:support@mhl.ru">support@mhl.ru</a><form class="support-form" data-support-form><label for="support-message">Ваш вопрос</label><textarea id="support-message" name="message" rows="3" required placeholder="Напишите, чем мы можем помочь"></textarea><button class="primary-button" type="submit">Подготовить письмо</button><p class="form-note" data-support-result aria-live="polite"></p></form></section></div>
  <div class="modal-backdrop" data-modal="notice" hidden><section class="modal" role="dialog" aria-modal="true" aria-labelledby="notice-title"><button class="modal-close" type="button" data-close-modal aria-label="Закрыть">×</button><h2 id="notice-title">Готово</h2><p data-notice-text></p><a class="primary-button button-link" href="${pageUrl('pages/favorites.html')}">Перейти в избранное</a></section></div>
  <div class="toast" role="status" aria-live="polite" data-toast></div>`;
}
function matchCard(match) {
  const home = getTeam(match.homeId), away = getTeam(match.awayId);
  const action = match.purchasable
    ? `<a class="action-button action-button--success" href="${pageUrl('pages/matches.html')}" data-buy-match="${match.id}">купить билет</a>`
    : `<span class="action-button ${match.status === 'продано' ? 'action-button--danger' : 'action-button--muted'}">${match.status}</span>`;
  return `<article class="match-card"><div class="team-block">${teamImage(home)}<div class="team-name">${home.name}</div><div class="team-city">${home.city}</div></div><div class="match-summary"><div class="match-time">${match.time}</div><div class="match-date">${match.date}</div><div class="match-city">${match.venue}</div></div><div class="team-block">${teamImage(away)}<div class="team-name">${away.name}</div><div class="team-city">${away.city}</div></div><div class="match-card__action">${action}<button class="secondary-button notification-button" type="button" data-notify-match="${match.id}" aria-label="Показать уведомление о матче ${home.name} — ${away.name}">♧ Уведомить</button></div></article>`;
}
function renderTickets() {
  const host = document.querySelector('[data-match-list]'); if (!host) return;
  const city = localStorage.getItem(STORAGE.city) || '';
  const filtered = matches.filter((match) => !city || match.city === city);
  host.innerHTML = filtered.length ? filtered.map(matchCard).join('') : '<p class="empty-state">На выбранный город матчей пока нет.</p>';
  const cityLabel = document.querySelector('[data-current-city]'); if (cityLabel) cityLabel.textContent = city || 'Все города';
  const cityButton = document.querySelector('[data-open-city]'); if (cityButton) cityButton.setAttribute('aria-label', `Выбрать город. Сейчас: ${city || 'все города'}`);
}
function renderTeams() {
  const host = document.querySelector('[data-team-list]'); if (!host) return;
  const favs = favorites();
  host.innerHTML = teams.filter(t => ['Москва', 'Санкт-Петербург'].includes(t.city)).map(team => `<article class="team-card"><a class="team-card__main" href="team.html?team=${team.id}" data-team-open="${team.id}">${teamImage(team)}<span class="team-card__name">${team.name}</span><span class="team-city">${team.city}</span></a><button class="icon-button favorite-toggle ${favs.includes(team.id) ? 'is-favorite' : ''}" type="button" data-favorite="${team.id}" aria-pressed="${favs.includes(team.id)}" aria-label="${favs.includes(team.id) ? 'Удалить из' : 'Добавить в'} избранное">${favs.includes(team.id) ? '♥' : '♡'}</button></article>`).join('');
}
function renderFavorites() {
  const host = document.querySelector('[data-favorite-list]'); if (!host) return;
  const favs = favorites(); const savedTeams = teams.filter(team => favs.includes(team.id));
  host.innerHTML = savedTeams.length ? savedTeams.map(team => `<article class="favorite-team-card"><div class="favorite-team-card__identity">${teamImage(team)}<div><h2>${team.name}</h2><p>${team.city}</p></div></div><div class="favorite-team-card__actions"><a class="secondary-button" href="${pageUrl('pages/arena.html')}?team=${team.id}">Ближайшие домашние матчи</a><button class="secondary-button secondary-button--danger" type="button" data-remove-favorite="${team.id}">Удалить из избранного</button></div></article>`).join('') : `<div class="empty-state empty-state--large"><h2>ЗДЕСЬ ПОКА ПУСТО</h2><p>Добавьте любимую команду, чтобы быстро находить её матчи.</p><a class="primary-button button-link" href="${pageUrl('pages/team.html')}">Добавить команду</a></div>`;
}
function renderTeamDetails() {
  const host = document.querySelector('[data-team-detail]'); if (!host) return;
  const id = new URLSearchParams(location.search).get('team') || 'dynamo-m'; const team = getTeam(id) || teams[0]; const favs = favorites(); const isFav = favs.includes(team.id);
  host.innerHTML = `<section class="team-detail-hero">${teamImage(team, 'team-detail-logo')}<div><p class="eyebrow">КОМАНДА</p><h1>${team.name}</h1><p>${team.city}</p><button class="primary-button" type="button" data-favorite="${team.id}" aria-pressed="${isFav}">${isFav ? 'Удалить из избранного' : 'Добавить команду в избранное'}</button></div></section><div class="team-detail-grid"><section class="detail-panel"><h2>СОСТАВ</h2><p>Информация о составе команды</p></section><section class="detail-panel"><h2>КАЛЕНДАРЬ</h2><p>Ближайшие матчи команды</p></section><section class="detail-panel"><h2>КОМАНДНАЯ СТАТИСТИКА</h2><p>Статистика команды</p></section><section class="detail-panel"><h2>ЛИЧНАЯ СТАТИСТИКА</h2><p>Статистика игроков</p></section></div><a class="secondary-button" href="${pageUrl('pages/team.html')}">Назад к командам</a>`;
}
function renderSeats() {
  const host = document.querySelector('[data-seat-grid]'); if (!host) return;
  const seat = selectedSeat();
  host.innerHTML = Array.from({ length: 6 }, (_, index) => { const row = 6 - index; return `<div class="seat-row"><span class="seat-row-label">${row} ряд</span><div class="seat-row__seats">${Array.from({ length: 8 }, (_, i) => { const number = i + 1; const price = row >= 5 ? 1000 : row >= 3 ? 1500 : 2000; const isSelected = seat.row === row && seat.seat === number; return `<button class="seat ${isSelected ? 'is-selected' : ''}" type="button" data-seat-row="${row}" data-seat-number="${number}" data-seat-price="${price}" aria-pressed="${isSelected}" title="${row} ряд, место ${number}, ${price} ₽">${number}</button>`; }).join('')}</div></div>`; }).join('');
  const summary = document.querySelector('[data-seat-summary]'); if (summary) summary.textContent = `Выбрано: сектор ${seat.sector}, ряд ${seat.row}, место ${seat.seat} — ${seat.price} ₽`;
}
function renderTicketSummary() {
  const match = selectedMatch(), seat = selectedSeat();
  document.querySelectorAll('[data-ticket-match]').forEach(el => el.textContent = `матч: ${match.home} vs ${match.away}`);
  document.querySelectorAll('[data-ticket-date]').forEach(el => el.textContent = `${match.date}, ${match.time}`);
  document.querySelectorAll('[data-ticket-city]').forEach(el => el.textContent = match.venue);
  document.querySelectorAll('[data-ticket-sector]').forEach(el => el.textContent = seat.sector);
  document.querySelectorAll('[data-ticket-row]').forEach(el => el.textContent = seat.row);
  document.querySelectorAll('[data-ticket-seat]').forEach(el => el.textContent = seat.seat);
  document.querySelectorAll('[data-ticket-price]').forEach(el => el.textContent = `${seat.price} ₽`);
}
function renderHomeMatch() {
  const host = document.querySelector('[data-home-match]'); if (!host) return;
  const teamId = new URLSearchParams(location.search).get('team') || 'dynamo-m';
  const match = matches.find(m => m.homeId === teamId && m.purchasable) || matches[0];
  host.innerHTML = matchCard(match);
}
function updateFavoritesCount() { const count = favorites().length; document.querySelectorAll('[data-favorites-count]').forEach(el => { el.textContent = count ? `(${count})` : ''; }); }
function showToast(message) { const toast = document.querySelector('[data-toast]'); if (!toast) return; toast.textContent = message; toast.classList.add('is-visible'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600); }
function openModal(name) { const modal = document.querySelector(`[data-modal="${name}"]`); if (modal) { modal.hidden = false; document.body.classList.add('modal-open'); const focusable = modal.querySelector('button, a, input, textarea'); focusable?.focus(); } }
function closeModal(modal) { if (!modal) return; modal.hidden = true; if (![...document.querySelectorAll('.modal-backdrop')].some(el => !el.hidden)) document.body.classList.remove('modal-open'); }

// Делегирование событий: один обработчик обслуживает и статические, и созданные JS элементы.
document.addEventListener('click', (event) => {
  const openSupport = event.target.closest('[data-open-support]'); if (openSupport) { openModal('support'); return; }
  const close = event.target.closest('[data-close-modal]'); if (close) { closeModal(close.closest('.modal-backdrop')); return; }
  if (event.target.classList.contains('modal-backdrop')) { closeModal(event.target); return; }
  const cityOpen = event.target.closest('[data-open-city]'); if (cityOpen) { openModal('city'); return; }
  const cityChoice = event.target.closest('[data-city]'); if (cityChoice) { localStorage.setItem(STORAGE.city, cityChoice.dataset.city); closeModal(cityChoice.closest('.modal-backdrop')); renderTickets(); showToast(`Выбран город: ${cityChoice.dataset.city}`); return; }
  const resetCity = event.target.closest('[data-reset-city]'); if (resetCity) { localStorage.removeItem(STORAGE.city); renderTickets(); showToast('Фильтр города сброшен'); return; }
  const favButton = event.target.closest('[data-favorite], [data-remove-favorite]');
  if (favButton) {
    const id = favButton.dataset.favorite || favButton.dataset.removeFavorite; const team = getTeam(id); let favs = favorites();
    if (favs.includes(id)) { favs = favs.filter(item => item !== id); showToast(`Команда «${team?.name || id}» удалена из избранного`); }
    else { favs.push(id); showToast(`Команда «${team?.name || id}» добавлена в избранное`); }
    saveJSON(STORAGE.favorites, favs); renderTeams(); renderFavorites(); renderTeamDetails(); updateFavoritesCount(); return;
  }
  const buy = event.target.closest('[data-buy-match]'); if (buy) { localStorage.setItem(STORAGE.match, buy.dataset.buyMatch); saveJSON(STORAGE.seat, { sector: 1, row: 3, seat: 4, price: 1500 }); }
  const notifyButton = event.target.closest('[data-notify-match]');
  if (notifyButton) {
    const match = getMatch(notifyButton.dataset.notifyMatch);
    if (!match) { showToast('Не удалось найти информацию о матче.'); return; }
    notifyButton.disabled = true;
    notifyButton.textContent = 'Проверяем…';
    notifyAboutMatch(match, asset('mhl-logo.png')).then(result => {
      showToast(result.message);
    }).catch(error => {
      console.error('Неожиданная ошибка Notification API:', error);
      showToast('Уведомление недоступно. Продолжайте пользоваться приложением без него.');
    }).finally(() => {
      notifyButton.disabled = false;
      notifyButton.textContent = '♧ Уведомить';
    });
    return;
  }
  const sector = event.target.closest('[data-sector]'); if (sector) { const seat = selectedSeat(); seat.sector = Number(sector.dataset.sector); saveJSON(STORAGE.seat, seat); renderSeats(); document.querySelectorAll('[data-sector]').forEach(btn => btn.classList.toggle('is-selected', btn === sector)); }
  const seatBtn = event.target.closest('[data-seat-row]'); if (seatBtn) { saveJSON(STORAGE.seat, { sector: 1, row: Number(seatBtn.dataset.seatRow), seat: Number(seatBtn.dataset.seatNumber), price: Number(seatBtn.dataset.seatPrice) }); renderSeats(); renderTicketSummary(); }
  const goPayment = event.target.closest('[data-go-payment]'); if (goPayment) { location.href = pageUrl('pages/search.html'); }
  const goSeats = event.target.closest('[data-back-seats]'); if (goSeats) { location.href = pageUrl('pages/matches.html'); }
  const login = event.target.closest('[data-login]'); if (login) { event.preventDefault(); showToast('Авторизация не входит в это задание.'); }
});

document.addEventListener('submit', (event) => {
  const paymentForm = event.target.closest('[data-payment-form]');
  if (paymentForm) {
    event.preventDefault(); if (!paymentForm.reportValidity()) return;
    const card = paymentForm.elements.cardNumber.value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(card)) { paymentForm.elements.cardNumber.setCustomValidity('Введите 16 цифр номера карты'); paymentForm.reportValidity(); paymentForm.elements.cardNumber.setCustomValidity(''); return; }
    const backdrop = document.querySelector('[data-modal="payment-success"]'); if (backdrop) { backdrop.hidden = false; document.body.classList.add('modal-open'); }
    paymentForm.reset(); return;
  }
  const supportForm = event.target.closest('[data-support-form]');
  if (supportForm) { event.preventDefault(); const message = supportForm.elements.message.value.trim(); const result = supportForm.querySelector('[data-support-result]'); if (result) result.textContent = `Ваше обращение подготовлено. Напишите нам: support@mhl.ru. Текст: «${message}»`; }
});

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-card-number]')) { const digits = event.target.value.replace(/\D/g, '').slice(0, 16); event.target.value = digits.replace(/(.{4})/g, '$1 ').trim(); }
  if (event.target.matches('[data-card-expiry]')) { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; }
  if (event.target.matches('[data-card-cvv]')) event.target.value = event.target.value.replace(/\D/g, '').slice(0, 3);
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(closeModal); });

// Первичная отрисовка динамических списков и данных заказа.
function init() {
  document.querySelectorAll('[data-app-header]').forEach(el => el.innerHTML = header());
  document.querySelectorAll('[data-app-footer]').forEach(el => el.innerHTML = footer());
  document.querySelectorAll('[data-app-modals]').forEach(el => el.innerHTML = modalShells());
  renderTickets(); renderTeams(); renderFavorites(); renderTeamDetails(); renderSeats(); renderTicketSummary(); renderHomeMatch(); updateFavoritesCount();
  if (currentPage === 'teams') { const isDetail = new URLSearchParams(location.search).has('team'); const list = document.querySelector('[data-team-list]'); const detail = document.querySelector('[data-team-detail]'); if (list) list.hidden = isDetail; if (detail) detail.hidden = !isDetail; }
  document.querySelectorAll('[data-sector]').forEach(btn => btn.classList.toggle('is-selected', Number(btn.dataset.sector) === selectedSeat().sector));
}
init();
