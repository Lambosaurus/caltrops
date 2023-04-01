module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js'
],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",        
      {
        "duskers": {
          primary: "#c5e838",
          secondary: "#2653a6",
          accent: "#ecf29b",
          neutral: "#2c4745",
          "neutral-content": "#37edb3",
          "base-content": "#37edb3",
          "base-100": "#09090b",
          "base-200": "#191f1d",
          "base-300": "#1c3328",
          fontFamily: "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
          "--rounded-box": "0.25rem",
          "--rounded-btn": "0",
          "--rounded-badge": "0",
          "--tab-radius": "0",
        },
        "soil": {
          primary: "#2f8029",
          secondary: "#335fa6",
          accent: "#dedc52",
          neutral: "#8a674a",
          "neutral-content": "#d9be9a",
          "base-content": "#c2b5a3",
          "base-100": "#302827",
          "base-200": "#423332",
          "base-300": "#5e4440",
        },
        "darkest": {
          primary: "#e11d48",
          secondary: "#881337",
          accent: "#e11d48",
          neutral: "#1f2937",
          "base-100": "#131316",
          "base-200": "#1f2937",
          "base-300": "#374151",
        },
      }
    ],
  },
  plugins: [require("daisyui"), require('tailwind-scrollbar')],
};
