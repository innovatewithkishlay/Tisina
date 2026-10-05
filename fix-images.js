const fs = require('fs');
let content = fs.readFileSync('lib/restaurant/mock-menu.ts', 'utf8');
const images = [
  '/images/tuna-tartare.jpg', 
  '/images/truffle-pasta.jpg', 
  '/images/panna-cotta.jpg', 
  '/images/beef-pasticada.jpg', 
  '/images/burrata-salad.jpg'
];
let count = 0;
content = content.replace(/image_url: "https:\/\/loremflickr[^"]+"/g, () => {
    let img = count < images.length ? images[count] : '/images/placeholder.jpg';
    count++;
    return `image_url: "${img}"`;
});
fs.writeFileSync('lib/restaurant/mock-menu.ts', content);
