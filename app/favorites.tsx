import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (!data) return;

    const parsed = JSON.parse(data);
    setUser(parsed);

    fetchFavorites(parsed.u_id);
    fetchListings();
  };

  // GET FAVORITES
  const fetchFavorites = async (uid: number) => {
    const { data, error } = await supabase
      .from("fav_table")
      .select(`
        *,
        pet_listings (*)
      `)
      .eq("user_id", uid);

    if (error) {
      console.log(error);
      return;
    }

    setFavorites(data || []);
  };

  // GET ALL APPROVED LISTINGS
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("pet_listings")
      .select("*")
      .eq("l_status", "Approved");

    if (error) {
      console.log(error);
      return;
    }

    setAllListings(data || []);
  };

  // ADD FAVORITE
  const addFavorite = async (listingId: number) => {
    if (!user) return;
  
    const exists = favorites.some(
      (item) => item.listing_id === listingId
    );
  
    if (exists) {
      alert("Already in favorites.");
      return;
    }
  
    const { error } = await supabase.from("fav_table").insert({
      user_id: user.u_id,
      listing_id: listingId,
      created_at: new Date().toISOString(),
    });
  
    if (error) {
      alert(error.message);
      return;
    }
  
    fetchFavorites(user.u_id);
    setModalVisible(false);
  };

  // REMOVE FAVORITE
  const removeFavorite = async (favId: number) => {
    await supabase.from("fav_table").delete().eq("f_id", favId);
    fetchFavorites(user.u_id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Favorites</Text>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addBtnText}>+ Add Favorite</Text>
      </TouchableOpacity>

      {/* FAVORITES LIST */}
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorite pets yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.f_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri:
                    item.pet_listings?.image_url ||
                    "https://via.placeholder.com/300",
                }}
                style={styles.image}
              />

              <Text style={styles.title}>
                {item.pet_listings?.p_name}
              </Text>

              <Text style={styles.price}>
                ₱{item.pet_listings?.p_price}
              </Text>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFavorite(item.f_id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* MODAL - ALL LISTINGS */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Listing</Text>

          <FlatList
            data={allListings}
            keyExtractor={(item) => item.l_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.modalCard}>
                <Image
                  source={{
                    uri:
                      item.image_url ||
                      "https://via.placeholder.com/300",
                  }}
                  style={styles.modalImage}
                />

                <Text style={styles.title}>{item.p_name}</Text>
                <Text style={styles.price}>₱{item.p_price}</Text>

                <TouchableOpacity
                  style={styles.favoriteBtn}
                  onPress={() => addFavorite(item.l_id)}
                >
                  <Text style={styles.favoriteText}>
                    Add to Favorites
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* BACK */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F7" },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    color: "#1B5E20",
  },

  addBtn: {
    backgroundColor: "#1B5E20",
    margin: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  addBtnText: { color: "#fff", fontWeight: "bold" },

  empty: { textAlign: "center", marginTop: 30 },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },

  image: { width: "100%", height: 180, borderRadius: 10 },

  title: { fontSize: 18, fontWeight: "bold", marginTop: 10 },

  price: { color: "#1B5E20", fontWeight: "bold" },

  removeBtn: {
    backgroundColor: "#d32f2f",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },

  removeText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  modalContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },

  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  modalCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  modalImage: { width: "100%", height: 180, borderRadius: 10 },

  favoriteBtn: {
    backgroundColor: "#1B5E20",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  favoriteText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  cancelBtn: {
    backgroundColor: "#d32f2f",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },

  cancelText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  backButton: {
    backgroundColor: "#1B5E20",
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },

  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});