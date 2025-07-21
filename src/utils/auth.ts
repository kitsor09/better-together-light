// Simple hash function for PIN (not cryptographically secure, but sufficient for privacy)
async function simpleHash(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'better-together-salt');
  
  if (crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

export async function hashPin(pin: string): Promise<string> {
  return await simpleHash(pin);
}

export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  const pinHash = await simpleHash(pin);
  return pinHash === hashedPin;
}

export function validatePin(pin: string): { isValid: boolean; message?: string } {
  if (!pin) {
    return { isValid: false, message: 'PIN cannot be empty' };
  }
  
  if (pin.length < 4) {
    return { isValid: false, message: 'PIN must be at least 4 characters' };
  }
  
  if (pin.length > 20) {
    return { isValid: false, message: 'PIN cannot be longer than 20 characters' };
  }
  
  return { isValid: true };
}