import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AlumniScreen from "../screens/AlumniScreen";
import AlumniDetailScreen from "../screens/AlumniDetailScreen";
import StoriesScreen from "../screens/StoriesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import { COLORS } from "../constants/theme";

const Tab = createBottomTabNavigator();
const AlumniStack = createNativeStackNavigator();

function AlumniStackNavigator() {
  return (
    <AlumniStack.Navigator screenOptions={{ headerShown: false }}>
      <AlumniStack.Screen name="AlumniList" component={AlumniScreen} />
      <AlumniStack.Screen name="AlumniDetail" component={AlumniDetailScreen} />
    </AlumniStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:    { active: "🏠", inactive: "🏡" },
  Alumni:  { active: "🎓", inactive: "👥" },
  AI:      { active: "🤖", inactive: "🤖" },
  Stories: { active: "🌟", inactive: "⭐" },
  Profile: { active: "👤", inactive: "👤" },
};

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Text style={{ fontSize: 22 }}>
              {focused ? icons.active : icons.inactive}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Alumni"
        component={AlumniStackNavigator}
        options={{ title: "Mentors" }}
      />
      <Tab.Screen
        name="AI"
        component={ChatbotScreen}
        options={{ title: "AI Chat" }}
      />
      <Tab.Screen name="Stories" component={StoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}