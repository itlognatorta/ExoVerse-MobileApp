import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export default function Orders() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [tab, setTab] = useState<"active" | "pending" | "rejected">(
    "active"
  );

  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchListings();
    }
  }, [user]);

  // USER
  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  };

  // ORDERS
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders_table")
      .select(`*, pet_listings(p_name, image_url, p_price)`)
      .eq("buyer_id", user.u_id);

    if (!error) setOrders(data || []);
  };

  // LISTINGS (FIXED)
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("pet_listings")
      .select(`
        *,
        users_table (u_fname, u_lname)
      `)
      .eq("l_status", "Approved");

    if (error) {
      console.log(error);
      return;
    }

    setListings(data || []);
  };

  // ADD QUANTITY
  const increaseQty = (item: any) => {
    setCart((prev) => {
      const found = prev.find((p) => p.l_id === item.l_id);

      if (!found) {
        if (item.pet_avail <= 0) return prev;
        return [...prev, { ...item, qty: 1 }];
      }

      if (found.qty >= item.pet_avail) return prev;

      return prev.map((p) =>
        p.l_id === item.l_id ? { ...p, qty: p.qty + 1 } : p
      );
    });
  };

  // DECREASE QTY
  const decreaseQty = (item: any) => {
    setCart((prev) => {
      const found = prev.find((p) => p.l_id === item.l_id);
      if (!found) return prev;

      if (found.qty === 1) {
        return prev.filter((p) => p.l_id !== item.l_id);
      }

      return prev.map((p) =>
        p.l_id === item.l_id ? { ...p, qty: p.qty - 1 } : p
      );
    });
  };

  // TOTAL PRICE
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.p_price) * item.qty,
    0
  );

  // PLACE ORDER (FIXED BUTTON WORKING)
  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("No items selected");
      return;
    }
  
    const insertData = cart.map((item) => ({
      buyer_id: user.u_id,
      seller_id: item.user_id, // must exist in pet_listings
      l_id: item.l_id,
      quantity: item.qty,
      total_price: Number(item.p_price) * item.qty,
      status: "Pending",
    }));
  
    const { data, error } = await supabase
      .from("orders_table")
      .insert(insertData)
      .select();
  
    if (error) {
      console.log("ORDER ERROR:", error);
      Alert.alert("Order Failed", error.message);
      return;
    }
  
    console.log("ORDER SUCCESS:", data);
  
    Alert.alert(
      "Order Successful",
      "Wait for seller to approve your order."
    );
  
    setCart([]);
    setModalVisible(false);
    fetchOrders();
  };
  // CANCEL
  const cancelOrder = () => {
    setCart([]);
    setModalVisible(false);
    router.replace("/dashboard");
  };

  const filteredOrders = orders.filter((o) => {
    if (tab === "active") return o.status === "Approved";
    if (tab === "pending") return o.status === "Pending";
    if (tab === "rejected") return o.status === "Rejected";
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>

      {/* BACK */}
      <TouchableOpacity
        onPress={() => router.replace("/dashboard")}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab("active")}>
          <Text style={[styles.tab, tab === "active" && styles.active]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab("pending")}>
          <Text style={[styles.tab, tab === "pending" && styles.active]}>
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab("rejected")}>
          <Text style={[styles.tab, tab === "rejected" && styles.active]}>
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      {/* ORDERS */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.pet_listings?.p_name}
            </Text>
        
            <Text>Status: {item.status}</Text>
        
            <Text>Qty: {item.quantity}</Text>
        
            <Text>Total: ₱{item.total_price}</Text>
          </View>
        )}
      />

      {/* FLOAT BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Select Pets</Text>

          <FlatList
            data={listings}
            keyExtractor={(item) => item.l_id.toString()}
            renderItem={({ item }) => {
              const owner = item.users_table
                ? `${item.users_table.u_fname} ${item.users_table.u_lname}`
                : "Unknown";

              const cartItem = cart.find(
                (c) => c.l_id === item.l_id
              );

              return (
                <View style={styles.listing}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                  />

                  <Text style={styles.title}>{item.p_name}</Text>
                  <Text>Owner: {owner}</Text>
                  <Text>₱{item.p_price}</Text>
                  <Text>Available: {item.pet_avail}</Text>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() => decreaseQty(item)}
                    >
                      <Text style={styles.qtyBtn}>-</Text>
                    </TouchableOpacity>

                    <Text>{cartItem ? cartItem.qty : 0}</Text>

                    <TouchableOpacity
                      onPress={() => increaseQty(item)}
                      disabled={item.pet_avail <= 0}
                    >
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />

          {/* TOTAL */}
          <Text style={styles.total}>
            Total: ₱{totalPrice}
          </Text>

          {/* BUTTONS */}
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={placeOrder}
          >
            <Text style={styles.btnText}>Place Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={cancelOrder}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F7" },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
    color: "#1B5E20",
  },

  backBtn: {
    padding: 10,
    alignItems: "center",
  },

  backText: {
    color: "#1B5E20",
    fontWeight: "bold",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  tab: {
    margin: 10,
    color: "gray",
  },

  active: {
    color: "#1B5E20",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1B5E20",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  fabText: { color: "#fff", fontSize: 30 },

  modal: { flex: 1, padding: 15 },

  modalTitle: { fontSize: 20, fontWeight: "bold" },

  listing: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 10,
  },

  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  qtyBtn: {
    fontSize: 20,
    paddingHorizontal: 10,
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },

  orderBtn: {
    backgroundColor: "#1B5E20",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },

  cancelBtn: {
    backgroundColor: "red",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },

  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  title: { fontWeight: "bold", fontSize: 16 },
});