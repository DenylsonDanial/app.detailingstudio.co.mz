import { Helmet } from 'react-helmet-async';
// @mui
import React from "react";
import CompanyNewEditForm from "../../sections/company/CompanyNewEditForm";


// ----------------------------------------------------------------------

export default function Page() {


    return (
        <>
            <Helmet>
                <title> Empresas | Adicionar novo</title>
            </Helmet>


                <CompanyNewEditForm />


        </>
    );
}
