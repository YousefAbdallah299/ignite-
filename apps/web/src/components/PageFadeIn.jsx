import { useEffect, useState } from "react";

export default function PageFadeIn({ children, className = "" }) {
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // Force page animation with JavaScript
    const timer1 = setTimeout(() => setIsPageVisible(true), 30);
    const timer2 = setTimeout(() => setIsContentVisible(true), 150);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div 
      className={`min-h-screen bg-white ${className}`}
      style={{
        opacity: isPageVisible ? 1 : 0,
        transform: isPageVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 800ms ease-out, transform 800ms ease-out'
      }}
    >
      <div 
        style={{
          opacity: isContentVisible ? 1 : 0,
          transform: isContentVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 800ms ease-out, transform 800ms ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
