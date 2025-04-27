import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the user data
 * @param token JWT token to verify
 * @returns User data from the token
 */
export async function verifyAuth(token: string | undefined): Promise<DecodedToken | null> {
  if (!token) {
    return null;
  }

  try {
    // In a real app, you'd use a proper JWT verification
    // This is a simple implementation for development purposes
    
    // For server-side JWT verification, you would use something like:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    
    // For client-side, we'll decode and do some basic validation
    const decoded = jwt_decode(token) as DecodedToken;
    
    if (!decoded || !decoded.id || !decoded.role) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Simple JWT decode function (for development only)
 * In production, use a proper JWT library with verification
 */
function jwt_decode(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
