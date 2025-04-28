import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const backToTopRef = useRef(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollThreshold = Math.min(200, window.innerHeight * 0.2);
      if (window.pageYOffset > scrollThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const adjustPosition = () => {
      if (!backToTopRef.current) return;
      const footer = document.querySelector('footer');
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;
        if (footerTop < viewportHeight) {
          const distanceFromFooter = viewportHeight - footerTop;
          backToTopRef.current.style.bottom = `${distanceFromFooter + 20}px`;
        } else {
          backToTopRef.current.style.bottom = '20px';
        }
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('scroll', adjustPosition);
    window.addEventListener('resize', adjustPosition);
    toggleVisibility();
    adjustPosition();
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('scroll', adjustPosition);
      window.removeEventListener('resize', adjustPosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isHomePage) return null;

  return (
    <div 
      className="custom_back-to-top" 
      data-module="ds-back-to-top" 
      ref={backToTopRef}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 100,
        display: isVisible ? 'block' : 'none'
      }}
    >
      <a
        href="#page-top"
        className="custom_back-to-top__button"
        onClick={(e) => {
          e.preventDefault();
          scrollToTop();
        }}
        style={{
          textDecoration: 'underline',
          fontWeight: 'bold'
        }}
      >
        Back to top
        <svg 
          className="ds_icon custom_back-to-top__icon" 
          aria-hidden="true" 
          role="img" 
          xmlns="http://www.w3.org/2000/svg" 
          height="24px" 
          viewBox="0 0 24 24" 
          width="24px"
        >
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
        </svg>
      </a>
    </div>
  );
};

export default BackToTop;