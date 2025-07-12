
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TipoBadgeProps {
  tipo: string;
}

export const TipoBadge = ({ tipo }: TipoBadgeProps) => {
  const colors = {
    "Parcial": "bg-blue-100 text-blue-800",
    "Trimestral": "bg-purple-100 text-purple-800",
    "Oral": "bg-orange-100 text-orange-800",
    "Trabajo Práctico": "bg-green-100 text-green-800",
    "Taller": "bg-yellow-100 text-yellow-800",
    "EF": "bg-pink-100 text-pink-800",
    "Nota Final": "bg-red-100 text-red-800"
  };
  
  return (
    <Badge className={colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
      {tipo}
    </Badge>
  );
};
