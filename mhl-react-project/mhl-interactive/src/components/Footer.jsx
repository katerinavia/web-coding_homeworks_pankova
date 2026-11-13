import React from 'react';
export default function Footer({onSupport}) { return <footer className="site-footer"><div className="site-footer__inner"><span className="footer-note">Молодёжная хоккейная лига</span><a className="footer-link" href="#top">Наверх</a><button className="footer-link nav-button" onClick={onSupport}>Поддержка</button></div></footer>; }
