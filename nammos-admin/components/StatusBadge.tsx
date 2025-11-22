import React from 'react';
import { OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; className: string; dotColor: string }> = {
  pending: { 
    label: 'Pendente', 
    className: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    dotColor: 'bg-yellow-400'
  },
  accepted: { 
    label: 'Aceito', 
    className: 'bg-blue-50 text-blue-700 border-blue-100',
    dotColor: 'bg-blue-500'
  },
  in_kitchen: { 
    label: 'Preparando', 
    className: 'bg-orange-50 text-orange-700 border-orange-100',
    dotColor: 'bg-orange-500'
  },
  out_for_delivery: { 
    label: 'Em Rota', 
    className: 'bg-purple-50 text-purple-700 border-purple-100',
    dotColor: 'bg-purple-500'
  },
  delivered: { 
    label: 'Entregue', 
    className: 'bg-green-50 text-green-700 border-green-100',
    dotColor: 'bg-green-500'
  },
  cancelled: { 
    label: 'Cancelado', 
    className: 'bg-red-50 text-red-700 border-red-100',
    dotColor: 'bg-red-500'
  },
};

interface Props {
  status: OrderStatus;
  minimal?: boolean;
}

const StatusBadge: React.FC<Props> = ({ status, minimal = false }) => {
  const config = statusConfig[status] || statusConfig.pending;
  
  if (minimal) {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
        <span className={`text-sm font-medium text-gray-600`}>{config.label}</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;