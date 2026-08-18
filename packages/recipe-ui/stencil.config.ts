import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'recipe-ui',
  globalStyle: 'src/global/global.css',
  // Evergreen browsers only — no legacy polyfill / IE11 targets.
  extras: {
    enableImportInjection: true,
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      // One-shot registration for SvelteKit (Phase 06): import defineCustomElements from dist/components.
      customElementsExportBehavior: 'bundle',
      externalRuntime: false,
      generateTypeDeclarations: true,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [{ src: 'global/global.css', dest: 'global.css' }],
    },
  ],
};
