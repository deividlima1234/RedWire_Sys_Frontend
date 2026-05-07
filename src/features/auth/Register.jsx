import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-300 p-4">
      <div className="max-w-md w-full bg-dark-200 rounded-lg shadow-2xl overflow-hidden border border-dark-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary font-mono tracking-wider mb-2">REDWIRE<span className="text-white">SYS</span></h1>
            <p className="text-gray-400">Create a new workspace</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-primary text-primary rounded text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-dark-100 border border-dark-100 rounded focus:outline-none focus:border-primary text-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eddamcore.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-dark-100 border border-dark-100 rounded focus:outline-none focus:border-primary text-white transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
