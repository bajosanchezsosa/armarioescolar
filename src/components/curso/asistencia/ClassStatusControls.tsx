
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, BookX } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ClassStatusControlsProps {
  sinClase: boolean;
  onSinClaseToggle: () => void;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
}

export const ClassStatusControls = ({ 
  sinClase, 
  onSinClaseToggle, 
  onMarkAllPresent, 
  onMarkAllAbsent 
}: ClassStatusControlsProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className={`border-2 ${sinClase ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookX className="h-5 w-5" />
          Control de Clase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-wrap'}`}>
          <Button
            variant={sinClase ? "default" : "outline"}
            onClick={onSinClaseToggle}
            className={`${isMobile ? 'w-full' : ''} ${sinClase ? "bg-orange-500 hover:bg-orange-600" : ""}`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {sinClase ? 'Reactivar Clase' : 'Marcar Sin Clase'}
          </Button>
          
          {!sinClase && (
            <>
              <Button 
                variant="outline" 
                onClick={onMarkAllPresent}
                className={isMobile ? 'w-full' : ''}
              >
                Marcar Todos Presentes
              </Button>
              <Button 
                variant="outline" 
                onClick={onMarkAllAbsent}
                className={isMobile ? 'w-full' : ''}
              >
                Marcar Todos Ausentes
              </Button>
            </>
          )}
        </div>
        
        {sinClase && (
          <p className="text-sm text-orange-700 mt-2">
            Clase marcada como "Sin Clase". Los alumnos no serán marcados como ausentes.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
