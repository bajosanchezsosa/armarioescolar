import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const EmptyStateCard = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alumnos en este curso</h3>
          <p className="text-gray-600">
            Agrega alumnos en la pestaña "Alumnos" para usar el registro manual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};