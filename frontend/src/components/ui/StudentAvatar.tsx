import { useEffect, useState } from 'react';
import { DefaultAvatar } from './DefaultAvatar';

// A student's avatar: the uploaded photo when set (falling back to the default
// avatar if the image can't load), otherwise the default avatar. Always
// circular; the `className` prop controls the size (e.g. "h-24 w-24").
export function StudentAvatar({
  photoUrl,
  alt = 'Profile photo',
  className = '',
}: {
  photoUrl?: string | null;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  // Reset the broken-image flag when the photo changes, so a fresh upload
  // (new photoUrl) recovers from a previously-failed load.
  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  if (photoUrl && !failed) {
    return (
      <img
        key={photoUrl}
        src={photoUrl}
        alt={alt}
        onError={() => setFailed(true)}
        className={`inline-block rounded-full object-cover ${className}`}
      />
    );
  }

  return <DefaultAvatar className={className} />;
}
