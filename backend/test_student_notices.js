async function test() {
    try {
        const email = 'teststudent_' + Date.now() + '@abc.com';
        const regRes = await fetch('http://localhost:5000/api/auth/register/student', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email,
                password: 'password123',
                firstName: 'Test',
                lastName: 'Student',
                registrationNumber: 'REG' + Date.now(),
                gender: 'Male',
                contactNumber: '12345678',
                course: 'CS',
                batchYear: 2024
            })
        });
        
        const regData = await regRes.json();
        const token = regData.token;
        console.log('Reg code:', regRes.status);
        console.log('Token exists:', !!token);
        
        // Fetch notices
        const noticeRes = await fetch('http://localhost:5000/api/notices', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const noticeData = await noticeRes.text();
        console.log('Notices code:', noticeRes.status);
        console.log('Notices response:', noticeData);
        
    } catch(err) {
        console.error(err);
    }
}
test();
