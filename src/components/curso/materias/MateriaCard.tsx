
import React from 'react';
import { Materia, MateriaModulo } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModulosSection } from './ModulosSection';

interface MateriaCardProps {
  materia: Materia;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEditMateria: (materia: Materia) => void;
  onDeleteMateria: (materia: Materia) => void;
  onAddModulo: (materiaId: string) => void;
  onEditModulo: (modulo: MateriaModulo) => void;
  onDeleteModulo: (modulo: MateriaModulo) => void;
}

export const MateriaCard = ({
  materia,
  isExpanded,
  onToggleExpanded,
  onEditMateria,
  onDeleteMateria,
  onAddModulo,
  onEditModulo,
  onDeleteModulo,
}: MateriaCardProps) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Clase':
        return 'default';
      case 'Taller':
        return 'secondary';
      case 'EF':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg">{materia.nombre}</CardTitle>
                  {(materia as any).profesor && (
                    <p className="text-sm text-gray-600 mt-1">Profesor: {(materia as any).profesor}</p>
                  )}
                </div>
                <Badge variant={getTipoColor(materia.tipo) as any}>
                  {materia.tipo}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMateria(materia);
                  }}
                  title="Editar materia completa (nombre, profesor y módulos)"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Materia
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMateria(materia);
                  }}
                  title="Eliminar materia y todos sus módulos"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ModulosSection
              materiaId={materia.id}
              showEditButtons={false}
              onAddModulo={onAddModulo}
              onEditModulo={onEditModulo}
              onDeleteModulo={onDeleteModulo}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
