
import React from 'react';
import { Nota } from '@/hooks/useNotas';

interface NotasStatsProps {
  notas: Nota[];
}

export const NotasStats = ({ notas }: NotasStatsProps) => {
  // Función para evaluar una nota
  const evaluarNota = (nota: string | null): 'aprobada' | 'regular' | 'desaprobada' | 'no_califica' => {
    if (!nota) return 'no_califica';
    
    // Intentar convertir a número
    const numeroNota = parseFloat(nota);
    if (!isNaN(numeroNota)) {
      if (numeroNota >= 7) return 'aprobada';
      if (numeroNota >= 4) return 'regular';
      return 'desaprobada';
    }
    
    // Para notas de texto
    const notaUpper = nota.toUpperCase();
    if (['A', 'E', 'MB', 'EXCELENTE'].includes(notaUpper)) return 'aprobada';
    if (['B', 'B+', 'BUENO', 'BIEN'].includes(notaUpper)) return 'aprobada';
    if (['C', 'R', 'REGULAR'].includes(notaUpper)) return 'regular';
    if (['D', 'I', 'INSUFICIENTE', 'DESAPROBADO'].includes(notaUpper)) return 'desaprobada';
    if (['NC', 'NP', 'NO CALIFICA', 'NO PRESENTE'].includes(notaUpper)) return 'no_califica';
    
    // Por defecto, considerar como regular si no se reconoce
    return 'regular';
  };

  const aprobadas = notas.filter(n => evaluarNota(n.nota) === 'aprobada').length;
  const regulares = notas.filter(n => evaluarNota(n.nota) === 'regular').length;
  const desaprobadas = notas.filter(n => evaluarNota(n.nota) === 'desaprobada').length;
  const noCalifican = notas.filter(n => evaluarNota(n.nota) === 'no_califica').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">Total de Notas</p>
        <p className="text-2xl font-bold text-blue-900">{notas.length}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Aprobadas</p>
        <p className="text-2xl font-bold text-green-900">{aprobadas}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-600">Regulares</p>
        <p className="text-2xl font-bold text-yellow-900">{regulares}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-600">Desaprobadas</p>
        <p className="text-2xl font-bold text-red-900">{desaprobadas}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">No Califican</p>
        <p className="text-2xl font-bold text-gray-900">{noCalifican}</p>
      </div>
    </div>
  );
};
