import axios, { endpoints } from './axios';

// ----------------------------------------------------------------------

export const getDistrictsByProvince = async (provinceId: number) => {
  const res = await axios.get(
    `${endpoints.common.districts}/findDistrictsByProvince/${provinceId}`
  );
  return res.data;
};
