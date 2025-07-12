import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Save } from 'lucide-react';

interface RegistroManualHeaderProps {
  periodoNombre: string;
  isLoading: boolean;
  onSave: () => void;
}

export const RegistroManualHeader = ({ periodoNombre, isLoading, onSave }: RegistroManualHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Registro Manual - {periodoNombre}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Vista estilo Excel para carga masiva de notas
          </p>
        </div>
        <Button onClick={onSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </CardHeader>
  );
};