import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Loader2, Check, AlertCircle, ChevronRight, ChevronLeft, Edit3, Plus, Lightbulb } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useVoiceSubmit } from '../hooks/useVoiceSubmit';
import { useRegion } from '../hooks/useRegion';
import { useSubmitPrice } from '../hooks/usePrices';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InlineAddProduct from './InlineAddProduct';
import InlineAddStore from './InlineAddStore';

interface VoiceSubmitFlowProps {
  onSwitchToManual: (prefill?: {
    product?: { id: string; name_ar: string; name_en: string; brand_ar: string | null; brand_en: string | null; unit_ar: string; unit_en: string; unit_size: string | null };
    store?: { id: string; name: string; address_ar: string | null; address_en: string | null };
    price?: string;
  }) => void;
}

export default function VoiceSubmitFlow({ onSwitchToManual }: VoiceSubmitFlowProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { selectedRegion } = useRegion();
  const { submitPrice, isSubmitting, error: submitError } = useSubmitPrice();

  const recorder = useVoiceRecorder(15000);
  const voice = useVoiceSubmit();

  const [success, setSuccess] = useState(false);
  const [locationNote, setLocationNote] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);

  const BackIcon = isAr ? ChevronRight : ChevronLeft;

  async function handleMicPress() {
    if (recorder.isRecording) {
      const audio = await recorder.stopRecording();
      if (audio) {
        const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
        await voice.processAudio(audio, lang, selectedRegion?.id, recorder.mimeType);
      }
    } else {
      voice.reset();
      await recorder.startRecording();
      voice.setPhase('recording');
    }
  }

  function handleSwitchToManual() {
    const prefill: Parameters<typeof onSwitchToManual>[0] = {};
    if (voice.selectedProduct) {
      prefill.product = voice.selectedProduct;
    }
    if (voice.selectedStore) {
      prefill.store = {
        id: voice.selectedStore.id,
        name: voice.selectedStore.name,
        address_ar: voice.selectedStore.address_ar,
        address_en: voice.selectedStore.address_en,
      };
    }
    if (voice.price) {
      prefill.price = voice.price;
    }
    onSwitchToManual(prefill);
  }

  async function handleSubmit() {
    if (!voice.selectedProduct || !voice.selectedStore || !voice.price) return;

    try {
      await submitPrice({
        product_id: voice.selectedProduct.id,
        store_id: voice.selectedStore.id,
        price: Number(voice.price),
        location_note_ar: isAr ? locationNote : undefined,
        location_note_en: !isAr ? locationNote : undefined,
      });
      setSuccess(true);
    } catch { /* error handled by hook */ }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Success Screen ---
  if (success) {
    return (
      <div className="text-center py-12 animate-fade-in">
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

  // --- Idle Phase ---
  if (voice.phase === 'idle' && !recorder.isRecording) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Error messages */}
        {(recorder.error || voice.error) && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 font-medium animate-scale-in flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {recorder.error === 'mic_permission_denied'
                ? t('voice.mic_denied')
                : voice.error === 'empty_transcript'
                  ? t('voice.empty_transcript')
                  : voice.error === 'voice_processing_failed'
                    ? t('voice.processing_failed')
                    : t('voice.mic_error')}
            </span>
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center gap-4 py-8">
          <button
            onClick={handleMicPress}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/30"
          >
            <Mic className="w-10 h-10" />
          </button>
          <p className="text-gray-500 text-sm text-center max-w-xs">{t('voice.tap_to_record')}</p>
        </div>

        {/* Recording hints */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm font-semibold">{t('voice.hint_title')}</p>
          </div>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li className="flex items-start gap-1.5">
              <span className="text-primary-400 mt-0.5">&#8226;</span>
              {t('voice.hint_1')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary-400 mt-0.5">&#8226;</span>
              {t('voice.hint_2')}
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-primary-400 mt-0.5">&#8226;</span>
              {t('voice.hint_3')}
            </li>
          </ul>
          <div className="border-t border-gray-200 pt-2">
            <p className="text-xs text-gray-400 mb-1.5">{t('voice.examples_label')}</p>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500" dir="auto">&ldquo;{t('voice.example_1')}&rdquo;</p>
              <p className="text-xs text-gray-500" dir="auto">&ldquo;{t('voice.example_2')}&rdquo;</p>
              <p className="text-xs text-gray-500" dir="auto">&ldquo;{t('voice.example_3')}&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Switch to manual */}
        <button
          onClick={() => onSwitchToManual()}
          className="btn-ghost w-full text-sm flex items-center justify-center gap-1"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {t('voice.switch_manual')}
        </button>
      </div>
    );
  }

  // --- Recording Phase ---
  if (voice.phase === 'recording' || recorder.isRecording) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center gap-4 py-8">
          <button
            onClick={handleMicPress}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all bg-red-500 text-white animate-pulse shadow-red-500/30"
          >
            <MicOff className="w-10 h-10" />
          </button>
          <div className="text-center">
            <p className="text-red-500 font-semibold text-lg" dir="ltr">
              {formatDuration(recorder.duration)}
            </p>
            <p className="text-gray-500 text-sm">{t('voice.tap_to_stop')}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Processing Phase ---
  if (voice.phase === 'processing') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <p className="text-gray-500 font-medium">{t('voice.analyzing')}</p>
      </div>
    );
  }

  // --- Results Phase ---
  if (voice.phase === 'results' && voice.result) {
    const { result } = voice;
    const canConfirm = voice.selectedProduct && voice.selectedStore && voice.price;

    return (
      <div className="space-y-5 animate-fade-in">
        {/* Transcript */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">{t('voice.transcript')}</p>
          <p className="text-sm text-gray-700 font-medium" dir="auto">{result.transcript}</p>
        </div>

        {/* Product matches */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('submit_page.step_product')}</h3>
          {result.matches.products.length === 0 ? (
            showAddProduct ? (
              <InlineAddProduct
                prefillName={result.parsed.product_query || ''}
                onCreated={(product) => {
                  voice.setSelectedProduct({ ...product, score: 1 });
                  setShowAddProduct(false);
                }}
                onCancel={() => setShowAddProduct(false)}
              />
            ) : (
              <div className="bg-amber-50 text-amber-700 text-sm rounded-xl p-3 flex items-center justify-between">
                <span>{t('voice.no_product_match')}</span>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="text-primary-600 font-medium text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t('voice.add_product')}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {result.matches.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => voice.setSelectedProduct(p)}
                  className={cn(
                    'w-full text-start card-hover transition-all',
                    voice.selectedProduct?.id === p.id && 'ring-2 ring-primary-500 bg-primary-50/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{isAr ? p.name_ar : p.name_en}</p>
                      {(p.brand_ar || p.brand_en) && (
                        <p className="text-sm text-gray-500">{isAr ? p.brand_ar : p.brand_en}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{p.unit_size} {isAr ? p.unit_ar : p.unit_en}</p>
                    </div>
                    {voice.selectedProduct?.id === p.id && (
                      <Check className="w-5 h-5 text-primary-500 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Store matches */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('submit_page.step_store')}</h3>
          {result.matches.stores.length === 0 ? (
            showAddStore ? (
              <InlineAddStore
                prefillName={result.parsed.store_query || ''}
                onCreated={(store) => {
                  voice.setSelectedStore({ ...store, score: 1 });
                  setShowAddStore(false);
                }}
                onCancel={() => setShowAddStore(false)}
              />
            ) : (
              <div className="bg-amber-50 text-amber-700 text-sm rounded-xl p-3 flex items-center justify-between">
                <span>{result.parsed.store_query ? t('voice.no_store_match') : t('voice.no_store_detected')}</span>
                <button
                  onClick={() => setShowAddStore(true)}
                  className="text-primary-600 font-medium text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t('voice.add_store')}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {result.matches.stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => voice.setSelectedStore(s)}
                  className={cn(
                    'w-full text-start card-hover transition-all',
                    voice.selectedStore?.id === s.id && 'ring-2 ring-primary-500 bg-primary-50/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      {(s.address_ar || s.address_en) && (
                        <p className="text-sm text-gray-500">{isAr ? s.address_ar : s.address_en}</p>
                      )}
                    </div>
                    {voice.selectedStore?.id === s.id && (
                      <Check className="w-5 h-5 text-primary-500 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('submit_page.step_price')}</h3>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100000"
              value={voice.price}
              onChange={(e) => voice.setPrice(e.target.value)}
              className="input text-2xl font-bold text-center py-4"
              dir="ltr"
              placeholder="0.00"
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {t('price.egp')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={voice.reset} className="btn-ghost flex-1 flex items-center justify-center gap-1">
            <Mic className="w-4 h-4" /> {t('voice.try_again')}
          </button>
          <button
            onClick={() => voice.setPhase('confirming')}
            disabled={!canConfirm}
            className="btn-primary flex-1"
          >
            {t('common.next')}
          </button>
        </div>

        <button
          onClick={handleSwitchToManual}
          className="btn-ghost w-full text-sm flex items-center justify-center gap-1"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {t('voice.switch_manual')}
        </button>
      </div>
    );
  }

  // --- Confirming Phase ---
  if (voice.phase === 'confirming') {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => voice.setPhase('results')} className="btn-ghost text-sm flex items-center gap-1">
          <BackIcon className="w-4 h-4" /> {t('common.back')}
        </button>
        <h2 className="text-lg font-semibold">{t('submit_page.step_confirm')}</h2>

        {submitError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 font-medium animate-scale-in">{submitError}</div>
        )}

        <div className="card space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('submit_page.step_product')}</span>
            <span className="font-semibold text-gray-900">
              {isAr ? voice.selectedProduct?.name_ar : voice.selectedProduct?.name_en}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('submit_page.step_store')}</span>
            <span className="font-semibold text-gray-900">{voice.selectedStore?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">{t('submit_page.step_price')}</span>
            <span className="text-xl font-bold gradient-text">
              {Number(voice.price).toFixed(2)} {t('price.egp')}
            </span>
          </div>
          {/* Optional location note */}
          <div className="py-2">
            <label className="text-sm text-gray-500 mb-1.5 block">{t('submit_page.step_location')} ({t('common.optional')})</label>
            <textarea
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              placeholder={t('submit_page.location_note_placeholder')}
              className="input min-h-[80px] resize-y text-sm"
              maxLength={200}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? t('common.loading') : t('submit_page.confirm_submit')}
        </button>
      </div>
    );
  }

  return null;
}
