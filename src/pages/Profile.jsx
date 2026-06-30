import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Avatar, Button, Input, Textarea, Switch } from '@heroui/react';
import { User, Mail, Shield, Award } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    role: '',
    verified: false
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (typeof window.currentUser === 'function') {
      const activeUser = window.currentUser();
      if (activeUser) {
        setUser(activeUser);
        setProfile({
          name: activeUser.name || activeUser.email.split('@')[0],
          bio: activeUser.bio || 'Pharmacist and open-education contributor.',
          avatarUrl: activeUser.avatar || '',
          role: activeUser.role || 'Contributor',
          verified: activeUser.verified || false
        });
      }
    }
  }, []);

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, ...profile };
      // Update in legacy session
      if (typeof window.updateUserProfile === 'function') {
        window.updateUserProfile(user.id, updatedUser);
      }
      setUser(updatedUser);
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center text-text-soft">
        <h2 className="text-xl font-bold">Please log in to view your profile</h2>
        <Button as="a" href="/auth/login.html" color="primary" className="mt-4 font-bold">Log In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header Profile Card */}
      <Card className="bg-surface border border-border p-6">
        <CardBody className="flex flex-col md:flex-row items-center gap-6">
          <Avatar
            isBordered
            color={profile.verified ? 'success' : 'default'}
            className="w-24 h-24 text-xl border-2"
            src={profile.avatarUrl}
            name={profile.name}
          />
          <div className="flex flex-col gap-2 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black text-text">{profile.name}</h1>
              {profile.verified && (
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-text-soft text-sm font-medium">{profile.bio}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-xs font-semibold text-text-muted">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Role: {profile.role}</span>
            </div>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} color="primary" variant="flat" className="font-bold">
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </CardBody>
      </Card>

      {/* Editing Form */}
      {isEditing && (
        <Card className="bg-surface border border-border p-6 animate-fadeIn">
          <CardHeader>
            <h2 className="text-lg font-extrabold text-text">Edit Personal Info</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-6">
            <Input
              label="Display Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <Textarea
              label="Biography"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about your pharmacy background, teaching interests, or qualifications..."
            />
            <Input
              label="Avatar Image URL"
              value={profile.avatarUrl}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
            <Button onClick={handleSave} color="primary" className="font-bold w-fit">
              Save Changes
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
