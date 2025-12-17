"use client";

import { Box, Text, Flex, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const OFFER_DAYS = 26;
const STORAGE_KEY = "free_offer_end";

const FreePropertyTimer = () => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let endDate = localStorage.getItem(STORAGE_KEY);

    // ✅ Set end date ONCE
    if (!endDate) {
      const end = new Date();
      end.setDate(end.getDate() + OFFER_DAYS);
      localStorage.setItem(STORAGE_KEY, end.toISOString());
      endDate = end.toISOString();
    }

    const endTime = new Date(endDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (distance % (1000 * 60 * 60)) / (1000 * 60)
        ),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <Box bg="red.500" color="white" p={4} rounded="lg" textAlign="center">
        <Text fontWeight="bold">
          Free property listing offer has ended
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bg="green.600"
      color="white"
      p={5}
      rounded="xl"
      textAlign="center"
      boxShadow="xl"
    >
      <Text fontSize="lg" fontWeight="bold" mb={1}>
        🎉 Add Property for FREE
      </Text>

      <Text fontSize="sm" mb={2}>
        Limited time offer ends in
      </Text>

      <Flex justify="center" gap={2}>
        <TimeBox label="Days" value={timeLeft.days} />
        <TimeBox label="Hours" value={timeLeft.hours} />
        <TimeBox label="Minutes" value={timeLeft.minutes} />
        <TimeBox label="Seconds" value={timeLeft.seconds} />
      </Flex>

      <Button
        mt={4}
        size="sm"
        bg="white"
        color="green.700"
        _hover={{ bg: "gray.100" }}
      >
        Add Property Now
      </Button>
    </Box>
  );
};

const TimeBox = ({ label, value }) => (
  <Box bg="whiteAlpha.300" p={2} rounded="md" minW="65px">
    <Text fontSize="lg" fontWeight="bold">
      {value}
    </Text>
    <Text fontSize="xs">{label}</Text>
  </Box>
);

export default FreePropertyTimer;
