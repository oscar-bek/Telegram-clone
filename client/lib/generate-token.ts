import { axiosClient } from '@/http/axios';

export const generateToken = async (userId?: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data } = await axiosClient.post('/api/auth/token', { userId });
    
    return data.token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};
