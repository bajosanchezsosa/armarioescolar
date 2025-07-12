
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceButtonGroup } from './AttendanceButtonGroup';
import { Alumno, EstadoAsistencia } from '@/types/database';

interface MobileAttendanceCardProps {
  alumno: Alumno;
  estado: EstadoAsistencia;
  onEstadoChange: (estado: EstadoAsistencia) => void;
  disabled?: boolean;
}

export const MobileAttendanceCard = ({ 
  alumno, 
  estado, 
  onEstadoChange, 
  disabled = false 
}: MobileAttendanceCardProps) => {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-medium text-base">
              {alumno.apellido}, {alumno.nombre}
            </p>
            {alumno.grupo_taller && (
              <Badge variant="outline" className="mt-1">
                Grupo {alumno.grupo_taller}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <AttendanceButtonGroup
            currentState={estado}
            onStateChange={onEstadoChange}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};
