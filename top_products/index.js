const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;


app.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    let { n, page, sort, order, minPrice, maxPrice } = req.query;

    n = parseInt(n) || 10;
    page = parseInt(page) || 1;
    minPrice = parseInt(minPrice) || 0;
    maxPrice = parseInt(maxPrice) || Infinity;
    order = order === 'desc' ? 'desc' : 'asc';
    const sortBy = ['rating', 'price', 'company', 'discount'].includes(sort) ? sort : null;

    try {
        
        const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
        const requests = companies.map(company =>
            axios.get(`http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products`, {
                params: { top: n, minPrice, maxPrice }
            })
        );

        const responses = await Promise.all(requests);

        // Aggregate and sort data
        let products = [];
        responses.forEach(response => {
            products = products.concat(response.data);
        });

        if (sortBy) {
            products.sort((a, b) => {
                if (order === 'asc') {
                    return a[sortBy] > b[sortBy] ? 1 : -1;
                } else {
                    return a[sortBy] < b[sortBy] ? 1 : -1;
                }
            });
        }

       
        const startIndex = (page - 1) * n;
        const endIndex = startIndex + n;
        const paginatedProducts = products.slice(startIndex, endIndex);

      
        paginatedProducts.forEach((product, index) => {
            product.id = `${categoryname}-${company}-${index}`;
        });

        res.json(paginatedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching product data' });
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { categoryname, productid } = req.params;

    try {
        
        const [_, company, index] = productid.split('-');

        
        const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products`);
        const product = response.data[index];

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching product data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
