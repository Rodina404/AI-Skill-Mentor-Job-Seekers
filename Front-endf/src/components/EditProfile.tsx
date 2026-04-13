import { useState } from 'react';
import { User, Mail, MapPin, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

interface EditProfileProps {
  onNavigate: (page: string) => void;
}

export function EditProfile({ onNavigate }: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'aya.mamdouh10@icloud.com',
    country: 'Egypt',
    city: 'Alex',
  });

  const [originalData] = useState({
    name: 'John Doe',
    email: 'aya.mamdouh10@icloud.com',
    country: 'Egypt',
    city: 'Alex',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    country?: string;
    city?: string;
    noChanges?: string;
  }>({});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any changes were made
    const hasChanges = 
      formData.name !== originalData.name ||
      formData.email !== originalData.email ||
      formData.country !== originalData.country ||
      formData.city !== originalData.city;

    if (!hasChanges) {
      setErrors({ noChanges: 'No changes detected. Please update at least one field before saving.' });
      return;
    }
    
    // Validate fields
    const newErrors: typeof errors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.country || formData.country.trim().length === 0) {
      newErrors.country = 'Country is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    setIsLoading(true);
    
    // Simulate API call
    // In a real app: await updateUserProfile(formData);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      
      // Hide success message and navigate back after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onNavigate('profile');
      }, 2000);
    }, 1000);
  };

  const handleCancel = () => {
    onNavigate('profile');
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-lime-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl mb-4 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            Edit Profile
          </h2>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Enter your full name"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                    errors.name ? 'border-red-300 bg-red-50/50' : 'border-green-200 bg-green-50/50'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="your.email@example.com"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                    errors.email ? 'border-red-300 bg-red-50/50' : 'border-green-200 bg-green-50/50'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value });
                      if (errors.country) setErrors({ ...errors, country: undefined });
                    }}
                    placeholder="Country"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent ${
                      errors.country ? 'border-red-300 bg-red-50/50' : 'border-green-200 bg-green-50/50'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.country && (
                  <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.country}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full pl-11 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50/50"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {showSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {errors.noChanges && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{errors.noChanges}</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}