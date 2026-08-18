/**
 * Library source entry — types and shared utils.
 *
 * Custom element registration for consumers (Phase 06) comes from the build
 * output, not this file:
 *
 *   import { defineCustomElements } from '@recipe-finder/ui/loader';
 *   // or (dist-custom-elements bundle):
 *   import { defineCustomElements } from '@recipe-finder/ui';
 *
 * Theme tokens: import '@recipe-finder/ui/global.css' (or override `--rf-*` on :root).
 */

export type * from './components.d.ts';
export { debounce } from './utils/debounce';
