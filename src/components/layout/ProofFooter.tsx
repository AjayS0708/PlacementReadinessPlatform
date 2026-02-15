import { useState } from 'react';
import './ProofFooter.css';

export interface ProofItem {
  id: string;
  label: string;
  checked: boolean;
  proofText: string;
}

export interface ProofFooterProps {
  items?: ProofItem[];
  onItemUpdate?: (id: string, checked: boolean, proofText: string) => void;
}

const defaultItems: ProofItem[] = [
  { id: 'ui-built', label: 'UI Built', checked: false, proofText: '' },
  { id: 'logic-working', label: 'Logic Working', checked: false, proofText: '' },
  { id: 'test-passed', label: 'Test Passed', checked: false, proofText: '' },
  { id: 'deployed', label: 'Deployed', checked: false, proofText: '' },
];

export const ProofFooter: React.FC<ProofFooterProps> = ({
  items: externalItems,
  onItemUpdate,
}) => {
  const [internalItems, setInternalItems] = useState<ProofItem[]>(defaultItems);
  const items = externalItems || internalItems;

  const handleProofChange = (id: string, proofText: string) => {
    if (onItemUpdate) {
      const item = items.find((i) => i.id === id);
      if (item) onItemUpdate(id, item.checked, proofText);
    } else {
      setInternalItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, proofText } : item))
      );
    }
  };

  const handleCheck = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    /* Require proof text before allowing check */
    if (!item.checked && !item.proofText.trim()) return;

    if (onItemUpdate) {
      onItemUpdate(id, !item.checked, item.proofText);
    } else {
      setInternalItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      );
    }
  };

  const completedCount = items.filter((i) => i.checked).length;

  return (
    <footer className="proof-footer">
      <div className="proof-footer__inner">
        <div className="proof-footer__header">
          <h3 className="proof-footer__title">Proof of Completion</h3>
          <span className="proof-footer__count">
            {completedCount} / {items.length} verified
          </span>
        </div>

        <div className="proof-footer__items">
          {items.map((item) => (
            <div
              key={item.id}
              className={`proof-footer__item ${item.checked ? 'proof-footer__item--checked' : ''}`}
            >
              <div className="proof-footer__item-row">
                <button
                  className={`proof-footer__checkbox ${item.checked ? 'proof-footer__checkbox--checked' : ''}`}
                  onClick={() => handleCheck(item.id)}
                  aria-label={`Mark ${item.label} as ${item.checked ? 'incomplete' : 'complete'}`}
                  disabled={!item.checked && !item.proofText.trim()}
                  type="button"
                >
                  {item.checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span className="proof-footer__label">{item.label}</span>
              </div>

              <input
                type="text"
                className="proof-footer__proof-input"
                placeholder={`Add proof for "${item.label}" to check off`}
                value={item.proofText}
                onChange={(e) => handleProofChange(item.id, e.target.value)}
                disabled={item.checked}
              />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
