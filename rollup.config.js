import { terser } from "rollup-plugin-terser";
import htmlTemplate from "rollup-plugin-generate-html-template";

export default {
  input: "js/scripts/main.js",
  output: [
    // {
    //   file: "bundle.js",
    //   format: "iife"
    // },
    {
      dir: "./",
      entryFileNames: "bundle.min.[hash].js",
      format: "iife",
      plugins: [terser()]
    }
  ],
  plugins: [
    htmlTemplate({
      template: "BeelineTaxi2019.html",
      target: "index.html"
    })
  ]
};
