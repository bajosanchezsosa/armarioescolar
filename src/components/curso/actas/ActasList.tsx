
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, User, AlertTriangle, Heart, Shield, FileText, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActaConAlumnos, TipoActa, PrioridadActa } from '@/types/database';
import { useDeleteActa } from '@/hooks/useActas';

interface ActasListProps {
  actas: ActaConAlumnos[];
  onEdit: (acta: ActaConAlumnos) => void;
}

const tipoActaConfig: Record<TipoActa, { icon: any; color: string; bgColor: string }> = {
  curso: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  alumno: { icon: User, color: 'text-green-600', bgColor: 'bg-green-50' },
  disciplinario: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  salud: { icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
  accidente: { icon: Shield, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  otro: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

const prioridadConfig: Record<PrioridadActa, { color: string; label: string }> = {
  baja: { color: 'bg-green-100 text-green-800', label: 'Baja' },
  media: { color: 'bg-yellow-100 text-yellow-800', label: 'Media' },
  alta: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
  critica: { color: 'bg-red-100 text-red-800', label: 'Crítica' },
};

export const ActasList = ({ actas, onEdit }: ActasListProps) => {
  const deleteActa = useDeleteActa();

  const handleDelete = async (id: string) => {
    try {
      await deleteActa.mutateAsync(id);
    } catch (error) {
      console.error('Error al eliminar acta:', error);
    }
  };

  if (actas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay actas registradas</p>
            <p className="text-sm">Crea la primera acta para este curso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {actas.map((acta) => {
        const tipoConfig = tipoActaConfig[acta.tipo as TipoActa];
        const prioridadInfo = prioridadConfig[acta.prioridad as PrioridadActa];
        const IconComponent = tipoConfig.icon;

        return (
          <Card key={acta.id} className={`${tipoConfig.bgColor} border-l-4 border-l-current ${tipoConfig.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${tipoConfig.color} ${tipoConfig.bgColor}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{acta.titulo}</CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(acta.fecha), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <Badge className={prioridadInfo.color}>
                        {prioridadInfo.label}
                      </Badge>
                      <Badge variant="outline">
                        {acta.tipo}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(acta)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar acta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el acta "{acta.titulo}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(acta.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{acta.descripcion}</p>
              
              {acta.acta_alumnos && acta.acta_alumnos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Alumnos involucrados:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {acta.acta_alumnos.map((actaAlumno) => (
                      <Badge key={actaAlumno.id} variant="secondary">
                        {actaAlumno.alumnos.apellido}, {actaAlumno.alumnos.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {acta.tipo === 'curso' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Users className="h-4 w-4" />
                  <span>Aplica a todo el curso</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
