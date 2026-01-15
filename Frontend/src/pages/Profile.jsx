import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in mt-10">
            <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">User Profile</h2>
            
            <div className="bg-bg-secondary p-8 rounded-2xl border border-border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-violet-600 opacity-20"></div>
                
                <div className="flex flex-col items-center -mt-4 mb-6">
                    <div className="w-24 h-24 bg-bg-secondary p-1 rounded-full border-4 border-bg-secondary z-10">
                         <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                         </div>
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mt-4">{user?.name}</h3>
                    <p className="text-blue-500 font-medium">Pro Member</p>
                </div>

                <div className="space-y-6 mt-8">
                    <div className="flex items-center gap-4 p-4 bg-bg-primary rounded-xl border border-border">
                        <User className="text-blue-500" />
                        <div>
                            <p className="text-xs text-text-secondary">Full Name</p>
                            <p className="text-text-primary font-medium">{user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-bg-primary rounded-xl border border-border">
                        <Mail className="text-emerald-500" />
                        <div>
                            <p className="text-xs text-text-secondary">Email Address</p>
                            <p className="text-text-primary font-medium">{user?.email}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 bg-bg-primary rounded-xl border border-border">
                        <Shield className="text-violet-500" />
                        <div>
                            <p className="text-xs text-text-secondary">Account Status</p>
                            <p className="text-text-primary font-medium">Active & Verified</p>
                        </div>
                    </div>
                </div>

                <button onClick={logout} className="w-full mt-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold transition-all border border-red-500/20">
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;