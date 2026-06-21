import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");

    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      fetchFavorites(parsed.u_id);
    }
  };

  const fetchFavorites = async (uid: number) => {
    const { data, error } = await supabase
      .from("fav_table")
      .select(
        "*, pet_listings(*, pet_images(image_url))"
      )
      .eq("user_id", uid);

    if (!error) {
      setFavorites(data || []);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Favorites</Text>

      {favorites.length === 0 ? (
        <Text style={styles.empty}>
          No favorite pets yet.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.f_id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri:
                    item.pet_listings?.pet_images?.[0]
                      ?.image_url ||
                    "https://via.placeholder.com/300",
                }}
                style={styles.image}
              />

              <Text style={styles.title}>
                {item.pet_listings?.title || "Pet Listing"}
              </Text>
            </View>
          )}
        />
      )}

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

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
    fontSize: 16,
  },

  card: {
    marginHorizontal: 15,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
  },

  image: {
    width: "100%",
    height: 180,
  },

  title: {
    padding: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  backButton: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#1B5E20",
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