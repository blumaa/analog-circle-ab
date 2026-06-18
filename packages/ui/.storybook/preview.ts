import type { Preview } from "@storybook/react";
import "@analog/tokens/css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "analog",
      values: [{ name: "analog", value: "#1a1a2e" }],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
