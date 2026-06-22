import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../supabase";

export default function Listings() {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);

  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");

    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      fetchListings(parsed.u_id);
    }
  };

  const fetchListings = async (uid: number) => {
    const { data, error } = await supabase
      .from("pet_listings")
      .select("*")
      .eq("u_id", uid)
      .order("l_id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setListings(data || []);
  };

  const openEdit = (item: any) => {
    setSelected(item);
    setName(item.p_name);
    setPrice(item.p_price?.toString());
    setDesc(item.description);
    setLocation(item.location);
    setEditModal(true);
  };

  const saveEdit = async () => {
    const updateData: any = {
      p_name: name,
      description: desc,
      location: location,
    };
  
    // Only allow price updates if NOT approved
    if (selected.l_status !== "Approved") {
      updateData.p_price = parseFloat(price);
    }
  
    const { error } = await supabase
      .from("pet_listings")
      .update(updateData)
      .eq("l_id", selected.l_id);
  
    if (error) {
      console.log(error);
      return;
    }
  
    setEditModal(false);
    fetchListings(user.u_id);
  };

  // ✅ DELETE FUNCTION
  const deleteListing = async (id: number) => {
    Alert.alert("Delete Listing", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("pet_listings")
            .delete()
            .eq("l_id", id);

          if (error) {
            console.log(error);
            Alert.alert("Error", "Failed to delete listing");
            return;
          }

          fetchListings(user.u_id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/300",
          }}
          style={styles.image}
        />

        <Text style={styles.title}>{item.p_name}</Text>
        <Text style={styles.price}>₱{item.p_price}</Text>
        <Text style={styles.status}>{item.l_status}</Text>

        {/* EDIT */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        {/* ✅ DELETE */}
        <TouchableOpacity
    style={styles.deleteBtn}
    onPress={() =>
        Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this listing?",
        [
            {
            text: "No",
            style: "cancel",
            onPress: () => {
                // stays on My Listings (no redirect needed)
            },
            },
            {
            text: "Yes",
            style: "destructive",
            onPress: () => deleteListing(item.l_id),
            },
        ]
        )
    }
    >
    <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
        </View>
        );
    };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.replace("/dashboard")}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My Listings</Text>

      {listings.length === 0 ? (
        <Text style={styles.empty}>You have no listings yet</Text>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.l_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* EDIT MODAL */}
      <Modal visible={editModal} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Edit Listing</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

            <TextInput
            style={[
                styles.input,
                selected?.l_status === "Approved" && styles.disabledInput,
            ]}
            value={price}
            onChangeText={setPrice}
            placeholder="Price"
            keyboardType="numeric"
            editable={selected?.l_status !== "Approved"}
            />

          <TextInput
            style={styles.input}
            value={desc}
            onChangeText={setDesc}
          />

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEditModal(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F7" },

  backBtn: { marginTop: 40, marginLeft: 15 },
  backText: { color: "#1B5E20", fontWeight: "bold" },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 20,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },

  image: { width: "100%", height: 180, borderRadius: 10 },

  title: { fontSize: 18, fontWeight: "bold" },
  price: { color: "#1B5E20" },
  status: { color: "orange", fontWeight: "bold" },

  editBtn: {
    marginTop: 10,
    backgroundColor: "#1B5E20",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  editText: { color: "#fff", fontWeight: "bold" },

  // ✅ NEW DELETE STYLE
  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#C62828",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteText: { color: "#fff", fontWeight: "bold" },

  empty: { textAlign: "center", marginTop: 50, color: "gray" },

  modal: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  input: {
    backgroundColor: "#eee",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },

  saveBtn: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  cancel: {
    textAlign: "center",
    marginTop: 15,
    color: "red",
    fontWeight: "bold",
  },

  disabledInput: {
    backgroundColor: "#ddd",
    color: "#777",
  },
});