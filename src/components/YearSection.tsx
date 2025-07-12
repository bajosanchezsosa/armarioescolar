
import { Curso } from '@/types/database';
import { CourseCard } from './CourseCard';

interface YearSectionProps {
  year: number;
  cursos: Curso[];
  onCourseClick: (curso: Curso) => void;
}

export const YearSection = ({ year, cursos, onCourseClick }: YearSectionProps) => {
  const yearCourses = cursos.filter(curso => curso.anio === year);

  if (yearCourses.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-lg">
          {year}° Año
        </span>
        <span className="text-sm text-gray-500 font-normal">
          ({yearCourses.length} {yearCourses.length === 1 ? 'curso' : 'cursos'})
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {yearCourses.map((curso) => (
          <CourseCard
            key={curso.id}
            curso={curso}
            onClick={() => onCourseClick(curso)}
          />
        ))}
      </div>
    </div>
  );
};
