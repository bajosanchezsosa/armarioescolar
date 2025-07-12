
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DiaSinClase } from '@/hooks/useDiasSinClase';

interface RegistroGeneralTableHeaderProps {
  allDaysInMonth: Date[];
  diasSinClase: DiaSinClase[];
  onDayClick: (day: Date) => void;
}

export const RegistroGeneralTableHeader = ({ allDaysInMonth, diasSinClase, onDayClick }: RegistroGeneralTableHeaderProps) => {
  const getDiaSinClaseForDate = (date: Date) => {
    return diasSinClase.find(d => d.fecha === format(date, 'yyyy-MM-dd'));
  };

  return (
    <>
      <TableHead className="sticky left-0 bg-white border-r-2 border-gray-200 z-10 min-w-[200px]">
        Alumno
      </TableHead>
      {allDaysInMonth.map((day) => {
        const diaSinClase = getDiaSinClaseForDate(day);
        
        return (
          <TableHead 
            key={day.toISOString()} 
            className={`text-center min-w-[60px] text-xs relative p-2 ${
              diaSinClase ? 'bg-red-100 border-red-200' : ''
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-1">
                <div className="text-center">
                  <div className={`font-semibold ${diaSinClase ? 'text-red-700' : ''}`}>
                    {format(day, 'dd', { locale: es })}
                  </div>
                  <div className={`text-xs ${diaSinClase ? 'text-red-600' : 'text-gray-500'}`}>
                    {format(day, 'EEE', { locale: es })}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 hover:scale-110 transition-transform ${
                    diaSinClase 
                      ? 'text-red-600 hover:bg-red-200' 
                      : 'text-gray-400 hover:bg-blue-100 hover:text-blue-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDayClick(day);
                  }}
                  title={diaSinClase ? `Sin clase: ${diaSinClase.motivo}. Click para modificar.` : "Marcar día sin clase"}
                >
                  {diaSinClase ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {diaSinClase && (
                <div className="text-xs text-red-700 font-medium truncate max-w-[50px]" title={diaSinClase.motivo}>
                  {diaSinClase.motivo.substring(0, 8)}...
                </div>
              )}
            </div>
          </TableHead>
        );
      })}
      <TableHead className="text-center bg-blue-50 font-bold min-w-[80px]">
        Total Mes
      </TableHead>
      <TableHead className="text-center bg-gray-50 font-bold min-w-[80px]">
        Total Año
      </TableHead>
    </>
  );
};
