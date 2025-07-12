export const RegistroManualLegend = () => {
  return (
    <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-50 border rounded"></div>
        <span>Aprobado (≥6 o A,B,C)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-50 border rounded"></div>
        <span>Desaprobado (&lt;6)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-50 border rounded"></div>
        <span>Otras notas</span>
      </div>
    </div>
  );
};