import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/tests/db/schemas.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'test.db',
  },
});
