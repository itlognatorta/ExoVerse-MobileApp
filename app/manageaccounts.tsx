import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../supabase";

export default function ManageAccounts() {
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    const { data } = await supabase.from("users_table").select("*");
    setUsers(data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await supabase
      .from("users_table")
      .update({ u_status: status })
      .eq("u_id", id);

    loadUsers();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.u_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.u_fname} {item.u_lname}</Text>
            <Text>{item.u_email}</Text>
            <Text>Status: {item.u_status}</Text>

            {item.u_status === "Pending" && (
              <TouchableOpacity
                onPress={() => updateStatus(item.u_id, "Active")}
                style={styles.approve}
              >
                <Text style={{ color: "#fff" }}>Approve</Text>
              </TouchableOpacity>
            )}

            {item.u_status === "Active" && (
              <TouchableOpacity
                onPress={() => updateStatus(item.u_id, "Inactive")}
                style={styles.reject}
              >
                <Text style={{ color: "#fff" }}>Deactivate</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  back: { fontSize: 18, color: "#1B5E20", marginTop: 40 },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
  },
  approve: {
    backgroundColor: "green",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  reject: {
    backgroundColor: "red",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
});