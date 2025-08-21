import React from 'react';
import {
  XIcon,
  UserIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  TagIcon,
  TruckIcon,
  LocationMarkerIcon,
  ClipboardListIcon,
  CalendarIcon,
  PhotographIcon,
  MailIcon,
} from '@heroicons/react/outline';

const ViewModal = ({
  isOpen,
  deal,
  onClose,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusIcon,
}) => {
  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Trade Deal Details</h3>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                deal.status
              )}`}
            >
              {getStatusIcon(deal.status)}
              <span className="ml-1">{deal.status}</span>
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender */}
            <InfoCard
              icon={<UserIcon className="h-5 w-5 mr-2 text-gray-600" />}
              title="Sender Information"
              bg="bg-gray-50"
              items={[
                ['Name', deal.sender_name],
                ['Number', deal.sender_number],
                deal.sender_email && ['Email', deal.sender_email],
              ]}
            />

            {/* Product */}
            <InfoCard
              icon={<TagIcon className="h-5 w-5 mr-2 text-gray-600" />}
              title="Product Information"
              bg="bg-blue-50"
              items={[
                ['Name', deal.product_name],
                ['Price', deal.product_price],
                deal.product_brand && ['Brand', deal.product_brand],
                deal.product_model && ['Model', deal.product_model],
                deal.product_category && ['Category', deal.product_category],
                ['Condition', deal.product_condition],
                deal.warranty_period && ['Warranty', deal.warranty_period],
                deal.product_image && [
                  'Image',
                  <a
                    key="img-link"
                    // href={deal.product_image}
                    href={'/logo512.png'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <PhotographIcon className="h-4 w-4 mr-1" />
                    View Image
                  </a>
                ],
              ]}
            />

            {/* Financial */}
            <InfoCard
              icon={<CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-600" />}
              title="Financial Details"
              bg="bg-green-50"
              items={[
                ['Deal Value', formatCurrency(deal.deal_value)],
                ['Profit', <span className="text-green-600">{formatCurrency(deal.profit)}</span>],
                ['Commission', formatCurrency(deal.commission)],
                deal.payment_method && ['Payment Method', deal.payment_method],
                deal.payment_status && ['Payment Status', deal.payment_status],
              ]}
            />

            {/* People */}
            <InfoCard
              icon={<UserIcon className="h-5 w-5 mr-2 text-gray-600" />}
              title="People Involved"
              bg="bg-purple-50"
              items={[
                ['Dealer', deal.dealer || '-'],
                ['Customer', deal.customer || '-'],
                deal.customer_phone && [
                  'Customer Phone',
                  <span className="flex items-center">
                    <PhoneIcon className="h-3 w-3 mr-1" />
                    {deal.customer_phone}
                  </span>,
                ],
                deal.customer_email && [
                  'Customer Email',
                  <span className="flex items-center">
                    <MailIcon className="h-3 w-3 mr-1" />
                    {deal.customer_email}
                  </span>,
                ],
              ]}
            />
          </div>

          {/* Description */}
          {deal.product_description && (
            <SectionCard
              icon={<ClipboardListIcon className="h-5 w-5 mr-2" />}
              title="Product Description"
              bg="bg-blue-50"
            >
              {deal.product_description}
            </SectionCard>
          )}

          {/* Logistics */}
          {(deal.vehicle_in ||
            deal.vehicle_out ||
            deal.shipping_address ||
            deal.billing_address ||
            deal.tracking_number ||
            deal.delivery_date) && (
              <SectionCard
                icon={<TruckIcon className="h-5 w-5 mr-2" />}
                title="Logistics Information"
                bg="bg-orange-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deal.vehicle_in && ['Vehicle In', deal.vehicle_in]}
                  {deal.vehicle_out && ['Vehicle Out', deal.vehicle_out]}
                  {deal.tracking_number && ['Tracking Number', deal.tracking_number]}
                  {deal.delivery_date && [
                    'Delivery Date',
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(deal.delivery_date)}
                    </span>,
                  ]}
                </div>
                {deal.shipping_address && (
                  <AddressBlock label="Shipping Address" value={deal.shipping_address} />
                )}
                {deal.billing_address && (
                  <AddressBlock label="Billing Address" value={deal.billing_address} />
                )}
              </SectionCard>
            )}

          {/* Tags */}
          {deal.tags && (
            <SectionCard title="Tags">
              <div className="flex flex-wrap gap-2">
                {deal.tags.split(',').map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Notes */}
          {deal.notes && (
            <SectionCard icon={<ClipboardListIcon className="h-5 w-5 mr-2" />} title="Notes">
              <div className="bg-gray-50 p-3 rounded-lg">{deal.notes}</div>
            </SectionCard>
          )}

          {/* Dates */}
          <div className="text-xs text-gray-500 border-t pt-4 flex justify-between">
            <span>Created: {formatDate(deal.createdAt)}</span>
            <span>Updated: {formatDate(deal.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, bg, items }) => (
  <div className={`${bg} p-4 rounded-lg`}>
    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">{icon} {title}</h4>
    <div className="space-y-2">
      {items
        .filter(Boolean)
        .map(([label, value], i) => (
          <div key={i}>
            <span className="text-sm text-gray-600">{label}:</span>
            <span className="ml-2 text-sm font-medium">{value}</span>
          </div>
        ))}
    </div>
  </div>
);

const SectionCard = ({ icon, title, children, bg }) => (
  <div className={`${bg || ''} p-4 rounded-lg`}>
    {title && (
      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
        {icon} {title}
      </h4>
    )}
    <div className="text-sm text-gray-700">{children}</div>
  </div>
);

const AddressBlock = ({ label, value }) => (
  <div className="mt-3">
    <span className="text-sm text-gray-600">{label}:</span>
    <div className="ml-2 text-sm font-medium bg-white p-2 rounded mt-1 flex items-start border border-gray-100">
      <LocationMarkerIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
      {value}
    </div>
  </div>
);

export default ViewModal;
