import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: {
    entry: 'src/index.ts',
    resolve: true,
    compilerOptions: {
      moduleResolution: 'node',
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs',
    };
  },
});
