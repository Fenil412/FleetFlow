import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1, x: 0,
        transition: { delay: i * 0.04, type: 'spring', stiffness: 260, damping: 25 },
    }),
};

/**
 * DataTable — animated table with skeleton loading, empty state, row hover
 *
 * Usage:
 *   <DataTable
 *     columns={['Name', 'Status', 'Actions']}
 *     rows={vehicles}
 *     loading={loading}
 *     emptyIcon={<Truck size={40} />}
 *     emptyText="No vehicles found"
 *     renderRow={(v, i) => <tr key={v.id}>...</tr>}
 *   />
 */
const DataTable = ({
    columns = [],
    rows = [],
    loading = false,
    emptyIcon,
    emptyText = 'No records found',
    renderRow,
    skeletonRows = 5,
    colSpan,
}) => {
    const span = colSpan || columns.length || 4;

    return (
        <div className="card overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-background/50 border-b border-border text-xs font-black text-text-secondary uppercase tracking-[0.12em]">
                            {columns.map((col, i) => (
                                <th key={i} className={`px-5 py-4 ${col.className || ''}`}>
                                    {typeof col === 'string' ? col : col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                        {loading ? (
                            Array.from({ length: skeletonRows }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array.from({ length: span }).map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-4 skeleton rounded-md" style={{ width: `${60 + (j % 3) * 15}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={span} className="py-20 text-center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center gap-3 text-text-secondary/40"
                                    >
                                        {emptyIcon && <div className="mb-1">{emptyIcon}</div>}
                                        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">{emptyText}</p>
                                    </motion.div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => renderRow(row, i))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { rowVariants };
export default DataTable;
