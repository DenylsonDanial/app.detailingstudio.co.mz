export type ICountry = {
    id: number,
    description: string,
    symbol: string,
    slug: string
}

export type IProvince = {
    id: number,
    description: string,
    slug: string
}

export type IDistrict = {
    id: number,
    description: string,
    slug: string
}

export const GENDER = [
    {name: 'Masculino', value: 'M'},
    {name: 'Femenino', value: 'F'},
]

export const AccountType = [
    {name: 'ACTIVO', value: 'Activo'},
    {name: 'PASSIVO', value: 'Passivo'},
]
