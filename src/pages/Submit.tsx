import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Check, Camera, MapPin, Plus, Image, X, Loader2, ShoppingBag, Store, DollarSign, Navigation, ClipboardCheck, Mic, Edit3, ScanBarcode } from 'lucide-react';
import api from '../lib/api';
import { useRegion } from '../hooks/useRegion';
import { useSubmitPrice } from '../hooks/usePrices';
import { useAuth } from '../hooks/useAuth';
import { uploadPriceImage } from '../lib/storage';
import { cn } from '../lib/utils';
import VoiceSubmitFlow from '../components/VoiceSubmitFlow';
import InlineAddProduct from '../components/InlineAddProduct';
import InlineAddStore from '../components/InlineAddStore';

const BarcodeScanner = lazy(() => import('../components/BarcodeScanner'));

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  brand_ar: string | null;
  brand_en: string | null;
  unit_ar: string;
  unit_en: string;
  unit_size: string | null;
}

interface StoreOption {
  id: string;
  name: string;
  address_ar: string | null;
  address_en: string | null;
}

const STEPS = ['product', 'store', 'price', 'location', 'confirm'] as const;
const STEP_ICONS = [ShoppingBag, Store, DollarSign, Navigation, ClipboardCheck];

export default function Submit() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { selectedRegion } = useRegion();
  const { submitPrice, isSubmitting, error: submitError } = useSubmitPrice();
  const { user } = useAuth();
  const isAr = i18n.language === 'ar';

  const voiceSupported = typeof window !== 'undefined' &&
    !!(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';
  const [mode, setMode] = useState<'manual' | 'voice'>('manual');

  const [step, setStep] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [stores, setStores] = useState<StoreOption[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [locationNote, setLocationNote] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodePrefill, setBarcodePrefill] = useState<{ name?: string; brand?: string; barcode?: string }>({});

  // Search products
  useEffect(() => {
    if (!productSearch.trim()) { setProducts([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get('/products/search', { params: { q: productSearch, limit: 10 } });
        setProducts(data.data);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  // Fetch stores
  useEffect(() => {
    if (step !== 1) return;
    async function fetchStores() {
      try {
        const params: Record<string, string> = {};
        if (selectedRegion) params.region_id = selectedRegion.id;
        const { data } = await api.get('/stores', { params });
        setStores(data.data);
      } catch { /* ignore */ }
    }
    fetchStores();
  }, [step, selectedRegion]);

  const filteredStores = storeSearch.trim()
    ? stores.filter(s => s.name.includes(storeSearch) ||
        s.address_ar?.includes(storeSearch) ||
        s.address_en?.toLowerCase().includes(storeSearch.toLowerCase()))
    : stores;

  async function handleBarcodeScan(code: string) {
    setShowBarcode(false);
    try {
      const { data } = await api.get(`/barcode/${code}`);
      if (data.found && data.source === 'local') {
        setSelectedProduct(data.product);
        setStep(1);
      } else if (data.found && data.source === 'openfoodfacts') {
        setBarcodePrefill({
          name: data.suggestion.name,
          brand: data.suggestion.brand,
          barcode: data.suggestion.barcode,
        });
        setShowAddProduct(true);
      } else {
        setBarcodePrefill({ barcode: code });
        setShowAddProduct(true);
      }
    } catch {
      setBarcodePrefill({ barcode: code });
      setShowAddProduct(true);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
  }

  async function handleSubmit() {
    if (!selectedProduct || !selectedStore || !price) return;

    try {
      let finalImageUrl = imageUrl;
      if (imageFile && user) {
        setIsUploading(true);
        try {
          finalImageUrl = await uploadPriceImage(imageFile, user.id);
        } catch {
          // Continue without image if upload fails
        } finally {
          setIsUploading(false);
        }
      }

      await submitPrice({
        product_id: selectedProduct.id,
        store_id: selectedStore.id,
        price: Number(price),
        image_url: finalImageUrl || undefined,
        location_note_ar: isAr ? locationNote : undefined,
        location_note_en: !isAr ? locationNote : undefined,
      });
      setSuccess(true);
    } catch { /* error handled by hook */ }
  }

  function handleVoicePrefill(prefill?: {
    product?: Product;
    store?: StoreOption;
    price?: string;
  }) {
    if (prefill?.product) {
      setSelectedProduct(prefill.product);
      setStep(1);
    }
    if (prefill?.store) {
      setSelectedStore(prefill.store);
      if (prefill.product) setStep(2);
    }
    if (prefill?.price) {
      setPrice(prefill.price);
      if (prefill.product && prefill.store) setStep(2);
    }
    setMode('manual');
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 sm:py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-500/20" style={{ background: 'var(--theme-gradient)' }}>
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('submit_page.success')}</h2>
        <p className="text-gray-500 mb-6">{t('app.description')}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('nav.home')}
        </button>
      </div>
    );
  }

  const BackIcon = isAr ? ChevronRight : ChevronLeft;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{t('submit_page.title')}</h1>

      {/* Mode toggle */}
      {voiceSupported && (
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('manual')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'manual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Edit3 className="w-4 h-4" />
            {t('voice.mode_manual')}
          </button>
          <button
            onClick={() => setMode('voice')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'voice'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Mic className="w-4 h-4" />
            {t('voice.mode_voice')}
          </button>
        </div>
      )}

      {/* Voice mode */}
      {mode === 'voice' && voiceSupported && (
        <VoiceSubmitFlow onSwitchToManual={handleVoicePrefill} />
      )}

      {/* Manual mode - Step indicators */}
      {mode === 'manual' && <>
      {/* Step indicators */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <div key={s} className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <div className={cn(
                'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-all',
                i < step && 'bg-success-500 text-white shadow-sm',
                i === step && 'bg-primary-500 text-white shadow-md shadow-primary-500/30',
                i > step && 'bg-gray-100 text-gray-400'
              )}>
                {i < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 rounded-full transition-colors',
                  i < step ? 'bg-success-500' : 'bg-gray-200'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {submitError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 font-medium animate-scale-in">{submitError}</div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcode && (
        <Suspense fallback={null}>
          <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowBarcode(false)} />
        </Suspense>
      )}

      {/* Step 1: Select Product */}
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-lg font-semibold">{t('submit_page.step_product')}</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder={t('submit_page.search_product')}
                className="input ps-10"
                autoFocus
              />
            </div>
            <button
              onClick={() => setShowBarcode(true)}
              className="btn-outline flex items-center gap-1.5 px-3"
              title={t('barcode.scan_title', 'Scan Barcode')}
            >
              <ScanBarcode className="w-5 h-5" />
            </button>
          </div>

          {showAddProduct ? (
            <InlineAddProduct
              prefillName={barcodePrefill.name}
              prefillBrand={barcodePrefill.brand}
              prefillBarcode={barcodePrefill.barcode}
              onCreated={(product) => {
                setSelectedProduct(product);
                setShowAddProduct(false);
                setBarcodePrefill({});
                setStep(1);
              }}
              onCancel={() => { setShowAddProduct(false); setBarcodePrefill({}); }}
            />
          ) : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setStep(1); }}
                    className={cn(
                      'w-full text-start card-hover',
                      selectedProduct?.id === p.id && 'ring-2 ring-primary-500'
                    )}
                  >
                    <p className="font-semibold text-gray-900">{isAr ? p.name_ar : p.name_en}</p>
                    {(p.brand_ar || p.brand_en) && (
                      <p className="text-sm text-gray-500">{isAr ? p.brand_ar : p.brand_en}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{p.unit_size} {isAr ? p.unit_ar : p.unit_en}</p>
                  </button>
                ))}
              </div>

              {productSearch.trim() && (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="w-full card border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/50 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-primary-600 active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">{t('submit_page.add_new_product', "Can't find it? Add new product")}</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 2: Select Store */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(0)} className="btn-ghost text-sm flex items-center gap-1">
            <BackIcon className="w-4 h-4" /> {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold">{t('submit_page.step_store')}</h2>

          {showAddStore ? (
            <InlineAddStore
              onCreated={(store) => {
                setSelectedStore(store);
                setShowAddStore(false);
                setStep(2);
              }}
              onCancel={() => setShowAddStore(false)}
            />
          ) : (
            <>
              <div className="relative">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={e => setStoreSearch(e.target.value)}
                  placeholder={t('submit_page.search_store')}
                  className="input ps-10"
                />
              </div>

              <button
                onClick={() => setShowAddStore(true)}
                className="w-full card border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/50 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-primary-600 active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">{t('store.add_store')}</span>
              </button>

              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                {filteredStores.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStore(s); setStep(2); }}
                    className={cn(
                      'w-full text-start card-hover',
                      selectedStore?.id === s.id && 'ring-2 ring-primary-500'
                    )}
                  >
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    {(s.address_ar || s.address_en) && (
                      <p className="text-sm text-gray-500">{isAr ? s.address_ar : s.address_en}</p>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Enter Price */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(1)} className="btn-ghost text-sm flex items-center gap-1">
            <BackIcon className="w-4 h-4" /> {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold">{t('submit_page.step_price')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('submit_page.enter_price')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100000"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="input text-3xl font-bold text-center py-5"
                dir="ltr"
                placeholder="0.00"
                autoFocus
              />
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                {t('price.egp')}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-gray-500" />
              {Number(price) > 200 ? t('submit_page.image_required') : t('submit_page.add_image')}
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" loading="lazy" />
                <button
                  onClick={clearImage}
                  className="absolute top-2 end-2 bg-red-500 text-white rounded-xl p-1.5 hover:bg-red-600 shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <label className="btn-outline flex-1 cursor-pointer flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">{isAr ? 'التقط صورة' : 'Take Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <label className="btn-outline flex-1 cursor-pointer flex items-center justify-center gap-2">
                  <Image className="w-5 h-5" />
                  <span className="text-sm">{isAr ? 'اختر صورة' : 'Gallery'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <button
            onClick={() => setStep(3)}
            disabled={!price || Number(price) <= 0}
            className="btn-primary w-full"
          >
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Step 4: Location Note */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(2)} className="btn-ghost text-sm flex items-center gap-1">
            <BackIcon className="w-4 h-4" /> {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            {t('submit_page.step_location')}
          </h2>
          <p className="text-sm text-gray-400">{t('common.optional')}</p>
          <textarea
            value={locationNote}
            onChange={e => setLocationNote(e.target.value)}
            placeholder={t('submit_page.location_note_placeholder')}
            className="input min-h-[120px] resize-y"
            maxLength={200}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span />
            <span>{locationNote.length}/200</span>
          </div>
          <button onClick={() => setStep(4)} className="btn-primary w-full">
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Step 5: Confirm */}
      {step === 4 && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setStep(3)} className="btn-ghost text-sm flex items-center gap-1">
            <BackIcon className="w-4 h-4" /> {t('common.back')}
          </button>
          <h2 className="text-lg font-semibold">{t('submit_page.step_confirm')}</h2>

          <div className="card space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                {t('submit_page.step_product')}
              </span>
              <span className="font-semibold text-gray-900">{isAr ? selectedProduct?.name_ar : selectedProduct?.name_en}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                {t('submit_page.step_store')}
              </span>
              <span className="font-semibold text-gray-900">{selectedStore?.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                {t('submit_page.step_price')}
              </span>
              <span className="text-xl font-bold gradient-text">{Number(price).toFixed(2)} {t('price.egp')}</span>
            </div>
            {imagePreview && (
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500 mb-2 block">{isAr ? 'صورة' : 'Photo'}</span>
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" loading="lazy" />
              </div>
            )}
            {locationNote && (
              <div className="flex justify-between items-start py-2">
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {t('price.location_note')}
                </span>
                <span className="text-sm text-gray-700 text-end max-w-[60%]">{locationNote}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
          >
            {(isSubmitting || isUploading) && <Loader2 className="w-5 h-5 animate-spin" />}
            {isUploading ? (isAr ? 'جاري رفع الصورة...' : 'Uploading image...') : isSubmitting ? t('common.loading') : t('submit_page.confirm_submit')}
          </button>
        </div>
      )}
      </>}
    </div>
  );
}
