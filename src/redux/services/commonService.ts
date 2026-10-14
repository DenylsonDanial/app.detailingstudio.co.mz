import {createApi} from '@reduxjs/toolkit/query/react'
import {customBaseQuery} from "../../auth/context/jwt/utils";
import { ICountry, IDistrict, IProvince } from '../../types/common';
import { ICurrency } from '../../types/currency';


export const commonService = createApi({
    reducerPath: 'commonService',
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getCountries: builder.query<ICountry[], void>({
            "query": () => ({
                "url": `countries/findAll`,
                "method": 'GET',
            })
        }),
        getProvinces: builder.query<IProvince[], void>({
            query: () => ({
                url: `provinces/findAll`,
                method: 'GET',
            })
        }),
        getDistricts: builder.query<IDistrict[], void>({
            query: () => ({
                url: `districts/findAll`,
                method: 'GET',
            })
        }),
        getCurrencies: builder.query<ICurrency[], void>({
            query: () => ({
                url: `common/listCurrencies`,
                method: 'GET',
            })
        }),
    }),
})

export const {
    useGetCountriesQuery,
    useGetProvincesQuery,
    useGetDistrictsQuery,
    useGetCurrenciesQuery,
} = commonService
