import { preprocessMeltUI, sequence } from "@melt-ui/pp";
import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config}*/
export default {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: sequence([vitePreprocess(), preprocessMeltUI()]),
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $utils: "src/utils",
      "$utils/*": "src/utils/*",
      $api: "src/api",
      "$api/*": "src/api/*",
      $constants: "src/constants",
      $type: "src/types",
      $icons: "src/icons",
      "$icons/*": "src/icons/*",
      $components: "src/components",
      "$components/*": "src/components/*",
      $features: "src/features",
      "$features/*": "src/features/*",
    },
  },
  compilerOptions: {
    runes: true,
  },
};
