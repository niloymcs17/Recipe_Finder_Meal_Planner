import { beforeAll } from 'vitest';

beforeAll(async () => {
  const { defineCustomElements } = await import('./loader');
  await defineCustomElements();
});
