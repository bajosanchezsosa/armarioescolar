
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CourseHeader } from '@/components/curso/CourseHeader';
import { CourseTabs } from '@/components/curso/CourseTabs';
import { useCurso } from '@/hooks/useCurso';
import { Loader2, AlertCircle } from 'lucide-react';

const Curso = () => {
  const { id } = useParams<{ id: string }>();
  const { data: curso, isLoading, error } = useCurso(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando curso...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span>Error al cargar el curso</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CourseHeader curso={curso} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <CourseTabs cursoId={curso.id} />
      </main>
    </div>
  );
};

export default Curso;
