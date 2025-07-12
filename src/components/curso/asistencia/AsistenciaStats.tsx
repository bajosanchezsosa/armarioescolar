
import React from 'react';

interface AsistenciaStatsProps {
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
}

export const AsistenciaStats = ({ presentes, ausentes, tardanzas, justificados }: AsistenciaStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{presentes}</div>
        <div className="text-sm text-gray-600">Presentes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{ausentes}</div>
        <div className="text-sm text-gray-600">Ausentes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">{tardanzas}</div>
        <div className="text-sm text-gray-600">Tardanzas</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{justificados}</div>
        <div className="text-sm text-gray-600">Justificados</div>
      </div>
    </div>
  );
};
