// prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Nạp các biến từ file .env vào process.env
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL, // Sử dụng DIRECT_URL cho kết nối trực tiếp đến database
  },
});