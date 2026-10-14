import { Helmet } from 'react-helmet-async';
// @mui
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { useParams, useRouter, useSearchParams } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSettingsContext } from 'src/components/settings';
import { usePageHeader } from 'src/layouts/dashboard/page-header-context';
// redux
import { useGetClientQuery } from 'src/redux/services/clientService';
import { useGetEntryQuery } from 'src/redux/services/entryService';
//
import EntryForm from './EntryForm';

// ----------------------------------------------------------------------

/** Nova entrada (opcionalmente com ?clientId=) ou edicao de /entries/:id/edit. */
export default function EntryFormView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const entryId = id ? Number(id) : undefined;
  const { currentData: entry, isLoading: loadingEntry } = useGetEntryQuery(entryId ?? 0, {
    skip: !entryId,
  });

  const clientId = entry?.clientId ?? Number(searchParams.get('clientId') ?? 0);
  const { currentData: client, isLoading: loadingClient } = useGetClientQuery(clientId, {
    skip: !clientId,
  });

  const title = entry ? `Editar entrada ${entry.number}` : 'Nova entrada';

  usePageHeader({
    title,
    actions: (
      <Button
        variant="soft"
        color="secondary"
        startIcon={<Iconify icon="eva:arrow-back-fill" />}
        onClick={() => router.back()}
      >
        Voltar
      </Button>
    ),
  });

  if ((entryId && loadingEntry) || (clientId && loadingClient)) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <EntryForm entry={entry} initialClient={client ?? null} />
      </Container>
    </>
  );
}
