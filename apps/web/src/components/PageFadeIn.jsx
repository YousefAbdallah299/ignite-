import { useEffect, useState, cloneElement, isValidElement } from "react";

export default function PageFadeIn({ children, className = "" }) {
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Force page animation with JavaScript
    const timer1 = setTimeout(() => setIsPageVisible(true), 30);
    const timer2 = setTimeout(() => setIsContentVisible(true), 150);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Separate Header from other children
  const separateChildren = () => {
    if (!Array.isArray(children)) {
      children = [children];
    }
    
    let header = null;
    let otherChildren = [];
    
    children.forEach(child => {
      if (isValidElement(child) && child.type?.name === 'Header') {
        header = child;
      } else {
        otherChildren.push(child);
      }
    });
    
    return { header, otherChildren };
  };

  const { header, otherChildren } = separateChildren();

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Render Header without any animation */}
      {header}
      
      {/* Wrap other content with fade-in animation */}
      <div 
        style={{
          opacity: isContentVisible ? 1 : 0,
          transform: isContentVisible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 800ms ease-out, transform 800ms ease-out'
        }}
      >
        {otherChildren}
      </div>
    </div>
  );
}
