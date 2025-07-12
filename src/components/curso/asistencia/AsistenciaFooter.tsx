
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AsistenciaFooterProps {
  onSave: () => void;
  isSaving: boolean;
  asistenciasLog: any[];
}

export const AsistenciaFooter = ({ onSave, isSaving, asistenciasLog }: AsistenciaFooterProps) => {
  return (
    <div className="flex justify-between items-end">
      <div className="text-xs text-gray-500 space-y-1 max-w-md">
        {asistenciasLog.length > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Última actualización: {asistenciasLog[0].user_nombre} -{' '}
              {format(new Date(asistenciasLog[0].created_at), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        )}
        {asistenciasLog.length > 1 && (
          <div className="text-xs text-gray-400">
            {asistenciasLog.length - 1} actualización{asistenciasLog.length > 2 ? 'es' : ''} anterior{asistenciasLog.length > 2 ? 'es' : ''}
          </div>
        )}
      </div>
      
      <Button 
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Guardando...' : 'Guardar Asistencias'}
      </Button>
    </div>
  );
};
