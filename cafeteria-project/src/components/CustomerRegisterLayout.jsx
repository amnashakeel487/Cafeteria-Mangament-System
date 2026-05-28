import PortalLoginLayout from './PortalLoginLayout';
import { getSecondaryButtonClass, PORTAL_THEMES } from './portalLoginThemes';

export default function CustomerRegisterLayout({ children, onSignInClick }) {
  const theme = PORTAL_THEMES.customer;
  const copyOverrides = theme.registerCopy || {};

  const secondaryAction = onSignInClick ? (
    <button type="button" onClick={onSignInClick} className={getSecondaryButtonClass('customer')}>
      Already have an account? Sign In →
    </button>
  ) : null;

  return (
    <PortalLoginLayout
      themeKey="customer"
      copyOverrides={copyOverrides}
      secondaryAction={secondaryAction}
    >
      {children}
    </PortalLoginLayout>
  );
}
