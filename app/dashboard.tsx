import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export const gestureEnabled = false;

export default function Dashboard() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [listings, setListings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
    fetchListings();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  };

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("pet_listings")
      .select(`
        *,
        pet_category (cat_name),
        pet_images (image_url)
      `);

    if (!error) {
      setListings(data || []);
      setFiltered(data || []);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    let result = listings.filter((item) =>
      item.p_name.toLowerCase().includes(text.toLowerCase())
    );

    if (category) {
      result = result.filter(
        (item) => item.cat_id === category
      );
    }

    setFiltered(result);
  };

  const filterByCategory = (cat: string | null) => {
    setCategory(cat);

    let result = listings;

    if (cat) {
      result = listings.filter(
        (item) => item.cat_id === cat
      );
    }

    if (search) {
      result = result.filter((item) =>
        item.p_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            item.pet_images?.[0]?.image_url ||
            "https://via.placeholder.com/300",
        }}
        style={styles.image}
      />

      <Text style={styles.title}>{item.p_name}</Text>
      <Text style={styles.price}>₱{item.p_price}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Text style={styles.menu}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>ExoVerse</Text>

        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImg}
        />
      </View>

      {/* WELCOME */}
      <Text style={styles.welcome}>
        Welcome Explorer, {user?.u_fname}
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search exotic pets..."
        style={styles.search}
        value={search}
        onChangeText={handleSearch}
      />

      {/* CATEGORY FILTER */}
      <View style={styles.categories}>
        <TouchableOpacity onPress={() => filterByCategory(null)}>
          <Text style={styles.cat}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => filterByCategory("1")}>
          <Text style={styles.cat}>Reptiles</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => filterByCategory("2")}>
          <Text style={styles.cat}>Birds</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => filterByCategory("3")}>
          <Text style={styles.cat}>Amphibians</Text>
        </TouchableOpacity>
      </View>

      {/* LISTINGS */}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>
          No such listing in the market
        </Text>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.l_id.toString()}
        />
      )}

      {/* DRAWER */}
      {drawerVisible && (
        <View style={styles.drawer}>
          <TouchableOpacity onPress={() => setDrawerVisible(false)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={styles.menuItem}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/sellpet")}>
            <Text style={styles.menuItem}>Sell Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/orders")}>
            <Text style={styles.menuItem}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/favorites")}>
            <Text style={styles.menuItem}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text style={styles.menuItem}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f7" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#1B5E20",
  },

  menu: { fontSize: 28, color: "#fff" },
  logo: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  logoImg: { width: 30, height: 30 },

  welcome: {
    fontSize: 18,
    margin: 15,
    color: "#1B5E20",
    fontWeight: "bold",
  },

  search: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 10,
    borderRadius: 10,
  },

  categories: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  cat: { color: "#1B5E20", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },

  image: { width: "100%", height: 180, borderRadius: 10 },

  title: { fontSize: 18, fontWeight: "bold" },

  price: { color: "#1B5E20" },

  desc: { color: "#666" },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "gray",
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    padding: 20,
  },

  back: {
    fontSize: 18,
    marginBottom: 20,
    color: "red",
  },

  menuItem: {
    padding: 15,
    fontSize: 16,
  },

  logout: {
    marginTop: 20,
    color: "red",
    fontWeight: "bold",
  },
});