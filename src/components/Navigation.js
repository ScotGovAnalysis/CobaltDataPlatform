import React from 'react';

const navItems = [
  { href: '/home', label: 'Home' },
  { href: '/datasets', label: 'Datasets' },
  { href: '/organisations', label: 'Organisations' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/help', label: 'Help' }
];

const Navigation = () => {
  return (
    <nav className="ds_site-navigation">
      <ul className="ds_site-navigation__list">
        {navItems.map((item, index) => (
          <li key={index} className="ds_site-navigation__item">
            <a href={item.href} className="ds_site-navigation__link">
              <span className="label-nav">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
