import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { to: '/datasets', label: 'Datasets' },
  { to: '/organisations', label: 'Organisations' },
  { to: '/themes', label: 'Themes' },
  { to: '/about', label: 'About' },
  { to: '/help', label: 'Help' },
];

const Navigation = ({ currentPath }) => {
  return (
    <nav className="ds_site-navigation">
      <ul className="ds_site-navigation__list">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.to || (item.to === '/datasets' && currentPath.startsWith('/dataset'));
          return (
            <li key={index} className="ds_site-navigation__item">
              <Link
                to={item.to}
                className={`ds_site-navigation__link ${isActive ? 'ds_current' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="label-nav">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;