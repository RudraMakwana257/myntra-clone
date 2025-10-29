import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Cross-platform storage fallback for web
const setItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // ignore storage errors on web
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
};

const deleteItem = async (key: string) => {
  if (Platform.OS === "web") {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const saveUserData = async (
  _id: string,
  name: string,
  email: string
) => {
  await setItem("userid", _id);
  await setItem("userName", name);
  await setItem("userEmail", email);
};

export const getUserData = async () => {
  const _id = await getItem("userid");
  const name = await getItem("userName");
  const email = await getItem("userEmail");
  return { _id, name, email };
};

export const clearUserData = async () => {
  await deleteItem("userid");
  await deleteItem("userName");
  await deleteItem("userEmail");
};

// Recently Viewed
const RECENTLY_VIEWED_KEY = "recentlyViewed";

export type RecentlyViewedItem = {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  discount?: string;
  image?: string;
};

export const getRecentlyViewed = async (): Promise<RecentlyViewedItem[]> => {
  const data = await getItem(RECENTLY_VIEWED_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data) as RecentlyViewedItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = async (
  item: RecentlyViewedItem,
  max: number = 20
): Promise<RecentlyViewedItem[]> => {
  const list = await getRecentlyViewed();
  const filtered = list.filter((i) => i.id !== item.id);
  const updated = [item, ...filtered].slice(0, max);
  await setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  return updated;
};

export const clearRecentlyViewed = async () => {
  await deleteItem(RECENTLY_VIEWED_KEY);
};