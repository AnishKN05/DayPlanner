
// import React from 'react';
// import PlannerScreen from './screens/PlannerScreen';

// export default function App() {
//   return <PlannerScreen />;
// }
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
