"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  Divider,
  HStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error); // ✅ Show the actual error message from NextAuth
    } else {
      router.push("/add-property");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/add-property" });
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box bg="white" p={8} rounded="md" shadow="md" w="full" maxW="md">
        <Heading mb={4} textAlign="center" color="green.600">
          Login to Your Account
        </Heading>

        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <Button
            colorScheme="green"
            type="submit"
            w="full"
            isLoading={loading}
          >
            Login
          </Button>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          <HStack w="full" align="center">
            <Divider />
            <Text fontSize="sm" color="gray.500">
              OR
            </Text>
            <Divider />
          </HStack>

          <Button
            w="full"
            variant="outline"
            leftIcon={<FcGoogle />}
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>

          <Text>
            Dont have an account?
            <ChakraLink as={NextLink} href="/signup" color="green.600">
              Sign Up
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
