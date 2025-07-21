import { useState, useEffect } from 'react';
import { hashPin, verifyPin, validatePin } from '../utils/auth';
import { storageService, AppSettings } from '../utils/storage';

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingPin, setHasExistingPin] = useState(false);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const settings = await storageService.getSettings();
      setHasExistingPin(!!settings.pinHash);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking existing PIN:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasExistingPin) {
      // Setting up new PIN
      await handlePinSetup();
    } else {
      // Verifying existing PIN
      await handlePinVerification();
    }
  };

  const handlePinSetup = async () => {
    const validation = validatePin(pin);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid PIN');
      return;
    }

    if (!isSettingUp) {
      setIsSettingUp(true);
      setError('Please confirm your PIN');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      setConfirmPin('');
      return;
    }

    try {
      const pinHash = await hashPin(pin);
      const settings: AppSettings = {
        pinHash,
        isLocked: false,
      };
      
      await storageService.saveSettings(settings);
      onUnlock();
    } catch (error) {
      console.error('Error setting up PIN:', error);
      setError('Failed to set up PIN. Please try again.');
    }
  };

  const handlePinVerification = async () => {
    try {
      const settings = await storageService.getSettings();
      
      if (!settings.pinHash) {
        setError('No PIN found. Please set up a new PIN.');
        setHasExistingPin(false);
        return;
      }

      const isValid = await verifyPin(pin, settings.pinHash);
      
      if (isValid) {
        // Update settings to show unlocked state
        await storageService.saveSettings({ ...settings, isLocked: false });
        onUnlock();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Failed to verify PIN. Please try again.');
    }
  };

  const resetPinSetup = () => {
    setIsSettingUp(false);
    setPin('');
    setConfirmPin('');
    setError('');
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="pin-lock loading">
        <div className="pin-lock-content">
          <h2>🔒 Better Together</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pin-lock">
      <div className="pin-lock-content">
        <h2>🔒 Better Together</h2>
        <p className="subtitle">Your private space for love and connection</p>
        
        {!hasExistingPin ? (
          <form onSubmit={handleSubmit} className="pin-form">
            <h3>{!isSettingUp ? 'Set Up Your PIN' : 'Confirm Your PIN'}</h3>
            <p className="instruction">
              {!isSettingUp 
                ? 'Create a PIN to secure your private thoughts and moments'
                : 'Please enter your PIN again to confirm'
              }
            </p>
            
            <input
              type="password"
              value={!isSettingUp ? pin : confirmPin}
              onChange={(e) => !isSettingUp ? setPin(e.target.value) : setConfirmPin(e.target.value)}
              placeholder={!isSettingUp ? 'Enter your PIN' : 'Confirm your PIN'}
              className="pin-input"
              autoFocus
              maxLength={20}
            />
            
            {error && <p className="error">{error}</p>}
            
            <div className="button-group">
              <button type="submit" className="primary-button">
                {!isSettingUp ? 'Continue' : 'Set PIN'}
              </button>
              
              {isSettingUp && (
                <button type="button" onClick={resetPinSetup} className="secondary-button">
                  Back
                </button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="pin-form">
            <h3>Enter Your PIN</h3>
            <p className="instruction">Welcome back! Please enter your PIN to continue</p>
            
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="pin-input"
              autoFocus
              maxLength={20}
            />
            
            {error && <p className="error">{error}</p>}
            
            <button type="submit" className="primary-button">
              Unlock
            </button>
          </form>
        )}
        
        <p className="privacy-note">
          💝 Your data is stored securely on your device and never leaves it
        </p>
      </div>
    </div>
  );
}