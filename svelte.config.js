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
      $routes: "src/routes",
      "$routes/*": "src/routes/*",
      $utils: "src/lib/utils",
      "$utils/*": "src/lib/utils/*",
      $api: "src/routes/api",
      "$api/*": "src/routes/api/*",
      $constants: "src/constants",
      $types: "src/lib/types",
      $icons: "src/lib/components/icons",
      "$icons/*": "src/lib/components/icons/*",
      $components: "src/lib/components",
      "$components/*": "src/lib/components/*",
    },
  },
  compilerOptions: {
    runes: true,
  },
};
