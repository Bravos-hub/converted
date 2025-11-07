import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  chargers,
  liveSessionSnapshot,
  sessionHistory as seedHistory,
  SessionHistoryItem,
} from '../constants/mock-data';

type SessionMethod = SessionHistoryItem['method'];

export type ActiveChargingSession = {
  id: string;
  chargerId: string;
  chargerName: string;
  site: string;
  driver: string;
  vehicle: string;
  method: SessionMethod;
  connectorId?: string;
  targetSoc: number;
  startedAt: string;
  durationMins: number;
  kwh: number;
  powerKw: number;
  cost: number;
  currency: string;
  status: 'charging' | 'stopping';
};

export type StartSessionPayload = {
  chargerId: string;
  chargerName?: string;
  site?: string;
  driver?: string;
  vehicle?: string;
  method?: SessionMethod;
  connectorId?: string;
  targetSoc?: number;
};

type ChargingSessionContextValue = {
  activeSession: ActiveChargingSession | null;
  history: SessionHistoryItem[];
  startSession: (payload: StartSessionPayload) => ActiveChargingSession;
  stopSession: () => SessionHistoryItem | null;
  isCharging: boolean;
};

const ChargingSessionContext = createContext<ChargingSessionContextValue | undefined>(undefined);

const TICK_INTERVAL_MS = 5000;
const MIN_POWER = 35;
const MAX_POWER = 95;

const findChargerName = (chargerId: string) =>
  chargers.find((c) => c.id === chargerId)?.name ?? chargerId;

const formatStartLabel = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let prefix = date.toLocaleDateString(undefined, { weekday: 'short' });
  if (date.toDateString() === now.toDateString()) prefix = 'Today';
  else if (date.toDateString() === yesterday.toDateString()) prefix = 'Yesterday';

  const time = date
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .replace(/^0/, '');
  return `${prefix} ${time}`;
};

const toHistoryEntry = (
  session: ActiveChargingSession,
  status: SessionHistoryItem['status'],
): SessionHistoryItem => ({
  id: session.id,
  chargerId: session.chargerId,
  driver: session.driver,
  method: session.method,
  energy: Number(session.kwh.toFixed(1)),
  cost: Math.round(session.cost),
  started: formatStartLabel(session.startedAt),
  status,
});

const generateSessionId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SES-${random}`;
};

const createActiveSession = (
  payload: StartSessionPayload,
  overrides: Partial<ActiveChargingSession> = {},
): ActiveChargingSession => {
  const now = new Date();
  return {
    id: overrides.id ?? generateSessionId(),
    chargerId: payload.chargerId,
    chargerName: payload.chargerName ?? findChargerName(payload.chargerId),
    site: payload.site ?? payload.chargerName ?? findChargerName(payload.chargerId),
    driver: payload.driver ?? 'Manual start',
    vehicle: payload.vehicle ?? 'Fleet vehicle',
    method: payload.method ?? 'App',
    connectorId: payload.connectorId,
    targetSoc: payload.targetSoc ?? 85,
    startedAt: overrides.startedAt ?? now.toISOString(),
    durationMins: overrides.durationMins ?? 0,
    kwh: overrides.kwh ?? 0,
    powerKw: overrides.powerKw ?? 60,
    cost: overrides.cost ?? 0,
    currency: overrides.currency ?? 'UGX',
    status: overrides.status ?? 'charging',
  };
};

const defaultActiveSession = createActiveSession(
  {
    chargerId: liveSessionSnapshot.charger,
    chargerName: findChargerName(liveSessionSnapshot.charger),
    site: liveSessionSnapshot.site,
    driver: 'Fleet 003',
    vehicle: liveSessionSnapshot.vehicle,
    method: liveSessionSnapshot.method as SessionMethod,
    targetSoc: liveSessionSnapshot.targetSoc,
  },
  {
    id: 'SES-2101',
    durationMins: liveSessionSnapshot.durationMins,
    kwh: liveSessionSnapshot.kwh,
    powerKw: liveSessionSnapshot.powerKw,
    cost: liveSessionSnapshot.cost,
    currency: liveSessionSnapshot.currency,
  },
);

export function ChargingSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveChargingSession | null>(defaultActiveSession);
  const [history, setHistory] = useState<SessionHistoryItem[]>(seedHistory);

  const finalizeSession = useCallback(
    (session: ActiveChargingSession, status: SessionHistoryItem['status']) => {
      const entry = toHistoryEntry(session, status);
      setHistory((prev) => {
        const idx = prev.findIndex((item) => item.id === entry.id);
        if (idx === -1) {
          return [entry, ...prev];
        }
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      });
      return entry;
    },
    [],
  );

  const startSession = useCallback(
    (payload: StartSessionPayload) => {
      const nextSession = createActiveSession(payload);
      setActiveSession((prev) => {
        if (prev) {
          finalizeSession(prev, 'completed');
        }
        return nextSession;
      });
      setHistory((prev) => {
        const entry = toHistoryEntry(nextSession, 'in-progress');
        const withoutDuplicate = prev.filter((item) => item.id !== entry.id);
        return [entry, ...withoutDuplicate];
      });
      return nextSession;
    },
    [finalizeSession],
  );

  const stopSession = useCallback(() => {
    let entry: SessionHistoryItem | null = null;
    setActiveSession((prev) => {
      if (!prev) return prev;
      entry = finalizeSession(prev, 'completed');
      return null;
    });
    return entry;
  }, [finalizeSession]);

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'charging') {
      return;
    }
    const interval = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev || prev.status !== 'charging') return prev;
        const nextPower = Math.max(
          MIN_POWER,
          Math.min(MAX_POWER, prev.powerKw + (Math.random() - 0.5) * 10),
        );
        const energyDelta = +(nextPower * (TICK_INTERVAL_MS / 3600000)).toFixed(2);
        return {
          ...prev,
          powerKw: Math.round(nextPower),
          kwh: +(prev.kwh + energyDelta).toFixed(2),
          cost: prev.cost + Math.round(nextPower * 5),
          durationMins: prev.durationMins + 1,
        };
      });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status]);

  const value = useMemo(
    () => ({
      activeSession,
      history,
      startSession,
      stopSession,
      isCharging: !!activeSession,
    }),
    [activeSession, history, startSession, stopSession],
  );

  return <ChargingSessionContext.Provider value={value}>{children}</ChargingSessionContext.Provider>;
}

export const useChargingSessions = () => {
  const ctx = useContext(ChargingSessionContext);
  if (!ctx) {
    throw new Error('useChargingSessions must be used within ChargingSessionProvider');
  }
  return ctx;
};
