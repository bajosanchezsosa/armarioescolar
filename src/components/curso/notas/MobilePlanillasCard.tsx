
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Share2, CheckCircle, Clock, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlanillaCompartible } from '@/hooks/usePlanillasCompartibles';
import { toast } from 'sonner';

interface MobilePlanillasCardProps {
  planilla: PlanillaCompartible;
  onView: (planilla: PlanillaCompartible) => void;
}

export const MobilePlanillasCard = ({ planilla, onView }: MobilePlanillasCardProps) => {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/planilla/${planilla.token_url}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado al portapapeles');
  };

  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/planilla/${planilla.token_url}`;
    const message = `Hola! Te comparto la planilla de notas de ${planilla.materia?.nombre} - ${planilla.periodo?.nombre}. Podés completarla desde este link: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{planilla.materia?.nombre}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {planilla.periodo?.nombre}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {planilla.curso?.anio}° {planilla.curso?.division}° - {planilla.curso?.turno}
            </p>
          </div>
          <Badge className={
            planilla.estado === 'completada' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }>
            {planilla.estado === 'completada' ? (
              <><CheckCircle className="h-3 w-3 mr-1" />Completada</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" />Pendiente</>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {planilla.estado === 'completada' && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Profesor:</strong> {planilla.profesor_nombre}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Completada el {format(new Date(planilla.fecha_completada!), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          {planilla.estado === 'completada' ? (
            <Button 
              onClick={() => onView(planilla)}
              className="w-full"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Planilla
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleShareWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir por WhatsApp
              </Button>
              <Button 
                onClick={handleCopyLink}
                variant="outline"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Creada el {format(new Date(planilla.created_at), 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
