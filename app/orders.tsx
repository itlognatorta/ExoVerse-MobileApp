import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

    const { data: ordersData } = await supabase
      .from("orders_table")
      .select(
        "*, pet_listings(title)"
      )
      .eq("buyer_id", user.u_id);

    setOrders(ordersData || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) =>
          item.order_id.toString()
        }
        
        renderItem={({ item }) => (
            
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.pet_listings?.title}
            </Text>

            <Text>Status: {item.status}</Text>

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
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F7" },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 20,
    color: "#1B5E20",
  },

  card: {
    margin: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
  },

  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});