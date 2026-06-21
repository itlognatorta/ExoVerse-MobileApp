import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await AsyncStorage.getItem("user");
    if (!data) return;

    const user = JSON.parse(data);

    const { data: ordersData, error } = await supabase
      .from("orders_table")
      .select(`
        *,
        pet_listings(title)
      `)
      .eq("buyer_id", user.u_id);

    if (!error) {
      setOrders(ordersData || []);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            You have no orders yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.pet_listings?.title || "Pet Listing"}
            </Text>

            <Text style={styles.status}>
              Status: {item.status}
            </Text>
          </View>
        )}
      />

      {/* Back to Dashboard Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 20,
    color: "#1B5E20",
    textAlign: "center",
  },

  card: {
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },

  status: {
    fontSize: 14,
    color: "#666",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "gray",
    fontSize: 16,
  },

  backButton: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#1B5E20", // ExoVerse theme color
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});