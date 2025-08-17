// auth.js - Handle authentication state and persistence

// Constants
const USER_STORAGE_KEY = 'naijaShopUser';
const TOKEN_EXPIRY_DAYS = 7;

// Get stored user data
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;

    const parsedData = JSON.parse(userData);
    
    // Check if the stored data has expired
    if (parsedData.expiresAt && new Date(parsedData.expiresAt) < new Date()) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }

    return parsedData.data?.user || null;
  } catch (error) {
    console.error('Error reading stored user:', error);
    return null;
  }
};

// Store user data with expiration
export const storeUser = (userData) => {
  try {
    if (!userData || !userData.data?.token) {
      throw new Error('Invalid user data');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

    const dataToStore = {
      data: {
        user: userData.data.user,
        token: userData.data.token
      },
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dataToStore));
    return dataToStore.data.user;
  } catch (error) {
    console.error('Error storing user:', error);
    return null;
  }
};

// Clear stored user data
export const clearStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

// Get stored token
export const getStoredToken = () => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;

    const parsedData = JSON.parse(userData);
    
    // Check expiration
    if (parsedData.expiresAt && new Date(parsedData.expiresAt) < new Date()) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }

    return parsedData.data?.token || null;
  } catch (error) {
    console.error('Error reading stored token:', error);
    return null;
  }
};

// Update token expiration
export const updateTokenExpiration = () => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return;

    const parsedData = JSON.parse(userData);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);
    
    const updatedData = {
      ...parsedData,
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error updating token expiration:', error);
  }
};
