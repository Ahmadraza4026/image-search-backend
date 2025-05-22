import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
});

async function test() {
  try {
    const res = await unsplashApi.get('/photos', { params: { per_page: 1 } });
    console.log('Response data:', res.data);
    console.log('Sample photo:', res.data[0]);
  } catch (error) {
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

test();
