import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

const parsedPort = Number(process.env.PORT);

export const PORT =
  Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

export const MONGO_URI = requireEnv("MONGO_URI");
export const JWT_SECRET = requireEnv("JWT_SECRET");
