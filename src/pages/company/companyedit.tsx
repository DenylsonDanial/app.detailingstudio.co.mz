import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
// @mui
import React, { useCallback, useEffect, useState } from 'react';
import { useSettingsContext } from '../../components/settings';
import { ICompany } from '../../types/company';
import { useGetCompanyMutation } from '../../redux/services/companyService';
import { LoadingScreen } from '../../components/loading-screen';
import CompanyNewEditForm from '../../sections/company/CompanyNewEditForm';

// components
// sections

// ----------------------------------------------------------------------

export default function Companyedit() {
  const [currentCompany, setCurrentCompany] = useState<ICompany>();

  const [getCompany] = useGetCompanyMutation();

  const { id } = useParams();

  const handleGetCompany = useCallback(
    async (companyId: number) => {
      const result: ICompany = await getCompany(companyId).unwrap();
      setCurrentCompany({
        ...result,
      });
    },
    [getCompany]
  );

  useEffect(() => {
    if (id) handleGetCompany(+id);
  }, [handleGetCompany, id]);

  return (
    <>
      <Helmet>
        <title> Empresas | Editar</title>
      </Helmet>
      {currentCompany ? (
        <CompanyNewEditForm isEdit currentCompany={currentCompany} />
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}
