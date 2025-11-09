import { Tabs } from 'expo-router';
import React from 'react';
import { Chrome, Heart, Search, ShoppingBag, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { Platform, View } from 'react-native';
import Header from '@/components/Header';

export default function TabLayout() {
  const { theme } = useTheme();

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <Header />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[theme].tint,
            tabBarInactiveTintColor: Colors[theme].icon,
            headerShown: false,
            tabBarStyle: {
              display: 'none',
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => <Chrome size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="categories"
            options={{
              title: 'Categories',
              tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="wishlist"
            options={{
              title: 'Wishlist',
              tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="bag"
            options={{
              title: 'Bag',
              tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            }}
          />
        </Tabs>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        tabBarInactiveTintColor: Colors[theme].icon,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors[theme].background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color ,size}) => <Chrome size={size} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color ,size}) => <Search size={size} color={color}/>,
        }}
      />
        <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color ,size}) => <Heart size={size} color={color}/>,
        }}
      />
        <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color ,size}) => <ShoppingBag size={size} color={color}/>,
        }}
      />
        <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color ,size}) => <User size={size} color={color}/>,
        }}
      />
     
    </Tabs>
  );
}