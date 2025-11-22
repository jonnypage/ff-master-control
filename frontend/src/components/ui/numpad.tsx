import { Button } from './button';
import { Delete, X } from 'lucide-react';

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function Numpad({ value, onChange, onClear }: NumpadProps) {
  const handleNumberClick = (num: string) => {
    const currentValue = value || '0';
    if (currentValue === '0') {
      onChange(num);
    } else {
      onChange(currentValue + num);
    }
  };

  const handleBackspace = () => {
    const currentValue = value || '0';
    if (currentValue.length > 1) {
      onChange(currentValue.slice(0, -1));
    } else {
      onChange('0');
    }
  };

  const handleClear = () => {
    onChange('0');
    onClear?.();
  };

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="bg-muted rounded-lg p-4 text-right">
        <div className="text-3xl font-bold text-foreground tabular-nums">
          {parseInt(value || '0', 10).toLocaleString()}
        </div>
      </div>

      {/* Numpad Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Row 1 */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('7')}
        >
          7
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('8')}
        >
          8
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('9')}
        >
          9
        </Button>

        {/* Row 2 */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('4')}
        >
          4
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('5')}
        >
          5
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('6')}
        >
          6
        </Button>

        {/* Row 3 */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('1')}
        >
          1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('2')}
        >
          2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('3')}
        >
          3
        </Button>

        {/* Row 4 */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={handleClear}
        >
          <X className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={() => handleNumberClick('0')}
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-16 text-xl font-semibold"
          onClick={handleBackspace}
        >
          <Delete className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

