/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AppNotificationsContext = createContext(null);

export function AppNotificationsProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const push = (type, message) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current, { id, type, message }]);
    window.setTimeout(() => dismiss(id), 4000);
  };

  const value = {
    success: (message) => push("success", message),
    error: (message) => push("danger", message),
    info: (message) => push("info", message),
  };

  return (
    <AppNotificationsContext.Provider value={value}>
      {children}

      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        <div className="d-grid gap-2">
          {items.map((item) => (
            <div key={item.id} className={`alert alert-${item.type} alert-dismissible fade show shadow-sm mb-0`} role="alert">
              {item.message}
              <button type="button" className="btn-close" aria-label="Close" onClick={() => dismiss(item.id)} />
            </div>
          ))}
        </div>
      </div>
    </AppNotificationsContext.Provider>
  );
}

export function useAppNotifications() {
  const value = useContext(AppNotificationsContext);

  if (!value) {
    throw new Error("useAppNotifications must be used within AppNotificationsProvider.");
  }

  return value;
}
