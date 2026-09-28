import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '../../store/appSlice';

const normalizeProductOptions = (options = []) => {
  return (Array.isArray(options) ? options : []).map((opt) => {
    const key = String(opt?.name || opt?.label || '').trim();
    const values = (opt?.values || []).map((v) => {
      if (v && typeof v === 'object') {
        const label = String(v.label || v.value || v.name || '').trim();
        return {
          label,
          value: String(v.value || label).trim(),
          price: Math.max(0, Number(v.price) || 0),
          oldPrice: Math.max(0, Number(v.oldPrice) || 0),
          isDefault: Boolean(v.isDefault),
        };
      }
      const label = String(v || '').trim();
      return { label, value: label, price: 0, oldPrice: 0, isDefault: false };
    }).filter((v) => v.label);
    
    if (!key || values.length === 0) return null;
    return { ...opt, name: key, label: key, values };
  }).filter(Boolean);
};

const interactiveOptions = (options = []) => normalizeProductOptions(options).filter((opt) => (opt.values || []).length > 0);

const ProductOptionsModal = ({ isOpen, onClose, product, source = 'normal' }) => {
  const dispatch = useDispatch();
  const isLogin = useSelector((s) => s.app.isLogin);
  const userData = useSelector((s) => s.app.userData);
  const userId = userData?._id;
  
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  const productOptions = interactiveOptions(product?.productOptions || []);
  const allOptionsSelected = interactiveOptions(productOptions).every((opt) => {
    const key = opt.name || opt.label;
    return String(selectedOptions?.[key] || '').trim();
  });

  const getActivePricing = () => {
    let price = Number(product?.price || 0);
    let oldPrice = product?.oldPrice || product?.mrp || product?.price || 0;
    
    if (productOptions.length > 0 && selectedOptions) {
      productOptions.forEach((opt) => {
        const key = opt.name || opt.label;
        const selectedLabel = selectedOptions[key];
        if (selectedLabel) {
          const found = (opt.values || []).find((v) => v.label === selectedLabel || v.value === selectedLabel);
          if (found) {
            if (Number(found.price) > 0) {
              price = Number(found.price);
            }
            if (Number(found.oldPrice) > 0) {
              oldPrice = Number(found.oldPrice);
            }
          }
        }
      });
    }
    
    return { price, oldPrice };
  };

  const { price: activePrice, oldPrice: activeOldPrice } = product ? getActivePricing() : { price: 0, oldPrice: 0 };
  const hasDiscount = activeOldPrice > activePrice;
  const discountPercent = hasDiscount ? Math.round(((activeOldPrice - activePrice) / activeOldPrice) * 100) : (product?.discount || 0);

  const handleAddToCart = async () => {
    if (!isLogin) {
      toast.error('Please login to add items to cart');
      onClose();
      return;
    }
    
    if (!allOptionsSelected && productOptions.length > 0) {
      toast.error('Please select all product options');
      return;
    }
    
    if (!product?.countInStock) {
      toast.error('This item is out of stock');
      return;
    }

    const cartProduct = {
      _id: product._id,
      name: product.name,
      price: activePrice,
      oldPrice: activeOldPrice,
      image: product.image || product.images?.[0],
      images: product.images,
      countInStock: product.countInStock ?? product.stock ?? 0,
      rating: product.rating,
      brand: product.brand,
      source: source,
      discount: discountPercent,
      selectedOptions,
    };

    setBusy(true);
    await dispatch(addToCart({ product: cartProduct, userId, quantity }));
    setBusy(false);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        maxWidth: 500,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Select Options</h3>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: '#f3f4f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoMdClose size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Product Info */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <img
              src={product.image || product.images?.[0]}
              alt={product.name}
              style={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{product.name}</h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#e84040' }}>₹{activePrice}</span>
                {hasDiscount && activeOldPrice > activePrice && (
                  <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>₹{activeOldPrice}</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Options */}
          {productOptions.map((opt) => {
            const key = opt.name || opt.label;
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                  {key} <span style={{ color: '#dc2626' }}>*</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(opt.values || []).map((val) => (
                    <button
                      key={val.value || val.label}
                      type="button"
                      onClick={() => setSelectedOptions((s) => ({ ...s, [key]: val.label }))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: `1.5px solid ${selectedOptions[key] === val.label ? '#e84040' : '#e5e7eb'}`,
                        background: selectedOptions[key] === val.label ? '#fff0f0' : '#fff',
                        color: selectedOptions[key] === val.label ? '#e84040' : '#374151',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {val.label}
                      {val.price > 0 && ` · ₹${val.price}`}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {!allOptionsSelected && productOptions.length > 0 && (
            <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 16 }}>
              Please select all options above
            </p>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Qty</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              −
            </button>
            <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={busy || (!allOptionsSelected && productOptions.length > 0)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: busy || (!allOptionsSelected && productOptions.length > 0) ? '#d1d5db' : '#111827',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: busy || (!allOptionsSelected && productOptions.length > 0) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {busy ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;