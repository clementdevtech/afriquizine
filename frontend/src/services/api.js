import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

export const fetchServices = async () => {
  const response = await axios.get(`${API_URL}/services`);
  return response.data;
};
