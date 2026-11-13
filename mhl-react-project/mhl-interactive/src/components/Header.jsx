import React from 'react';
export default function Header({ page, favoritesCount, onSupport }) {
 return <header className="site-header"><div className="site-header__inner">
  <a className="brand" href="/" aria-label="МХЛ — главная"><img className="site-logo" src="/assets/images/mhl-logo.png" alt="МХЛ"/></a>
  <nav className="main-navigation" aria-label="Основная навигация">
   <a className={`navigation-link ${page==='tickets'?'is-active':''}`} href="/">Билеты</a>
   <a className={`navigation-link ${page==='teams'?'is-active':''}`} href="/teams">Команды</a>
   <a className={`navigation-link ${page==='favorites'?'is-active':''}`} href="/favorites">Избранное <span className="favorites-count">{favoritesCount ? `(${favoritesCount})` : ''}</span></a>
   <button className="navigation-link nav-button" onClick={onSupport}>Поддержка</button>
  </nav><a className="login-link" href="#login" onClick={e=>{e.preventDefault(); alert('Авторизация не входит в это задание.')}}>войти</a>
 </div></header>
}
