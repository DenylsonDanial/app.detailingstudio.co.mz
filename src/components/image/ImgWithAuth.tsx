import { useEffect, useState } from 'react';

interface ImageWithAuthProps {
  isAvatar?: boolean;
  file?: string;
}

/**
 * Mostra uma imagem cujo conteudo ja vem em base64/data-url do backend, evitando
 * um segundo pedido autenticado ao storage.
 */
export default function ImageWithAuth({ isAvatar, file }: ImageWithAuthProps) {
  const [imageData, setImageData] = useState('');

  useEffect(() => {
    setImageData(file || '');
  }, [file]);

  return isAvatar ? (
    <img
      style={{
        marginRight: '16px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
      }}
      src={imageData}
      alt=""
    />
  ) : (
    <img src={imageData} alt="" />
  );
}
