import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { UserProvider, useUser } from './src/context/UserContext';
import ConnectScreen from './src/screens/ConnectScreen';
import FuelScreen from './src/screens/FuelScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = { Connect: '👥', Fuel: '🔥' };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: theme.fontSize.xl }}>{icons[label] || '•'}</Text>
      <Text
        style={{
          fontSize: theme.fontSize.xs,
          color: focused ? theme.colors.accent : theme.colors.textTertiary,
          fontWeight: focused ? theme.fontWeight.semibold : theme.fontWeight.regular,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 70,
          paddingBottom: 10,
        },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Connect" component={ConnectScreen} />
      <Tab.Screen name="Fuel" component={FuelScreen} />
    </Tab.Navigator>
  );
}

function AppRoot() {
  const { onboardingComplete } = useUser();

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppRoot />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
