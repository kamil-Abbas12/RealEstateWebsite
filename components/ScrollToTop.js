"use client";
import { useState, useEffect } from "react";
import { IconButton } from "@chakra-ui/react";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) setIsVisible(true);
      else setIsVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isVisible && (
        <IconButton
          icon={<FaArrowUp />}
          aria-label="Scroll to top"
          position="fixed"
          bottom="30px"
          right="30px"
          zIndex="1000"
          colorScheme="green"
          rounded="full"
          size="lg"
          onClick={scrollToTop}
          boxShadow="lg"
          _hover={{ bg: "green.700" }}
        />
      )}
    </>
  );
}
