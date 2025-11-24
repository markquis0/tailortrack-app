const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  path: string,
  { token, headers, ...options }: RequestOptions = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: 'tailor' | 'client' | null;
    isAnonymous?: boolean;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export interface ClientSummary {
  id: string;
  storeName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  clientUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  lastMeasurementUpdate: string | null;
  nextAppointment: {
    id: string;
    date: string;
    status: string;
  } | null;
}

export interface MeasurementRecord {
  clientId?: string;
  userId?: string;
  chest?: number;
  overarm?: number;
  waist?: number;
  hipSeat?: number;
  neck?: number;
  arm?: number;
  pantOutseam?: number;
  pantInseam?: number;
  coatInseam?: number;
  height?: number;
  weight?: number;
  coatSize?: string;
  pantSize?: string;
  dressShirtSize?: string;
  shoeSize?: string;
  materialPreference?: string;
  dateTaken?: string;
}

const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'tailor' | 'client';
  }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createAnonymous: () =>
    request<AuthResponse>('/auth/anonymous', {
      method: 'POST',
    }),
  updateProfile: (
    token: string,
    payload: { firstName?: string; lastName?: string; email?: string }
  ) =>
    request<{ user: AuthResponse['user'] }>('/auth/update-profile', {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    }),
  getClients: (token: string) =>
    request<ClientSummary[] | ClientSummary>('/clients', {
      token,
    }),
  getMeasurements: (token: string, clientId?: string) => {
    const path = clientId ? `/measurements/${clientId}` : '/measurements/me';
    return request<MeasurementRecord>(path, {
      token,
    });
  },
  upsertMeasurements: (token: string, data: MeasurementRecord) =>
    request<MeasurementRecord>('/measurements', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  getClient: (token: string, clientId: string) =>
    request<ClientSummary>(`/clients/${clientId}`, { token }),
  updateClient: (
    token: string,
    clientId: string,
    payload: { storeName?: string | null; notes?: string | null }
  ) =>
    request<ClientSummary>(`/clients/${clientId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }),
};

export interface AppointmentRecord {
  id: string;
  clientId: string;
  title: string;
  date: string;
  location?: string | null;
  notes?: string | null;
  status: 'scheduled' | 'completed' | 'canceled';
}

export interface TimerRecord {
  id: string;
  clientId: string;
  tailorId: string;
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  description?: string | null;
}

export const appointmentApi = {
  list: (token: string, clientId: string) =>
    request<AppointmentRecord[]>(`/appointments/${clientId}`, { token }),
  create: (
    token: string,
    payload: { clientId: string; title: string; date: Date; location?: string; notes?: string }
  ) =>
    request<AppointmentRecord>('/appointments', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  update: (
    token: string,
    appointmentId: string,
    payload: Partial<{
      title: string;
      date: Date;
      location: string;
      notes: string;
      status: 'scheduled' | 'completed' | 'canceled';
    }>
  ) =>
    request<AppointmentRecord>(`/appointments/${appointmentId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }),
};

export const timerApi = {
  list: (token: string, clientId: string) =>
    request<TimerRecord[]>(`/timers/${clientId}`, { token }),
  start: (
    token: string,
    payload: { clientId: string; description?: string }
  ) =>
    request<TimerRecord>('/timers/start', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
  stop: (
    token: string,
    payload: { timerId: string; endTime?: Date }
  ) =>
    request<TimerRecord>('/timers/stop', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),
};

export default api;

