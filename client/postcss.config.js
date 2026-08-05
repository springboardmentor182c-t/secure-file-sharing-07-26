<<<<<<< HEAD
=======
// Tailwind v4 runs through the @tailwindcss/vite plugin (see vite.config.ts),
// so this file isn't required for Tailwind itself - it's kept only for
// autoprefixer, and fixed to use ESM export syntax since package.json has
// "type": "module" (the old `module.exports =` syntax crashes Vite's build
// with "module is not defined in ES module scope").
>>>>>>> b9ef5279aa1a5b45ad52c0779faf72bb7f99af5f
export default {
  plugins: {
    autoprefixer: {},
  },
};
