import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "build/index.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      terser(),
      typescript(),
    ],
  },
];
