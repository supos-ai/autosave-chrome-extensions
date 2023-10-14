import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: {
    file: "build/index.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [terser(), typescript(), nodeResolve({ extensions: [".ts", ".js"] })],
};
