import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

export default function Dashboard() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();
  }, []);

  // Logout function
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>

      {/* DRAWER */}
      {drawerVisible && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setDrawerVisible(false)}
          />

          <View style={styles.drawer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.drawerLogo}
            />

            <Text style={styles.drawerTitle}>ExoVerse</Text>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>👤 Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>🏠 Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>📦 My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>❤️ Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>🦎 Sell a Pet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>💬 Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>⚙ Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>🔒 Account Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>

          {/* MENU BUTTON */}
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>ExoVerse</Text>
          </View>

          {/* NOTIF */}
          <Text style={styles.notification}>🔔</Text>
        </View>

        {/* WELCOME SECTION */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome Explorer,
          </Text>

          <Text style={styles.nameText}>
            {user?.u_fname || "Explorer"} 👋
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search exotic pets..."
            style={styles.searchBar}
          />
        </View>

        {/* CATEGORIES */}
        <Text style={styles.sectionTitle}>
          Browse Categories
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          <View style={styles.category}><Text>🦎 Reptiles</Text></View>
          <View style={styles.category}><Text>🐦 Birds</Text></View>
          <View style={styles.category}><Text>🐸 Amphibians</Text></View>
          <View style={styles.category}><Text>🕷 Arachnids</Text></View>
          <View style={styles.category}><Text>🐒 Mammals</Text></View>
        </ScrollView>

        {/* FEATURED */}
        <Text style={styles.sectionTitle}>
          Featured Listings
        </Text>

        <View style={styles.card}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1548767797-d8c844163c4" }}
            style={styles.petImage}
          />
          <Text style={styles.petName}>Ball Python</Text>
          <Text style={styles.price}>₱5,000</Text>
        </View>

        <View style={styles.card}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1517849845537-4d257902454a" }}
            style={styles.petImage}
          />
          <Text style={styles.petName}>Green Iguana</Text>
          <Text style={styles.price}>₱7,500</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
  },

  header: {
    marginTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuIcon: {
    fontSize: 28,
    color: "#1B5E20",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  title: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  notification: {
    fontSize: 22,
  },

  welcomeContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },

  welcomeText: {
    fontSize: 16,
    color: "#666",
  },

  nameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  searchContainer: {
    padding: 20,
  },

  searchBar: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 15,
    color: "#1B5E20",
  },

  categories: {
    paddingLeft: 20,
    marginBottom: 20,
  },

  category: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
  },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
  },

  petImage: {
    width: "100%",
    height: 180,
  },

  petName: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
  },

  price: {
    color: "#1B5E20",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingBottom: 15,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  drawer: {
    position: "absolute",
    width: 260,
    height: "100%",
    backgroundColor: "#FFF",
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 10,
  },

  drawerLogo: {
    width: 80,
    height: 80,
    alignSelf: "center",
  },

  drawerTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 30,
  },

  menuItem: {
    paddingVertical: 15,
  },

  menuText: {
    fontSize: 16,
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#C62828",
    padding: 15,
    borderRadius: 12,
  },

  logoutText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});