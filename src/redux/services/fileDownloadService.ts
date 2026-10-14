import { saveAs } from 'file-saver';
//
import axios, { endpoints } from '../../utils/axios';

// ----------------------------------------------------------------------

/**
 * Parametros aceites pelos endpoints de exportacao. `defaultFileName` so e
 * usado quando a resposta nao traz Content-Disposition.
 */
export type FileDownloadParams = {
  defaultFileName: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  term?: string;
  fileFormat?: 'PDF' | 'EXCEL';
  page?: number;
  size?: number;
  [key: string]: unknown;
};

const fetchExport = (context: string, params: FileDownloadParams) =>
  axios.get(`${endpoints.common.export}/${context}`, { params, responseType: 'blob' });

export const generateAndDownloadFile = async (context: string, params: FileDownloadParams) => {
  const response = await fetchExport(context, params);

  const contentDisposition = response.headers['content-disposition'];
  const fileName = contentDisposition
    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    : params.defaultFileName;

  saveAs(new Blob([response.data]), fileName);
};

export const printPdf = async (context: string, params: FileDownloadParams) => {
  const response = await fetchExport(context, { ...params, fileFormat: 'PDF' });

  const pdfUrl = URL.createObjectURL(response.data);
  const newWindow = window.open(pdfUrl, '_blank');

  if (newWindow) {
    newWindow.onload = () => newWindow.print();
  }
};
