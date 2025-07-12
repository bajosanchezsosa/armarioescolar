import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCursos } from '@/hooks/useCursos';
import { YearSection } from '@/components/YearSection';
import { Header } from '@/components/Header';
import { Curso } from '@/types/database';
import { Loader2, AlertCircle, School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: cursos, isLoading, error } = useCursos();
  const { toast } = useToast();
  
  const handleCourseClick = (curso: Curso) => {
    navigate(`/curso/${curso.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando cursos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span>Error al cargar los cursos</span>
          </div>
        </div>
      </div>
    );
  }

  const years = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Cursos
          </h1>
          <p className="text-gray-600">
            Selecciona un curso para acceder a la gestión de alumnos, materias, asistencia y notas.
          </p>
        </div>

        <div className="space-y-8">
          {years.map(year => (
            <YearSection
              key={year}
              year={year}
              cursos={cursos || []}
              onCourseClick={handleCourseClick}
            />
          ))}
        </div>

        {cursos && cursos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay cursos disponibles</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
