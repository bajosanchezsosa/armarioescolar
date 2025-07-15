
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3, Calendar } from 'lucide-react';
import RegistroGeneral from '../registro-general/RegistroGeneral';

interface RegistroGeneralTabProps {
  cursoId: string;
}

export const RegistroGeneralTab = ({ cursoId }: RegistroGeneralTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-indigo-600" />
            Registro General de Asistencias
          </h2>
          <p className="text-gray-600">
            Vista mensual completa con resumen de inasistencias por alumno
          </p>
        </div>
      </div>
      <RegistroGeneral cursoId={cursoId} />
    </div>
  );
};
