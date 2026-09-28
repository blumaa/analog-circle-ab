import type { Preview } from "@storybook/react";
import "@analog/tokens/css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "analog",
      // Mirrors --color-bg; addon needs a literal.
      values: [{ name: "analog", value: "#1b1c2d" }],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
