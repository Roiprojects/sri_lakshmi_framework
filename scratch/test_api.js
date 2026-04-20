const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/frames?public=true');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data length:', data.length);
        console.log('First Item:', data[0]);
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
