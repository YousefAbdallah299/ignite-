import React, { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({ 
  children, 
  className = '', 
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  delay = 0
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add delay if specified
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          // Once visible, stop observing to improve performance
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: threshold, // Configurable threshold
        rootMargin: rootMargin // Configurable root margin
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, delay]);

  return (
    <div
      ref={elementRef}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 800ms ease-out, transform 800ms ease-out'
      }}
    >
      {children}
    </div>
  );
}
