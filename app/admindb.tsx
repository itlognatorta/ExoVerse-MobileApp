import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export default function AdminDB() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
  });

  // 🔐 SECURITY CHECK + LOAD DATA
  const loadDashboard = async () => {
    const storedUser = await AsyncStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.u_role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    const { data: users } = await supabase
      .from("users_table")
      .select("*");

    const { data: listings } = await supabase
      .from("pet_listings")
      .select("*");

    setStats({
      totalUsers: users?.length || 0,
      pendingUsers:
        users?.filter((u) => u.u_status === "Pending").length || 0,
      activeUsers:
        users?.filter((u) => u.u_status === "Active").length || 0,
      inactiveUsers:
        users?.filter((u) => u.u_status === "Inactive").length || 0,

      pendingListings:
        listings?.filter((l) => l.l_status === "Pending").length || 0,
      approvedListings:
        listings?.filter((l) => l.l_status === "Approved").length || 0,
      rejectedListings:
        listings?.filter((l) => l.l_status === "Rejected").length || 0,
    });
  };

  // refresh every time screen is opened
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>

      {/* OVERLAY */}
      {drawerVisible && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setDrawerVisible(false)}
        />
      )}

      {/* DRAWER */}
      {drawerVisible && (
        <View style={styles.drawer}>
          <TouchableOpacity onPress={() => setDrawerVisible(false)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/adminprofile")}>
            <Text style={styles.menuItem}>👤 Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/manageaccounts")}>
            <Text style={styles.menuItem}>👥 Manage Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/managelistings")}>
            <Text style={styles.menuItem}>📦 Manage Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        {/* STATS */}
        <View style={styles.card}>
          <Text>Total Users</Text>
          <Text style={styles.value}>{stats.totalUsers}</Text>
        </View>

        <View style={styles.card}>
          <Text>Pending Users</Text>
          <Text style={styles.value}>{stats.pendingUsers}</Text>
        </View>

        <View style={styles.card}>
          <Text>Active Users</Text>
          <Text style={styles.value}>{stats.activeUsers}</Text>
        </View>

        <View style={styles.card}>
          <Text>Inactive Users</Text>
          <Text style={styles.value}>{stats.inactiveUsers}</Text>
        </View>

        <View style={styles.card}>
          <Text>Pending Listings</Text>
          <Text style={styles.value}>{stats.pendingListings}</Text>
        </View>

        <View style={styles.card}>
          <Text>Approved Listings</Text>
          <Text style={styles.value}>{stats.approvedListings}</Text>
        </View>

        <View style={styles.card}>
          <Text>Rejected Listings</Text>
          <Text style={styles.value}>{stats.rejectedListings}</Text>
        </View>

        {/* QUICK ACTIONS */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/manageaccounts")}
        >
          <Text style={styles.actionText}>Manage Accounts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push("/managelistings")}
        >
          <Text style={styles.actionText}>Manage Listings</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F7" },

  header: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  menu: {
    fontSize: 30,
    color: "#1B5E20",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
    color: "#1B5E20",
  },

  card: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 15,
  },

  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    marginTop: 10,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 998,
  },

  drawer: {
    position: "absolute",
    width: 250,
    height: "100%",
    backgroundColor: "#FFF",
    zIndex: 999,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  back: {
    fontSize: 18,
    marginBottom: 25,
  },

  menuItem: {
    fontSize: 18,
    marginVertical: 15,
  },

  logout: {
    marginTop: 30,
    color: "red",
    fontSize: 18,
  },

  actionBtn: {
    backgroundColor: "#1B5E20",
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
  },

  actionText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});