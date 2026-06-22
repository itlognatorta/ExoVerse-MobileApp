import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabase";

export default function Sales() {
  const [user, setUser] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");

    if (data) {
      setUser(JSON.parse(data));
    }
  };

  const fetchSales = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders_table")
      .select(`
        *,
        pet_listings(
          p_name,
          p_price,
          image_url
        ),
        users_table!orders_table_buyer_id_fkey(
          u_fname,
          u_lname
        )
      `)
      .eq("seller_id", user.u_id)
      .order("order_id", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setSales(data || []);
    }

    setLoading(false);
  };

  const getTotalRevenue = () => {
    return sales
      .filter((item) => item.status === "Approved")
      .reduce(
        (sum, item) => sum + Number(item.total_price),
        0
      );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Sales</Text>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.backText}>
          ← Back to Dashboard
        </Text>
      </TouchableOpacity>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          Total Revenue
        </Text>

        <Text style={styles.summaryAmount}>
          ₱{getTotalRevenue()}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1B5E20"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) =>
            item.order_id.toString()
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              No sales found.
            </Text>
          }
          renderItem={({ item }) => {
            const buyer =
              item.users_table
                ? `${item.users_table.u_fname} ${item.users_table.u_lname}`
                : "Unknown Buyer";

            return (
              <View style={styles.card}>
                <Text style={styles.petName}>
                  {item.pet_listings?.p_name}
                </Text>

                <Text style={styles.text}>
                  Buyer: {buyer}
                </Text>

                <Text style={styles.text}>
                  Quantity: {item.quantity}
                </Text>

                <Text style={styles.text}>
                  Price Per Pet: ₱
                  {item.pet_listings?.p_price}
                </Text>

                <Text style={styles.total}>
                  Total Payment: ₱
                  {item.total_price}
                </Text>

                <Text
                  style={[
                    styles.status,
                    item.status === "Approved"
                      ? styles.approved
                      : item.status === "Rejected"
                      ? styles.rejected
                      : styles.pending,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F7",
    padding: 15,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 10,
  },

  backBtn: {
    marginBottom: 15,
    alignItems: "center",
  },

  backText: {
    color: "#1B5E20",
    fontWeight: "bold",
  },

  summaryCard: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  summaryTitle: {
    color: "#FFF",
    fontSize: 16,
  },

  summaryAmount: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 8,
  },

  text: {
    fontSize: 14,
    marginBottom: 4,
  },

  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },

  status: {
    marginTop: 10,
    fontWeight: "bold",
  },

  approved: {
    color: "green",
  },

  rejected: {
    color: "red",
  },

  pending: {
    color: "orange",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "gray",
  },
});