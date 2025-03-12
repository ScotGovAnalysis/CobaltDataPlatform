import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Initial check
    toggleVisibility();
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Don't render on home page
  if (isHomePage) return null;

  return (
    <div className="ds_back-to-top" data-module="ds-back-to-top">
      {isVisible && (
        <a 
          href="#page-top" 
          className="ds_back-to-top__button"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
        >
          Back to top
          <svg className="ds_icon ds_back-to-top__icon" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
  <path d="M0 0h24v24H0V0z" fill="none"/>
  <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
</svg>

        </a>
      )}
    </div>
  );
};

export default BackToTop;

