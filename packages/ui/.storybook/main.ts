import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Served at /component-lib on the app's Vercel domain — production assets must
  // resolve under that subpath. Dev (root) is unaffected.
  viteFinal: async (viteConfig, { configType }) => {
    if (configType === "PRODUCTION") viteConfig.base = "/component-lib/";
    return viteConfig;
  },
};

export default config;
