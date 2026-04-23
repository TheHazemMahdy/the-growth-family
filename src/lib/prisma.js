import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = global;

const isProduction = process.env.NODE_ENV === 'production';

let prismaInstance;

if (isProduction && process.env.TURSO_DATABASE_URL) {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSql(libsql);
  prismaInstance = new PrismaClient({ adapter });
} else {
  // Use SQLite for development OR if Turso is not configured yet (e.g. during build)
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
