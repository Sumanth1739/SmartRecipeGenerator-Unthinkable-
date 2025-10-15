import { User, LogOut, Heart, Settings } from 'lucide-react';
import { useState } from 'react';

type User = {
  id: string;
  email: string;
  full_name?: string;
};

type UserProfileProps = {
  user: User;
  onSignOut: () => void;
  favoritesCount: number;
};

export function UserProfile({ user, onSignOut, favoritesCount }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
    onSignOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-800">
            {user.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-600">{user.email}</p>
        </div>
        {favoritesCount > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {favoritesCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.full_name || 'User'}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Heart className="w-5 h-5 text-red-500" />
                <span>My Favorites</span>
                {favoritesCount > 0 && (
                  <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Settings</span>
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
