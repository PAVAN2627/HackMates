import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  lines: string[];
  delay?: number;
  lineDelay?: number;
  className?: string;
}

export function TypewriterText({ lines, delay = 100, lineDelay = 800, className = '' }: TypewriterTextProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        const timeout = setTimeout(() => {
          setDisplayLines(prev => {
            const newLines = [...prev];
            if (!newLines[currentLineIndex]) {
              newLines[currentLineIndex] = '';
            }
            newLines[currentLineIndex] += currentLine[currentCharIndex];
            return newLines;
          });
          setCurrentCharIndex(prev => prev + 1);
        }, delay + Math.random() * 50); // Add slight randomness for more natural feel

        return () => clearTimeout(timeout);
      } else {
        // Current line is complete, move to next line after delay
        const timeout = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, lineDelay);

        return () => clearTimeout(timeout);
      }
    } else {
      // Animation complete, hide cursor after a delay
      const timeout = setTimeout(() => {
        setShowCursor(false);
      }, 2000);
      setIsComplete(true);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, lines, delay, lineDelay]);

  return (
    <div className={className}>
      {displayLines.map((line, index) => (
        <div 
          key={index} 
          className={`${index === 1 ? "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent" : ""} ${
            index <= currentLineIndex ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        >
          {line}
          {index === currentLineIndex && showCursor && (
            <span className="animate-pulse text-purple-500 ml-1">|</span>
          )}
        </div>
      ))}
    </div>
  );
}