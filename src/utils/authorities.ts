/**
 * Catalogo de perfis e permissoes, espelhando o seed do backend em
 * api.detailingstudio.co.mz/src/main/resources/db/migration/master/V2__seed_rbac.sql.
 * Alterar aqui obriga a alterar la.
 *
 * Convencao: <accao>:<recurso>
 */
export enum Roles {
  SA = 'SA',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export const RESOURCES = [
  'dashboard',
  'entries',
  'payments',
  'clients',
  'vehicles',
  'statements',
  'expenses',
  'services',
  'reports',
  'users',
  'roles',
  'permissions',
  'settings',
  'audit',
  'companies',
] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = 'read' | 'create' | 'update' | 'delete' | 'export';

/** Constroi o nome da permissao, ex.: can('create', 'entries') -> 'create:entries' */
export const can = (action: Action, resource: Resource): string => `${action}:${resource}`;

export enum Authorities {
  // Resumo
  READ_DASHBOARD = 'read:dashboard',
  EXPORT_DASHBOARD = 'export:dashboard',

  // Operacao diaria
  READ_ENTRIES = 'read:entries',
  CREATE_ENTRIES = 'create:entries',
  UPDATE_ENTRIES = 'update:entries',
  DELETE_ENTRIES = 'delete:entries',
  EXPORT_ENTRIES = 'export:entries',
  CANCEL_ENTRIES = 'cancel:entries',
  MANAGE_DELIVERED = 'manage:delivered',
  ADJUST_PRICES = 'adjust:prices',
  AUTHORIZE_CREDIT = 'authorize:credit',
  BACKDATE_MOVEMENTS = 'backdate:movements',

  READ_PAYMENTS = 'read:payments',
  CREATE_PAYMENTS = 'create:payments',
  UPDATE_PAYMENTS = 'update:payments',
  DELETE_PAYMENTS = 'delete:payments',
  EXPORT_PAYMENTS = 'export:payments',
  REVERSE_PAYMENTS = 'reverse:payments',

  // Clientes e contas
  READ_CLIENTS = 'read:clients',
  CREATE_CLIENTS = 'create:clients',
  UPDATE_CLIENTS = 'update:clients',
  DELETE_CLIENTS = 'delete:clients',
  EXPORT_CLIENTS = 'export:clients',
  MANAGE_CREDIT = 'manage:credit',

  READ_VEHICLES = 'read:vehicles',
  CREATE_VEHICLES = 'create:vehicles',
  UPDATE_VEHICLES = 'update:vehicles',
  DELETE_VEHICLES = 'delete:vehicles',
  EXPORT_VEHICLES = 'export:vehicles',
  REASSIGN_VEHICLES = 'reassign:vehicles',

  READ_STATEMENTS = 'read:statements',
  EXPORT_STATEMENTS = 'export:statements',

  // Despesas
  READ_EXPENSES = 'read:expenses',
  CREATE_EXPENSES = 'create:expenses',
  UPDATE_EXPENSES = 'update:expenses',
  DELETE_EXPENSES = 'delete:expenses',
  EXPORT_EXPENSES = 'export:expenses',
  REVERSE_EXPENSES = 'reverse:expenses',

  // Servicos e precos
  READ_SERVICES = 'read:services',
  CREATE_SERVICES = 'create:services',
  UPDATE_SERVICES = 'update:services',
  DELETE_SERVICES = 'delete:services',
  EXPORT_SERVICES = 'export:services',

  // Relatorios
  READ_REPORTS = 'read:reports',
  EXPORT_REPORTS = 'export:reports',

  // Administracao
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',

  READ_ROLES = 'read:roles',
  CREATE_ROLES = 'create:roles',
  UPDATE_ROLES = 'update:roles',
  DELETE_ROLES = 'delete:roles',

  READ_PERMISSIONS = 'read:permissions',
  CREATE_PERMISSIONS = 'create:permissions',
  UPDATE_PERMISSIONS = 'update:permissions',
  DELETE_PERMISSIONS = 'delete:permissions',

  READ_SETTINGS = 'read:settings',
  UPDATE_SETTINGS = 'update:settings',

  READ_AUDIT = 'read:audit',

  // Plataforma
  READ_COMPANIES = 'read:companies',
  CREATE_COMPANIES = 'create:companies',
  UPDATE_COMPANIES = 'update:companies',
  DELETE_COMPANIES = 'delete:companies',
}
