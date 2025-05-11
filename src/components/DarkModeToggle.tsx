
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle = ({ className }: DarkModeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Toggle
      aria-label="Toggle dark mode"
      className={cn("hover:bg-transparent", className)}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Toggle>
  );
};

export default DarkModeToggle;
