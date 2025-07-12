
import React from 'react';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Alumno, Materia } from '@/types/database';
import { DiaSinClase } from '@/hooks/useDiasSinClase';
import { useRegistroGeneralData } from '../../../hooks/useRegistroGeneral';
import { useRegistroAnualData } from '../../../hooks/useRegistroAnual';
import { RegistroGeneralTableHeader } from './RegistroGeneralTableHeader';
import { RegistroGeneralTableRow } from './RegistroGeneralTableRow';

interface RegistroGeneralTableProps {
  alumnos: Alumno[];
  materias: Materia[];
  workingDays: Date[];
  cursoId: string;
  diasSinClase: DiaSinClase[];
  onDayClick: (day: Date) => void;
}

export const RegistroGeneralTable = ({ 
  alumnos, 
  materias, 
  workingDays, 
  cursoId, 
  diasSinClase, 
  onDayClick 
}: RegistroGeneralTableProps) => {
  const { data: registroData = {} } = useRegistroGeneralData(cursoId, workingDays);
  
  const year = workingDays.length > 0 ? workingDays[0].getFullYear() : new Date().getFullYear();
  const { data: registroAnualData = {} } = useRegistroAnualData(cursoId, year);

  // Obtener todos los días del mes (excluyendo fines de semana)
  const monthStart = workingDays.length > 0 ? new Date(workingDays[0].getFullYear(), workingDays[0].getMonth(), 1) : new Date();
  const monthEnd = workingDays.length > 0 ? new Date(workingDays[0].getFullYear(), workingDays[0].getMonth() + 1, 0) : new Date();
  const allDaysInMonth: Date[] = [];
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      allDaysInMonth.push(new Date(d));
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <RegistroGeneralTableHeader
              allDaysInMonth={allDaysInMonth}
              diasSinClase={diasSinClase}
              onDayClick={onDayClick}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {alumnos.map((alumno) => (
            <RegistroGeneralTableRow
              key={alumno.id}
              alumno={alumno}
              allDaysInMonth={allDaysInMonth}
              workingDays={workingDays}
              diasSinClase={diasSinClase}
              materias={materias}
              cursoId={cursoId}
              registroData={registroData}
              registroAnualData={registroAnualData}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
