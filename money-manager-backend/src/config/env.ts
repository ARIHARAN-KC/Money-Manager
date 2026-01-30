import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export const PORT = Number(process.env.PORT ?? 5000);
export const MONGO_URI = requireEnv("MONGO_URI");
export const JWT_SECRET = requireEnv("JWT_SECRET");
