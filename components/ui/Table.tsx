import React from 'react';
import clsx from 'clsx';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('w-full', className)}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={clsx('bg-claude-bg-secondary', className)}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={clsx('divide-y divide-claude-border', className)}>
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => {
  return (
    <tr
      className={clsx(
        'hover:bg-claude-bg-secondary transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children?: React.ReactNode;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-left text-sm font-semibold text-claude-text',
        className
      )}
    >
      {children}
    </th>
  );
};

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  rowSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, align = 'left', colSpan, rowSpan }) => {
  return (
    <td
      className={clsx(
        'px-4 py-3 text-sm text-claude-text-muted',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className
      )}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  );
};
