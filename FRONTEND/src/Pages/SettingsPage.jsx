import React from 'react';
import { Settings } from 'lucide-react';

export const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Settings size={32} />
      </div>
      <h1 className="text-3xl font-extrabold">Account Settings</h1>
      <p className="text-base-content/60 max-w-md">
        Change your password, configure notification settings, or manage privacy preferences. Ready for Phase 4.
      </p>
    </div>
  );
};

export default SettingsPage;
