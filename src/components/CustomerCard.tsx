import { Building2, PhoneCall } from 'lucide-react';
import { StatusChip, TypeChip } from '@/components/StatusChip';
import type { Customer } from '@/types';

export function CustomerCard({
  customer,
  history,
  onCall,
}: {
  customer: Customer;
  history?: boolean;
  onCall?: (customer: Customer) => void;
}) {
  return (
    <article className="customer-card">
      <div className="customer-main">
        <div>
          <div className="customer-title-row">
            <h3>{customer.name}</h3>
            <TypeChip type={customer.type} />
          </div>
          <a className="phone-link" href={`tel:${customer.phone}`}>
            {customer.phone}
          </a>
        </div>
        {!history && onCall ? (
          <button
            className="call-button"
            onClick={() => onCall(customer)}
            type="button"
          >
            <PhoneCall aria-hidden size={20} />
            拨打
          </button>
        ) : (
          <StatusChip status={customer.status} />
        )}
      </div>

      <div className="company-line">
        <Building2 aria-hidden size={16} />
        <span>{customer.company || '未填写公司'}</span>
      </div>

      {customer.remark ? <p className="remark">{customer.remark}</p> : null}
    </article>
  );
}
