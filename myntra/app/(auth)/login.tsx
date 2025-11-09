import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Colors } from "@/constants/theme";
import { useResponsive } from "@/hooks/use-responsive";
import Container from "@/components/Container";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setisloading] = useState(false);
  const { theme } = useTheme();
  const { isDesktop, isTablet } = useResponsive();
  const colors = Colors[theme];

  const handleLogin = async () => {
    try {
      setisloading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
    } finally {
      setisloading(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webContainer, { backgroundColor: colors.background }]}>
        <Container>
          <View style={[
            styles.webFormContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
              shadowColor: colors.shadow,
              width: isDesktop ? 450 : isTablet ? '70%' : '90%',
              maxWidth: 500,
            }
          ]}>
          <Text style={[styles.title, { color: Colors[theme].text }]}>Welcome to Myntra</Text>
          <Text style={[styles.subtitle, { color: Colors[theme].icon }]}>Login to continue shopping</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Colors[theme].background, color: Colors[theme].text }]}
            placeholder="Email"
            placeholderTextColor={Colors[theme].icon}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={[styles.passwordContainer, { backgroundColor: Colors[theme].background }]}>
            <TextInput
              style={[styles.passwordInput, { color: Colors[theme].text }]}
              placeholder="Password"
              placeholderTextColor={Colors[theme].icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={Colors[theme].icon} />
              ) : (
                <Eye size={20} color={Colors[theme].icon} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isloading}
          >
            {isloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => router.push("/signup")}
          >
            <Text style={[styles.signupText, { color: colors.buttonPrimary }]}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
          </View>
        </Container>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        }}
        style={styles.backgroundImage}
      />
      <View style={[styles.formContainer, { backgroundColor: `rgba(${theme === 'light' ? '255, 255, 255' : '0, 0, 0'}, 0.9)` }]}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>Welcome to Myntra</Text>
        <Text style={[styles.subtitle, { color: Colors[theme].icon }]}>Login to continue shopping</Text>
        <TextInput
          style={[styles.input, { backgroundColor: Colors[theme].background, color: Colors[theme].text }]}
          placeholder="Email"
          placeholderTextColor={Colors[theme].icon}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={[styles.passwordContainer, { backgroundColor: Colors[theme].background }]}>
          <TextInput
            style={[styles.passwordInput, { color: Colors[theme].text }]}
            placeholder="Password"
            placeholderTextColor={Colors[theme].icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={Colors[theme].icon} />
            ) : (
              <Eye size={20} color={Colors[theme].icon} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isloading}
        >
          {isloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    width: "100%",
    height: "50%",
    position: "absolute",
    top: 0,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginTop: "60%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#3e3e3e",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  button: {
    backgroundColor: "#ff3f6c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    color: "#ff3f6c",
    fontSize: 16,
  },
  webContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webFormContainer: {
    padding: 40,
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    alignSelf: 'center',
    marginVertical: 40,
  },
});