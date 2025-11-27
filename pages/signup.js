"use client";
import { useState } from "react";
import { Box, Input, Button, Heading, VStack, Text, Divider, HStack, Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage({ 
        text: data.message || "Signup successful! Redirecting to login...", 
        type: "success" 
      });
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setMessage({ 
        text: data.error || "Something went wrong", 
        type: "error" 
      });
    }
  };

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/" });
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
          Create Account
        </Heading>

        <VStack spacing={4} as="form" onSubmit={handleSubmit}>
          <Input name="name" placeholder="Full Name" onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />

          <Button colorScheme="green" type="submit" isLoading={loading} w="full">
            Sign Up
          </Button>

          {message.text && (
            <Alert status={message.type} borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">{message.text}</AlertDescription>
            </Alert>
          )}
        </VStack>

        <Divider my={6} />

        <VStack spacing={3}>
          <Text fontSize="sm" color="gray.600">
            Or sign up with
          </Text>
          <Button
            onClick={handleGoogleSignup}
            leftIcon={<FcGoogle />}
            variant="outline"
            w="full"
            size="md"
          >
            Continue with Google
          </Button>
        </VStack>

        <HStack justify="center" mt={4}>
          <Text fontSize="sm">Already have an account?</Text>
          <Button
            variant="link"
            colorScheme="green"
            size="sm"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
