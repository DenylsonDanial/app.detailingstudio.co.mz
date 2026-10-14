/**
 * Tipos do dominio do Detailing Studio, espelhando os DTOs da API
 * (api.detailingstudio.co.mz: client, catalog, entry, payment, expense, report).
 */

// ----------------------------------------------------------------------
// Paginacao (Spring Data Page)

export type IPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type PageParams = {
  page: number;
  size: number;
  sort?: string;
};

// ----------------------------------------------------------------------
// Enumeracoes e etiquetas

export type RecordStatus = 'ACTIVE' | 'ARCHIVED';
export type ClientType = 'INDIVIDUAL' | 'COMPANY';
export type VehicleCategory = 'TURISMO' | 'SUV' | 'BUS' | 'MOTA';
export type PricingType = 'BY_CATEGORY' | 'FIXED' | 'VARIABLE' | 'HOURLY';
export type WorkStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
export type EntryPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'MPESA' | 'EMOLA' | 'TRANSFER' | 'POS';
export type MovementKind = 'PAYMENT' | 'EXPENSE' | 'REVERSAL';
export type MovementStatus = 'VALID' | 'REVERSED';

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  INDIVIDUAL: 'Particular',
  COMPANY: 'Empresa',
};

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  TURISMO: 'Turismo',
  SUV: 'SUV/Carrinha',
  BUS: 'Bus',
  MOTA: 'Mota',
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  BY_CATEGORY: 'Por categoria',
  FIXED: 'Preço fixo',
  VARIABLE: 'Variável (por trabalho)',
  HOURLY: 'Por hora',
};

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  PENDING: 'Por iniciar',
  IN_PROGRESS: 'Em curso',
  COMPLETED: 'Concluído',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelada',
};

/** Sequencia normal do trabalho; o cancelamento tem fluxo proprio. */
export const WORK_FLOW: WorkStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];

export const PAYMENT_STATUS_LABELS: Record<EntryPaymentStatus, string> = {
  UNPAID: 'Por pagar',
  PARTIAL: 'Parcialmente pago',
  PAID: 'Pago',
  CANCELLED: 'Cancelada',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Numerário',
  MPESA: 'M-Pesa',
  EMOLA: 'e-Mola',
  TRANSFER: 'Transferência',
  POS: 'POS',
};

export const VEHICLE_CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];
export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

// ----------------------------------------------------------------------
// Clientes e viaturas

export type IVehicle = {
  id: number;
  clientId: number;
  clientName: string;
  plate: string;
  brand?: string | null;
  model?: string | null;
  category: VehicleCategory;
  categoryLabel: string;
  description: string;
  notes?: string | null;
  status: RecordStatus;
};

export type IVehicleRequest = {
  clientId: number;
  plate: string;
  brand?: string;
  model?: string;
  category: VehicleCategory;
  notes?: string;
};

export type IClient = {
  id: number;
  name: string;
  clientType: ClientType;
  phone?: string | null;
  creditAllowed: boolean;
  notes?: string | null;
  status: RecordStatus;
  createdAt: string;
  createdBy: string;
  vehicles: IVehicle[];
  currentDebt?: number | null;
  totalServices?: number | null;
  totalReceived?: number | null;
};

export type IClientRequest = {
  name: string;
  clientType: ClientType;
  phone?: string;
  creditAllowed?: boolean;
  notes?: string;
};

export type IChangeHistory = {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  reason?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  changedBy: string;
  changedAt: string;
};

// ----------------------------------------------------------------------
// Catalogo

export type ICategoryPrice = {
  category: VehicleCategory;
  price: number;
};

export type IServiceItem = {
  id: number;
  code?: string | null;
  name: string;
  pricingType: PricingType;
  basePrice?: number | null;
  category?: VehicleCategory | null;
  sortOrder: number;
  status: RecordStatus;
  prices: ICategoryPrice[];
};

export type IServiceItemRequest = {
  code?: string;
  name: string;
  pricingType: PricingType;
  basePrice?: number | null;
  category?: VehicleCategory | null;
  sortOrder?: number;
  prices: ICategoryPrice[];
  reason?: string;
};

/** Preco de catalogo para uma categoria, ou null quando e introduzido no trabalho. */
export function catalogPrice(service: IServiceItem, category: VehicleCategory): number | null {
  switch (service.pricingType) {
    case 'VARIABLE':
      return null;
    case 'FIXED':
    case 'HOURLY':
      return service.basePrice ?? null;
    default:
      return service.prices.find((item) => item.category === category)?.price ?? null;
  }
}

// ----------------------------------------------------------------------
// Entradas

export type IEntryRow = {
  id: number;
  number: string;
  clientId: number;
  vehicleId?: number | null;
  clientName: string;
  vehiclePlate?: string | null;
  vehicleDescription?: string | null;
  vehicleCategory?: VehicleCategory | null;
  entryAt: string;
  serviceDate: string;
  workStatus: WorkStatus;
  total: number;
  openingBalance: boolean;
  responsible: string;
  notes?: string | null;
  paid: number;
  balance: number;
  paymentStatus: EntryPaymentStatus;
};

export type IEntryLine = {
  id: number;
  serviceId?: number | null;
  serviceName: string;
  pricingType: PricingType;
  category?: VehicleCategory | null;
  quantity: number;
  catalogPrice?: number | null;
  unitPrice: number;
  subtotal: number;
  adjustReason?: string | null;
};

export type IEntryAllocation = {
  paymentId: number;
  paymentNumber: string;
  paymentDate: string;
  method: PaymentMethod;
  kind: MovementKind;
  amount: number;
};

export type IEntry = Omit<IEntryRow, 'vehicleId'> & {
  vehicleId?: number | null;
  clientCreditAllowed: boolean;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  creditAuthorizedBy?: string | null;
  creditReason?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  createdBy: string;
  lines: IEntryLine[];
  allocations: IEntryAllocation[];
};

export type IEntryLineRequest = {
  id?: number;
  serviceId: number;
  quantity?: number;
  unitPrice?: number | null;
  adjustReason?: string;
};

export type IEntryRequest = {
  clientId: number;
  vehicleId: number;
  /** Data e hora locais (yyyy-MM-ddTHH:mm). */
  entryAt?: string;
  notes?: string;
  lines: IEntryLineRequest[];
};

export type IEntryFilter = {
  startDate?: string;
  endDate?: string;
  clientId?: number;
  vehicleId?: number;
  workStatus?: WorkStatus;
  paymentStatus?: EntryPaymentStatus;
  serviceId?: number;
  term?: string;
};

// ----------------------------------------------------------------------
// Pagamentos

export type IAllocationRequest = {
  entryId: number;
  amount: number;
};

export type IPaymentRequest = {
  clientId: number;
  paymentDate?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  idempotencyKey: string;
  allocations: IAllocationRequest[];
};

export type IAllocationPreview = {
  entryId: number;
  entryNumber: string;
  entryAt: string;
  vehiclePlate?: string | null;
  total: number;
  balance: number;
  amount: number;
};

export type IPayment = {
  id: number;
  number: string;
  clientId: number;
  clientName: string;
  kind: MovementKind;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  status: MovementStatus;
  reversalOfId?: number | null;
  reversalOfNumber?: string | null;
  reason?: string | null;
  refund: boolean;
  createdAt: string;
  createdBy: string;
  allocations: {
    entryId: number;
    entryNumber: string;
    vehiclePlate?: string | null;
    amount: number;
  }[];
};

export type IPaymentReversal = {
  reason: string;
  refund: boolean;
  refundDate?: string;
  refundMethod?: PaymentMethod;
};

export type IPaymentFilter = {
  startDate?: string;
  endDate?: string;
  clientId?: number;
  method?: PaymentMethod;
  kind?: MovementKind;
  term?: string;
};

// ----------------------------------------------------------------------
// Despesas

export type IExpenseCategory = {
  id: number;
  name: string;
  active: boolean;
};

export type IExpense = {
  id: number;
  number: string;
  kind: MovementKind;
  description: string;
  categoryId: number;
  categoryName: string;
  expenseDate: string;
  amount: number;
  method: PaymentMethod;
  notes?: string | null;
  status: MovementStatus;
  reversalOfId?: number | null;
  reversalOfNumber?: string | null;
  reason?: string | null;
  createdAt: string;
  createdBy: string;
};

export type IExpenseRequest = {
  description: string;
  categoryId: number;
  amount: number;
  expenseDate?: string;
  method: PaymentMethod;
  notes?: string;
};

export type IExpenseFilter = {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  method?: PaymentMethod;
  term?: string;
};

// ----------------------------------------------------------------------
// Resumo e extracto

export type IMethodAmount = {
  method: PaymentMethod;
  label: string;
  amount: number;
};

export type ISummary = {
  startDate: string;
  endDate: string;
  entriesCount: number;
  vehiclesCount: number;
  servicesTotal: number;
  receipts: number;
  receiptsByMethod: IMethodAmount[];
  expenses: number;
  expensesByMethod: IMethodAmount[];
  netMovement: number;
  receivablePeriod: number;
  totalDebt: number;
  workStatusCounts: Record<WorkStatus, number>;
};

export type IStatementLine = {
  date: string;
  type: 'SERVICE' | 'OPENING' | 'PAYMENT' | 'REVERSAL' | 'REFUND';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export type IStatement = {
  clientId: number;
  clientName: string;
  clientPhone?: string | null;
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  currentDebt: number;
  lines: IStatementLine[];
};

export type DateRange = {
  startDate?: string;
  endDate?: string;
};
