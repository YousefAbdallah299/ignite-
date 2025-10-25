import { useEffect, isValidElement } from "react";

export default function PageFadeIn({ children, className = "" }) {
  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
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
      
      {/* Render other content */}
      <div>
        {otherChildren}
      </div>
    </div>
  );
}
