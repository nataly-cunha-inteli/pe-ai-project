// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Documentação Pe.ai",
  tagline: "Dinosaurs are cool",
  favicon: "img/logo_light_mode.png",

  // Set the production url of your site here
  url: "https://nataly-cunha-inteli.github.io",
  baseUrl: "/pe-ai-project/",
  // Explicit trailingSlash setting to avoid GitHub Pages redirect/trailing slash issues
  trailingSlash: false,

  // GitHub pages deployment config.
  organizationName: "nataly-cunha-inteli", // Usually your GitHub org/user name.
  projectName: "pe-ai-project", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  // 👇 Ativa suporte ao Mermaid
  themes: ["@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/logo_light_mode.png",
      navbar: {
        title: "Documentação Pe.ai",
        logo: {
          alt: "Logo Pe.ai",
          srcDark: "img/logo_dark_mode.png",
          src: "img/logo_light_mode.png",
        },
        items: [
          {
            href: "https://github.com/MiguelClaret/VisaoAlem",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/MiguelClaret/VisaoAlem",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Engenharia Alcantara, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },

      // 👇 Config extra do Mermaid
      mermaid: {
        theme: { light: "neutral", dark: "dark" },
      },
    }),
};

export default config;

