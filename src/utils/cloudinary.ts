import { v2 as cloudinary, ConfigOptions } from "cloudinary";

const cloudinaryConfig: ConfigOptions = {
  cloud_name: process.env.CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_KEY || "",
  api_secret: process.env.CLOUDINARY_SECRET || "",
};

cloudinary.config(cloudinaryConfig);

export default cloudinary;

export type cloudinaryResponse = {
  secure_url: string;
};
