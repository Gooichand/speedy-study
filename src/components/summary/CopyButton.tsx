
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  section: string;
  isActive: boolean;
  onCopy: (text: string, section: string) => void;
  colorClass: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  section, 
  isActive, 
  onCopy, 
  colorClass 
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onCopy(text, section)}
      className={`bg-slate-800/50 ${colorClass} transform hover:scale-105 transition-all duration-200`}
    >
      {isActive ? (
        <Check size={16} className="mr-2" />
      ) : (
        <Copy size={16} className="mr-2" />
      )}
      Copy
    </Button>
  );
};

export default CopyButton;
