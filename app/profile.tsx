import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.card}>
        <Image
          source={{
            uri:
              user?.u_profile ||
              "https://your-supabase-url/default-profile.png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {user?.u_fname} {user?.u_lname}
        </Text>

        <Text style={styles.info}>📧 {user?.u_email}</Text>
        <Text style={styles.info}>📱 {user?.u_contact}</Text>
        <Text style={styles.info}>🏠 {user?.u_address}</Text>
        <Text style={styles.role}>Role: {user?.u_role}</Text>

        {/* Back to Dashboard Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/dashboard")}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logout}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
  },

  header: {
    backgroundColor: "#1B5E20",
    padding: 20,
    alignItems: "center",
  },

  logo: {
    width: 60,
    height: 60,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },

  card: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  info: {
    marginTop: 5,
    color: "#555",
  },

  role: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#1B5E20",
  },

  backButton: {
    marginTop: 30,
    backgroundColor: "#1B5E20", // ExoVerse theme color
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  logout: {
    marginTop: 15,
    backgroundColor: "#C62828",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});