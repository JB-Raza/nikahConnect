import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NikahConnect 💍</Text>

      <Text style={styles.subtitle}>
        Find meaningful connections, built with intention.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#d4af37",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
  },
});
