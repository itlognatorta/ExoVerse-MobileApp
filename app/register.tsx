import CryptoJS from "crypto-js";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabase";

export default function RegistrationPage() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let newErrors: any = {};

    if (!fname.trim())
      newErrors.fname = "First name is required.";

    if (!lname.trim())
      newErrors.lname = "Last name is required.";

    if (!contact.trim()) {
      newErrors.contact = "Contact number is required.";
    } else if (!/^09\d{9}$/.test(contact)) {
      newErrors.contact =
        "Contact number must be 11 digits and start with 09.";
    }

    if (!address.trim())
      newErrors.address = "Address is required.";

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      newErrors.email = "Invalid email format.";
    }

    if (!username.trim())
      newErrors.username = "Username is required.";

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
  
      // Check Email duplicate (profile table)
      const { data: existingEmail } = await supabase
        .from("users_table")
        .select("u_email")
        .eq("u_email", email)
        .maybeSingle();
  
      if (existingEmail) {
        setErrors((prev: any) => ({
          ...prev,
          email: "Email already exists.",
        }));
        return;
      }
  
      // Check Username duplicate
      const { data: existingUsername } = await supabase
        .from("users_table")
        .select("u_uname")
        .eq("u_uname", username)
        .maybeSingle();
  
      if (existingUsername) {
        setErrors((prev: any) => ({
          ...prev,
          username: "Username already exists.",
        }));
        return;
      }
  
      const hashedPassword = CryptoJS.SHA256(password).toString();

      // INSERT PROFILE DATA
      const { error } = await supabase
      .from("users_table")
      .insert([
        {
          u_fname: fname,
          u_lname: lname,
          u_contact: contact,
          u_email: email.trim().toLowerCase(),
          u_uname: username,
          u_pass: hashedPassword,
          u_profile: "default-profile.png",
          u_address: address,
          u_status: "Pending",
          u_role: "user",
        },
      ]);
  
      if (error) throw error;
  
      Alert.alert(
        "Registration Successful",
        "Your account has been created."
      );
  
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>
          Create Account
        </Text>

        <Text style={styles.subheading}>
          Join the ExoVerse community
        </Text>

        <TextInput
          placeholder="First Name"
          style={styles.input}
          value={fname}
          onChangeText={setFname}
        />
        {errors.fname && (
          <Text style={styles.error}>
            {errors.fname}
          </Text>
        )}

        <TextInput
          placeholder="Last Name"
          style={styles.input}
          value={lname}
          onChangeText={setLname}
        />
        {errors.lname && (
          <Text style={styles.error}>
            {errors.lname}
          </Text>
        )}

        <TextInput
          placeholder="Contact Number"
          keyboardType="phone-pad"
          style={styles.input}
          value={contact}
          onChangeText={setContact}
        />
        {errors.contact && (
          <Text style={styles.error}>
            {errors.contact}
          </Text>
        )}

        <TextInput
          placeholder="Address"
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
        {errors.address && (
          <Text style={styles.error}>
            {errors.address}
          </Text>
        )}

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && (
          <Text style={styles.error}>
            {errors.email}
          </Text>
        )}

        <TextInput
          placeholder="Username"
          autoCapitalize="none"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        {errors.username && (
          <Text style={styles.error}>
            {errors.username}
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
          <Text style={styles.error}>
            {errors.password}
          </Text>
        )}

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>
            {errors.confirmPassword}
          </Text>
        )}

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading
              ? "Creating Account..."
              : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.replace("/login")
          }
        >
          <Text style={styles.loginLink}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
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
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    marginBottom: 120,
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 10,
  },

  subheading: {
    color: "#666",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#F8F8F8",
    marginTop: 10,
  },

  error: {
    color: "red",
    marginTop: 5,
    marginLeft: 5,
    fontSize: 12,
  },

  registerBtn: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  registerText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  loginLink: {
    marginTop: 20,
    textAlign: "center",
    color: "#2E7D32",
    fontWeight: "600",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 90,
    backgroundColor: "#1B5E20",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});