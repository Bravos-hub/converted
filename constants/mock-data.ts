import { Colors } from './theme';

// Shared types ---------------------------------------------------------------
export type KPITrend = {
  id: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  data: number[];
  unit?: string;
};

export type ChargerConnector = {
  id: string;
  format: 'CCS2' | 'Type2' | 'CHAdeMO';
  status: 'available' | 'charging' | 'offline' | 'disabled';
  powerKw: number;
  enabled: boolean;
};

export type Charger = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'busy' | 'fault';
  isCommercial: boolean;
  avgUtilization: number;
  lastSession: string;
  targetSoc: number;
  pricing: {
    label: string;
    rate: string;
    window?: string;
  }[];
  availability: {
    label: string;
    window: string;
  }[];
  connectors: ChargerConnector[];
  alerts?: { severity: 'info' | 'warning' | 'critical'; message: string }[];
};

export type SessionHistoryItem = {
  id: string;
  chargerId: string;
  driver: string;
  method: 'QR' | 'RFID' | 'App';
  energy: number;
  cost: number;
  started: string;
  status: 'completed' | 'in-progress' | 'failed';
};

export type WalletTransaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  timestamp: string;
};

export type WalletInvoice = {
  id: string;
  period: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
};

export type NotificationPreferences = {
  push: boolean;
  sms: boolean;
  email: boolean;
  offlineAlerts: boolean;
  weeklyDigest: boolean;
};

// Dashboard ------------------------------------------------------------------
export const dashboardKpis: KPITrend[] = [
  {
    id: 'energy',
    label: 'Energy',
    value: '248 kWh',
    change: '+12%',
    positive: true,
    unit: 'kWh',
    data: [12, 14, 9, 18, 22, 17, 21],
  },
  {
    id: 'sessions',
    label: 'Sessions',
    value: '36',
    change: '+6%',
    positive: true,
    data: [4, 5, 4, 6, 5, 7, 5],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: 'UGX 1.52M',
    change: '+18%',
    positive: true,
    unit: 'UGX',
    data: [120, 140, 110, 180, 220, 175, 210],
  },
];

export const liveSessionSnapshot = {
  charger: 'EVZ-UG-KLA-000377',
  site: 'Office DC90',
  vehicle: 'Nissan Ariya • UBL 662Z',
  method: 'QR',
  status: 'Charging',
  targetSoc: 85,
  startedAt: '11:05',
  durationMins: 34,
  kwh: 21.4,
  cost: 18600,
  currency: 'UGX',
  powerKw: 68,
};

export const healthAlerts = [
  { id: 'alert-1', severity: 'critical', message: 'DC90 • Connector 1 fault — insulation alert' },
  { id: 'alert-2', severity: 'warning', message: 'Home AC22 offline for 15m (Wi-Fi)' },
  { id: 'alert-3', severity: 'info', message: 'Firmware 3.4.2 ready for Guest AC22' },
];

// Chargers -------------------------------------------------------------------
export const chargers: Charger[] = [
  {
    id: 'EVZ-UG-KLA-000377',
    name: 'Office — DC90',
    location: 'Lugogo Bypass',
    status: 'busy',
    isCommercial: true,
    avgUtilization: 82,
    lastSession: '11:05 • 21.4 kWh',
    targetSoc: 85,
    pricing: [
      { label: 'Base rate', rate: 'UGX 1,200/kWh' },
      { label: 'Peak (5p-10p)', rate: 'UGX 1,450/kWh', window: '17:00 — 22:00' },
    ],
    availability: [
      { label: 'Weekday', window: '05:00 — 23:00' },
      { label: 'Weekend', window: '08:00 — 22:00' },
      { label: 'Holiday', window: 'custom' },
    ],
    connectors: [
      { id: 'C1', format: 'CCS2', status: 'charging', powerKw: 90, enabled: true },
      { id: 'C2', format: 'CHAdeMO', status: 'available', powerKw: 65, enabled: true },
    ],
    alerts: [{ severity: 'warning', message: 'Schedule holiday mode' }],
  },
  {
    id: 'EVZ-UG-KLA-000123',
    name: 'Home — AC22',
    location: 'Bugolobi',
    status: 'online',
    isCommercial: false,
    avgUtilization: 38,
    lastSession: '09:42 • 8.1 kWh',
    targetSoc: 90,
    pricing: [{ label: 'Home', rate: 'UGX 750/kWh' }],
    availability: [{ label: 'Daily', window: '24/7' }],
    connectors: [
      { id: 'C1', format: 'Type2', status: 'available', powerKw: 22, enabled: true },
      { id: 'C2', format: 'Type2', status: 'offline', powerKw: 22, enabled: false },
    ],
    alerts: [{ severity: 'info', message: 'Wi-Fi signal weak' }],
  },
  {
    id: 'EVZ-UG-KLA-000522',
    name: 'Guest — AC22',
    location: 'Ntinda',
    status: 'offline',
    isCommercial: true,
    avgUtilization: 45,
    lastSession: 'Yesterday • 11.6 kWh',
    targetSoc: 80,
    pricing: [{ label: 'Base', rate: 'UGX 1,050/kWh' }],
    availability: [{ label: 'Daily', window: '06:00 — 22:00' }],
    connectors: [
      { id: 'C1', format: 'Type2', status: 'offline', powerKw: 22, enabled: false },
      { id: 'C2', format: 'Type2', status: 'offline', powerKw: 22, enabled: false },
    ],
    alerts: [{ severity: 'critical', message: 'Breaker tripped — dispatch tech' }],
  },
];

// Sessions -------------------------------------------------------------------
export const sessionHistory: SessionHistoryItem[] = [
  { id: 'SES-2101', chargerId: 'EVZ-UG-KLA-000377', driver: 'Brenda', method: 'QR', energy: 21.4, cost: 18600, started: 'Today 10:31', status: 'completed' },
  { id: 'SES-2098', chargerId: 'EVZ-UG-KLA-000123', driver: 'Ronald', method: 'App', energy: 8.1, cost: 6075, started: 'Today 08:55', status: 'completed' },
  { id: 'SES-2092', chargerId: 'EVZ-UG-KLA-000522', driver: 'Guest QR', method: 'QR', energy: 0, cost: 0, started: 'Yesterday 22:10', status: 'failed' },
  { id: 'SES-2087', chargerId: 'EVZ-UG-KLA-000377', driver: 'Fleet 003', method: 'RFID', energy: 32.2, cost: 28980, started: 'Mon 18:05', status: 'completed' },
  { id: 'SES-2081', chargerId: 'EVZ-UG-KLA-000123', driver: 'Mary', method: 'App', energy: 5.7, cost: 4275, started: 'Mon 07:44', status: 'completed' },
];

export const sessionFilters = ['7d', '30d', '90d'] as const;

export const sessionAnalytics = [
  { id: 'trend-energy', label: 'Energy (7d)', value: '248 kWh', change: '+12%' },
  { id: 'trend-duration', label: 'Avg duration', value: '47 min', change: '-5%' },
  { id: 'trend-cost', label: 'Revenue', value: 'UGX 1.52M', change: '+18%' },
];

export const upcomingReservations = [
  { id: 'RES-302', driver: 'Daniel', site: 'Office — DC90', window: 'Today 17:00-18:00', status: 'awaiting' },
  { id: 'RES-299', driver: 'Fleet 004', site: 'Guest — AC22', window: 'Tomorrow 08:30-09:30', status: 'approved' },
];

// Wallet ---------------------------------------------------------------------
export const walletSummary = {
  balance: 1825000,
  currency: 'UGX',
  reserved: 240000,
  payoutEta: 'Thu, 4:00 PM',
};

export const walletTransactions: WalletTransaction[] = [
  { id: 'TX-9101', type: 'credit', amount: 18600, currency: 'UGX', description: 'Session SES-2101 • Office DC90', timestamp: 'Today 11:05' },
  { id: 'TX-9098', type: 'credit', amount: 6075, currency: 'UGX', description: 'Session SES-2098 • Home AC22', timestamp: 'Today 09:04' },
  { id: 'TX-9090', type: 'debit', amount: 150000, currency: 'UGX', description: 'Withdrawal to Stanbic ****2210', timestamp: 'Yesterday 18:20' },
  { id: 'TX-9088', type: 'credit', amount: 28980, currency: 'UGX', description: 'Session SES-2087 • Office DC90', timestamp: 'Mon 18:50' },
];

export const walletInvoices: WalletInvoice[] = [
  { id: 'INV-2025-05', period: 'May 2025', amount: 1120000, currency: 'UGX', status: 'paid' },
  { id: 'INV-2025-06', period: 'Jun 2025', amount: 1265000, currency: 'UGX', status: 'pending' },
];

export const walletCards = [
  { id: 'card-1', brand: 'VISA', last4: '8842', exp: '09/27', default: true, verified: true },
  { id: 'card-2', brand: 'Mastercard', last4: '1183', exp: '04/26', verified: false },
];

// Settings -------------------------------------------------------------------
export const accountProfile = {
  name: 'Ronald Tayebwa',
  email: 'ronald@evzone.africa',
  phone: '+256 771 123456',
  plan: 'Pro • 18 chargers',
  language: 'English',
  currency: 'UGX',
};

export const notificationPreferences: NotificationPreferences = {
  push: true,
  sms: false,
  email: true,
  offlineAlerts: true,
  weeklyDigest: true,
};

export const supportShortcuts = [
  { id: 'faq', label: 'FAQ & Guides', icon: 'book-open-page-variant' },
  { id: 'ticket', label: 'Open support ticket', icon: 'lifebuoy' },
  { id: 'call', label: '24/7 hotline', icon: 'phone' },
];

export const accessUsers = [
  { id: 'USR-001', name: 'Robert Fox', role: 'Family', methods: ['App', 'RFID'], vehicles: 2 },
  { id: 'USR-004', name: 'Pool RFID', role: 'Guest', methods: ['RFID'], vehicles: 5 },
  { id: 'USR-006', name: 'Fleet Ops', role: 'Employee', methods: ['App'], vehicles: 12 },
];

export const accessPolicies = [
  { id: 'policy-app', label: 'App login', enabled: true },
  { id: 'policy-qr', label: 'Guest QR (time-bound)', enabled: true },
  { id: 'policy-rfid', label: 'RFID cards', enabled: true },
];

export const availabilityWindows = chargers.reduce<{ [id: string]: Charger['availability'] }>((acc, charger) => {
  acc[charger.id] = charger.availability;
  return acc;
}, {});

export const pricingTemplates = chargers.reduce<{ [id: string]: Charger['pricing'] }>((acc, charger) => {
  acc[charger.id] = charger.pricing;
  return acc;
}, {});

// Simple helpers -------------------------------------------------------------
export function getStatusTint(status: Charger['status']) {
  const palette = Colors.light;
  switch (status) {
    case 'online':
      return { bg: palette.success, fg: palette.onPrimary };
    case 'busy':
      return { bg: palette.warning, fg: '#111111' };
    case 'offline':
      return { bg: palette.muted, fg: '#fff' };
    case 'fault':
    default:
      return { bg: palette.error, fg: '#fff' };
  }
}
