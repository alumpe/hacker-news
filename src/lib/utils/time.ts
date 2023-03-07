export const timeAgo = (timeAsNumber: number) => {
  const currentTime = Math.round(Date.now() / 1000); // in seconds since 1st January 1970

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });

  const diffSeconds = timeAsNumber - currentTime;
  const diffMinutes = Math.ceil(diffSeconds / 60);
  const diffHours = Math.ceil(diffSeconds / (60 * 60));
  const diffDays = Math.ceil(diffSeconds / (60 * 60 * 24));

  if (diffDays) return rtf.format(diffDays, "days");
  if (diffHours) return rtf.format(diffHours, "hours");
  if (diffMinutes) return rtf.format(diffMinutes, "minutes");

  return rtf.format(diffSeconds, "seconds");
};
