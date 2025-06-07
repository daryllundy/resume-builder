import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit3, 
  Eye, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ResumeSection {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'custom';
  title: string;
  content: any;
  isVisible: boolean;
}

interface InteractiveResumeEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

// Sortable section component
function SortableSection({ section, onUpdate, onDelete }: { 
  section: ResumeSection; 
  onUpdate: (id: string, updates: Partial<ResumeSection>) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);

  const renderSectionEditor = () => {
    switch (section.type) {
      case 'personal':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={section.content.name || ''}
                  onChange={(e) => onUpdate(section.id, { 
                    content: { ...section.content, name: e.target.value }
                  })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={section.content.title || ''}
                  onChange={(e) => onUpdate(section.id, { 
                    content: { ...section.content, title: e.target.value }
                  })}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  value={section.content.email || ''}
                  onChange={(e) => onUpdate(section.id, { 
                    content: { ...section.content, email: e.target.value }
                  })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={section.content.phone || ''}
                  onChange={(e) => onUpdate(section.id, { 
                    content: { ...section.content, phone: e.target.value }
                  })}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input
                value={section.content.location || ''}
                onChange={(e) => onUpdate(section.id, { 
                  content: { ...section.content, location: e.target.value }
                })}
                className="text-sm"
              />
            </div>
          </div>
        );

      case 'summary':
        return (
          <div>
            <Label className="text-xs">Professional Summary</Label>
            <Textarea
              value={section.content.text || ''}
              onChange={(e) => onUpdate(section.id, { 
                content: { ...section.content, text: e.target.value }
              })}
              className="text-sm min-h-[100px]"
              placeholder="Write a compelling professional summary..."
            />
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {section.content.items?.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={item.position || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[index] = { ...item, position: e.target.value };
                      onUpdate(section.id, { content: { ...section.content, items: newItems }});
                    }}
                    placeholder="Position Title"
                    className="text-sm font-medium"
                  />
                  <Input
                    value={item.company || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[index] = { ...item, company: e.target.value };
                      onUpdate(section.id, { content: { ...section.content, items: newItems }});
                    }}
                    placeholder="Company Name"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={item.duration || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[index] = { ...item, duration: e.target.value };
                      onUpdate(section.id, { content: { ...section.content, items: newItems }});
                    }}
                    placeholder="Jan 2020 - Present"
                    className="text-sm"
                  />
                  <Input
                    value={item.location || ''}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[index] = { ...item, location: e.target.value };
                      onUpdate(section.id, { content: { ...section.content, items: newItems }});
                    }}
                    placeholder="Location"
                    className="text-sm"
                  />
                </div>
                <Textarea
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...section.content.items];
                    newItems[index] = { ...item, description: e.target.value };
                    onUpdate(section.id, { content: { ...section.content, items: newItems }});
                  }}
                  placeholder="• Achievement 1&#10;• Achievement 2&#10;• Achievement 3"
                  className="text-sm min-h-[80px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = section.content.items.filter((_: any, i: number) => i !== index);
                    onUpdate(section.id, { content: { ...section.content, items: newItems }});
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            )) || []}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newItem = { position: '', company: '', duration: '', location: '', description: '' };
                const items = section.content.items || [];
                onUpdate(section.id, { content: { ...section.content, items: [...items, newItem] }});
              }}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Experience
            </Button>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Skills (comma-separated)</Label>
              <Textarea
                value={section.content.skills?.join(', ') || ''}
                onChange={(e) => onUpdate(section.id, { 
                  content: { 
                    ...section.content, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }
                })}
                className="text-sm min-h-[80px]"
                placeholder="JavaScript, React, Node.js, Python, SQL, Git..."
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {section.content.skills?.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              )) || []}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label className="text-xs">Content</Label>
            <Textarea
              value={section.content.text || ''}
              onChange={(e) => onUpdate(section.id, { 
                content: { ...section.content, text: e.target.value }
              })}
              className="text-sm min-h-[100px]"
            />
          </div>
        );
    }
  };

  const renderSectionPreview = () => {
    if (!section.isVisible) return null;

    switch (section.type) {
      case 'personal':
        return (
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{section.content.name || 'Your Name'}</h1>
            <p className="text-lg text-gray-600">{section.content.title || 'Professional Title'}</p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              {section.content.email && <span>{section.content.email}</span>}
              {section.content.phone && <span>{section.content.phone}</span>}
              {section.content.location && <span>{section.content.location}</span>}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">
              {section.content.text || 'Add your professional summary here...'}
            </p>
          </div>
        );

      case 'experience':
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Professional Experience</h2>
            <div className="space-y-4">
              {section.content.items?.map((item: any, index: number) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900">{item.position || 'Position Title'}</h3>
                    <span className="text-sm text-gray-500">{item.duration || 'Duration'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-700 font-medium">{item.company || 'Company Name'}</p>
                    {item.location && <span className="text-sm text-gray-500">{item.location}</span>}
                  </div>
                  <div className="text-gray-600 text-sm whitespace-pre-line">
                    {item.description || 'Add your achievements and responsibilities...'}
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {section.content.skills?.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              )) || [<span className="text-gray-500 text-sm">Add your skills...</span>]}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {section.content.text || 'Add content for this section...'}
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className={`transition-all ${isEditing ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
              <input
                type="checkbox"
                checked={section.isVisible}
                onChange={(e) => onUpdate(section.id, { isVisible: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? 'bg-blue-100 text-blue-700' : ''}
              >
                {isEditing ? <Eye className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
              </Button>
              {section.type === 'custom' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(section.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? renderSectionEditor() : renderSectionPreview()}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InteractiveResumeEditor({ 
  initialContent, 
  onContentChange, 
  onSave 
}: InteractiveResumeEditorProps) {
  const [sections, setSections] = useState<ResumeSection[]>([
    {
      id: 'personal',
      type: 'personal',
      title: 'Personal Information',
      content: { name: '', title: '', email: '', phone: '', location: '' },
      isVisible: true
    },
    {
      id: 'summary',
      type: 'summary', 
      title: 'Professional Summary',
      content: { text: '' },
      isVisible: true
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Professional Experience',
      content: { items: [] },
      isVisible: true
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      content: { skills: [] },
      isVisible: true
    }
  ]);

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [customSectionTitle, setCustomSectionTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate resume content from sections
  const generateResumeContent = () => {
    let content = '';
    
    sections.filter(s => s.isVisible).forEach(section => {
      switch (section.type) {
        case 'personal':
          content += `${section.content.name || 'Your Name'}\n`;
          content += `${section.content.title || 'Professional Title'}\n`;
          content += `${section.content.email || ''} | ${section.content.phone || ''} | ${section.content.location || ''}\n\n`;
          break;
        
        case 'summary':
          if (section.content.text) {
            content += `PROFESSIONAL SUMMARY\n${section.content.text}\n\n`;
          }
          break;
        
        case 'experience':
          if (section.content.items?.length > 0) {
            content += `PROFESSIONAL EXPERIENCE\n`;
            section.content.items.forEach((item: any) => {
              content += `${item.position || 'Position'} | ${item.company || 'Company'} | ${item.duration || 'Duration'}\n`;
              if (item.location) content += `${item.location}\n`;
              if (item.description) content += `${item.description}\n`;
              content += '\n';
            });
          }
          break;
        
        case 'skills':
          if (section.content.skills?.length > 0) {
            content += `SKILLS\n${section.content.skills.join(', ')}\n\n`;
          }
          break;
        
        default:
          if (section.content.text) {
            content += `${section.title.toUpperCase()}\n${section.content.text}\n\n`;
          }
      }
    });
    
    return content.trim();
  };

  // Update content when sections change
  useEffect(() => {
    const content = generateResumeContent();
    onContentChange?.(content);
  }, [sections, onContentChange]);

  const handleSectionUpdate = (id: string, updates: Partial<ResumeSection>) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const handleSectionDelete = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addCustomSection = () => {
    if (!customSectionTitle.trim()) return;
    
    const newSection: ResumeSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: customSectionTitle,
      content: { text: '' },
      isVisible: true
    };
    
    setSections(prev => [...prev, newSection]);
    setCustomSectionTitle('');
  };

  const handleSave = () => {
    const content = generateResumeContent();
    onSave?.(content);
  };

  const renderPreview = () => (
    <div className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto">
      <div className="space-y-6">
        {sections.filter(s => s.isVisible).map(section => (
          <div key={section.id}>
            {section.type === 'personal' && (
              <div className="text-center space-y-2 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">{section.content.name || 'Your Name'}</h1>
                <p className="text-xl text-gray-600">{section.content.title || 'Professional Title'}</p>
                <div className="flex justify-center space-x-6 text-gray-500">
                  {section.content.email && <span>{section.content.email}</span>}
                  {section.content.phone && <span>{section.content.phone}</span>}
                  {section.content.location && <span>{section.content.location}</span>}
                </div>
              </div>
            )}
            
            {section.type === 'summary' && section.content.text && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed">{section.content.text}</p>
              </div>
            )}
            
            {section.type === 'experience' && section.content.items?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Professional Experience</h2>
                <div className="space-y-5">
                  {section.content.items.map((item: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.position || 'Position Title'}</h3>
                        <span className="text-gray-600 font-medium">{item.duration || 'Duration'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-gray-800 font-medium text-lg">{item.company || 'Company Name'}</p>
                        {item.location && <span className="text-gray-600">{item.location}</span>}
                      </div>
                      <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {item.description || 'Add your achievements and responsibilities...'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {section.type === 'skills' && section.content.skills?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {section.content.skills.map((skill: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {section.type === 'custom' && section.content.text && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">{section.title}</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {section.content.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Mode Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Interactive Resume Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="split">Split</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleSave} className="ml-4">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor Interface */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Panel */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sections.map(section => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onUpdate={handleSectionUpdate}
                        onDelete={handleSectionDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Add Custom Section */}
                <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      value={customSectionTitle}
                      onChange={(e) => setCustomSectionTitle(e.target.value)}
                      placeholder="Section Title (e.g., Certifications, Projects)"
                      className="flex-1"
                    />
                    <Button onClick={addCustomSection} disabled={!customSectionTitle.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Section
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-[800px] overflow-y-auto">
                  {renderPreview()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}