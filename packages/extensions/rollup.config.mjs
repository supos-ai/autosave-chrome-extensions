import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/service_worker.ts",
    output: {
      file: "build/service_worker.js",
      format: "iife",
      name: "service_worker",
    },
    plugins: [
      copy({
        targets: [
          { src: "src/manifest.json", dest: "build" },
          { src: "src/icons/*", dest: "build/icons" },
          { src: "src/views/*", dest: "build/views" },
        ],
      }),
      terser(),
      typescript(),
      nodeResolve(),
      {
        buildStart() {
          this.addWatchFile("./src/manifest.json");
        },
      },
    ],
  },
  {
    input: "src/content.ts",
    output: {
      file: "build/content.js",
      format: "iife",
      name: "content",
    },
    plugins: [terser(), typescript(), nodeResolve()],
  },
  {
    input: "src/document.ts",
    output: {
      file: "build/document.js",
      format: "iife",
      name: "document",
    },
    plugins: [typescript(), terser(), nodeResolve()],
  },
];
