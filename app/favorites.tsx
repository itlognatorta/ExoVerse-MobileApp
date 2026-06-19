import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
    const { data } = await supabase
      .from("fav_table")
      .select(
        "*, pet_listings(*, pet_images(image_url))"
      )
      .eq("user_id", uid);

    setFavorites(data || []);
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{
                  uri:
                    item.pet_listings?.pet_images?.[0]
                      ?.image_url,
                }}
                style={styles.image}
              />
              <Text style={styles.title}>
                {item.pet_listings?.title}
              </Text>
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
      )}
      
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

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },

  card: {
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
  },

  image: { width: "100%", height: 180 },

  title: {
    padding: 10,
    fontWeight: "bold",
  },
});