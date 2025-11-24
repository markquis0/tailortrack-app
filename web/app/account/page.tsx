'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function AccountPage() {
  const { user, logout, updateProfile, status } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F7A8C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account...</p>
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
              <Link href="/" className="text-[#1F7A8C] hover:text-[#174E5A]">
                Dashboard
              </Link>
              <Link href="/measurements" className="text-[#1F7A8C] hover:text-[#174E5A]">
                Measurements
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <SectionHeader
            title="Account Information"
            subtitle={
              user?.isAnonymous
                ? 'Add your name and email to personalize your account. This is optional.'
                : 'Update your profile information.'
            }
          />
          {user?.role && (
            <>
              <p className="text-xs uppercase tracking-wide text-gray-600 mt-4">Role</p>
              <p className="text-gray-900 mt-1 capitalize">{user.role}</p>
            </>
          )}
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
          />
          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
          />
          {user?.isAnonymous && (
            <p className="text-sm text-gray-600 italic mt-2">
              Adding your information will convert your anonymous account to a personalized one.
            </p>
          )}
          <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Card>

        <Card>
          <SectionHeader title="Account Actions" />
          <Button variant="danger" onClick={logout} className="w-full">
            Sign out
          </Button>
        </Card>
      </main>
    </div>
  );
}

