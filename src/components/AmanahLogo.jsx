import React from "react";

export default function AmanahLogo({ className = "", size = "md", showText = true, textClassName = "" }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-24 h-24",
  };

  const currentSize = sizeMap[size] || size;

  return (
    <div className={`flex items-center gap-2.5 inline-flex ${className}`}>
      <div className={`relative ${currentSize} shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform duration-200 hover:scale-105`}>
        <img 
          src="/logo.svg" 
          alt="Amanah Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <span className={`font-heading font-bold text-foreground tracking-tight ${textClassName || "text-xl"}`}>
          Amanah
        </span>
      )}
    </div>
  );
}
