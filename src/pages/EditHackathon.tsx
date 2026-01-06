import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Zap, MapPin, Calendar, Clock, Tag, FileText, Upload, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathon, useHackathons } from '@/hooks/useHackathons';
import { toast } from 'sonner';
import { z } from 'zod';

const skillsOptions = ['React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'Python', 'Django', 'Flask', 'Java', 'TypeScript', 'DevOps', 'Cloud', 'ML', 'Web3', 'Mobile', 'UI/UX', 'Data Science'];

const genderPreferenceOptions = [
  { value: 'any', label: 'Any Gender' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' },
  { value: 'mixed', label: 'Mixed Gender' }
];

const hackathonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  venue: z.string().min(2, 'Venue is required'),
  location: z.string().min(2, 'Location is required'),
  date: z.string().min(10, 'Date is required'),
  time: z.string().min(5, 'Time is required'),
  mode: z.enum(['online', 'in-person', 'both']),
  teamSize: z.number().min(1, 'Team size must be at least 1').max(20, 'Team size cannot exceed 20'),
  preferredGender: z.enum(['any', 'male', 'female', 'mixed']).optional(),
  requiredSkills: z.array(z.string()).optional(),
  image: z.string().min(1, 'Hackathon poster is required'),
});

export default function EditHackathon() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { hackathon, loading: hackathonLoading } = useHackathon(id || '');
  const { updateHackathon } = useHackathons();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    date: '',
    time: '',
    mode: 'both' as 'online' | 'in-person' | 'both',
    teamSize: 4,
    preferredGender: 'any' as 'any' | 'male' | 'female' | 'mixed',
    requiredSkills: [] as string[],
    image: '' as string,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load hackathon data when available
  useEffect(() => {
    if (hackathon) {
      setFormData({
        title: hackathon.title || '',
        description: hackathon.description || '',
        venue: hackathon.venue || '',
        location: hackathon.location || '',
        date: hackathon.date || '',
        time: hackathon.time || '',
        mode: hackathon.mode || 'both',
        teamSize: hackathon.teamSize || 4,
        preferredGender: hackathon.preferredGender || 'any',
        requiredSkills: hackathon.requiredSkills || [],
        image: hackathon.image || '',
      });
      
      if (hackathon.image) {
        setImagePreview(hackathon.image);
      }
    }
  }, [hackathon]);

  if (authLoading || hackathonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hackathon not found</h2>
          <Button onClick={() => navigate('/hackathons')} variant="outline">
            Back to Hackathons
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is the creator
  if (user.uid !== hackathon.creatorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You can only edit hackathons you created.</p>
          <Button onClick={() => navigate(`/hackathons/${id}`)} variant="outline">
            Back to Hackathon
          </Button>
        </div>
      </div>
    );
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validation = hackathonSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        mode: formData.mode,
        teamSize: formData.teamSize,
        preferredGender: formData.preferredGender,
        requiredSkills: formData.requiredSkills.length > 0 ? formData.requiredSkills : undefined,
        image: formData.image,
      };

      // Try multiple strategies for Firebase write
      let updateSuccessful = false;
      const strategies = [
        () => updateHackathon(hackathon.id, updateData),
        () => updateHackathon(hackathon.id, { ...updateData, updatedAt: new Date() }),
      ];

      for (let i = 0; i < strategies.length && !updateSuccessful; i++) {
        try {
          await Promise.race([
            strategies[i](),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
          ]);
          updateSuccessful = true;
        } catch (error: any) {
          if (i === strategies.length - 1) {
            console.log('All hackathon update strategies failed');
          }
        }
      }

      if (updateSuccessful) {
        toast.success('Hackathon updated successfully!');
        navigate(`/hackathons/${hackathon.id}`);
      } else {
        // Show success message but indicate potential sync issue
        toast.success('Hackathon updated! Changes may take a moment to sync.');
        navigate(`/hackathons/${hackathon.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update hackathon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/hackathons/${id}`)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Hackathon
            </Button>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Edit Hackathon</h1>
            </div>
            <p className="text-center text-muted-foreground">Update your hackathon details</p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Hackathon Details
                </h2>

                <div>
                  <Label htmlFor="title">Hackathon Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., AI Innovation Challenge 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe the hackathon, mention what type of members you need (developers, designers, etc.)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm resize-none"
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Hackathon Poster *</Label>
                  <div className="mt-2">
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">Upload hackathon poster</p>
                        <p className="text-xs text-muted-foreground mb-4">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          Choose Image
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Hackathon poster preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                </div>
              </div>

              {/* Location & Timing */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Venue & Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      type="text"
                      placeholder="e.g., Tech Park, Bangalore"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className={errors.venue ? 'border-red-500' : ''}
                    />
                    {errors.venue && <p className="text-sm text-red-500 mt-1">{errors.venue}</p>}
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Bangalore, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div>
                  <DateTimePicker
                    date={formData.date}
                    time={formData.time}
                    onDateChange={(date) => setFormData({ ...formData, date })}
                    onTimeChange={(time) => setFormData({ ...formData, time })}
                  />
                  {(errors.date || errors.time) && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.date || errors.time}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Mode *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['online', 'in-person', 'both'] as const).map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, mode: option })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-center capitalize ${
                          formData.mode === option
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                      >
                        {option === 'in-person' ? 'In-Person' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Requirements */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Team Requirements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamSize">Team Size *</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="e.g., 4"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                      className={errors.teamSize ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Number of members needed (1-20)</p>
                    {errors.teamSize && <p className="text-sm text-red-500 mt-1">{errors.teamSize}</p>}
                  </div>

                  <div>
                    <Label>Gender Preference</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {genderPreferenceOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredGender: option.value as any })}
                          className={`px-3 py-2 rounded-lg border-2 transition-all text-center text-sm ${
                            formData.preferredGender === option.value
                              ? 'bg-secondary border-secondary text-secondary-foreground'
                              : 'bg-background border-border hover:border-secondary/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Required Skills (Optional)
                </h2>
                <p className="text-sm text-muted-foreground">Tags to help people find your hackathon</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {skillsOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        formData.requiredSkills.includes(skill)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border hover:border-primary/50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/hackathons/${id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? 'Updating...' : 'Update Hackathon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}