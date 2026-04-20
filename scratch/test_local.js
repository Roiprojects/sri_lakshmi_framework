const http = require('http');

http.get('http://127.0.0.1:3000/api/categories', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            console.log('BODY:', rawData.substring(0, 500));
            process.exit(0);
        } catch (e) {
            console.error(e.message);
            process.exit(1);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    process.exit(1);
});

setTimeout(() => {
    console.error('Request timed out after 5s');
    process.exit(1);
}, 5000);
