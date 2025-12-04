import React from 'react';
import styles from './Select.module.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    className = '',
    id,
    ...props
}) => {
    const selectId = id || props.name;

    return (
        <div className={styles.selectWrapper}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`${styles.select} ${error ? styles.error : ''} ${className}`}
                {...props}
            >
                <option value="">Pilih {label || 'opsi'}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};
