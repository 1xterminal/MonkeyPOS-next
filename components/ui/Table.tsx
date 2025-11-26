'use client';

import React from 'react';
import styles from './Table.module.css';
import { defaultOverrides } from 'next/dist/server/require-hook';

export interface Column {
    key: string;
    label: string;
}

export interface Action<T> {
    label: String;
    icon?: React.ReactNode;
    className?: string;
    onClick: (item: T, index: number) => void;
}

interface TableProps<T> {
    columns: Column[];
    data: T[];
    actions?: Action<T>[];
    isLoading?: boolean;
}

export default function TableComponent<T extends { id?: string | number }>({
    columns,
    data,
    actions = [],
    isLoading = false,
}: TableProps<T>) {
    const hasActions = actions.length > 0;
    const colSpanCount = 1 + columns.length + (hasActions ? 1 : 0);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.tableData}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>No</th>
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        {hasActions && <th style={{ width: '150px' }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={colSpanCount} className={styles.emptyCell}>
                                Loading Data...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpanCount} className={styles.emptyCell}>
                                Belum Ada Data.
                            </td>
                        </tr>
                    ) : (
                        data.map((row: any, index) => (
                            <tr key={row.id || index}>
                                <td>{index + 1}</td>
                                {columns.map((col) => (
                                    <td key={`${row.id || index}-${col.key}`}>
                                        {row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : ''}
                                    </td>
                                ))}
                                {hasActions && (
                                    <td className={styles.actionCell}>
                                        <div className={styles.actionGroup}>
                                            {actions.map((action, actionIndex) => (
                                                <button
                                                    key={actionIndex}
                                                    className={styles.actionButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        action.onClick(row, index);
                                                    }}
                                                >
                                                    {action.icon && (
                                                        <span className={styles.iconWrapper}>{action.icon}</span>
                                                    )}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}