
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { AsistenciaFormHeader } from './AsistenciaFormHeader';
import { Materia } from '@/types/database';

interface AsistenciaHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMateria: string;
  setSelectedMateria: (materia: string) => void;
  materias: Materia[];
}

export const AsistenciaHeader = ({
  selectedDate,
  setSelectedDate,
  selectedMateria,
  setSelectedMateria,
  materias
}: AsistenciaHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Registro de Asistencia por Materia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AsistenciaFormHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMateria={selectedMateria}
          setSelectedMateria={setSelectedMateria}
          materias={materias}
        />
      </CardContent>
    </Card>
  );
};
