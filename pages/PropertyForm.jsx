"use client";
import React, { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Select, NumberInput, NumberInputField,
  VStack, HStack, Heading, Textarea, Grid, GridItem,
  Image, IconButton, Badge, useToast, Text, RadioGroup, Radio,
  Progress, FormHelperText, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import axios from "axios";

export default function PropertyForm({ onSuccess } = {}) {
  const toast = useToast();
  const { isOpen: isContactOpen, onOpen: onContactOpen, onClose: onContactClose } = useDisclosure();

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [listingFee, setListingFee] = useState(5);
  const [savedPropertyId, setSavedPropertyId] = useState(null);

  // Contact information state
  const [showContactInfo, setShowContactInfo] = useState(null); // null, 'yes', or 'no'
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [form, setForm] = useState({
    title: "",
    listingType: "sale",
    price: "",
    currency: "USD",
    address: "",
    lat: "",
    lng: "",
    bedrooms: 1,
    bathrooms: 1,
    area: "",
    propertyType: "House",
    yearBuilt: "",
    furnished: false,
    garden: false,
    parking: false,
    description: "",
    amenities: [],
  });

  const AMENITIES = ["Pool", "Gym", "AC", "Elevator", "Balcony", "Security", "Garden", "Parking"];

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Address autocomplete
  async function handleAddressChange(e) {
    const value = e.target.value;
    setForm(prev => ({ ...prev, address: value }));

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&limit=5&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_KEY}`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Geoapify error:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(s) {
    setForm(prev => ({
      ...prev,
      address: s.properties.formatted || s.properties.name,
      lat: s.properties.lat,
      lng: s.properties.lon,
    }));
    setShowSuggestions(false);
  }

  // Cloudinary upload
  async function uploadToCloud(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const resp = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        fd,
        {
          onUploadProgress: (ev) => {
            if (!ev.total) return;
            setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        }
      );
      return resp.data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw err;
    }
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 12) {
      toast({ title: "Maximum 12 images allowed", status: "warning" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploads = files.map(f => uploadToCloud(f));
      const urls = await Promise.all(uploads);

      setImages(prev => [...prev, ...urls].slice(0, 12));
      setPreviews(prev => [...prev, ...urls].slice(0, 12));

      toast({ title: `${urls.length} image(s) uploaded`, status: "success" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message || "Upload error", status: "error" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function removeImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  function toggleAmenity(name) {
    setForm(prev => {
      const has = prev.amenities.includes(name);
      return { ...prev, amenities: has ? prev.amenities.filter(a => a !== name) : [...prev.amenities, name] };
    });
  }

  function nextStep() {
    if (step === 1) {
      if (!form.title || !form.address || !form.price) {
        toast({ title: "Please fill Title, Address and Price", status: "error" });
        return;
      }
    }
    if (step === 2) {
      if (images.length === 0) {
        toast({ title: "Please upload at least one image", status: "error" });
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 1));
  }

  // Save property and open contact modal
  async function handleSaveProperty() {
    if (processing) return;

    if (!form.title || !form.address || !form.price) {
      toast({ title: "Missing required fields", status: "error" });
      return;
    }
    if (images.length === 0) {
      toast({ title: "Please upload at least one image", status: "error" });
      return;
    }

    const payload = {
      ...form,
      images,
      amenities: form.amenities,
      status: "pending_payment",
    };

    try {
      setProcessing(true);
      toast({ title: "Saving property...", status: "info" });

      const res = await axios.post("/api/properties", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 60000
      });

      if (!res?.data?.success) {
        toast({ title: res?.data?.message || "Save failed", status: "error" });
        setProcessing(false);
        return;
      }

      const propertyId = res.data.propertyId;
      setSavedPropertyId(propertyId);
      
      toast({ title: "Property saved!", status: "success" });
      
      // Open contact information modal
      onContactOpen();

    } catch (err) {
      console.error("Save error:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || err?.message,
        status: "error",
      });
    } finally {
      setProcessing(false);
    }
  }

  // Handle contact modal submission
  function handleContactModalSubmit() {
    if (showContactInfo === 'yes') {
      if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
        toast({ title: "Please fill all contact fields", status: "error" });
        return;
      }
    }
    
    onContactClose();
    setStep(4); // Move to payment step
  }

  // Proceed to payment with contact info
  async function handleProceedToPayment() {
    if (!savedPropertyId) {
      toast({ title: "Property not saved", status: "error" });
      return;
    }

    setProcessing(true);
    
    try {
      // Update property with contact info if provided
      if (showContactInfo === 'yes') {
        await axios.put("/api/properties", {
          id: savedPropertyId,
          ownerContactName: contactInfo.name,
          ownerContactEmail: contactInfo.email,
          ownerContactPhone: contactInfo.phone,
          allowDirectContact: true
        });
      } else {
        await axios.put("/api/properties", {
          id: savedPropertyId,
          allowDirectContact: false
        });
      }

      const payRes = await axios.post("/api/create-checkout-session", {
        propertyId: savedPropertyId,
        propertyTitle: form.title,
        listingFee: listingFee,
      });

      if (payRes.data.url) {
        window.location.href = payRes.data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout failed",
        description: err?.response?.data?.message || err?.message,
        status: "error",
      });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="lg" maxW="900px" mx="auto">
      <Heading size="lg" mb={3}>Create Listing — Step {step} of 4</Heading>

      <HStack spacing={3} mb={4}>
        <Badge colorScheme={step >= 1 ? "teal" : "gray"}>1. Details</Badge>
        <Badge colorScheme={step >= 2 ? "teal" : "gray"}>2. Images</Badge>
        <Badge colorScheme={step >= 3 ? "teal" : "gray"}>3. Amenities</Badge>
        <Badge colorScheme={step >= 4 ? "teal" : "gray"}>4. Payment</Badge>
      </HStack>

      <VStack align="stretch" spacing={5}>
        {/* STEP 1 - Details */}
        {step === 1 && (
          <>
            <FormControl isRequired>
              <FormLabel>Property Title</FormLabel>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Spacious 3BR apartment with mountain view" />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Listing Type</FormLabel>
                  <RadioGroup value={form.listingType} onChange={val => setForm({ ...form, listingType: val })}>
                    <HStack spacing={4}>
                      <Radio value="sale">Sale</Radio>
                      <Radio value="rent">Rent</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Price ({form.currency})</FormLabel>
                  <NumberInput min={0} value={form.price} onChange={(val) => setForm({ ...form, price: val })}>
                    <NumberInputField placeholder="Enter price" />
                  </NumberInput>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isRequired position="relative">
              <FormLabel>Address</FormLabel>
              <Input value={form.address} onChange={handleAddressChange} placeholder="Start typing address..." autoComplete="off" />
              {showSuggestions && suggestions.length > 0 && (
                <Box border="1px solid #eee" bg="white" mt={1} maxH="150px" overflowY="auto" position="absolute" w="full" zIndex={30}>
                  {suggestions.map((s, i) => (
                    <Box key={i} p={2} _hover={{ bg: "gray.50", cursor: "pointer" }} onClick={() => handleSuggestionClick(s)}>
                      {s.properties.formatted || s.properties.name}
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Short Description</FormLabel>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </FormControl>
          </>
        )}

        {/* STEP 2 - Images */}
        {step === 2 && (
          <>
            <FormControl isRequired>
              <FormLabel>Property Images (Max 12)</FormLabel>
              <Input type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading || images.length >= 12} />
              <FormHelperText>{images.length}/12 images uploaded</FormHelperText>

              {uploading && (
                <Box mt={2}>
                  <Text fontSize="sm" mb={1}>Uploading... {uploadProgress}%</Text>
                  <Progress value={uploadProgress} size="sm" />
                </Box>
              )}
            </FormControl>

            {previews.length > 0 && (
              <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={3}>
                {previews.map((url, idx) => (
                  <GridItem key={idx} position="relative">
                    <Image src={url} alt={`Preview ${idx}`} borderRadius="md" objectFit="cover" h="120px" w="100%" />
                    <IconButton
                      icon={<CloseIcon />}
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={() => removeImage(idx)}
                      aria-label="Remove image"
                    />
                  </GridItem>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* STEP 3 - Amenities & details */}
        {step === 3 && (
          <>
            <FormControl>
              <FormLabel>Property Type</FormLabel>
              <Select value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value })}>
                <option>House</option>
                <option>Apartment</option>
                <option>Villa</option>
                <option>Commercial</option>
                <option>Land</option>
              </Select>
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Bedrooms</FormLabel>
                  <NumberInput min={0} value={form.bedrooms} onChange={(val) => setForm({ ...form, bedrooms: Number(val) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Bathrooms</FormLabel>
                  <NumberInput min={0} value={form.bathrooms} onChange={(val) => setForm({ ...form, bathrooms: Number(val) })}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl mt={3}>
              <FormLabel>Area (sqft)</FormLabel>
              <NumberInput min={0} value={form.area} onChange={(val) => setForm({ ...form, area: Number(val) })}>
                <NumberInputField placeholder="Enter total area" />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Amenities</FormLabel>
              <HStack wrap="wrap" spacing={2}>
                {AMENITIES.map(a => {
                  const active = form.amenities.includes(a);
                  return (
                    <Button
                      key={a}
                      size="sm"
                      variant={active ? "solid" : "outline"}
                      colorScheme={active ? "teal" : "gray"}
                      onClick={() => toggleAmenity(a)}
                    >
                      {a}
                    </Button>
                  );
                })}
              </HStack>
            </FormControl>
          </>
        )}

        {/* STEP 4 - Preview & Payment Selection */}
        {step === 4 && (
          <>
            <Heading size="md">Preview & Choose Listing Type</Heading>
            <Box border="1px solid #eee" p={4} borderRadius="md" bg="gray.50">
              <Heading size="sm">{form.title}</Heading>
              <Text mt={1}><strong>Price:</strong> {form.price} {form.currency}</Text>
              <Text mt={1}><strong>Address:</strong> {form.address}</Text>
              <Text mt={1}><strong>Area:</strong> {form.area} sqft</Text>
              <Text mt={1}><strong>Type:</strong> {form.propertyType}</Text>

              {previews.length > 0 && (
                <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={3} mt={3}>
                  {previews.map((url, i) => (
                    <Image key={i} src={url} alt={`preview-${i}`} h="120px" w="100%" objectFit="cover" borderRadius="md" />
                  ))}
                </Grid>
              )}

              {form.description && <Text mt={3} fontSize="sm">{form.description}</Text>}

              {form.amenities.length > 0 && (
                <HStack mt={3} spacing={2}>
                  {form.amenities.map(a => <Badge key={a}>{a}</Badge>)}
                </HStack>
              )}
            </Box>

            {/* PREMIUM OPTION SELECTION */}
            <Box mt={6} p={5} border="2px solid" borderColor="teal.400" borderRadius="md" bg="white">
              <Heading size="sm" mb={4}>📋 Select Your Listing Type:</Heading>
              
              <RadioGroup onChange={(val) => setListingFee(Number(val))} value={listingFee}>
                <VStack align="stretch" spacing={4}>
                  <Box
                    p={4}
                    border="2px solid"
                    borderColor={listingFee === 5 ? "teal.500" : "gray.200"}
                    borderRadius="md"
                    bg={listingFee === 5 ? "teal.50" : "white"}
                    cursor="pointer"
                    onClick={() => setListingFee(5)}
                  >
                    <Radio value={5} size="lg">
                      <VStack align="start" spacing={1} ml={2}>
                        <Text fontWeight="bold" fontSize="lg">Standard Listing - $5</Text>
                        <Text fontSize="sm" color="gray.600">
                          Your property appears in regular listings
                        </Text>
                      </VStack>
                    </Radio>
                  </Box>

                  <Box
                    p={4}
                    border="2px solid"
                    borderColor={listingFee === 15 ? "yellow.500" : "gray.200"}
                    borderRadius="md"
                    bg={listingFee === 15 ? "yellow.50" : "white"}
                    cursor="pointer"
                    onClick={() => setListingFee(15)}
                  >
                    <Radio value={15} size="lg">
                      <VStack align="start" spacing={1} ml={2}>
                        <HStack>
                          <Text fontWeight="bold" fontSize="lg">Premium Listing - $15</Text>
                          <Badge colorScheme="yellow" fontSize="sm">⭐ FEATURED</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          🚀 Your property appears at the TOP of all search results
                        </Text>
                        <Text fontSize="xs" color="green.600" fontWeight="semibold">
                          ✓ 3x more visibility • ✓ Sell/Rent faster
                        </Text>
                      </VStack>
                    </Radio>
                  </Box>
                </VStack>
              </RadioGroup>

              <Button
                colorScheme="teal"
                size="lg"
                w="full"
                mt={5}
                onClick={handleProceedToPayment}
                isLoading={processing}
                leftIcon={<Text>💳</Text>}
              >
                Proceed to Payment - ${listingFee}
              </Button>
            </Box>
          </>
        )}

        {/* Navigation */}
        <HStack spacing={3} justify="flex-end" mt={4}>
          {step > 1 && step < 4 && <Button variant="outline" onClick={prevStep}>Back</Button>}
          {step < 3 && <Button colorScheme="teal" onClick={nextStep}>Next</Button>}
          {step === 3 && <Button colorScheme="teal" onClick={handleSaveProperty} isLoading={processing}>Save & Continue</Button>}
        </HStack>

      </VStack>

      {/* Contact Information Modal */}
      <Modal isOpen={isContactOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contact Information</ModalHeader>
          <ModalBody>
            <Text mb={4}>Do you want buyers to contact you directly?</Text>
            
            <RadioGroup onChange={setShowContactInfo} value={showContactInfo}>
              <VStack align="stretch" spacing={3}>
                <Radio value="yes">Yes, provide my contact information</Radio>
                <Radio value="no">No, keep it private</Radio>
              </VStack>
            </RadioGroup>

            {showContactInfo === 'yes' && (
              <VStack spacing={3} mt={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    value={contactInfo.name} 
                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})} 
                    placeholder="Your name" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email"
                    value={contactInfo.email} 
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})} 
                    placeholder="your@email.com" 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input 
                    value={contactInfo.phone} 
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} 
                    placeholder="+1 234 567 8900" 
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="teal" 
              onClick={handleContactModalSubmit}
              isDisabled={showContactInfo === null}
            >
              Continue to Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
