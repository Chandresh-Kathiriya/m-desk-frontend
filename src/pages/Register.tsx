import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
  const [apiError, setApiError] = useState('');

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');
    try {
      await registerUser(data);
      navigate('/');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed';
      setApiError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600 mb-8">Join MDesk to start shopping</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(error || apiError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error || apiError}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            error={errors.password?.message}
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="9876543210"
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Mobile must be 10 digits',
              },
            })}
            error={errors.mobile?.message}
          />

          <Input
            label="City"
            type="text"
            placeholder="New Delhi"
            {...register('city', {
              required: 'City is required',
            })}
            error={errors.city?.message}
          />

          <Input
            label="State"
            type="text"
            placeholder="Delhi"
            {...register('state', {
              required: 'State is required',
            })}
            error={errors.state?.message}
          />

          <Input
            label="Pincode"
            type="text"
            placeholder="110001"
            {...register('pincode', {
              required: 'Pincode is required',
              pattern: {
                value: /^[0-9]{6}$/,
                message: 'Pincode must be 6 digits',
              },
            })}
            error={errors.pincode?.message}
          />

          <Button type="submit" isLoading={isLoading} fullWidth>
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
