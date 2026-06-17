import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import { router } from "expo-router";
import React, { useState } from "react";

import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<any>({});

  const handleLogin = async () => {
    let newErrors: any = {};

    // VALIDATION
    if (!email) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();

      const { data, error } = await supabase
        .from("users_table")
        .select("*")
        .eq("u_email", email.trim().toLowerCase())
        .eq("u_pass", hashedPassword)
        .maybeSingle();

      if (error) {
        setErrors({ password: "Login error. Try again." });
        return;
      }

      if (!data) {
        setErrors({
          password: "Invalid email or password.",
        });
        return;
      }

      if (data.u_status === "Pending") {
        setErrors({
          password: "Your account is still pending approval.",
        });
        return;
      }

      // SAVE USER SESSION
      await AsyncStorage.setItem("user", JSON.stringify(data));

      // ROLE REDIRECT
      if (data.u_role === "admin") {
        router.replace("/admindb");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setErrors({
        password: err.message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Hello Explorer!</Text>

        <Text style={styles.subheading}>
          Sign in to your ExoVerse account
        </Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && (
          <Text style={{ color: "red", marginBottom: 10 }}>
            {errors.email}
          </Text>
        )}

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && (
          <Text style={{ color: "red", marginBottom: 10 }}>
            {errors.password}
          </Text>
        )}

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
        >
          <Text style={styles.signup}>
            Don't have an account yet? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 220,
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },

  heading: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 10,
  },

  subheading: {
    color: "#666",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#F8F8F8",
  },

  loginBtn: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  loginText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  signup: {
    marginTop: 25,
    textAlign: "center",
    color: "#2E7D32",
    fontWeight: "600",
  },
});