import { Clock3, PhoneCall } from 'lucide-react';
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
          {onCall ? (
            <button
              className="phone-link phone-link-button"
              onClick={() => onCall(customer)}
              type="button"
            >
              {customer.phone}
            </button>
          ) : (
            <a className="phone-link" href={`tel:${customer.phone}`}>
              {customer.phone}
            </a>
          )}
        </div>
        <div className="customer-actions">
          {history ? <StatusChip status={customer.status} /> : null}
          {onCall ? (
            <button
              className="call-button"
              onClick={() => onCall(customer)}
              type="button"
            >
              <PhoneCall aria-hidden size={20} />
              拨打
            </button>
          ) : null}
          {!history && !onCall ? <StatusChip status={customer.status} /> : null}
        </div>
      </div>

      <div className="company-line">
        <span>{customer.company || '未填写公司'}</span>
      </div>

      <div className="last-contact-line">
        <Clock3 aria-hidden size={16} />
        <span>{history ? '最近更新' : '从未拨打'}</span>
      </div>

      {customer.remark ? <p className="remark">{customer.remark}</p> : null}
    </article>
  );
}
