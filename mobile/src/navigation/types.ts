export type TailorStackParamList = {
  TailorDashboard: undefined;
  ClientProfile: { clientId: string; clientName?: string };
  Timer: { clientId?: string; clientName?: string } | undefined;
  TailorAppointments: { clientId?: string; clientName?: string } | undefined;
};

export type ClientStackParamList = {
  ClientDashboard: undefined;
  ClientMeasurements: undefined;
  ClientMaterials: undefined;
  ClientNotes: undefined;
  ClientAppointments: undefined;
};

export type RootTabParamList = {
  Tailor: undefined;
  Client: undefined;
  Account: undefined;
};

