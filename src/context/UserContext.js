import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

const defaultProfile = {
  weightKg: 75,
  heightCm: 178,
  age: 28,
  sex: 'male',
  activityType: 'surfer',
  activityLevel: 'high',
  goal: 'build',
  mealsPerDay: 4,
  dietaryRestrictions: [],
  budget: 'mid',
};

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(defaultProfile);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        onboardingComplete,
        setOnboardingComplete,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
