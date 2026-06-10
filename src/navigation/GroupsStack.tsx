import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddExpenseModalScreen } from '../screens/groups/AddExpenseModalScreen';
import { CreateGroupScreen } from '../screens/groups/CreateGroupScreen';
import { GroupDetailsScreen } from '../screens/groups/GroupDetailsScreen';
import { GroupsScreen } from '../screens/groups/GroupsScreen';
import { JoinGroupScreen } from '../screens/groups/JoinGroupScreen';
import { colors } from '../theme';
import type { GroupsStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export function GroupsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '800'
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background
        }
      }}
    >
      <Stack.Screen name="GroupsHome" component={GroupsScreen} options={{ title: 'Meus Grupos' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Criar grupo' }} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} options={{ title: 'Entrar em grupo' }} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ title: 'Detalhes do grupo' }} />
      <Stack.Screen
        name="AddExpenseModal"
        component={AddExpenseModalScreen}
        options={{
          title: 'Nova despesa',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: colors.surface
          }
        }}
      />
    </Stack.Navigator>
  );
}
