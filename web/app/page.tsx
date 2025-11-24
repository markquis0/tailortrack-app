'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import api, { ClientSummary, MeasurementRecord } from '../services/api';
import { appointmentApi } from '../services/api';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [client, setClient] = useState<ClientSummary | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!token || user === undefined) return;

    setLoading(true);
    setError(undefined);
    try {
      if (user?.isAnonymous) {
        const measurementResponse = await api.getMeasurements(token).catch(() => null);
        setMeasurements(measurementResponse);
        setClient(null);
      } else {
        const response = await api.getClients(token);
        const normalized = Array.isArray(response) ? response[0] : response;
        setClient(normalized ?? null);
        if (normalized) {
          const measurementResponse = await api
            .getMeasurements(token, normalized.id)
            .catch(() => null);
          setMeasurements(measurementResponse);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  const formatHeight = (value?: number) => {
    if (value === undefined || value === null) return '—';
    const totalInches = Math.max(0, Math.round(value));
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}' ${inches}''`;
  };

  if (user === undefined || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F7A8C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">TailorTrack</h1>
            <div className="flex gap-4">
              <Link href="/measurements" className="text-[#1F7A8C] hover:text-[#174E5A]">
                Measurements
              </Link>
              <Link href="/account" className="text-[#1F7A8C] hover:text-[#174E5A]">
                Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <Card>
          <SectionHeader
            title="Welcome to TailorTrack!"
            subtitle={
              user?.isAnonymous
                ? 'Track your measurements and preferences. Add your name and email in Account to personalize your profile.'
                : 'Review measurements, notes, and upcoming fittings.'
            }
          />
          {!user?.isAnonymous && client && (
            <>
              <p className="text-xs uppercase tracking-wide text-gray-600 mt-4">Tailor</p>
              <p className="text-gray-900 mt-1">
                {client.notes ? 'Assigned tailor • see notes below' : 'No tailor connected yet'}
              </p>
              <p className="text-xs uppercase tracking-wide text-gray-600 mt-4">Store focus</p>
              <p className="text-gray-900 mt-1">{client.storeName ?? 'Add your preferred stores.'}</p>
            </>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="Quick measurements"
            subtitle="Keep your measurements up to date for custom fits."
          />
          {measurements ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {[
                  { label: 'Chest', value: measurements.chest },
                  { label: 'Overarm', value: measurements.overarm },
                  { label: 'Waist', value: measurements.waist },
                  { label: 'Hip/Seat', value: measurements.hipSeat },
                  { label: 'Neck', value: measurements.neck },
                  { label: 'Arm', value: measurements.arm },
                  { label: 'Pant Outseam', value: measurements.pantOutseam },
                  { label: 'Pant Inseam', value: measurements.pantInseam },
                  { label: 'Coat Inseam', value: measurements.coatInseam },
                  { label: 'Height', value: formatHeight(measurements.height) },
                  { label: 'Weight', value: measurements.weight },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
                      {item.label}
                    </p>
                    <p className="text-base font-medium text-gray-900">{item.value ?? '—'}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-4">
                  Sizes
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Coat Size', value: measurements.coatSize },
                    { label: 'Pant Size', value: measurements.pantSize },
                    { label: 'Dress Shirt', value: measurements.dressShirtSize },
                    { label: 'Shoe Size', value: measurements.shoeSize },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
                        {item.label}
                      </p>
                      <p className="text-base font-medium text-gray-900">{item.value ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {measurements.materialPreference && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-2">
                    Material Preference
                  </p>
                  <p className="text-base text-gray-900">{measurements.materialPreference}</p>
                </div>
              )}

              <Link
                href="/measurements"
                className="inline-block mt-6 text-[#1F7A8C] font-semibold hover:text-[#174E5A]"
              >
                Update measurements →
              </Link>
            </div>
          ) : (
            <p className="text-gray-600 text-center mt-4">
              Measurements haven&apos;t been added yet. Update them to get tailored guidance.
            </p>
          )}
        </Card>

        {!user?.isAnonymous && client && (
          <Card>
            <SectionHeader title="Notes" subtitle="Personal reminders for fit and style." />
            <p className="text-gray-900">{client.notes ?? 'Add fit notes or reminders.'}</p>
          </Card>
        )}
      </main>
    </div>
  );
}
