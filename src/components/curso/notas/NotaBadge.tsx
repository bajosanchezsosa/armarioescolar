
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotaBadgeProps {
  nota: string | null;
}

export const NotaBadge = ({ nota }: NotaBadgeProps) => {
  if (nota === null || nota === '') {
    return <Badge variant="secondary">No califica</Badge>;
  }
  
  // Intentar convertir a número para notas numéricas
  const numeroNota = parseFloat(nota);
  
  // Si es un número válido, usar la lógica original
  if (!isNaN(numeroNota)) {
    if (numeroNota >= 7) {
      return <Badge className="bg-green-100 text-green-800">{nota}</Badge>;
    } else if (numeroNota >= 4) {
      return <Badge className="bg-yellow-100 text-yellow-800">{nota}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{nota}</Badge>;
    }
  }
  
  // Para notas de texto (letras), usar colores neutros basados en letras comunes
  const notaUpper = nota.toUpperCase();
  
  if (['A', 'E', 'MB', 'EXCELENTE'].includes(notaUpper)) {
    return <Badge className="bg-green-100 text-green-800">{nota}</Badge>;
  } else if (['B', 'B+', 'BUENO', 'BIEN'].includes(notaUpper)) {
    return <Badge className="bg-blue-100 text-blue-800">{nota}</Badge>;
  } else if (['C', 'R', 'REGULAR'].includes(notaUpper)) {
    return <Badge className="bg-yellow-100 text-yellow-800">{nota}</Badge>;
  } else if (['D', 'I', 'INSUFICIENTE', 'DESAPROBADO'].includes(notaUpper)) {
    return <Badge className="bg-red-100 text-red-800">{nota}</Badge>;
  } else if (['NC', 'NP', 'NO CALIFICA', 'NO PRESENTE'].includes(notaUpper)) {
    return <Badge variant="secondary">{nota}</Badge>;
  } else {
    // Para cualquier otra letra o texto, usar un color neutro
    return <Badge className="bg-gray-100 text-gray-800">{nota}</Badge>;
  }
};
