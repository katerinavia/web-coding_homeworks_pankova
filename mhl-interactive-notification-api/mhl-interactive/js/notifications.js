/** Работа с браузерным Notification API. Все ошибки возвращаются вызывающему коду. */
export async function notifyAboutMatch(match, iconUrl = '') {
  if (!('Notification' in window)) {
    return { ok: false, message: 'Этот браузер не поддерживает уведомления. Попробуйте открыть проект в актуальном Chrome, Edge или Firefox.' };
  }

  // Уведомления работают только в защищённом контексте: HTTPS или localhost.
  if (!window.isSecureContext) {
    return { ok: false, message: 'Уведомления доступны только через HTTPS или localhost. Запустите проект через Live Server.' };
  }

  try {
    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();

    if (permission === 'denied') {
      return { ok: false, message: 'Уведомления заблокированы в настройках браузера. Разрешите их для этого сайта и попробуйте снова.' };
    }
    if (permission !== 'granted') {
      return { ok: false, message: 'Разрешение на уведомления не получено. Вы можете продолжить пользоваться списком матчей без них.' };
    }

    const notification = new Notification('МХЛ — информация о матче', {
      body: `${match.home} — ${match.away}\n${match.date}, ${match.time}\n${match.venue}`,
      ...(iconUrl ? { icon: iconUrl } : {}),
      tag: `mhl-match-${match.id}`,
      renotify: false
    });
    notification.addEventListener('click', () => {
      window.focus();
      notification.close();
    });
    notification.addEventListener('error', () => {});
    return { ok: true, message: 'Браузерное уведомление отправлено.' };
  } catch (error) {
    console.error('Notification API error:', error);
    return { ok: false, message: 'Не удалось показать уведомление. Проверьте разрешения браузера и попробуйте ещё раз.' };
  }
}
