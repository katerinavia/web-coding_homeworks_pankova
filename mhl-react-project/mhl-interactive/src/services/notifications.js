/** Notification API integration without direct DOM manipulation. */
export async function notifyAboutMatch(match) {
  if (!('Notification' in window)) return { ok:false, message:'Этот браузер не поддерживает уведомления.' };
  if (!window.isSecureContext) return { ok:false, message:'Уведомления доступны только на HTTPS или localhost.' };
  try {
    let permission=Notification.permission;
    if(permission==='default') permission=await Notification.requestPermission();
    if(permission==='denied') return {ok:false,message:'Уведомления запрещены в настройках браузера.'};
    if(permission!=='granted') return {ok:false,message:'Разрешение на уведомления не получено.'};
    new Notification(`${match.home} — ${match.away}`,{body:`${match.date}, ${match.time}. ${match.venue}`,icon:'/assets/images/mhl-logo.png',tag:`mhl-${match.id}`});
    return {ok:true,message:'Уведомление о матче показано.'};
  } catch { return {ok:false,message:'Не удалось показать уведомление. Проверьте настройки браузера.'}; }
}
