
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Users, Clock, Settings, GraduationCap } from 'lucide-react';
import { Curso } from '@/types/database';
import { CourseEditDialog } from './curso/CourseEditDialog';

interface CourseCardProps {
  curso: Curso;
  onClick: () => void;
}

export const CourseCard = ({ curso, onClick }: CourseCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getCourseColor = (anio: number, division: string) => {
    // Para cursos de 4° año en adelante, usar colores por orientación
    if (anio >= 4) {
      const orientacionColors: { [key: string]: string } = {
        '1': 'border-l-blue-500 hover:border-l-blue-600', // Electromecánica
        '2': 'border-l-green-500 hover:border-l-green-600', // Multimedios
        '3': 'border-l-purple-500 hover:border-l-purple-600', // Administración de las Organizaciones
        '4': 'border-l-orange-500 hover:border-l-orange-600' // Energías Renovables
      };
      return orientacionColors[division] || 'border-l-gray-500 hover:border-l-gray-600';
    }
    
    // Para cursos de 1°, 2° y 3° año, mantener colores por año
    const yearColors = [
      'border-l-blue-500 hover:border-l-blue-600',
      'border-l-green-500 hover:border-l-green-600', 
      'border-l-purple-500 hover:border-l-purple-600',
      'border-l-orange-500 hover:border-l-orange-600',
      'border-l-red-500 hover:border-l-red-600',
      'border-l-indigo-500 hover:border-l-indigo-600',
      'border-l-pink-500 hover:border-l-pink-600'
    ];
    return yearColors[anio - 1] || yearColors[0];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Si se hace click en el botón de configuración, no abrir el curso
    if ((e.target as HTMLElement).closest('button[data-edit]')) {
      return;
    }
    onClick();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  return (
    <>
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-l-4 ${getCourseColor(curso.anio, curso.division)} bg-white relative group`}
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">
                {curso.anio}°{curso.division}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                {curso.turno}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEditClick}
                data-edit
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="h-4 w-4" />
              <span className="capitalize">{curso.orientacion}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Ver alumnos y gestión</span>
            </div>
            <div className="text-xs text-gray-500">
              Año {curso.anio} • División {curso.division} • Turno {curso.turno}
            </div>
          </div>
        </CardContent>
      </Card>

      <CourseEditDialog
        curso={curso}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
};
