// Central config for all config-driven CRM modules. Each entry powers the
// generic list / create / detail pages under /app/[resource]. Leads keeps its
// own bespoke pages and is intentionally not here.

import {
  KYC_STATUSES, OPPORTUNITY_STAGES, DEAL_STATUSES, PROJECT_STATUSES, PLOT_STATUSES,
  PLOT_FACINGS, CAMPAIGN_CHANNELS, CAMPAIGN_STATUSES, QUOTATION_STATUSES, BOOKING_STATUSES,
  PAYMENT_STATUSES, PAYMENT_MODES, TASK_STATUSES, TASK_PRIORITIES, VISIT_STATUSES,
  FOLLOWUP_PRIORITIES, FOLLOWUP_STATUSES, humanize,
} from '@smartagro-crm/shared';

export type ColumnType = 'text' | 'money' | 'date' | 'number' | 'status';
export type FieldType =
  | 'text'
  | 'number'
  | 'money'
  | 'date'
  | 'textarea'
  | 'select'
  | 'ref'
  | 'file';

export interface ColumnDef {
  key: string;
  label: string;
  type?: ColumnType;
  sub?: string; // optional secondary line (e.g. email under phone)
}

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hidden?: boolean; // present in the payload, not rendered (auto-filled, e.g. by a file upload)
  options?: Option[]; // for select
  refPath?: string; // for ref — apiPath of related resource
  refLabel?: string; // for ref — field on the related row to display
}

export interface FilterDef {
  key: string;
  label: string;
  options: Option[];
}

export interface ResourceConfig {
  slug: string;
  title: string;
  singular: string;
  apiPath: string;
  searchable?: boolean;
  columns: ColumnDef[];
  fields: FieldDef[];
  filters?: FilterDef[];
}

const toOptions = (values: readonly string[]): Option[] =>
  values.map((v) => ({ value: v, label: humanize(v) }));

const KYC = toOptions(KYC_STATUSES);
const OPP_STAGE = toOptions(OPPORTUNITY_STAGES);
const DEAL_STATUS = toOptions(DEAL_STATUSES);
const PROJECT_STATUS = toOptions(PROJECT_STATUSES);
const PLOT_STATUS = toOptions(PLOT_STATUSES);
const PLOT_FACING = toOptions(PLOT_FACINGS);
const CAMPAIGN_CHANNEL = toOptions(CAMPAIGN_CHANNELS);
const CAMPAIGN_STATUS = toOptions(CAMPAIGN_STATUSES);
const QUOTATION_STATUS = toOptions(QUOTATION_STATUSES);
const BOOKING_STATUS = toOptions(BOOKING_STATUSES);
const PAYMENT_STATUS = toOptions(PAYMENT_STATUSES);
const PAYMENT_MODE = toOptions(PAYMENT_MODES);
const TASK_STATUS = toOptions(TASK_STATUSES);
const TASK_PRIORITY = toOptions(TASK_PRIORITIES);
const VISIT_STATUS = toOptions(VISIT_STATUSES);
const FU_PRIORITY = toOptions(FOLLOWUP_PRIORITIES);
const FU_STATUS = toOptions(FOLLOWUP_STATUSES);

export const RESOURCES: Record<string, ResourceConfig> = {
  customers: {
    slug: 'customers',
    title: 'Customers',
    singular: 'Customer',
    apiPath: 'customers',
    searchable: true,
    filters: [{ key: 'kycStatus', label: 'KYC', options: KYC }],
    columns: [
      { key: 'fullName', label: 'Name' },
      { key: 'phone', label: 'Phone', sub: 'email' },
      { key: 'city', label: 'City' },
      { key: 'kycStatus', label: 'KYC', type: 'status' },
      { key: 'createdAt', label: 'Added', type: 'date' },
    ],
    fields: [
      { key: 'fullName', label: 'Full name', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'pan', label: 'PAN', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'pincode', label: 'Pincode', type: 'text' },
      { key: 'kycStatus', label: 'KYC status', type: 'select', options: KYC },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  opportunities: {
    slug: 'opportunities',
    title: 'Opportunities',
    singular: 'Opportunity',
    apiPath: 'opportunities',
    searchable: true,
    filters: [{ key: 'stage', label: 'Stage', options: OPP_STAGE }],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'stage', label: 'Stage', type: 'status' },
      { key: 'value', label: 'Value', type: 'money' },
      { key: 'probability', label: 'Prob %', type: 'number' },
      { key: 'expectedClose', label: 'Expected close', type: 'date' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'stage', label: 'Stage', type: 'select', options: OPP_STAGE },
      { key: 'value', label: 'Value (₹)', type: 'money' },
      { key: 'probability', label: 'Probability %', type: 'number' },
      { key: 'expectedClose', label: 'Expected close', type: 'date' },
      { key: 'customerId', label: 'Customer', type: 'ref', refPath: 'customers', refLabel: 'fullName' },
      { key: 'projectId', label: 'Project', type: 'ref', refPath: 'projects', refLabel: 'name' },
      { key: 'plotId', label: 'Plot', type: 'ref', refPath: 'plots', refLabel: 'plotNumber' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  deals: {
    slug: 'deals',
    title: 'Deals',
    singular: 'Deal',
    apiPath: 'deals',
    searchable: true,
    filters: [{ key: 'status', label: 'Status', options: DEAL_STATUS }],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'closedAt', label: 'Closed', type: 'date' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'amount', label: 'Amount (₹)', type: 'money' },
      { key: 'status', label: 'Status', type: 'select', options: DEAL_STATUS },
      { key: 'opportunityId', label: 'Opportunity', type: 'ref', refPath: 'opportunities', refLabel: 'title' },
      { key: 'customerId', label: 'Customer', type: 'ref', refPath: 'customers', refLabel: 'fullName' },
      { key: 'plotId', label: 'Plot', type: 'ref', refPath: 'plots', refLabel: 'plotNumber' },
      { key: 'closedAt', label: 'Closed at', type: 'date' },
    ],
  },
  projects: {
    slug: 'projects',
    title: 'Projects',
    singular: 'Project',
    apiPath: 'projects',
    searchable: true,
    filters: [{ key: 'status', label: 'Status', options: PROJECT_STATUS }],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'totalPlots', label: 'Plots', type: 'number' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'totalAreaSqft', label: 'Total area (sqft)', type: 'number' },
      { key: 'totalPlots', label: 'Total plots', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUS },
      { key: 'launchDate', label: 'Launch date', type: 'date' },
    ],
  },
  plots: {
    slug: 'plots',
    title: 'Plot Inventory',
    singular: 'Plot',
    apiPath: 'plots',
    searchable: true,
    filters: [{ key: 'status', label: 'Status', options: PLOT_STATUS }],
    columns: [
      { key: 'plotNumber', label: 'Plot #' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'areaSqft', label: 'Area (sqft)', type: 'number' },
      { key: 'totalPrice', label: 'Price', type: 'money' },
      { key: 'facing', label: 'Facing' },
    ],
    fields: [
      { key: 'projectId', label: 'Project', type: 'ref', refPath: 'projects', refLabel: 'name', required: true },
      { key: 'plotNumber', label: 'Plot number', type: 'text', required: true },
      { key: 'areaSqft', label: 'Area (sqft)', type: 'number', required: true },
      { key: 'pricePerSqft', label: 'Price / sqft (₹)', type: 'money' },
      { key: 'totalPrice', label: 'Total price (₹)', type: 'money', required: true },
      { key: 'facing', label: 'Facing', type: 'select', options: PLOT_FACING },
      { key: 'status', label: 'Status', type: 'select', options: PLOT_STATUS },
      { key: 'block', label: 'Block', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  campaigns: {
    slug: 'campaigns',
    title: 'Campaigns',
    singular: 'Campaign',
    apiPath: 'campaigns',
    searchable: true,
    filters: [
      { key: 'status', label: 'Status', options: CAMPAIGN_STATUS },
      { key: 'channel', label: 'Channel', options: CAMPAIGN_CHANNEL },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'channel', label: 'Channel', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'budget', label: 'Budget', type: 'money' },
      { key: 'spent', label: 'Spent', type: 'money' },
      { key: 'leadsCount', label: 'Leads', type: 'number' },
    ],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'channel', label: 'Channel', type: 'select', options: CAMPAIGN_CHANNEL },
      { key: 'status', label: 'Status', type: 'select', options: CAMPAIGN_STATUS },
      { key: 'budget', label: 'Budget (₹)', type: 'money' },
      { key: 'spent', label: 'Spent (₹)', type: 'money' },
      { key: 'leadsCount', label: 'Leads count', type: 'number' },
      { key: 'startDate', label: 'Start date', type: 'date' },
      { key: 'endDate', label: 'End date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  quotations: {
    slug: 'quotations',
    title: 'Quotations',
    singular: 'Quotation',
    apiPath: 'quotations',
    filters: [{ key: 'status', label: 'Status', options: QUOTATION_STATUS }],
    columns: [
      { key: 'quotationNumber', label: 'Number' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'total', label: 'Total', type: 'money' },
      { key: 'validUntil', label: 'Valid until', type: 'date' },
    ],
    fields: [
      { key: 'quotationNumber', label: 'Quotation number', type: 'text', required: true },
      { key: 'customerId', label: 'Customer', type: 'ref', refPath: 'customers', refLabel: 'fullName' },
      { key: 'plotId', label: 'Plot', type: 'ref', refPath: 'plots', refLabel: 'plotNumber' },
      { key: 'projectId', label: 'Project', type: 'ref', refPath: 'projects', refLabel: 'name' },
      { key: 'amount', label: 'Amount (₹)', type: 'money' },
      { key: 'tax', label: 'Tax (₹)', type: 'money' },
      { key: 'discount', label: 'Discount (₹)', type: 'money' },
      { key: 'total', label: 'Total (₹)', type: 'money' },
      { key: 'status', label: 'Status', type: 'select', options: QUOTATION_STATUS },
      { key: 'validUntil', label: 'Valid until', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  bookings: {
    slug: 'bookings',
    title: 'Bookings',
    singular: 'Booking',
    apiPath: 'bookings',
    filters: [{ key: 'status', label: 'Status', options: BOOKING_STATUS }],
    columns: [
      { key: 'bookingNumber', label: 'Number' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'bookingAmount', label: 'Booking amt', type: 'money' },
      { key: 'totalAmount', label: 'Total', type: 'money' },
      { key: 'agreementDate', label: 'Agreement', type: 'date' },
    ],
    fields: [
      { key: 'bookingNumber', label: 'Booking number', type: 'text', required: true },
      { key: 'customerId', label: 'Customer', type: 'ref', refPath: 'customers', refLabel: 'fullName', required: true },
      { key: 'plotId', label: 'Plot', type: 'ref', refPath: 'plots', refLabel: 'plotNumber', required: true },
      { key: 'quotationId', label: 'Quotation', type: 'ref', refPath: 'quotations', refLabel: 'quotationNumber' },
      { key: 'projectId', label: 'Project', type: 'ref', refPath: 'projects', refLabel: 'name' },
      { key: 'bookingAmount', label: 'Booking amount (₹)', type: 'money' },
      { key: 'totalAmount', label: 'Total amount (₹)', type: 'money' },
      { key: 'agreementDate', label: 'Agreement date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: BOOKING_STATUS },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  payments: {
    slug: 'payments',
    title: 'Payments',
    singular: 'Payment',
    apiPath: 'payments',
    filters: [{ key: 'status', label: 'Status', options: PAYMENT_STATUS }],
    columns: [
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'mode', label: 'Mode', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'dueDate', label: 'Due', type: 'date' },
      { key: 'paidAt', label: 'Paid', type: 'date' },
    ],
    fields: [
      { key: 'amount', label: 'Amount (₹)', type: 'money', required: true },
      { key: 'mode', label: 'Mode', type: 'select', options: PAYMENT_MODE },
      { key: 'status', label: 'Status', type: 'select', options: PAYMENT_STATUS },
      { key: 'bookingId', label: 'Booking', type: 'ref', refPath: 'bookings', refLabel: 'bookingNumber' },
      { key: 'customerId', label: 'Customer', type: 'ref', refPath: 'customers', refLabel: 'fullName' },
      { key: 'dueDate', label: 'Due date', type: 'date' },
      { key: 'paidAt', label: 'Paid at', type: 'date' },
      { key: 'reference', label: 'Reference', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  receipts: {
    slug: 'receipts',
    title: 'Receipts',
    singular: 'Receipt',
    apiPath: 'receipts',
    columns: [
      { key: 'receiptNumber', label: 'Number' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'issuedAt', label: 'Issued', type: 'date' },
    ],
    fields: [
      { key: 'receiptNumber', label: 'Receipt number', type: 'text', required: true },
      { key: 'customerId', label: 'Customer', type: 'ref', refPath: 'customers', refLabel: 'fullName' },
      { key: 'amount', label: 'Amount (₹)', type: 'money', required: true },
      { key: 'issuedAt', label: 'Issued at', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  documents: {
    slug: 'documents',
    title: 'Documents',
    singular: 'Document',
    apiPath: 'documents',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'entityType', label: 'Entity' },
      { key: 'mimeType', label: 'Type' },
      { key: 'createdAt', label: 'Added', type: 'date' },
    ],
    fields: [
      { key: 'storagePath', label: 'File', type: 'file', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'entityType', label: 'Entity type', type: 'text', required: true },
      { key: 'entityId', label: 'Entity ID', type: 'text', required: true },
      { key: 'mimeType', label: 'MIME type', type: 'text', hidden: true },
      { key: 'sizeBytes', label: 'Size (bytes)', type: 'number', hidden: true },
    ],
  },
  tasks: {
    slug: 'tasks',
    title: 'Tasks',
    singular: 'Task',
    apiPath: 'tasks',
    filters: [
      { key: 'status', label: 'Status', options: TASK_STATUS },
      { key: 'priority', label: 'Priority', options: TASK_PRIORITY },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'priority', label: 'Priority', type: 'status' },
      { key: 'dueAt', label: 'Due', type: 'date' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: TASK_STATUS },
      { key: 'priority', label: 'Priority', type: 'select', options: TASK_PRIORITY },
      { key: 'dueAt', label: 'Due at', type: 'date' },
      { key: 'relatedLeadId', label: 'Related lead', type: 'ref', refPath: 'leads', refLabel: 'fullName' },
      { key: 'relatedCustomerId', label: 'Related customer', type: 'ref', refPath: 'customers', refLabel: 'fullName' },
    ],
  },
  'site-visits': {
    slug: 'site-visits',
    title: 'Site Visits',
    singular: 'Site Visit',
    apiPath: 'site-visits',
    filters: [{ key: 'status', label: 'Status', options: VISIT_STATUS }],
    columns: [
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'scheduledAt', label: 'Scheduled', type: 'date' },
    ],
    fields: [
      { key: 'leadId', label: 'Lead', type: 'ref', refPath: 'leads', refLabel: 'fullName', required: true },
      { key: 'scheduledAt', label: 'Scheduled at', type: 'date', required: true },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', options: VISIT_STATUS },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  'follow-ups': {
    slug: 'follow-ups',
    title: 'Follow-ups',
    singular: 'Follow-up',
    apiPath: 'follow-ups',
    filters: [
      { key: 'status', label: 'Status', options: FU_STATUS },
      { key: 'priority', label: 'Priority', options: FU_PRIORITY },
    ],
    columns: [
      { key: 'dueAt', label: 'Due', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'notes', label: 'Notes' },
    ],
    fields: [
      { key: 'leadId', label: 'Lead', type: 'ref', refPath: 'leads', refLabel: 'fullName', required: true },
      { key: 'dueAt', label: 'Due at', type: 'date', required: true },
      { key: 'priority', label: 'Priority', type: 'select', options: FU_PRIORITY },
      { key: 'status', label: 'Status', type: 'select', options: FU_STATUS },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
};

export function getResource(slug: string): ResourceConfig | undefined {
  return RESOURCES[slug];
}
