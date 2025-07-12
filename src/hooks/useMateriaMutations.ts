
import { useMateriaCreate } from './useMateriaCreate';
import { useMateriaUpdate } from './useMateriaUpdate';
import { useMateriaDelete } from './useMateriaDelete';

export const useMateriaMutations = (cursoId: string) => {
  const createMateria = useMateriaCreate(cursoId);
  const updateMateria = useMateriaUpdate(cursoId);
  const deleteMateria = useMateriaDelete(cursoId);

  return {
    createMateria,
    updateMateria,
    deleteMateria,
  };
};
