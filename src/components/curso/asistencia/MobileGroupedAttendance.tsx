
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MobileAttendanceCard } from './MobileAttendanceCard';
import { Alumno, EstadoAsistencia, GrupoTaller } from '@/types/database';

interface MobileGroupedAttendanceProps {
  alumnos: Alumno[];
  asistencias: Record<string, EstadoAsistencia>;
  onEstadoChange: (alumnoId: string, estado: EstadoAsistencia) => void;
  grupo: GrupoTaller;
  sinClase?: boolean;
  onSinClaseChange?: (grupo: GrupoTaller, sinClase: boolean) => void;
  sinClaseGrupos?: Record<string, boolean>;
}

export const MobileGroupedAttendance = ({ 
  alumnos, 
  asistencias, 
  onEstadoChange, 
  grupo,
  sinClase = false,
  onSinClaseChange,
  sinClaseGrupos = {}
}: MobileGroupedAttendanceProps) => {
  // Filtrar alumnos por grupo si se especifica
  const alumnosFiltrados = grupo === 'todos' 
    ? alumnos
    : alumnos.filter(alumno => alumno.grupo_taller === grupo);

  if (alumnosFiltrados.length === 0) {
    return null;
  }

  const title = grupo === 'todos' ? 'Todo el curso' : `Grupo ${grupo}`;
  const sinClaseGrupo = grupo === 'todos' ? sinClase : (sinClaseGrupos[grupo as string] || false);

  const handleSinClaseToggle = () => {
    if (onSinClaseChange && grupo !== 'todos') {
      onSinClaseChange(grupo, !sinClaseGrupo);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-gray-600">
              {alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          {grupo !== 'todos' && onSinClaseChange && (
            <div className="flex items-center space-x-2">
              <Switch
                id={`sin-clase-${grupo}`}
                checked={sinClaseGrupo}
                onCheckedChange={handleSinClaseToggle}
              />
              <Label htmlFor={`sin-clase-${grupo}`} className="text-sm">
                Sin clase
              </Label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alumnosFiltrados.map((alumno) => (
          <MobileAttendanceCard
            key={alumno.id}
            alumno={alumno}
            estado={asistencias[alumno.id] || 'P'}
            onEstadoChange={(estado) => onEstadoChange(alumno.id, estado)}
            disabled={sinClaseGrupo}
          />
        ))}
      </CardContent>
    </Card>
  );
};
