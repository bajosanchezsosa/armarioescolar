
import React from 'react';
import { MateriaModulo } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Calendar, Users } from 'lucide-react';
import { useMateriaModulos } from '@/hooks/useMateriaQueries';

interface ModulosSectionProps {
  materiaId: string;
  showEditButtons?: boolean;
  onAddModulo: (materiaId: string) => void;
  onEditModulo: (modulo: MateriaModulo) => void;
  onDeleteModulo: (modulo: MateriaModulo) => void;
}

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ModulosSection = ({ 
  materiaId, 
  showEditButtons = true,
  onAddModulo, 
  onEditModulo, 
  onDeleteModulo 
}: ModulosSectionProps) => {
  const { data: modulos = [] } = useMateriaModulos(materiaId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Módulos Horarios ({modulos.length})
        </h4>
        {showEditButtons && (
          <Button
            size="sm"
            onClick={() => onAddModulo(materiaId)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Agregar Módulo
          </Button>
        )}
      </div>

      {modulos.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No hay módulos configurados</p>
          <p className="text-sm">
            {showEditButtons 
              ? "Los módulos se configuran al crear/editar la materia" 
              : "Edita la materia para configurar módulos"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {modulos.map((modulo) => (
            <div
              key={modulo.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{DIAS_SEMANA[modulo.dia_semana]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{modulo.hora_inicio}</span>
                </div>
                <Badge variant="outline">
                  {modulo.cantidad_modulos} módulo{modulo.cantidad_modulos !== 1 ? 's' : ''}
                </Badge>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Grupo {modulo.grupo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
