
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Clock, Users, GraduationCap } from 'lucide-react';
import { Curso } from '@/types/database';
import { useNavigate } from 'react-router-dom';

interface CourseHeaderProps {
  curso: Curso;
}

export const CourseHeader = ({ curso }: CourseHeaderProps) => {
  const navigate = useNavigate();

  const getCourseColor = (anio: number) => {
    const colors = [
      'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white',
      'border-l-green-500 bg-gradient-to-r from-green-50 to-white', 
      'border-l-purple-500 bg-gradient-to-r from-purple-50 to-white',
      'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white',
      'border-l-red-500 bg-gradient-to-r from-red-50 to-white',
      'border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white',
      'border-l-pink-500 bg-gradient-to-r from-pink-50 to-white'
    ];
    return colors[anio - 1] || colors[0];
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>

        <Card className={`border-l-4 ${getCourseColor(curso.anio)} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {curso.anio}° {curso.division}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {curso.orientacion} - Turno {curso.turno}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="capitalize">{curso.orientacion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Gestión de Alumnos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">{curso.turno}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
