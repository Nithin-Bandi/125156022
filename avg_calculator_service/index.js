const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const testServerBaseURL = 'http://20.244.56.144/test';
const windowSize = 10;
const timeout = 500; 


const authorizationToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIxMTM5Mjg0LCJpYXQiOjE3MjExMzg5ODQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQ4YWRjMzc3LWFhZGQtNDY4Yi1hZjUyLTM3ZWFjNDZhMDBiYyIsInN1YiI6IjEyNTE1NjAyMkBzYXN0cmEuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6ImQ4YWRjMzc3LWFhZGQtNDY4Yi1hZjUyLTM3ZWFjNDZhMDBiYyIsImNsaWVudFNlY3JldCI6InlMQVhhclF6TW1CSXdSZEUiLCJvd25lck5hbWUiOiJCYW5kaSBOaXRoaW4iLCJvd25lckVtYWlsIjoiMTI1MTU2MDIyQHNhc3RyYS5hYy5pbiIsInJvbGxObyI6IjEyNTE1NjAyMiJ9.H_P5niK5PmweFJBUDWtfmSmyWEWBQYmt-Q2UfxTLkMI";

let windowState = [];



const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(`${testServerBaseURL}/${type}`, {
            headers: {
                'Authorization': `Bearer ${authorizationToken}`
            },
            timeout
        });
        if (response.data && Array.isArray(response.data.numbers)) {
            return response.data.numbers;
        } else {
            console.error('Unexpected response format:', response.data);
            return [];
        }
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('Error fetching numbers: timeout of 500ms exceeded');
        } else if (error.response) {
            console.error(`Error fetching numbers: Request failed with status code ${error.response.status}`);
        } else {
            console.error('Error fetching numbers:', error.message);
        }
        return [];
    }
};


const updateWindowState = (numbers) => {
    windowState = [...new Set([...windowState, ...numbers])].slice(-windowSize);
};


const calculateAverage = () => {
    const sum = windowState.reduce((acc, num) => acc + num, 0);
    return windowState.length ? sum / windowState.length : 0;
};


app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;
    const validTypes = {
        "r": "rand",
        "e": "even",
        "f": "fibo",
        "p": "primes"
    };

    if (!validTypes[type]) {
        return res.status(400).send('Invalid type');
    }

    const numbers = await fetchNumbers(validTypes[type]);
    const windowPrevState = [...windowState];

    updateWindowState(numbers);

    const avg = calculateAverage();
    const windowCurrState = [...windowState];

    res.json({
        numbers,
        windowPrevState,
        windowCurrState,
        avg
    });
});


app.listen(port, () => {
    console.log(`Average Calculator microservice listening at http://localhost:${port}`);
});
