const productCategories = [
  {
    name: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    description: 'Latest gadgets and electronic devices'
  },
  {
    name: 'fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
    description: 'Trendy clothing and accessories'
  },
  {
    name: 'home-appliances',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
    description: 'Quality appliances for your home'
  },
  {
    name: 'smartphones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9',
    description: 'Latest smartphones and accessories'
  },
  {
    name: 'laptops',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    description: 'Powerful laptops and notebooks'
  },
  {
    name: 'furniture',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126',
    description: 'Stylish furniture for your home'
  }
];

export const getProductCategories = () => {
  return productCategories;
};

export const getCategoryImage = (category) => {
  const categoryData = productCategories.find(cat => cat.name === category);
  return categoryData ? categoryData.image : `https://source.unsplash.com/800x600/?${category}`;
};
