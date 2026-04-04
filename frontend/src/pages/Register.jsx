import React, { useState } from 'react';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Register', { name, email, password, role });
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name: </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Email: </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Role: </label>
                    <select value={role} onChange={e => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
