import React from 'react';
import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
} from "@heroicons/react/outline";

const WhatsAppProductCard = ({
  deal,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusIcon,
  AddInventory
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">

      {/* Image */}
      <div className="relative h-64 bg-gray-50"> {/* Increased height */}
        {deal.product_image ? (
          <img
            src={deal.product_image}
            alt={deal.product_name || 'Product'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <DocumentTextIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(deal.status)} bg-white/80 backdrop-blur-sm`}>
            {getStatusIcon(deal.status)}
            <span className="ml-1">{deal.status}</span>
          </span>
        </div>

        {/* Price Tag */}
        {deal.product_price && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {deal.product_price}
            </span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100"> {/* Reduced padding */}
        <div className="flex justify-between items-center text-sm text-gray-700">
          <div className="flex items-center space-x-2 truncate">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="font-medium truncate">{deal.sender_name || 'Unknown'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <PhoneIcon className="h-4 w-4 text-gray-500" />
            <span>{deal.sender_number || 'No number'}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3"> {/* Reduced from p-4 and space-y-4 */}
        {/* Product Info */}
        <div>
          <h3 className="font-semibold text-base text-gray-900 leading-tight line-clamp-2">
            {deal.product_name || 'Unnamed Product'}
          </h3>
          <div className="mt-1 text-sm text-gray-600 space-y-1"> {/* Reduced mt and spacing */}
            {(deal.product_brand || deal.product_model) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Brand/Model:</span>
                <span className="font-medium">{deal.product_brand} {deal.product_model}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Condition:</span>
              <span className="capitalize font-medium">{deal.product_condition || 'N/A'}</span>
            </div>
            {deal.product_category && (
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="capitalize font-medium">{deal.product_category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-gray-50 rounded-lg p-2 space-y-1 text-sm"> {/* Reduced padding */}
          <div className="flex justify-between">
            <span className="text-gray-500">Deal Value:</span>
            <span className="font-bold">{formatCurrency(deal.deal_value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Profit:</span>
            <span className="font-semibold text-green-600">{formatCurrency(deal.profit)}</span>
          </div>
          {deal.commission && (
            <div className="flex justify-between">
              <span className="text-gray-500">Commission:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(deal.commission)}</span>
            </div>
          )}
          {deal.payment_status && (
            <div className="flex justify-between">
              <span className="text-gray-500">Payment:</span>
              <span className="capitalize">{deal.payment_status}</span>
            </div>
          )}
        </div>

        {/* Dealer & Customer */}
        {(deal.dealer || deal.customer) && (
          <div className="text-sm space-y-1">
            {deal.dealer && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dealer:</span>
                <span className="font-medium">{deal.dealer}</span>
              </div>
            )}
            {deal.customer && (
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium">{deal.customer}</span>
              </div>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center text-xs text-gray-400 pt-2 border-t border-gray-100">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {formatDate(deal.createdAt)}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-2"> {/* Reduced padding */}
        <button
          onClick={() => onView(deal)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <EyeIcon className="h-4 w-4" /> View
        </button>
        <button
          onClick={() => onEdit(deal)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
        >
          <PencilIcon className="h-4 w-4" /> Edit
        </button>
        <button
          onClick={() => onDelete(deal._id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <TrashIcon className="h-4 w-4" /> Delete
        </button>
        <button onClick={()=>AddInventory()}>
          add
        </button>
      </div>
    </div>
  );
};

export default WhatsAppProductCard;
