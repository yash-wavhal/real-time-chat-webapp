import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// console.log('BASE_URL', BASE_URL);

export const api = axios.create({
  baseURL: `${BASE_URL}`,
  withCredentials: true,
});
