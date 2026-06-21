import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabase";

export default function SellPet() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<any>(null);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [image, setImage] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "1", name: "Reptiles" },
    { id: "2", name: "Birds" },
    { id: "3", name: "Amphibians" },
  ];

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    };
    loadUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const validate = () => {
    let err: any = {};

    if (!title) err.title = "Title is required";
    if (!description) err.description = "Description is required";
    if (!price) err.price = "Price is required";
    if (!category) err.category = "Category is required";
    if (!image) err.image = "Image is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const uploadImage = async () => {
    const fileExt = image.uri.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `pets/${fileName}`;

    const response = await fetch(image.uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from("pet-images")
      .upload(filePath, blob, {
        contentType: "image/jpeg",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("pet-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const imageUrl = await uploadImage();

      const { data: listing, error } = await supabase
        .from("pet_listings")
        .insert([
          {
            title,
            description,
            price: parseFloat(price),
            cat_id: category,
            u_id: user.u_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await supabase.from("pet_images").insert([
        {
          l_id: listing.l_id,
          image_url: imageUrl,
        },
      ]);

      Alert.alert("Success", "Pet listed successfully!");

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory(null);
      setCategoryLabel("");
      setImage(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sell Your Exotic Pet</Text>

      {/* IMAGE */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      {/* TITLE */}
      <TextInput
        placeholder="Pet Name"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* DESCRIPTION */}
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      {/* PRICE */}
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* CATEGORY DROPDOWN */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={{ color: categoryLabel ? "#000" : "#888" }}>
          {categoryLabel || "Select Category"}
        </Text>
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={styles.dropdown}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.dropdownItem}
              onPress={() => {
                setCategory(cat.id);
                setCategoryLabel(cat.name);
                setDropdownVisible(false);
              }}
            >
              <Text>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* SELL BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Posting..." : "Sell Pet"}
        </Text>
      </TouchableOpacity>

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F6F7",
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  imageBox: {
    height: 200,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 10,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },

  dropdown: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },

  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  button: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  backButton: {
    backgroundColor: "#1B5E20",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});