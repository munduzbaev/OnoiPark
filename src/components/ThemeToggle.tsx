import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../utils/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}
