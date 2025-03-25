import React from 'react';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/datasets', label: 'Datasets' },
  { href: '/organisations', label: 'Organisations' },
  { href: '/themes', label: 'Themes' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/help', label: 'Help' }
];

const Navigation = ({ currentPath }) => {
  return (
    <nav className="ds_site-navigation">
      <ul className="ds_site-navigation__list">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.href || (item.href === '/datasets' && currentPath.startsWith('/dataset'));
          return (
            <li key={index} className="ds_site-navigation__item">
              <a
                href={item.href}
                className={`ds_site-navigation__link ${isActive ? 'ds_current' : ''}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className="label-nav">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
