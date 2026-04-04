const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { registerStudent } = require('./controllers/authController');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('DB connected');

        const req = {
            body: {
                email: 'test' + Date.now() + '@test.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                registrationNumber: 'REG' + Date.now(),
                gender: 'Male',
                contactNumber: '1234567890',
                course: 'CS',
                batchYear: 2023
            }
        };

        const res = {
            status: function(code) {
                console.log('Status set to:', code);
                return this;
            },
            json: function(data) {
                console.log('JSON response:', data);
            }
        };

        // Pass no next function to simulate it missing if it's indeed missing
        try {
            await registerStudent(req, res);
            console.log('Finished');
        } catch (e) {
            console.error('Uncaught error:', e);
        }

        process.exit(0);
    })
    .catch(console.error);
