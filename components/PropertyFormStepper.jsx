"use client";
import React, { useEffect, useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Select, NumberInput, NumberInputField,
  VStack, HStack, Heading, Textarea, Grid, GridItem,
  Image, IconButton, useToast, Text, RadioGroup, Radio,
  Progress, FormHelperText, Badge, Spinner
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import axios from "axios";

export default function PropertyFormStepper({ propertyId }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(!!propertyId);
  const [listingFee, setListingFee] = useState(5); // default $5
  const [savedPropertyId, setSavedPropertyId] = useState(propertyId || null);

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

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const AMENITIES = ["Pool", "Gym", "AC", "Elevator", "Balcony", "Security", "Garden", "Parking"];

  // ✅ Load existing property for editing
  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/properties/${propertyId}`);

        if (res.data?.success && res.data?.property) {
          const p = res.data.property;
          
          setForm({
            title: p.title || "",
            listingType: p.listingType || "sale",
            price: p.price || "",
            currency: p.currency || "USD",
            address: p.address || "",
            lat: p.lat || "",
            lng: p.lng || "",
            bedrooms: p.bedrooms || 1,
            bathrooms: p.bathrooms || 1,
            area: p.area || "",
            propertyType: p.propertyType || "House",
            yearBuilt: p.yearBuilt || "",
            furnished: p.furnished || false,
            garden: p.garden || false,
            parking: p.parking || false,
            description: p.description || "",
            amenities: p.amenities || [],
          });
          setImages(p.images || []);
          setPreviews(p.images || []);
          setIsEdit(true);
        }
      } catch (err) {
        toast({
          title: "Error loading property",
          description: err.response?.data?.message || err.message,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, toast]);

  // ✅ Cloudinary upload
  async function uploadToCloud(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        onUploadProgress: (ev) => {
          if (!ev.total) return;
          setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      }
    );

    return res.data.secure_url;
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 100) {
      toast({ title: "Maximum 100 images allowed", status: "warning" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploads = files.map((file) => uploadToCloud(file));
      const urls = await Promise.all(uploads);
      setImages((prev) => [...prev, ...urls].slice(0, 100));
      setPreviews((prev) => [...prev, ...urls].slice(0, 100));
      toast({ title: `${urls.length} images uploaded`, status: "success" });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, status: "error" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleAmenity(name) {
    setForm((prev) => {
      const has = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: has ? prev.amenities.filter((a) => a !== name) : [...prev.amenities, name],
      };
    });
  }

  // ✅ Save property first (step 1-2), then show preview with payment options
  async function handleSaveProperty() {
    if (!form.title || !form.address || !form.price) {
      toast({ title: "Please fill required fields", status: "error" });
      return;
    }

    if (images.length === 0) {
      toast({ title: "Please upload at least one image", status: "error" });
      return;
    }

    setProcessing(true);

    try {
      const payload = { 
        ...form, 
        images, 
        amenities: form.amenities || [],
        status: "pending_payment" // ✅ Mark as pending until payment
      };

      const res = await axios.post("/api/properties", payload);

      if (res.data?.success) {
        setSavedPropertyId(res.data.propertyId);
        toast({ title: "Property saved! Choose your listing type.", status: "success" });
        setStep(3); // Move to preview/payment step
      }
    } catch (err) {
      toast({
        title: "Failed to save property",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    } finally {
      setProcessing(false);
    }
  }

  // ✅ Proceed to Stripe checkout with selected fee
  async function handleCheckout() {
    if (!savedPropertyId) {
      toast({ title: "Property not saved yet", status: "error" });
      return;
    }

    setProcessing(true);
    try {
      const res = await axios.post("/api/create-checkout-session", {
        propertyId: savedPropertyId,
        propertyTitle: form.title,
        listingFee: listingFee, // ✅ Pass selected fee ($5 or $15)
      });

      if (res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe
      }
    } catch (err) {
      toast({ title: "Checkout failed", description: err.message, status: "error" });
    } finally {
      setProcessing(false);
    }
  }

  // ✅ Update existing property
  async function handleUpdateProperty() {
    if (!propertyId) return;

    setProcessing(true);
    try {
      const payload = { ...form, images, amenities: form.amenities || [] };
      const res = await axios.put(`/api/properties/${propertyId}`, payload);

      if (res.data?.success) {
        toast({ title: "Property updated!", status: "success" });
        window.location.href = `/property/${propertyId}`;
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={3}>Loading property...</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="lg" maxW="900px" mx="auto">
      <Heading size="lg" mb={4}>
        {isEdit ? "Edit Property" : `Create Listing — Step ${step} of 3`}
      </Heading>

      {!isEdit && (
        <HStack spacing={3} mb={4}>
          <Badge colorScheme={step >= 1 ? "teal" : "gray"}>1. Details</Badge>
          <Badge colorScheme={step >= 2 ? "teal" : "gray"}>2. Images</Badge>
          <Badge colorScheme={step >= 3 ? "teal" : "gray"}>3. Payment</Badge>
        </HStack>
      )}

      <VStack align="stretch" spacing={4}>
        {/* ✅ STEP 1 - Basic Details */}
        {(step === 1 || isEdit) && (
          <>
            <FormControl isRequired>
              <FormLabel>Property Title</FormLabel>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Spacious 3BR apartment"
              />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Listing Type</FormLabel>
                  <RadioGroup
                    value={form.listingType}
                    onChange={(val) => setForm({ ...form, listingType: val })}
                  >
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
                  <NumberInput
                    min={0}
                    value={form.price}
                    onChange={(val) => setForm({ ...form, price: val })}
                  >
                    <NumberInputField placeholder="Enter price" />
                  </NumberInput>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Property address"
              />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  >
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Commercial</option>
                    <option>Land</option>
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Area (sqft)</FormLabel>
                  <NumberInput
                    min={0}
                    value={form.area}
                    onChange={(val) => setForm({ ...form, area: val })}
                  >
                    <NumberInputField placeholder="Total area" />
                  </NumberInput>
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Bedrooms</FormLabel>
                  <NumberInput
                    min={0}
                    value={form.bedrooms}
                    onChange={(val) => setForm({ ...form, bedrooms: Number(val) })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Bathrooms</FormLabel>
                  <NumberInput
                    min={0}
                    value={form.bathrooms}
                    onChange={(val) => setForm({ ...form, bathrooms: Number(val) })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe your property..."
              />
            </FormControl>
          </>
        )}

        {/* ✅ STEP 2 - Images & Amenities */}
        {(step === 2 || isEdit) && (
          <>
            <FormControl>
              <FormLabel>Property Images (Max 100)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                disabled={uploading || images.length >= 100}
              />
              <FormHelperText>{images.length}/100 images uploaded</FormHelperText>

              {uploading && (
                <Box mt={2}>
                  <Text fontSize="sm" mb={1}>
                    Uploading... {uploadProgress}%
                  </Text>
                  <Progress value={uploadProgress} size="sm" />
                </Box>
              )}
            </FormControl>

            {previews.length > 0 && (
              <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={3}>
                {previews.map((url, idx) => (
                  <GridItem key={idx} position="relative">
                    <Image
                      src={url}
                      alt={`Preview ${idx}`}
                      borderRadius="md"
                      objectFit="cover"
                      h="120px"
                      w="100%"
                    />
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

            <FormControl mt={4}>
              <FormLabel>Amenities</FormLabel>
              <HStack wrap="wrap" spacing={2}>
                {AMENITIES.map((a) => {
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

        {/* ✅ STEP 3 - Preview & Payment Options */}
        {step === 3 && !isEdit && (
          <>
            <Heading size="md">Preview & Choose Listing Type</Heading>
            <Box border="1px solid #eee" p={4} borderRadius="md">
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

              {form.description && <Text mt={3}>{form.description}</Text>}

              {form.amenities.length > 0 && (
                <HStack mt={3} spacing={2} wrap="wrap">
                  {form.amenities.map(a => <Badge key={a}>{a}</Badge>)}
                </HStack>
              )}
            </Box>

            <Box mt={6} p={4} border="2px solid" borderColor="teal.300" borderRadius="md">
              <Heading size="sm" mb={3}>Select Listing Type:</Heading>
              <RadioGroup onChange={(val) => setListingFee(Number(val))} value={listingFee}>
                <VStack align="start" spacing={3}>
                  <Radio value={5}>
                    <HStack>
                      <Text fontWeight="bold">Standard Listing - $5</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" ml={6}>
                      Your property appears in regular listings
                    </Text>
                  </Radio>
                  <Radio value={15}>
                    <HStack>
                      <Text fontWeight="bold">Premium Listing - $15</Text>
                      <Badge colorScheme="yellow">⭐ Featured</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" ml={6}>
                      Your property appears at the TOP of all listings
                    </Text>
                  </Radio>
                </VStack>
              </RadioGroup>

              <Button
                colorScheme="teal"
                size="lg"
                mt={5}
                w="full"
                onClick={handleCheckout}
                isLoading={processing}
              >
                Proceed to Payment (${listingFee})
              </Button>
            </Box>
          </>
        )}
      </VStack>

      {/* ✅ Navigation Buttons */}
      {!isEdit && (
        <HStack spacing={3} justify="flex-end" mt={6}>
          {step > 1 && step < 3 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step === 1 && (
            <Button colorScheme="teal" onClick={() => setStep(2)}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button colorScheme="teal" onClick={handleSaveProperty} isLoading={processing}>
              Save & Continue
            </Button>
          )}
        </HStack>
      )}

      {isEdit && (
        <HStack spacing={3} justify="flex-end" mt={6}>
          <Button colorScheme="teal" onClick={handleUpdateProperty} isLoading={processing}>
            Update Property
          </Button>
        </HStack>
      )}
    </Box>
  );
}
