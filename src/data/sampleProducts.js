// Local sample products (30 items) — images use picsum.photos seeded URLs
const sampleProducts = [
  {
    id: 'local_1',
    title: 'Classic Lipstick',
    price: 1299,
    description: 'Long-lasting matte lipstick in a range of vibrant colours.',
    thumbnail: 'https://picsum.photos/seed/lipstick/600/600',
    images: ['https://picsum.photos/seed/lipstick/800/800','https://picsum.photos/seed/lipstick2/800/800'],
    rating: 4.2,
    stock: 50,
    brand: 'BeautyCo',
    category: 'Beauty'
  },
  {
    id: 'local_2',
    title: 'Floral Eau de Parfum',
    price: 4999,
    description: 'A delicate floral fragrance with notes of jasmine and rose.',
    thumbnail: 'https://picsum.photos/seed/perfume/600/600',
    images: ['https://picsum.photos/seed/perfume/800/800','https://picsum.photos/seed/perfume2/800/800'],
    rating: 4.6,
    stock: 25,
    brand: 'Aroma',
    category: 'Fragrances'
  },
  {
    id: 'local_3',
    title: 'Eyeshadow Palette',
    price: 2999,
    description: 'Neutral and shimmer shades for everyday and glam looks.',
    thumbnail: 'https://picsum.photos/seed/eyeshadow/600/600',
    images: ['https://picsum.photos/seed/eyeshadow/800/800','https://picsum.photos/seed/eyeshadow2/800/800'],
    rating: 4.1,
    stock: 40,
    brand: 'ColorLux',
    category: 'Beauty'
  },
  {
    id: 'local_4',
    title: 'Mascaras Pro Volume',
    price: 2199,
    description: 'Volumizing mascara for fuller-looking lashes.',
    thumbnail: 'https://picsum.photos/seed/mascara/600/600',
    images: ['https://picsum.photos/seed/mascara/800/800'],
    rating: 4.0,
    stock: 60,
    brand: 'LashPro',
    category: 'Beauty'
  },
  {
    id: 'local_5',
    title: 'Hand Cream Set',
    price: 899,
    description: 'Nourishing hand cream trio for soft, smooth skin.',
    thumbnail: 'https://picsum.photos/seed/handcream/600/600',
    images: ['https://picsum.photos/seed/handcream/800/800'],
    rating: 4.3,
    stock: 120,
    brand: 'SoftCare',
    category: 'Beauty'
  },
  // Add more items up to 30
  ...Array.from({ length: 25 }).map((_, i) => {
    const idx = i + 6;
    return {
      id: `local_${idx}`,
      title: `Sample Product ${idx}`,
      price: (idx * 10 + 99),
      description: `Description for sample product ${idx}.`,
      thumbnail: `https://picsum.photos/seed/sample${idx}/600/600`,
      images: [`https://picsum.photos/seed/sample${idx}/800/800`, `https://picsum.photos/seed/sample${idx}b/800/800`],
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      stock: Math.floor(Math.random() * 100) + 1,
      brand: `Brand ${idx}`,
      category: ['Beauty','Fragrances','Home','Electronics','Fashion'][idx % 5]
    };
  })
];

export default sampleProducts;
