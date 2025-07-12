
import React from 'react';
import { Button } from '@/components/ui/button';
import { EstadoAsistencia } from '@/types/database';
import { useIsMobile } from '@/hooks/use-mobile';

interface AttendanceButtonGroupProps {
  currentState: EstadoAsistencia;
  onStateChange: (state: EstadoAsistencia) => void;
  disabled?: boolean;
}

const ATTENDANCE_STATES = [
  { value: 'P' as EstadoAsistencia, label: 'P', color: 'bg-green-500 hover:bg-green-600', description: 'Presente' },
  { value: 'A' as EstadoAsistencia, label: 'A', color: 'bg-red-500 hover:bg-red-600', description: 'Ausente' },
  { value: 'T' as EstadoAsistencia, label: 'T', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'Tarde' },
  { value: 'J' as EstadoAsistencia, label: 'J', color: 'bg-blue-500 hover:bg-blue-600', description: 'Justificado' },
];

export const AttendanceButtonGroup = ({ currentState, onStateChange, disabled = false }: AttendanceButtonGroupProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex gap-2 ${isMobile ? 'flex-wrap justify-center' : 'gap-1'}`}>
      {ATTENDANCE_STATES.map((state) => (
        <Button
          key={state.value}
          size={isMobile ? "default" : "sm"}
          disabled={disabled}
          className={`${isMobile ? 'w-16 h-12' : 'w-8 h-8'} p-0 text-white font-bold ${
            currentState === state.value 
              ? state.color
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          onClick={() => onStateChange(state.value)}
          title={state.description}
        >
          {isMobile ? state.description : state.label}
        </Button>
      ))}
    </div>
  );
};
