import { AppleClassic } from './variants/AppleClassic';
import { AppleEditorial } from './variants/AppleEditorial';
import { AppleStamped } from './variants/AppleStamped';
import { Wordmark } from './Wordmark';

// Active logo variant. Swap this to try a different mark.
// Options: 'classic' | 'editorial' | 'stamped'
type LogoVariant = 'classic' | 'editorial' | 'stamped';
const ACTIVE_VARIANT: LogoVariant = 'classic';

const ICONS: Record<LogoVariant, React.ComponentType<{ size?: number }>> = {
  classic: AppleClassic,
  editorial: AppleEditorial,
  stamped: AppleStamped,
};

interface LogoProps {
  iconOnly?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ iconOnly = false, size = 32, className = '' }: LogoProps) {
  const Icon = ICONS[ACTIVE_VARIANT];

  if (iconOnly) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Icon size={size} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icon size={size} />
      <Wordmark />
    </span>
  );
}
