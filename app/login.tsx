import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
  
  export default function LoginPage() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>
  
        <View style={styles.card}>
          <Text style={styles.heading}>Hello Explorer!</Text>
  
          <Text style={styles.subheading}>
            Sign in to your ExoVerse account
          </Text>
  
          <TextInput
            placeholder="Email"
            style={styles.input}
          />
  
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />
  
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
  
          <TouchableOpacity>
            <Text style={styles.signup}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
  
    header: {
      height: 220,
      backgroundColor: "#1B5E20",
      justifyContent: "center",
      alignItems: "center",
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
  
    logo: {
      width: 140,
      height: 140,
      resizeMode: "contain",
    },
  
    card: {
      backgroundColor: "#fff",
      marginHorizontal: 20,
      marginTop: -30,
      borderRadius: 20,
      padding: 20,
      elevation: 8,
    },
  
    heading: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#1B5E20",
      marginBottom: 10,
    },
  
    subheading: {
      color: "#666",
      marginBottom: 30,
    },
  
    input: {
      borderWidth: 1,
      borderColor: "#D9D9D9",
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      backgroundColor: "#F8F8F8",
    },
  
    loginBtn: {
      backgroundColor: "#1B5E20",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 10,
    },
  
    loginText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 16,
    },
  
    signup: {
      marginTop: 25,
      textAlign: "center",
      color: "#2E7D32",
      fontWeight: "600",
    },
  });