import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config'; // Import the config

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Updated to use API_URL
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            login({ name: data.name, email: data.email }, data.token);
            navigate('/');
        } catch (error) {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-bg-primary transition-colors duration-300">
            <div className="bg-bg-secondary p-8 rounded-2xl w-96 border border-border shadow-xl">
                <h2 className="text-3xl font-bold text-text-primary text-center mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" placeholder="Email" 
                        className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" placeholder="Password" 
                        className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                        Login
                    </button>
                </form>
                <p className="text-text-secondary text-center mt-4 text-sm">
                    Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;