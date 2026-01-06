import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Calendar, Clock, Tag, FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useHackathons } from '@/hooks/useHackathons';
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

export default function CreateHackathon() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { createHackathon } = useHackathons();
  
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

  if (loading) {
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

      const hackathonId = await createHackathon({
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
        status: 'open',
      } as any);

      toast.success('Hackathon created successfully!');
      navigate(`/hackathons/${hackathonId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create hackathon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
              <img 
                src="/assets/roundlogohackmates.png" 
                alt="HackMates Logo" 
                className="h-8 w-8 md:h-10 md:w-10 rounded-full"
              />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">HackMates</h1>
            </div>
            <p className="text-center text-sm md:text-base text-muted-foreground">Post a hackathon and find team members</p>
            <p className="text-center text-xs text-muted-foreground mt-2">Developed by NoobcodersIND</p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-lg shadow-lg p-4 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Basic Information */}
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  Hackathon Details
                </h2>

                <div>
                  <Label htmlFor="title" className="text-sm">Hackathon Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., AI Innovation Challenge 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`text-sm ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe the hackathon, mention what type of members you need (developers, designers, etc.)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm resize-none"
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-sm">Hackathon Poster *</Label>
                  <div className="mt-2">
                    {!imagePreview ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-6 text-center hover:border-primary/50 transition-colors">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">Upload hackathon poster</p>
                        <p className="text-xs text-muted-foreground mb-3 md:mb-4">PNG, JPG up to 5MB</p>
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
                          size="sm"
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
                          className="w-full h-32 md:h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                </div>
              </div>

              {/* Location & Timing */}
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                  Venue & Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <Label htmlFor="venue" className="text-sm">Venue *</Label>
                    <Input
                      id="venue"
                      type="text"
                      placeholder="e.g., Tech Park, Bangalore"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className={`text-sm ${errors.venue ? 'border-red-500' : ''}`}
                    />
                    {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue}</p>}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm">Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Bangalore, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`text-sm ${errors.location ? 'border-red-500' : ''}`}
                    />
                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
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
                    <p className="text-xs text-red-500 mt-1">
                      {errors.date || errors.time}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm">Mode *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(['online', 'in-person', 'both'] as const).map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, mode: option })}
                        className={`px-3 py-2 md:px-4 md:py-3 rounded-lg border-2 transition-all text-center capitalize text-xs md:text-sm ${
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
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 md:w-5 md:h-5" />
                  Team Requirements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <Label htmlFor="teamSize" className="text-sm">Team Size *</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="e.g., 4"
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                      className={`text-sm ${errors.teamSize ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Number of members needed (1-20)</p>
                    {errors.teamSize && <p className="text-xs text-red-500 mt-1">{errors.teamSize}</p>}
                  </div>

                  <div>
                    <Label className="text-sm">Gender Preference</Label>
                    <div className="grid grid-cols-2 gap-1 md:gap-2 mt-2">
                      {genderPreferenceOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredGender: option.value as any })}
                          className={`px-2 py-2 md:px-3 rounded-lg border-2 transition-all text-center text-xs ${
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
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 md:w-5 md:h-5" />
                  Required Skills (Optional)
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">Tags to help people find your hackathon</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-h-48 md:max-h-60 overflow-y-auto">
                  {skillsOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-2 py-2 md:px-3 rounded-lg border-2 transition-all text-xs ${
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm md:text-base"
                size="lg"
              >
                {isSubmitting ? 'Creating Hackathon...' : 'Create Hackathon'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
