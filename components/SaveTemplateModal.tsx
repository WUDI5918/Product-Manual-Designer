
import React, { useState } from 'react';

interface SaveTemplateModalProps {
  onClose: () => void;
  onSave: (details: { name: string; category: string; tags: string[] }) => void;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('My Page Template');
  const [category] = useState('Custom'); // Per screenshot, this seems fixed for user-saved templates
  const [tags, setTags] = useState<string[]>(['user-saved']);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveClick = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), category, tags });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-panel rounded-xl shadow-2xl w-full max-w-lg border border-color p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-dark-color">Save Page as Template</h2>
        
        <div>
          <label className="block text-sm font-medium text-light-color mb-1">Template Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input w-full border-primary-color"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-color mb-1">Category</label>
          <input
            type="text"
            value={category}
            readOnly
            className="input w-full bg-contrast text-light-color cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-color mb-1">Tags</label>
          <div className="p-2 border border-color rounded-md bg-element min-h-[40px] flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-contrast text-base-color text-sm px-2 py-1 rounded flex items-center">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-light-color hover:text-dark-color">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); }}
              placeholder="Add a new tag..."
              className="input flex-1"
            />
            <button onClick={handleAddTag} className="btn btn-secondary">Add Tag</button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSaveClick} className="btn btn-primary">Save Template</button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
