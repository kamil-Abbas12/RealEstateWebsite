"use client";
import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Text,
  Divider,
  HStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      onClose();
      window.location.reload(); // Refresh to update session
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" color="green.600">
          Login to Your Account
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} as="form" onSubmit={handleLogin}>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <HStack w="full">
              <Divider />
              <Text fontSize="sm" color="gray.500">OR</Text>
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

            <HStack>
              <Text fontSize="sm">Don't have an account?</Text>
              <Button
                variant="link"
                colorScheme="green"
                size="sm"
                onClick={onSwitchToSignup}
              >
                Sign Up
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
