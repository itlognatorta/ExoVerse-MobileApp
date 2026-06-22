import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

const { width } = Dimensions.get("window");

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

  // USER
  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  };

  // LISTINGS (✅ WITH OWNER NAME)
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("pet_listings")
      .select(`
        *,
        pet_category(cat_name),
        users_table (
          u_fname,
          u_lname
        )
      `)
      .eq("l_status", "Approved");
  
    if (error) {
      console.log("Fetch error:", error);
      return;
    }
  
    setListings(data || []);
    setFiltered(data || []);
  };

  // SEARCH
  const handleSearch = (text: string) => {
    setSearch(text);

    let result = listings.filter((item) =>
      item.p_name?.toLowerCase().includes(text.toLowerCase())
    );

    if (category) {
      result = result.filter(
        (item) => String(item.cat_id) === String(category)
      );
    }

    setFiltered(result);
  };

  // CATEGORY FILTER
  const filterByCategory = (cat: string | null) => {
    setCategory(cat);

    let result = listings;

    if (cat) {
      result = result.filter(
        (item) => String(item.cat_id) === String(cat)
      );
    }

    if (search) {
      result = result.filter((item) =>
        item.p_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  // CARD (✅ OWNER NAME ADDED)
  const renderItem = ({ item }: any) => {
    const ownerName = item.users_table
      ? `${item.users_table.u_fname} ${item.users_table.u_lname}`
      : "Unknown Owner";
  
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.image_url || "https://via.placeholder.com/300" }}
          style={styles.image}
        />
  
        <Text style={styles.title}>{item.p_name}</Text>
  
        {/* OWNER NAME */}
        <Text style={styles.owner}>Owner: {ownerName}</Text>
  
        <Text style={styles.price}>₱{item.p_price}</Text>
        <Text style={styles.desc}>{item.description}</Text>
  
        <Text style={styles.status}>{item.l_status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

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

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.welcome}>
          Welcome Explorer, {user?.u_fname}
        </Text>

        <TextInput
          placeholder="Search exotic pets..."
          style={styles.search}
          value={search}
          onChangeText={handleSearch}
        />

        {/* CATEGORY */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
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
        </ScrollView>

        {/* LIST */}
        {filtered.length === 0 ? (
          <Text style={styles.empty}>
            No active listings available
          </Text>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.l_id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* DRAWER */}
      {drawerVisible && (
        <View style={styles.drawerOverlay}>
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

            <TouchableOpacity onPress={() => router.push("/listing")}>
              <Text style={styles.menuItem}>My Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/favorites")}>
              <Text style={styles.menuItem}>Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/sales")}>
              <Text style={styles.menuItem}>Sales</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Text style={styles.menuItem}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f7" },
  content: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1B5E20",
  },

  menu: { fontSize: 28, color: "#fff" },

  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  logoImg: {
    width: 30,
    height: 30,
  },

  welcome: {
    fontSize: 18,
    margin: 15,
    color: "#1B5E20",
    fontWeight: "bold",
  },

  search: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
  },

  categories: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },

  cat: {
    color: "#1B5E20",
    fontWeight: "bold",
    marginRight: 15,
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    width: width - 20,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },

  title: { fontSize: 18, fontWeight: "bold" },
  owner: { fontSize: 13, color: "#555", marginBottom: 3 },
  price: { color: "#1B5E20" },
  desc: { color: "#666" },

  status: {
    marginTop: 5,
    color: "orange",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "gray",
  },

  drawerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  drawer: {
    width: 260,
    height: "100%",
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