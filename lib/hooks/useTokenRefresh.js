// lib/hooks/useTokenRefresh.js
'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook that automatically refreshes the authentication token before it expires
 * Keeps user logged in without interruption
 */
export function useTokenRefresh() {
  const refreshTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('[Token Refresh] No token found');
        return false;
      }

      console.log('[Token Refresh] Attempting to refresh token...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        console.log('[Token Refresh] ✅ Token refreshed successfully');
        
        // Schedule next refresh (23 hours from now, giving 1 hour buffer)
        scheduleNextRefresh();
        return true;
      } else {
        console.log('[Token Refresh] ❌ Failed to refresh:', data.error);
        return false;
      }
    } catch (error) {
      console.error('[Token Refresh] Error:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const scheduleNextRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh token every 23 hours
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, 23 * 60 * 60 * 1000);

    console.log('[Token Refresh] Scheduled next refresh in 23 hours');
  }, [refreshToken]);

  useEffect(() => {
    // Check if token exists and schedule refresh on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      scheduleNextRefresh();
    }

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleNextRefresh]);

  return { refreshToken };
}
