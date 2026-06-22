import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  const [species, setSpecies] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvail] = useState("");

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
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const validate = () => {
    let err: any = {};

    if (!title) err.title = "Pet Name is required";
    if (!species) err.species = "Species is required";
    if (!age) err.age = "Age is required";
    if (!gender) err.gender = "Gender is required";
    if (!location) err.location = "Location is required";
    if (!description) err.description = "Description is required";
    if (!price) err.price = "Price is required";
    if (!available) err.title = "Pet Availability is required";
    if (!category) err.category = "Category is required";
    if (!image) err.image = "Image is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const convertToBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // ✅ convert image to base64
      const base64Image: any = await convertToBase64(image.uri);

      // ✅ insert directly into pet_listings
      const { data: listing, error } = await supabase
        .from("pet_listings")
        .insert([
          {
            p_name: title,
            p_species: species,
            p_age: age,
            p_gender: gender,
            p_price: parseFloat(price),
            description: description,
            location: location,
            cat_id: Number(category),
            u_id: user.u_id,
            pet_avail: available,
            l_status: "Pending",
            image_url: base64Image, // ✅ IMAGE STORED HERE
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert("Success", "Pet listed successfully!");

      setTitle("");
      setSpecies("");
      setAge("");
      setGender("");
      setLocation("");
      setDescription("");
      setPrice("");
      setCategory(null);
      setCategoryLabel("");
      setImage(null);
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sell Your Exotic Pet</Text>

      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      <TextInput placeholder="Pet Name" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Species" value={species} onChangeText={setSpecies} style={styles.input} />
      <TextInput placeholder="Age" value={age} onChangeText={setAge} style={styles.input} />
      <TextInput placeholder="Gender" value={gender} onChangeText={setGender} style={styles.input} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Pet Quantity" value={available} onChangeText={setAvail} keyboardType="numeric" style={styles.input}
/>
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Posting..." : "Sell Pet"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>Cancel</Text>
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