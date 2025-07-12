
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Check } from 'lucide-react';
import { Materia } from '@/types/database';

interface InasistenciaInfo {
  valor: number;
  tipo: string;
  color: string;
}

interface RegistroGeneralCellProps {
  alumnoId: string;
  fecha: string;
  inasistencia: InasistenciaInfo;
  materias: Materia[];
  cursoId: string;
}

export const RegistroGeneralCell = ({ 
  alumnoId, 
  fecha, 
  inasistencia, 
  materias, 
  cursoId 
}: RegistroGeneralCellProps) => {
  
  const renderContent = () => {
    switch (inasistencia.tipo) {
      case 'vacio':
        return <span className="text-gray-300">-</span>;
      case 'presente-todo':
        return <Check className="h-4 w-4 text-green-600 mx-auto" />;
      case 'ausente-clase':
        return <span className="text-red-600 font-bold text-sm">C</span>;
      case 'ausente-taller':
        return <span className="text-red-600 font-bold text-sm">T</span>;
      case 'ausente-ef':
        return <span className="text-red-600 font-bold text-xs">EF</span>;
      case 'ausente-todo':
        return <span className="text-red-600 font-bold text-sm">A</span>;
      case 'ausente-clases':
        return <span className="text-red-600 font-bold text-xs">C+T</span>;
      default:
        return <span className="text-red-600 font-bold text-sm">A</span>;
    }
  };

  const getBackgroundColor = () => {
    if (inasistencia.tipo === 'vacio') {
      return 'bg-gray-50 hover:bg-gray-100';
    }
    if (inasistencia.tipo === 'presente-todo') {
      return 'bg-green-50 hover:bg-green-100';
    }
    return 'bg-red-50 hover:bg-red-100';
  };

  const getTooltipText = () => {
    switch (inasistencia.tipo) {
      case 'vacio':
        return 'Sin datos de asistencia registrados o todas las materias marcadas como "Sin Clase"';
      case 'presente-todo':
        return 'Presente en todas las materias con clase';
      case 'ausente-clase':
        return 'Ausente en Clase (0.5 inasistencias)';
      case 'ausente-taller':
        return 'Ausente en Taller (0.5 inasistencias)';
      case 'ausente-ef':
        return 'Ausente en Educación Física (0.25 inasistencias)';
      case 'ausente-todo':
        return 'Ausente en todo (1 inasistencia)';
      case 'ausente-clases':
        return 'Ausente en Clase y Taller (1 inasistencia)';
      default:
        return `${inasistencia.valor} inasistencias`;
    }
  };

  return (
    <TableCell 
      className={`text-center cursor-pointer transition-colors ${getBackgroundColor()}`}
      title={getTooltipText()}
    >
      {renderContent()}
    </TableCell>
  );
};
