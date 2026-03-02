import React from 'react';

/**
 * FormField — unified input, select, or textarea wrapper with label and focus animation
 *
 * Usage (input):
 *   <FormField label="Vehicle Name" name="name" value={...} onChange={...} placeholder="e.g. Fleet Truck Alpha" required />
 *
 * Usage (select):
 *   <FormField label="Status" name="status" type="select" value={...} onChange={...}>
 *     <option>AVAILABLE</option>
 *   </FormField>
 *
 * Usage (textarea):
 *   <FormField label="Notes" name="notes" type="textarea" rows={3} value={...} onChange={...} />
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    hint,
    leftIcon: LeftIcon,
    rightSlot,
    children,
    rows = 3,
    min,
    max,
    step,
    className = '',
}) => {
    const inputClass = `input-field${LeftIcon ? ' pl-10' : ''}${rightSlot ? ' pr-10' : ''} ${className}`;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="text-danger ml-0.5">*</span>}
                </label>
            )}

            <div className="relative group">
                {LeftIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary group-focus-within:text-primary transition-colors pointer-events-none">
                        <LeftIcon size={16} />
                    </div>
                )}

                {type === 'select' ? (
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        disabled={disabled}
                        className={inputClass}
                    >
                        {children}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        rows={rows}
                        className={`${inputClass} resize-none`}
                    />
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        min={min}
                        max={max}
                        step={step}
                        className={inputClass}
                    />
                )}

                {rightSlot && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {rightSlot}
                    </div>
                )}
            </div>

            {hint && <p className="text-xs text-text-secondary mt-1 ml-0.5">{hint}</p>}
        </div>
    );
};

export default FormField;
