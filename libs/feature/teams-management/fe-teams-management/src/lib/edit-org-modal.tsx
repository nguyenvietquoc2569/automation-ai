import React, { useState, useEffect } from 'react';
import { OrganizationListItem, OrganizationUpdateRequest } from './teams-api-service';

interface EditOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orgId: string, updateData: OrganizationUpdateRequest) => Promise<void>;
  organization: OrganizationListItem | null;
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
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
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
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButtonHover: {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af',
  },
  submitButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
  closeButtonHover: {
    color: '#374151',
  },
  errorMessage: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '16px',
    fontWeight: '500',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#dc2626',
    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
  },
  successMessage: {
    color: '#16a34a',
    fontSize: '14px',
    marginTop: '8px',
  },
};

export function EditOrgModal({ isOpen, onClose, onSubmit, organization }: EditOrgModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    displayName?: string;
    description?: string;
  }>({});

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Organization name is required';
    }
    if (name.trim().length < 2) {
      return 'Organization name must be at least 2 characters long';
    }
    if (name.trim().length > 50) {
      return 'Organization name must be less than 50 characters long';
    }
    // Check for valid characters (letters, numbers, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      return 'Organization name can only contain letters, numbers, hyphens, and underscores';
    }
    return undefined;
  };

  const validateDisplayName = (displayName: string): string | undefined => {
    if (displayName.trim() && displayName.trim().length > 100) {
      return 'Display name must be less than 100 characters long';
    }
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (description.trim() && description.trim().length > 500) {
      return 'Description must be less than 500 characters long';
    }
    return undefined;
  };

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const displayNameError = validateDisplayName(formData.displayName);
    if (displayNameError) errors.displayName = displayNameError;
    
    const descriptionError = validateDescription(formData.description);
    if (descriptionError) errors.description = descriptionError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input change handlers with validation
  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    // Clear validation error for this field when user starts typing
    if (validationErrors.name) {
      setValidationErrors({ ...validationErrors, name: undefined });
    }
  };

  const handleDisplayNameChange = (value: string) => {
    setFormData({ ...formData, displayName: value });
    if (validationErrors.displayName) {
      setValidationErrors({ ...validationErrors, displayName: undefined });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    if (validationErrors.description) {
      setValidationErrors({ ...validationErrors, description: undefined });
    }
  };

  // Validate field on blur
  const handleFieldBlur = (fieldName: 'name' | 'displayName' | 'description') => {
    setFocusedField(null);
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'name': {
        const nameError = validateName(formData.name);
        if (nameError) errors.name = nameError;
        else delete errors.name;
        break;
      }
      case 'displayName': {
        const displayNameError = validateDisplayName(formData.displayName);
        if (displayNameError) errors.displayName = displayNameError;
        else delete errors.displayName;
        break;
      }
      case 'description': {
        const descriptionError = validateDescription(formData.description);
        if (descriptionError) errors.description = descriptionError;
        else delete errors.description;
        break;
      }
    }
    
    setValidationErrors(errors);
  };

  // Initialize form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        displayName: organization.displayName || '',
        description: organization.description || '',
      });
    }
  }, [organization]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setIsSubmitting(false);
      setFocusedField(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization) {
      setError('No organization selected for editing');
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the validation errors above');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updateData: OrganizationUpdateRequest = {
        name: formData.name.trim(),
        displayName: formData.displayName.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      await onSubmit(organization.id, updateData);
      onClose();
    } catch (err) {
      console.error('Edit modal error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update organization';
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <button
          type="button"
          style={styles.closeButton}
          onClick={handleClose}
          disabled={isSubmitting}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              Object.assign(e.currentTarget.style, styles.closeButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, styles.closeButton);
          }}
        >
          ×
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Edit Organization</h2>
          <p style={styles.subtitle}>
            Update the organization details below
          </p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="orgName">
              Organization Name *
            </label>
            <input
              id="orgName"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => handleFieldBlur('name')}
              style={{
                ...styles.input,
                ...(focusedField === 'name' ? styles.inputFocus : {}),
                ...(validationErrors.name ? styles.inputError : {}),
              }}
              placeholder="Enter organization name"
              disabled={isSubmitting}
              required
            />
            {validationErrors.name && (
              <div style={styles.fieldError}>
                {validationErrors.name}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="orgDisplayName">
              Display Name
            </label>
            <input
              id="orgDisplayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              onFocus={() => setFocusedField('displayName')}
              onBlur={() => handleFieldBlur('displayName')}
              style={{
                ...styles.input,
                ...(focusedField === 'displayName' ? styles.inputFocus : {}),
                ...(validationErrors.displayName ? styles.inputError : {}),
              }}
              placeholder="Enter display name (optional)"
              disabled={isSubmitting}
            />
            {validationErrors.displayName && (
              <div style={styles.fieldError}>
                {validationErrors.displayName}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="orgDescription">
              Description
            </label>
            <textarea
              id="orgDescription"
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => handleFieldBlur('description')}
              style={{
                ...styles.textarea,
                ...(focusedField === 'description' ? styles.inputFocus : {}),
                ...(validationErrors.description ? styles.inputError : {}),
              }}
              placeholder="Enter organization description (optional)"
              disabled={isSubmitting}
              rows={3}
            />
            {validationErrors.description && (
              <div style={styles.fieldError}>
                {validationErrors.description}
              </div>
            )}
          </div>

          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={styles.cancelButton}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  Object.assign(e.currentTarget.style, {
                    ...styles.cancelButton,
                    ...styles.cancelButtonHover,
                  });
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
              disabled={isSubmitting || !formData.name.trim() || Object.keys(validationErrors).length > 0}
              style={{
                ...styles.submitButton,
                ...(isSubmitting || !formData.name.trim() || Object.keys(validationErrors).length > 0 ? styles.submitButtonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && formData.name.trim() && Object.keys(validationErrors).length === 0) {
                  Object.assign(e.currentTarget.style, {
                    ...styles.submitButton,
                    ...styles.submitButtonHover,
                  });
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, {
                  ...styles.submitButton,
                  ...(isSubmitting || !formData.name.trim() || Object.keys(validationErrors).length > 0 ? styles.submitButtonDisabled : {}),
                });
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditOrgModal;
