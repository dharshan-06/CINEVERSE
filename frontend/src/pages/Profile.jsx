import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, movieApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Settings, Edit3, Heart, List, X, Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const userId = user?._id || user?.id;

  // Fetch full user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userApi.getProfile(userId),
    enabled: !!userId,
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile', userId]);
      updateUser(data); // Synchronize globally
      setIsEditing(false);
      toast.success('Profile updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large (max 2MB)');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      updateProfileMutation.mutate({ avatar: base64String });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Fetch movie details for favorites
  const { data: favoriteMovies } = useQuery({
    queryKey: ['favoriteDetails', profile?.favoriteMovies],
    queryFn: async () => {
      if (!profile?.favoriteMovies?.length) return [];
      const promises = profile.favoriteMovies.map(id => movieApi.getDetails(id));
      return Promise.all(promises);
    },
    enabled: !!profile?.favoriteMovies,
  });

  // Fetch movie details for watchlist (limit to 6 for preview)
  const { data: watchlistMovies, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlistDetails', profile?.watchlist],
    queryFn: async () => {
      if (!profile?.watchlist?.length) return [];
      const promises = profile.watchlist.slice(-6).reverse().map(id => movieApi.getDetails(id));
      return Promise.all(promises);
    },
    enabled: !!profile?.watchlist,
  });

  if (!user) return <div className="h-screen flex items-center justify-center">Please login to view profile</div>;
  if (profileLoading) return <div className="h-screen flex items-center justify-center">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full border-4 border-surface shadow-2xl overflow-hidden relative">
            <img 
              src={profile?.avatar || user.avatar} 
              alt={profile?.username} 
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <button 
            onClick={handlePhotoClick}
            disabled={isUploading}
            className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Camera className="w-8 h-8" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-4xl font-black">{profile?.username}</h1>
            <button 
              onClick={() => {
                setBio(profile?.bio || '');
                setIsEditing(true);
              }}
              className="bg-surface border border-white/10 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" /> EDIT PROFILE
            </button>
          </div>
          <p className="text-muted max-w-xl mb-6">
            {profile?.bio || "No bio yet. Tell the world about your cinematic taste!"}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-8 text-sm font-bold tracking-widest uppercase">
            <div className="flex flex-col">
              <span className="text-white text-2xl font-black">{profile?.favoriteMovies?.length || 0}</span>
              <span className="text-muted text-[10px]">Favorites</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-2xl font-black">{profile?.watchlist?.length || 0}</span>
              <span className="text-muted text-[10px]">Watchlist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl border border-white/10 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tighter">EDIT PROFILE</h2>
              <button onClick={() => setIsEditing(false)} className="text-muted hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] text-muted uppercase">About You</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about your movie taste..."
                className="w-full bg-background border border-white/10 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button 
              onClick={() => updateProfileMutation.mutate({ bio })}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-primary text-black py-3 rounded-xl font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              SAVE CHANGES
            </button>
          </div>
        </div>
      )}

      {/* Profile Sections */}
      <div className="space-y-16">
        {/* Favorite 4 */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-muted flex items-center gap-2">
              <Heart className="w-4 h-4" /> FAVORITE MOVIES
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => {
              const movie = favoriteMovies?.[i];
              return movie ? (
                <MovieCard key={movie.id} movie={movie} />
              ) : (
                <div key={i} className="aspect-[2/3] bg-surface/50 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-muted group hover:border-primary/30 transition-colors cursor-pointer">
                  <span className="font-black text-4xl group-hover:text-primary/50 transition-colors">{i + 1}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Watchlist Preview */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-muted flex items-center gap-2">
              <List className="w-4 h-4" /> RECENTLY ADDED TO WATCHLIST
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {watchlistLoading ? (
              [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-surface rounded-md animate-pulse" />)
            ) : watchlistMovies?.length > 0 ? (
              watchlistMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)
            ) : (
              <p className="col-span-full text-muted italic text-sm py-8 text-center bg-surface/20 rounded-xl border border-dashed border-white/5">
                Your watchlist is empty.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
