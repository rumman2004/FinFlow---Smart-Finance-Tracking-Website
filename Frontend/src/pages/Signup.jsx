import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../config'; // Import the config

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Updated to use API_URL
            const { data } = await axios.post(`${API_URL}/api/auth/signup`, { 
                name, 
                email, 
                password 
            });
            
            // Auto-login after signup
            login({ name: data.name, email: data.email }, data.token);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error signing up');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-bg-primary transition-colors duration-300">
            <div className="bg-bg-secondary p-8 rounded-2xl w-96 border border-border shadow-xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                
                <h2 className="text-3xl font-bold text-text-primary text-center mb-2">Create Account</h2>
                <p className="text-text-secondary text-center mb-6">Start tracking your wealth today.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <input 
                        type="text" placeholder="Full Name" required
                        className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                        type="email" placeholder="Email Address" required
                        className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" placeholder="Password" required
                        className="w-full bg-bg-primary text-text-primary p-3 rounded-xl border border-border focus:border-blue-500 outline-none transition-colors"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02]">
                        Sign Up
                    </button>
                </form>

                <p className="text-text-secondary text-center mt-6 text-sm relative z-10">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;