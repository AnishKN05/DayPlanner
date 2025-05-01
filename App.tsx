

import React, { useEffect } from 'react';
import CalendarScreen from './screens/CalendarScreen';
import * as Notifications from 'expo-notifications';
import { initDB } from './services/db';

export default function App() {
  useEffect(() => {
    const setup = async () => {
      await Notifications.requestPermissionsAsync();
      await initDB();
    };

    setup();
  }, []);

  return <CalendarScreen />;
}
