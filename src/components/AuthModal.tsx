import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Phone, Mail, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { t, i18n } = useTranslation();
  const { signInWithOtp, verifyOtp, signInWithEmail, signUpWithEmail } = useAuth();
  const isAr = i18n.language === 'ar';

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'input' | 'otp'>('input');

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  function resetState() {
    setStep('input');
    setMode('login');
    setPhone('');
    setOtp('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithOtp(phone);
      setStep('otp');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 422) {
        setError(t('auth.invalid_phone'));
      } else {
        setError(t('auth.otp_not_available'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(phone, otp);
      onClose();
      resetState();
    } catch {
      setError(t('auth.invalid_otp'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
      resetState();
    } catch {
      setError(t('auth.invalid_credentials'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      onClose();
      resetState();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError(t('auth.email_exists'));
      } else {
        setError(err?.message || t('common.error'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm p-6 pt-8 relative animate-slide-up">
        {/* Handle bar for mobile */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />

        <button onClick={() => { onClose(); resetState(); }} className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 transition-colors p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            {method === 'email' ? (
              <Mail className="w-7 h-7 text-white" />
            ) : step === 'otp' ? (
              <ShieldCheck className="w-7 h-7 text-white" />
            ) : (
              <Phone className="w-7 h-7 text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'signup' ? t('auth.signup_title') : t('auth.login_title')}
          </h2>
        </div>

        {/* Method toggle - only show on input step */}
        {step === 'input' && (
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => { setMethod('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                method === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              {t('auth.email')}
            </button>
            <button
              type="button"
              onClick={() => { setMethod('phone'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                method === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              {t('auth.phone')}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 animate-scale-in font-medium">{error}</div>
        )}

        {/* Email Login */}
        {method === 'email' && step === 'input' && mode === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.email_label')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="input"
                dir="ltr"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="input pe-11"
                  dir="ltr"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login')}
            </button>
            <p className="text-sm text-center text-gray-500">
              {t('auth.no_account_prompt')}{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setPassword(''); setConfirmPassword(''); }}
                className="text-primary-600 font-semibold hover:underline"
              >
                {t('auth.create_account')}
              </button>
            </p>
          </form>
        )}

        {/* Email Signup */}
        {method === 'email' && step === 'input' && mode === 'signup' && (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.email_label')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="input"
                dir="ltr"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="input pe-11"
                  dir="ltr"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.confirm_password_label')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirm_password_placeholder')}
                className="input"
                dir="ltr"
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.create_account')}
            </button>
            <p className="text-sm text-center text-gray-500">
              {t('auth.have_account')}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setPassword(''); setConfirmPassword(''); }}
                className="text-primary-600 font-semibold hover:underline"
              >
                {t('auth.login')}
              </button>
            </p>
          </form>
        )}

        {/* Phone OTP - Step 1 */}
        {method === 'phone' && step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.phone_label')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t('auth.phone_placeholder')}
                className="input text-lg"
                dir="ltr"
                required
                autoFocus
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.send_otp')}
            </button>
          </form>
        )}

        {/* Phone OTP - Step 2 */}
        {method === 'phone' && step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 text-center bg-surface-100 rounded-xl p-3">
              {t('auth.otp_sent')} <span className="font-bold" dir="ltr">{phone}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.otp_label')}
              </label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder={t('auth.otp_placeholder')}
                className="input text-center text-2xl tracking-[0.5em] font-bold"
                dir="ltr"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-base">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.verify')}
            </button>
            <button
              type="button"
              onClick={() => { setStep('input'); setOtp(''); setError(''); }}
              className="btn-ghost w-full text-sm flex items-center justify-center gap-1"
            >
              <BackArrow className="w-4 h-4" />
              {t('common.back')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
