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

export default function ManageListings() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    // 1. get listings
    const { data: listingsData, error } = await supabase
      .from("pet_listings")
      .select("*")
      .order("l_id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    if (!listingsData) return;

    // 2. get all user ids
    const userIds = [...new Set(listingsData.map((i) => i.u_id))];

    const { data: usersData } = await supabase
      .from("users_table")
      .select("u_id, u_fname, u_lname")
      .in("u_id", userIds);

    // 3. merge manually
    const merged = listingsData.map((listing) => {
      const owner = usersData?.find((u) => u.u_id === listing.u_id);

      return {
        ...listing,
        ownerName: owner
          ? `${owner.u_fname} ${owner.u_lname}`
          : "Unknown Owner",
      };
    });

    setListings(merged);
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("pet_listings")
      .update({ l_status: status })
      .eq("l_id", id);

    if (error) {
      console.log(error);
      return;
    }

    loadListings();
  };

  const renderItem = ({ item }: any) => {
    const isApproved = item.l_status === "Approved";

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/300",
          }}
          style={styles.image}
        />

        {/* OWNER NAME */}
        <Text style={styles.owner}>
          Owner: {item.ownerName}
        </Text>

        <Text style={styles.title}>{item.p_name}</Text>
        <Text style={styles.text}>Species: {item.p_species}</Text>
        <Text style={styles.text}>Price: ₱{item.p_price}</Text>
        <Text style={styles.text}>Location: {item.location}</Text>
        <Text style={styles.desc}>{item.description}</Text>

        <Text style={styles.status}>
          Status: {item.l_status}
        </Text>

        {/* APPROVE */}
        {item.l_status === "Pending" && (
          <TouchableOpacity
            onPress={() => updateStatus(item.l_id, "Approved")}
            style={styles.approve}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
        )}

        {/* REJECT (BLOCK IF APPROVED) */}
        {!isApproved ? (
          <TouchableOpacity
            onPress={() => updateStatus(item.l_id, "Rejected")}
            style={styles.reject}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.locked}>
            <Text style={styles.lockText}>
              Already Approved
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Manage Listings</Text>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.l_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: "#F5F6F7" },
  
    back: {
      fontSize: 18,
      color: "#1B5E20",
      marginTop: 40,
    },
  
    header: {
      fontSize: 22,
      fontWeight: "bold",
      marginVertical: 10,
      color: "#1B5E20",
    },
  
    card: {
      padding: 15,
      backgroundColor: "#fff",
      marginBottom: 10,
      borderRadius: 10,
    },
  
    image: {
      width: "100%",
      height: 180,
      borderRadius: 10,
      marginBottom: 10,
    },
  
    title: { fontSize: 18, fontWeight: "bold" },
    text: { fontSize: 14, color: "#444" },
  
    desc: { color: "#666", marginTop: 5 },
  
    status: {
      marginTop: 8,
      fontWeight: "bold",
      color: "orange",
    },
  
    approve: {
      backgroundColor: "green",
      padding: 10,
      marginTop: 10,
      borderRadius: 8,
      alignItems: "center",
    },
  
    reject: {
      backgroundColor: "red",
      padding: 10,
      marginTop: 10,
      borderRadius: 8,
      alignItems: "center",
    },
  
    btnText: {
      color: "#fff",
      fontWeight: "bold",
    },
  
    owner: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#1B5E20",
      marginBottom: 5,
    },

    locked: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#ccc",
        borderRadius: 8,
        alignItems: "center",
      },
      
      lockText: {
        color: "#333",
        fontWeight: "bold",
      },
  });