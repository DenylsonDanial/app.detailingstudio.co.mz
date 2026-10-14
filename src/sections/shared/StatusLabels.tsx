import Label, { LabelColor } from 'src/components/label';
import {
  EntryPaymentStatus,
  MovementKind,
  MovementStatus,
  PAYMENT_STATUS_LABELS,
  WORK_STATUS_LABELS,
  WorkStatus,
} from 'src/types/detailing';

// ----------------------------------------------------------------------

const WORK_COLORS: Record<WorkStatus, LabelColor> = {
  PENDING: 'default',
  IN_PROGRESS: 'info',
  COMPLETED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const PAYMENT_COLORS: Record<EntryPaymentStatus, LabelColor> = {
  UNPAID: 'error',
  PARTIAL: 'warning',
  PAID: 'success',
  CANCELLED: 'default',
};

export function WorkStatusLabel({ status }: { status: WorkStatus }) {
  return (
    <Label variant="soft" color={WORK_COLORS[status]}>
      {WORK_STATUS_LABELS[status]}
    </Label>
  );
}

export function PaymentStatusLabel({ status }: { status: EntryPaymentStatus }) {
  return (
    <Label variant="soft" color={PAYMENT_COLORS[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Label>
  );
}

/** Pagamento/despesa valido, estornado, ou o proprio estorno (com ou sem devolucao). */
export function MovementLabel({
  kind,
  status,
  refund,
}: {
  kind: MovementKind;
  status: MovementStatus;
  refund?: boolean;
}) {
  if (kind === 'REVERSAL') {
    return (
      <Label variant="soft" color="warning">
        {refund ? 'Devolução' : 'Estorno'}
      </Label>
    );
  }
  return status === 'REVERSED' ? (
    <Label variant="soft" color="error">
      Estornado
    </Label>
  ) : (
    <Label variant="soft" color="success">
      Válido
    </Label>
  );
}
