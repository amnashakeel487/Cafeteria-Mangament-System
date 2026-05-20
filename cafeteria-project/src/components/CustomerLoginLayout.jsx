import PortalLoginLayout, {
  PortalLoginErrorAlert,
  PortalLoginField,
} from './PortalLoginLayout';
import { getSecondaryButtonClass } from './portalLoginThemes';

export { PortalLoginErrorAlert as CustomerLoginErrorAlert, PortalLoginField as CustomerLoginField };

export default function CustomerLoginLayout({ children, onRegisterClick, secondaryAction }) {
  const sec =
    secondaryAction ??
    (onRegisterClick ? (
      <button type="button" onClick={onRegisterClick} className={getSecondaryButtonClass('customer')}>
        Don&apos;t have an account? Register →
      </button>
    ) : null);

  return (
    <PortalLoginLayout themeKey="customer" secondaryAction={sec}>
      {children}
    </PortalLoginLayout>
  );
}
