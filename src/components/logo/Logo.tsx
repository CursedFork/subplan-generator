import { PencilClassic } from './variants/PencilClassic';
import { PencilEditorial } from './variants/PencilEditorial';
import { PencilStamped } from './variants/PencilStamped';
import { Wordmark } from './Wordmark';

// Active logo variant. Swap this to try a different mark.
// Options: 'classic' | 'editorial' | 'stamped'
type LogoVariant = 'classic' | 'editorial' | 'stamped';
const ACTIVE_VARIANT: LogoVariant = 'classic';

const ICONS: Record<LogoVariant, React.ComponentType<{ size?: number }>> = {
  classic:   PencilClassic,
  editorial: PencilEditorial,
  stamped:   PencilStamped,
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
