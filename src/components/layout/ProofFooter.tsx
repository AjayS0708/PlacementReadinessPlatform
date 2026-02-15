import React, { useState } from 'react';
import { Checkbox } from '../base';
import './ProofFooter.css';

export interface ProofItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ProofFooterProps {
  items?: ProofItem[];
  onItemChange?: (id: string, checked: boolean) => void;
}

const defaultItems: ProofItem[] = [
  { id: 'ui-built', label: 'UI Built', checked: false },
  { id: 'logic-working', label: 'Logic Working', checked: false },
  { id: 'test-passed', label: 'Test Passed', checked: false },
  { id: 'deployed', label: 'Deployed', checked: false },
];

export const ProofFooter: React.FC<ProofFooterProps> = ({
  items = defaultItems,
  onItemChange,
}) => {
  const [internalItems, setInternalItems] = useState(items);

  const handleChange = (id: string, checked: boolean) => {
    if (onItemChange) {
      onItemChange(id, checked);
    } else {
      setInternalItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, checked } : item))
      );
    }
  };

  const displayItems = onItemChange ? items : internalItems;

  return (
    <div className="proof-footer">
      <div className="proof-footer__content">
        <span className="proof-footer__label">Proof Checklist:</span>
        <div className="proof-footer__items">
          {displayItems.map((item) => (
            <Checkbox
              key={item.id}
              label={item.label}
              checked={item.checked}
              onChange={(e) => handleChange(item.id, e.target.checked)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
