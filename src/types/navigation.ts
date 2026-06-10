import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type GroupsStackParamList = {
  GroupsHome: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
  GroupDetails: { groupId: string };
  AddExpenseModal: { groupId: string };
};

export type AppTabsParamList = {
  GroupsTab: NavigatorScreenParams<GroupsStackParamList> | undefined;
  ActivityTab: undefined;
  ProfileTab: undefined;
};
