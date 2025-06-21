import React, { useState } from 'react';

interface AddNewOrgProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orgData: { name: string; description?: string }) => Promise<void>;
  maxOrgsReached: boolean;
  currentOrgCount: number;
  maxOrgs: number;
}

// Styles for the modal
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
    position: 'relative' as const,
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#dc2626',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  error: {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: '4px',
  },
  limitInfo: {
    padding: '12px',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#92400e',
  },
  limitInfoError: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
    color: '#991b1b',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  button: {
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#f9fafb',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  cancelButtonHover: {
    backgroundColor: '#f3f4f6',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  submitButtonHover: {
    backgroundColor: '#2563eb',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  closeButton: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px',
  },
  closeButtonHover: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
};

export function AddNewOrg({ 
  isOpen, 
  onClose, 
  onSubmit, 
  maxOrgsReached, 
  currentOrgCount, 
  maxOrgs 
}: AddNewOrgProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Don't render if modal is not open
  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate organization name
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Organization name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Organization name must be less than 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(formData.name.trim())) {
      newErrors.name = 'Organization name can only contain letters, numbers, spaces, hyphens, underscores, and dots';
    }

    // Validate description (optional)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (maxOrgsReached) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      
      // Reset form on success
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create organization:', error);
      setErrors({ submit: 'Failed to create organization. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({ name: '', description: '' });
    setErrors({});
    setFocusedField(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose} onKeyDown={handleKeyDown}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          style={styles.closeButton}
          onClick={handleClose}
          disabled={isSubmitting}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              Object.assign(e.currentTarget.style, styles.closeButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, { backgroundColor: 'transparent', color: '#6b7280' });
          }}
        >
          ×
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Add New Organization</h2>
          <p style={styles.subtitle}>
            Create a new organization and become its owner
          </p>
        </div>

        {/* Organization limit info */}
        <div style={{
          ...styles.limitInfo,
          ...(maxOrgsReached ? styles.limitInfoError : {})
        }}>
          {maxOrgsReached ? (
            <>
              <strong>Organization Limit Reached</strong><br />
              You have reached the maximum limit of {maxOrgs} organizations. 
              Please contact support to increase your limit or deactivate an existing organization.
            </>
          ) : (
            <>
              You can create {maxOrgs - currentOrgCount} more organization{maxOrgs - currentOrgCount !== 1 ? 's' : ''} 
              ({currentOrgCount}/{maxOrgs} used)
            </>
          )}
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Organization Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Organization Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === 'name' ? styles.inputFocus : {}),
                ...(errors.name ? styles.inputError : {}),
              }}
              placeholder="Enter organization name"
              disabled={isSubmitting || maxOrgsReached}
              maxLength={100}
            />
            {errors.name && <div style={styles.error}>{errors.name}</div>}
          </div>

          {/* Organization Description */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Organization Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.textarea,
                ...(focusedField === 'description' ? styles.inputFocus : {}),
                ...(errors.description ? styles.inputError : {}),
              }}
              placeholder="Enter organization description (optional)"
              disabled={isSubmitting || maxOrgsReached}
              maxLength={500}
            />
            {errors.description && <div style={styles.error}>{errors.description}</div>}
            <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
              {formData.description.length}/500
            </div>
          </div>

          {/* Submit error */}
          {errors.submit && <div style={styles.error}>{errors.submit}</div>}

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={styles.cancelButton}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  Object.assign(e.currentTarget.style, styles.cancelButtonHover);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.cancelButton);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || maxOrgsReached || !formData.name.trim()}
              style={{
                ...styles.submitButton,
                ...(isSubmitting || maxOrgsReached || !formData.name.trim() ? styles.submitButtonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !maxOrgsReached && formData.name.trim()) {
                  Object.assign(e.currentTarget.style, styles.submitButtonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !maxOrgsReached && formData.name.trim()) {
                  Object.assign(e.currentTarget.style, styles.submitButton);
                } else {
                  Object.assign(e.currentTarget.style, {
                    ...styles.submitButton,
                    ...styles.submitButtonDisabled,
                  });
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNewOrg;
