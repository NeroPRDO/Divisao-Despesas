import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityScreen } from '../screens/expenses/ActivityScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme';
import type { AppTabsParamList } from '../types/navigation';
import { GroupsStack } from './GroupsStack';

const Tabs = createBottomTabNavigator<AppTabsParamList>();

type TabName = keyof AppTabsParamList;

function getTabIcon(routeName: TabName, focused: boolean): keyof typeof Ionicons.glyphMap {
  if (routeName === 'GroupsTab') {
    return focused ? 'people' : 'people-outline';
  }

  if (routeName === 'ActivityTab') {
    return focused ? 'receipt' : 'receipt-outline';
  }

  return focused ? 'person' : 'person-outline';
}

export function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 12);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset
        },
        tabBarItemStyle: {
          paddingVertical: 4
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2
        },
        tabBarIconStyle: {
          marginTop: 2
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={getTabIcon(route.name, focused)} size={size + 4} color={color} />
        )
      })}
    >
      <Tabs.Screen name="GroupsTab" component={GroupsStack} options={{ title: 'Grupos' }} />
      <Tabs.Screen name="ActivityTab" component={ActivityScreen} options={{ title: 'Atividade' }} />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tabs.Navigator>
  );
}
