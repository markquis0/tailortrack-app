'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import api, { MeasurementRecord } from '../../services/api';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';

const numericFields: Array<keyof MeasurementRecord> = [
  'chest',
  'overarm',
  'waist',
  'hipSeat',
  'neck',
  'arm',
  'pantOutseam',
  'pantInseam',
  'coatInseam',
  'height',
  'weight',
];

const sizeFields: Array<keyof MeasurementRecord> = ['coatSize', 'dressShirtSize', 'shoeSize'];

const preferenceFields: Array<keyof MeasurementRecord> = ['materialPreference'];

const fieldLabels: Partial<Record<keyof MeasurementRecord, string>> = {
  chest: 'Chest',
  overarm: 'Overarm',
  waist: 'Waist',
  hipSeat: 'Hip Seat',
  neck: 'Neck',
  arm: 'Arm',
  pantOutseam: 'Pant Outseam',
  pantInseam: 'Pant Inseam',
  coatInseam: 'Coat Inseam',
  height: 'Height',
  weight: 'Weight',
  coatSize: 'Coat Size',
  pantSize: 'Pant Size',
  dressShirtSize: 'Dress Shirt Size',
  shoeSize: 'Shoe Size',
  materialPreference: 'Material Preference',
};

const formatHeightInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const totalInches = parseInt(digits, 10) || 0;
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}''`;
};

const parseHeightToInches = (formatted: string) => {
  if (!formatted) return undefined;
  const digits = formatted.replace(/\D/g, '');
  if (!digits) return undefined;
  return parseInt(digits, 10);
};

const formatHeightFromNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return '';
  }
  const totalInches = Math.max(0, Math.round(value));
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}''`;
};

export default function MeasurementsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pantWaist, setPantWaist] = useState('');
  const [pantLength, setPantLength] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(undefined);
    try {
      if (user?.isAnonymous) {
        const measurementResponse = await api.getMeasurements(token).catch(() => null);
        const nextValues: Record<string, string> = {};
        if (measurementResponse) {
          if (measurementResponse.pantSize) {
            const parts = String(measurementResponse.pantSize)
              .split(/[xX/]/)
              .map((part) => part.trim())
              .filter(Boolean);
            setPantWaist(parts[0] ?? '');
            setPantLength(parts[1] ?? '');
          } else {
            setPantWaist('');
            setPantLength('');
          }
          [...numericFields, ...sizeFields, ...preferenceFields].forEach((field) => {
            const value = measurementResponse[field];
            if (value !== undefined && value !== null) {
              if (field === 'height') {
                nextValues[field] = formatHeightFromNumber(Number(value));
              } else {
                nextValues[field] = String(value);
              }
            }
          });
        }
        setValues(nextValues);
      } else {
        const clientResponse = await api.getClients(token);
        const normalized = Array.isArray(clientResponse) ? clientResponse[0] : clientResponse;
        if (!normalized) {
          throw new Error('Client profile not found');
        }
        setClientId(normalized.id);
        const measurementResponse = await api.getMeasurements(token, normalized.id).catch(() => null);
        const nextValues: Record<string, string> = {};
        if (measurementResponse) {
          if (measurementResponse.pantSize) {
            const parts = String(measurementResponse.pantSize)
              .split(/[xX/]/)
              .map((part) => part.trim())
              .filter(Boolean);
            setPantWaist(parts[0] ?? '');
            setPantLength(parts[1] ?? '');
          } else {
            setPantWaist('');
            setPantLength('');
          }
          [...numericFields, ...sizeFields, ...preferenceFields].forEach((field) => {
            const value = measurementResponse[field];
            if (value !== undefined && value !== null) {
              if (field === 'height') {
                nextValues[field] = formatHeightFromNumber(Number(value));
              } else {
                nextValues[field] = String(value);
              }
            }
          });
        }
        setValues(nextValues);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateValue = (key: string, value: string) => {
    if (key === 'height') {
      const formatted = value.trim() ? formatHeightInput(value) : '';
      setValues((prev) => ({ ...prev, [key]: formatted }));
      return;
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!token) return;
    if (!user?.isAnonymous && !clientId) return;

    setLoading(true);
    try {
      const payload: MeasurementRecord = user?.isAnonymous
        ? { userId: user.id }
        : { clientId: clientId! };

      numericFields.forEach((field) => {
        const val = values[field];
        if (val) {
          if (field === 'height') {
            const parsedHeight = parseHeightToInches(val);
            if (parsedHeight !== undefined) {
              payload[field] = parsedHeight as never;
            }
            return;
          }
          const parsed = Number(val);
          if (!Number.isNaN(parsed)) {
            payload[field] = parsed as never;
          }
        }
      });

      sizeFields.forEach((field) => {
        const val = values[field];
        if (val) {
          payload[field] = val as never;
        }
      });

      preferenceFields.forEach((field) => {
        const val = values[field];
        if (val) {
          payload[field] = val as never;
        }
      });

      const formattedPantWaist = pantWaist.trim();
      const formattedPantLength = pantLength.trim();
      if (formattedPantWaist || formattedPantLength) {
        const pantSizeValue =
          formattedPantWaist && formattedPantLength
            ? `${formattedPantWaist}x${formattedPantLength}`
            : formattedPantWaist || formattedPantLength;
        payload.pantSize = pantSizeValue as never;
      }

      await api.upsertMeasurements(token, payload);
      alert('Measurements updated successfully!');
      router.push('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save measurements');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user?.isAnonymous && !clientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F7A8C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading measurements...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAnonymous && !clientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">
          {error ?? 'We need your profile to update measurements.'}
        </p>
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
              <Link href="/" className="text-[#1F7A8C] hover:text-[#174E5A]">
                Dashboard
              </Link>
              <Link href="/account" className="text-[#1F7A8C] hover:text-[#174E5A]">
                Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <Card>
          <SectionHeader
            title="Body measurements"
            subtitle="Enter the latest measurements in inches or centimeters."
          />
          {numericFields.map((field) => (
            <Input
              key={field}
              label={fieldLabels[field]}
              type={field === 'height' ? 'text' : 'number'}
              value={values[field] ?? ''}
              onChange={(e) => updateValue(field, e.target.value)}
              placeholder={field === 'height' ? "5' 10''" : '0.0'}
            />
          ))}
        </Card>

        <Card>
          <SectionHeader title="Sizes" subtitle="Share the sizing info your tailor relies on." />
          <Input
            label="Pant Waist Size"
            type="text"
            value={pantWaist}
            onChange={(e) => setPantWaist(e.target.value)}
            placeholder="32"
          />
          <Input
            label="Pant Length"
            type="text"
            value={pantLength}
            onChange={(e) => setPantLength(e.target.value)}
            placeholder="34"
          />
          {sizeFields.map((field) => (
            <Input
              key={field}
              label={fieldLabels[field]}
              type="text"
              value={values[field] ?? ''}
              onChange={(e) => updateValue(field, e.target.value)}
              placeholder="42R / 10.5 US"
            />
          ))}
        </Card>

        <Card>
          <SectionHeader
            title="Material Preferences"
            subtitle="Share your favorite fabrics and materials."
          />
          {preferenceFields.map((field) => (
            <Input
              key={field}
              label={fieldLabels[field]}
              type="text"
              value={values[field] ?? ''}
              onChange={(e) => updateValue(field, e.target.value)}
              placeholder="Linen, cotton..."
            />
          ))}
        </Card>

        <Button onClick={save} disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save measurements'}
        </Button>
      </main>
    </div>
  );
}

