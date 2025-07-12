
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Materia } from '@/types/database';

interface AsistenciaFormHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMateria: string;
  setSelectedMateria: (materia: string) => void;
  materias: Materia[];
}

export const AsistenciaFormHeader = ({
  selectedDate,
  setSelectedDate,
  selectedMateria,
  setSelectedMateria,
  materias
}: AsistenciaFormHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Fecha</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Materia</label>
        <Select value={selectedMateria} onValueChange={setSelectedMateria}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar materia" />
          </SelectTrigger>
          <SelectContent>
            {materias.map((materia) => (
              <SelectItem key={materia.id} value={materia.id}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{materia.nombre}</span>
                  <Badge variant="outline">{materia.tipo}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
