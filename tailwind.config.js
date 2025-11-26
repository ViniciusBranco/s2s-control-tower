const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const properties = ['bg', 'text', 'border', 'ring', 'stroke', 'fill', 'from', 'to'];

const safelist = [];

colors.forEach(color => {
    shades.forEach(shade => {
        properties.forEach(prop => {
            safelist.push(`${prop}-${color}-${shade}`);
            safelist.push(`hover:${prop}-${color}-${shade}`);
            safelist.push(`group-hover:${prop}-${color}-${shade}`);
        });
    });
});

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    safelist: safelist,
}
