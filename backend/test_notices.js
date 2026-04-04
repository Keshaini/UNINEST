async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: 'admin_test_999@test.com', password: 'password123456' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Token:', token ? 'Exists' : 'Missing');
        
        const postRes = await fetch('http://localhost:5000/api/notices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test',
                content: 'Test content',
                targetAudience: 'All',
                priority: 'Normal'
            })
        });
        const postText = await postRes.text();
        console.log('Post response:', postRes.status, postText);
    } catch(err) {
        console.error('Script Error:', err);
    }
}
test();
