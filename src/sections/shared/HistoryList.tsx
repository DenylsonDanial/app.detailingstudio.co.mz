// @mui
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
// types
import { IChangeHistory } from 'src/types/detailing';
import { formatDateTime } from 'src/utils/maputo-time';

// ----------------------------------------------------------------------

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Alteração',
  UPDATE_TOTAL: 'Alteração do total',
  STATUS: 'Mudança de estado',
  CANCEL: 'Cancelamento',
  CREDIT: 'Conta corrente',
  CREDIT_AUTHORIZATION: 'Entrega autorizada com saldo pendente',
  OPENING_BALANCE: 'Saldo de abertura',
  ARCHIVE: 'Arquivado',
  UNARCHIVE: 'Reactivado',
  REASSIGN: 'Reassociação de viatura',
  REVERSAL: 'Estorno',
  REFUND: 'Devolução',
};

const VALUE_LABELS: Record<string, string> = {
  true: 'Sim',
  false: 'Não',
  PENDING: 'Por iniciar',
  IN_PROGRESS: 'Em curso',
  COMPLETED: 'Concluído',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelada',
  ACTIVE: 'Activo',
  ARCHIVED: 'Arquivado',
};

const show = (value?: string | null) => (value ? VALUE_LABELS[value] ?? value : '—');

/** Historico de alteracoes relevantes: autor, data, motivo e valores anteriores/novos. */
export default function HistoryList({ items }: { items: IChangeHistory[] }) {
  return (
    <Card>
      <CardHeader title="Histórico de alterações" />
      <Stack divider={<Divider />} sx={{ p: 3, pt: 2 }}>
        {items.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sem alterações registadas.
          </Typography>
        )}
        {items.map((item) => (
          <Stack key={item.id} spacing={0.5} sx={{ py: 1.5 }}>
            <Typography variant="subtitle2">{ACTION_LABELS[item.action] ?? item.action}</Typography>
            {(item.oldValue || item.newValue) && (
              <Typography variant="body2">
                {show(item.oldValue)} → {show(item.newValue)}
              </Typography>
            )}
            {item.reason && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Motivo: {item.reason}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {item.changedBy} · {formatDateTime(item.changedAt)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
