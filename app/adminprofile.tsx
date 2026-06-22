import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminProfile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Admin Profile</Text>

      <Text style={styles.info}>Name: {user?.u_fname} {user?.u_lname}</Text>
      <Text style={styles.info}>Email: {user?.u_email}</Text>
      <Text style={styles.info}>Role: {user?.u_role}</Text>
      <Text style={styles.info}>Status: {user?.u_status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40 },
  back: { fontSize: 18, color: "#1B5E20" },
  logo: { width: 100, height: 100, alignSelf: "center", marginTop: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", margin: 10 },
  info: { fontSize: 16, marginTop: 10 },
});