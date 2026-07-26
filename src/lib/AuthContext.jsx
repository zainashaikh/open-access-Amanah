import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      const baseUrl = appParams.appBaseUrl || 'https://base44.app';
      
      try {
        if (!appParams.appId || appParams.appId === 'untitled' || appParams.appId === 'demo') {
          await checkUserAuth();
          setIsLoadingPublicSettings(false);
          return;
        }

        const res = await fetch(`${baseUrl}/api/apps/public/prod/public-settings/by-id/${appParams.appId}`, {
          headers: {
            'X-App-Id': appParams.appId || '',
            ...(appParams.token ? { 'Authorization': `Bearer ${appParams.token}` } : {})
          }
        }).catch(() => null);

        if (res && res.ok) {
          const publicSettings = await res.json().catch(() => null);
          if (publicSettings) setAppPublicSettings(publicSettings);
        } else if (res && res.status === 403) {
          const appErrorData = await res.json().catch(() => ({}));
          const reason = appErrorData?.extra_data?.reason;
          if (reason === 'auth_required') {
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          } else if (reason === 'user_not_registered') {
            setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
          } else if (reason) {
            setAuthError({ type: reason, message: appErrorData.message || 'Access denied' });
          }
        }
        await checkUserAuth();
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        await checkUserAuth();
        setIsLoadingPublicSettings(false);
      }
    } catch (error) {
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.warn('User auth check handled with fallback:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
