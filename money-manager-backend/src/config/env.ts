import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

// Parse PORT safely without changing default behavior
const parsedPort = Number(process.env.PORT);

export const PORT: number = Number.isInteger(parsedPort) && parsedPort > 0
  ? parsedPort
  : 5000;

export const MONGO_URI: string = requireEnv("MONGO_URI");
export const JWT_SECRET: string = requireEnv("JWT_SECRET");
