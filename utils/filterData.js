// Example: filterData.js
export const filterData = [
  {
    items: [
      { name: 'For Sale', value: 'sale' },
      { name: 'To Rent', value: 'rent' },
    ],
    placeholder: 'Listing Status',
    queryName: 'listing_status',
  },
  {
    items: [
      { name: 'Flat', value: 'flats' },
      { name: 'House', value: 'houses' },
    ],
    placeholder: 'Property Type',
    queryName: 'property_type',
  },
  {
    items: [
      { name: '1+', value: '1' },
      { name: '2+', value: '2' },
      { name: '3+', value: '3' },
    ],
    placeholder: 'Min Beds',
    queryName: 'minimum_beds',
  },
];
