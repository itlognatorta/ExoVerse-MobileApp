import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabase";

export default function Settings() {
  const [user, setUser] = useState<any>(null);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  // 🔒 CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!oldPass || !newPass) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    const hashedOld = CryptoJS.SHA256(oldPass).toString();
    const hashedNew = CryptoJS.SHA256(newPass).toString();

    if (hashedOld !== user.u_pass) {
      Alert.alert("Error", "Old password is incorrect");
      return;
    }

    const { error } = await supabase
      .from("users_table")
      .update({ u_pass: hashedNew })
      .eq("u_id", user.u_id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Password updated!");

    const updatedUser = { ...user, u_pass: hashedNew };
    await AsyncStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setOldPass("");
    setNewPass("");
  };

  // ❌ DELETE ACCOUNT (soft delete option)
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("users_table")
              .delete()
              .eq("u_id", user.u_id);

            await AsyncStorage.removeItem("user");

            router.replace("/login");
          },
        },
      ]
    );
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* ACCOUNT INFO */}
      <View style={styles.card}>
        <Text style={styles.label}>Logged in as:</Text>
        <Text style={styles.value}>
          {user?.u_fname} {user?.u_lname}
        </Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.u_email}</Text>
      </View>

      {/* CHANGE PASSWORD */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Change Password
        </Text>

        <TextInput
          placeholder="Old Password"
          secureTextEntry
          value={oldPass}
          onChangeText={setOldPass}
          style={styles.input}
        />

        <TextInput
          placeholder="New Password"
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleChangePassword}
        >
          <Text style={styles.btnText}>
            Update Password
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIONS */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>
            Delete Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={{
            marginTop: 50,
            marginLeft: 20,
        }}
        onPress={() => router.replace("/dashboard")}
        >
        <Text style={{ fontSize: 18, color: "#1B5E20" }}>
            ← Back to Dashboard
        </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
    padding: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  label: {
    color: "#777",
    fontSize: 12,
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1B5E20",
  },

  input: {
    backgroundColor: "#F1F1F1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#1B5E20",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  logoutBtn: {
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  deleteBtn: {
    backgroundColor: "#C62828",
    padding: 12,
    borderRadius: 10,
  },

  deleteText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});