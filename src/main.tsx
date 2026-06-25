import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider }    from '@/store/toast';
import { AuthProvider }     from '@/store/auth';
import { ResourceProvider } from '@/store/resources';
import { CartProvider }     from '@/store/cart';
import { DemandProvider }   from '@/store/demand';
import { ToastViewport }    from '@/shared/components/ui/ToastViewport';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <ResourceProvider>
          {/* DemandProvider wraps CartProvider so demand state outlives any cart reset */}
          <DemandProvider>
            <CartProvider>
              <App />
              <ToastViewport />
            </CartProvider>
          </DemandProvider>
        </ResourceProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
);
