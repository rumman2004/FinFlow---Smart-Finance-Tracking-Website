import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { API_URL } from '../../config';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Folders = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    useEffect(() => { fetchFolders(); }, []);

    const fetchFolders = async () => {
        const { data } = await axios.get(`${API_URL}/api/folders`, { headers: { Authorization: `Bearer ${token}` } });
        setFolders(data);
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/api/folders`, { name: newFolderName }, { headers: { Authorization: `Bearer ${token}` } });
        setShowModal(false); setNewFolderName(''); fetchFolders();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if(!window.confirm("Delete folder?")) return;
        await axios.delete(`${API_URL}/api/folders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchFolders();
    };

    return (
        <div className="w-full animate-fade-in">
             <header className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-text-primary">Your Folders</h2><p className="text-text-secondary">Organize your finances.</p></div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20"><Plus size={18} /> New</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {folders.map((folder) => (
                    <div 
                        key={folder._id} 
                        onClick={() => navigate(`/folders/${folder._id}`, { state: { folderName: folder.name } })}
                        className="bg-bg-secondary p-6 rounded-2xl border border-border hover:border-blue-500/50 transition-all cursor-pointer group relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Wallet size={24} /></div>
                            <button onClick={(e) => handleDelete(e, folder._id)} className="text-text-secondary hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">{folder.name}</h3>
                        <p className="text-xs text-text-secondary">Click to view details</p>
                    </div>
                ))}
            </div>
            
             {/* Simple Modal */}
             {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-bg-secondary p-8 rounded-2xl w-96 border border-border">
                        <h3 className="text-xl font-bold text-text-primary mb-4">New Folder</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input type="text" placeholder="Name" required className="w-full bg-bg-primary text-text-primary p-3 rounded-lg border border-border mb-4 outline-none focus:border-blue-500" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                            <div className="flex gap-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-bg-primary text-text-primary py-2 rounded-lg">Cancel</button><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Create</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Folders;