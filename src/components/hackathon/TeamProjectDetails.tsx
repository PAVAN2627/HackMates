import { useState } from 'react';
import { Edit, Save, X, Lightbulb, Code, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HackathonTeam } from '@/types';
import { cn } from '@/lib/utils';

interface TeamProjectDetailsProps {
  team: HackathonTeam;
  isLeader: boolean;
  onUpdate: (updates: Partial<HackathonTeam>) => Promise<void>;
}

const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI',
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Supabase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'TensorFlow', 'PyTorch', 'Scikit-learn',
  'Tailwind CSS', 'Material-UI', 'Bootstrap',
  'GraphQL', 'REST API', 'WebSocket',
  'Git', 'GitHub', 'GitLab'
];

export function TeamProjectDetails({ team, isLeader, onUpdate }: TeamProjectDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: team.projectTitle || '',
    projectDescription: team.projectDescription || '',
    techStack: team.techStack || [],
    projectStatus: team.projectStatus || 'planning'
  });
  const [techInput, setTechInput] = useState('');
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      projectTitle: team.projectTitle || '',
      projectDescription: team.projectDescription || '',
      techStack: team.techStack || [],
      projectStatus: team.projectStatus || 'planning'
    });
    setIsEditing(false);
  };

  const addTech = (tech: string) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
    setTechInput('');
    setShowTechDropdown(false);
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const filteredTechOptions = TECH_STACK_OPTIONS.filter(tech =>
    tech.toLowerCase().includes(techInput.toLowerCase()) &&
    !formData.techStack.includes(tech)
  );

  const statusConfig = {
    planning: { label: 'Planning', icon: Lightbulb, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
    'in-progress': { label: 'In Progress', icon: Code, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/30' }
  };

  const currentStatus = statusConfig[formData.projectStatus as keyof typeof statusConfig];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="glass rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Project Details</h4>
        </div>
        {isLeader && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Project Title */}
          <div>
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              placeholder="e.g., AI-Powered Task Manager"
              value={formData.projectTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
            />
          </div>

          {/* Project Description */}
          <div>
            <Label htmlFor="projectDescription">Project Description</Label>
            <Textarea
              id="projectDescription"
              placeholder="Describe your project idea, goals, and features..."
              rows={4}
              value={formData.projectDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
            />
          </div>

          {/* Tech Stack */}
          <div>
            <Label>Tech Stack</Label>
            <div className="relative">
              <Input
                placeholder="Type to search technologies..."
                value={techInput}
                onChange={(e) => {
                  setTechInput(e.target.value);
                  setShowTechDropdown(true);
                }}
                onFocus={() => setShowTechDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && techInput.trim()) {
                    e.preventDefault();
                    addTech(techInput.trim());
                  }
                }}
              />
              {showTechDropdown && filteredTechOptions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredTechOptions.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => addTech(tech)}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <button
                    onClick={() => removeTech(tech)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Status */}
          <div>
            <Label htmlFor="projectStatus">Project Status</Label>
            <Select
              value={formData.projectStatus}
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectStatus: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Planning
                  </div>
                </SelectItem>
                <SelectItem value="in-progress">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Project Title */}
          {team.projectTitle ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Project Title</p>
              <p className="font-semibold text-lg">{team.projectTitle}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {isLeader ? 'Click Edit to add project details' : 'No project details yet'}
            </p>
          )}

          {/* Project Description */}
          {team.projectDescription && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap">{team.projectDescription}</p>
            </div>
          )}

          {/* Tech Stack */}
          {team.techStack && team.techStack.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {team.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Project Status */}
          {team.projectStatus && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <Badge className={cn('gap-1', currentStatus.color)}>
                <StatusIcon className="h-3 w-3" />
                {currentStatus.label}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
