
import React from 'react';
import { useParams } from 'react-router-dom';
import { PlanillaPublica } from '@/components/planilla/PlanillaPublica';

export const PlanillaPublicaPage = () => {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Token inválido</h1>
          <p className="text-gray-600">No se proporcionó un token válido para la planilla.</p>
        </div>
      </div>
    );
  }

  return <PlanillaPublica token={token} />;
};
