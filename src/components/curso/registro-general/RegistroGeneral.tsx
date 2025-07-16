import React from 'react';
import RegistroGeneralNuevo from './RegistroGeneralNuevo';

interface RegistroGeneralProps {
  cursoId: string;
}

const RegistroGeneral: React.FC<RegistroGeneralProps> = ({ cursoId }) => {
  return <RegistroGeneralNuevo cursoId={cursoId} />;
};

export default RegistroGeneral; 