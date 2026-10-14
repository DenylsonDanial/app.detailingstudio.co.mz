/** Remove filtros vazios para nao enviar "?term=&clientId=" a API. */
export function cleanParams<T extends object>(
  params: T
): Record<string, string | number | boolean> {
  return Object.entries(params).reduce<Record<string, string | number | boolean>>(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value as string | number | boolean;
      }
      return acc;
    },
    {}
  );
}

/** Executa um efeito (ex.: invalidar tags de outro servico) so depois de a mutacao ter sucesso. */
export async function afterSuccess(queryFulfilled: Promise<unknown>, effect: () => void) {
  try {
    await queryFulfilled;
    effect();
  } catch {
    // o erro e tratado por quem chamou a mutacao
  }
}
