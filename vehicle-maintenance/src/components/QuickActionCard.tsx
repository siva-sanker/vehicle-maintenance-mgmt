// components/QuickActions.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/quickaction.css'
// import type { Icon } from 'lucide-react';

type Action = {
  label: string;
  path: string;
  icon: any;
};

type QuickActionsProps = {
  title?: string;
  actions: Action[];
};

const QuickActions: React.FC<QuickActionsProps> = ({ title = 'Quick Actions', actions }) => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <h3>{title}</h3>
      <div className="action-buttons">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="action-card"
          >
            <action.icon size={20} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
