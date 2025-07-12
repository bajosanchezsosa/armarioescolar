
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alumno, Materia } from '@/types/database';
import { DiaSinClase } from '@/hooks/useDiasSinClase';
import { calcularInasistenciasDia, calcularTotalPeriodo } from '@/utils/asistenciaCalculations';
import { RegistroGeneralCell } from './RegistroGeneralCell';
import { useQueryClient } from '@tanstack/react-query';

interface RegistroGeneralTableRowProps {
  alumno: Alumno;
  allDaysInMonth: Date[];
  workingDays: Date[];
  diasSinClase: DiaSinClase[];
  materias: Materia[];
  cursoId: string;
  registroData: Record<string, any[]>;
  registroAnualData: Record<string, any[]>;
}

export const RegistroGeneralTableRow = ({ 
  alumno, 
  allDaysInMonth, 
  workingDays, 
  diasSinClase, 
  materias, 
  cursoId, 
  registroData,
  registroAnualData 
}: RegistroGeneralTableRowProps) => {
  const queryClient = useQueryClient();
  
  const getDiaSinClaseForDate = (date: Date) => {
    return diasSinClase.find(d => d.fecha === format(date, 'yyyy-MM-dd'));
  };

  const handleRefreshCache = () => {
    console.log('Forzando invalidación de cache...');
    queryClient.invalidateQueries({ queryKey: ['registro-general'] });
    queryClient.invalidateQueries({ queryKey: ['registro-anual'] });
    queryClient.invalidateQueries({ queryKey: ['asistencias'] });
  };

  const totalMensual = calcularTotalPeriodo(
    alumno.id,
    workingDays.map(d => format(d, 'yyyy-MM-dd')),
    registroData,
    materias
  );

  const totalAnual = calcularTotalPeriodo(
    alumno.id,
    Object.keys(registroAnualData),
    registroAnualData,
    materias
  );

  return (
    <TableRow key={alumno.id}>
      <TableCell className="sticky left-0 bg-white border-r-2 border-gray-200 z-10 font-medium">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>{alumno.apellido}, {alumno.nombre}</span>
            <button 
              onClick={handleRefreshCache}
              className="p-1 hover:bg-gray-100 rounded"
              title="Refrescar cache"
            >
              <RefreshCw className="h-3 w-3 text-gray-500" />
            </button>
          </div>
          <span className="text-xs text-gray-500">Grupo {alumno.grupo_taller}</span>
        </div>
      </TableCell>
      {allDaysInMonth.map((day) => {
        const fecha = format(day, 'yyyy-MM-dd');
        const diaSinClase = getDiaSinClaseForDate(day);
        const isWorkingDay = workingDays.some(wd => format(wd, 'yyyy-MM-dd') === fecha);
        
        if (diaSinClase) {
          return (
            <TableCell key={`${alumno.id}-${fecha}`} className="text-center bg-red-100 border-red-200">
              <div className="flex flex-col items-center gap-1">
                <X className="h-4 w-4 text-red-600" />
                <span className="text-xs text-red-700 font-bold">SIN CLASE</span>
              </div>
            </TableCell>
          );
        }
        
        if (!isWorkingDay) {
          return (
            <TableCell key={`${alumno.id}-${fecha}`} className="text-center bg-gray-50">
              <span className="text-gray-400">-</span>
            </TableCell>
          );
        }
        
        const inasistencia = calcularInasistenciasDia(alumno.id, fecha, registroData, materias);
        
        return (
          <RegistroGeneralCell
            key={`${alumno.id}-${fecha}`}
            alumnoId={alumno.id}
            fecha={fecha}
            inasistencia={inasistencia}
            materias={materias}
            cursoId={cursoId}
          />
        );
      })}
      <TableCell className="text-center font-bold bg-blue-50">
        {totalMensual.toFixed(totalMensual % 1 === 0 ? 0 : 2)}
      </TableCell>
      <TableCell className="text-center font-bold bg-gray-50">
        {totalAnual.toFixed(totalAnual % 1 === 0 ? 0 : 2)}
      </TableCell>
    </TableRow>
  );
};
