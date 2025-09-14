import { useProfileSummary } from '@/hooks/useProfileSummary';
import { ProfileBadgesSkeleton } from './ProfileSkeleton';
import type { SweetSpotProfile } from '@/lib/sweetspot/types';

type ProfileBadgesProps = {
  profile?: SweetSpotProfile | null;
  showKeywords?: boolean;
  className?: string;
  keywordsLimit?: number;
  showIcons?: boolean;
  isLoading?: boolean;
};

export function ProfileBadges({
  profile,
  showKeywords = true,
  className = '',
  keywordsLimit = 10,
  showIcons = true,
  isLoading = false,
}: ProfileBadgesProps) {
  const profileState = useProfileSummary(profile);

  if (isLoading || !profileState) {
    return <ProfileBadgesSkeleton className={className} />;
  }

  const { summary, badges } = profileState;
  const orderedBadges = Object.entries(badges).sort(
    ([, a]: [string, any], [, b]: [string, any]) =>
      (a.priority ?? 99) - (b.priority ?? 99) || a.label.localeCompare(b.label),
  );
  const limitedKeywords = summary.topKeywords?.slice(0, keywordsLimit) ?? [];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {orderedBadges.map(([key, badge]) => (
        <span
          key={key}
          className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium"
        >
          {showIcons && badge.icon && <span className="mr-1">{badge.icon}</span>}
          {badge.label}
        </span>
      ))}
      {showKeywords && limitedKeywords.length > 0 && (
        <span className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium">
          {limitedKeywords.join(', ')}
          <span className="ml-1 text-gray-400">
            ({limitedKeywords.length} sur {summary.topKeywords?.length ?? 0})
          </span>
        </span>
      )}
    </div>
  );
}

export function ProfileBadgesCompact({
  profile,
  showKeywords = true,
  className = '',
  keywordsLimit = 10,
  showIcons = true,
  isLoading = false,
}: ProfileBadgesProps) {
  const profileState = useProfileSummary(profile);

  if (isLoading || !profileState) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <div className="h-4 w-10 rounded bg-gray-200" />
        <div className="h-1 w-1 rounded-full bg-gray-300" />
        <div className="h-4 w-8 rounded bg-gray-200" />
      </div>
    );
  }

  const { summary, badges } = profileState;
  const orderedBadges = Object.entries(badges).sort(
    ([, a]: [string, any], [, b]: [string, any]) =>
      (a.priority ?? 99) - (b.priority ?? 99) || a.label.localeCompare(b.label),
  );
  const limitedKeywords = summary.topKeywords?.slice(0, keywordsLimit) ?? [];

  return (
    <div className={`flex gap-1 ${className}`}>
      {orderedBadges.map(([key, badge]) => (
        <span
          key={key}
          className="inline-flex items-center rounded bg-gray-100 px-1 py-0.5 text-xs font-medium"
        >
          {showIcons && badge.icon && <span className="mr-1">{badge.icon}</span>}
          {badge.label}
        </span>
      ))}
      {showKeywords && limitedKeywords.length > 0 && (
        <span className="inline-flex items-center rounded bg-blue-100 px-1 py-0.5 text-xs font-medium">
          {limitedKeywords.join(', ')}
        </span>
      )}
    </div>
  );
}
