
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAlumnos } from '@/hooks/useAlumnos';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useDiasSinClase } from '@/hooks/useDiasSinClase';
import { RegistroGeneralTable } from './RegistroGeneralTable';
import { DiaSinClaseDialog } from './DiaSinClaseDialog';

interface RegistroGeneralViewProps {
  cursoId: string;
}

const getBuenosAiresDate = () => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
};

export const RegistroGeneralView = ({ cursoId }: RegistroGeneralViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(getBuenosAiresDate());
  const [selectedYear, setSelectedYear] = useState<number>(getBuenosAiresDate().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(getBuenosAiresDate().getMonth());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: alumnos = [], isLoading: alumnosLoading } = useAlumnos(cursoId);
  const { data: materias = [], isLoading: materiasLoading } = useMaterias(cursoId);
  const { data: diasSinClase = [] } = useDiasSinClase(cursoId);

  // Calcular días hábiles del mes seleccionado
  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const diasSinClaseFechas = new Set(diasSinClase.map(d => d.fecha));
  const workingDays = allDays.filter(day => !isWeekend(day) && !diasSinClaseFechas.has(format(day, 'yyyy-MM-dd')));

  const handlePreviousMonth = () => {
    const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleNextMonth = () => {
    const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(parseInt(month));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setDialogOpen(true);
  };

  const getDiaSinClaseForDate = (date: Date) => {
    return diasSinClase.find(d => d.fecha === format(date, 'yyyy-MM-dd'));
  };

  const currentYear = getBuenosAiresDate().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (alumnosLoading || materiasLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Registro del mes de {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="ml-4">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RegistroGeneralTable
            alumnos={alumnos.filter(a => a.activo)}
            materias={materias}
            workingDays={workingDays}
            cursoId={cursoId}
            diasSinClase={diasSinClase}
            onDayClick={handleDayClick}
          />
        </CardContent>
      </Card>

      {selectedDay && (
        <DiaSinClaseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          day={selectedDay}
          cursoId={cursoId}
          diaSinClase={getDiaSinClaseForDate(selectedDay)}
        />
      )}
    </div>
  );
};
