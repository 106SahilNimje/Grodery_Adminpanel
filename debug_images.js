const https = require('https');
const fs = require('fs');

const url = 'https://grocery-app-backend-0mdx.onrender.com/products';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            const logData = products.map(p => ({
                name: p.name,
                image: p.image,
                variants: p.variants ? p.variants.length : 0
            }));

            fs.writeFileSync('product_images_log.json', JSON.stringify(logData, null, 2));
            console.log('Successfully saved product data to product_images_log.json');
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
