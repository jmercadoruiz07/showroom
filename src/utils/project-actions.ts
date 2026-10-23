export type ProjectAction = {
  label: string;
  href: string;
  icon: 'play';
};

/** Each action is announced in a description by a `<marker>: <link>` line, e.g. "PLAY AT: <a href>…</a>". */
const ACTIONS: { marker: string; label: string; icon: ProjectAction['icon'] }[] = [
  { marker: 'PLAY AT', label: 'PLAY', icon: 'play' },
];

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

/**
 * Finds the action links in a project description. Each matched line is removed from the
 * description together with the whitespace before it; the links come back as actions.
 */
export const extractActions = (
  description: string | undefined,
): { description: string | undefined; actions: ProjectAction[] } => {
  if (description === undefined) return { description, actions: [] };

  let remaining = description;
  const actions: ProjectAction[] = [];

  for (const { marker, label, icon } of ACTIONS) {
    const line = new RegExp(
      `\\s*(?:<p>\\s*)?${marker}:\\s*<a\\b[^>]*?\\bhref="([^"]*)"[^>]*>[\\s\\S]*?</a>\\s*(?:</p>)?`,
      'i',
    );
    const match = remaining.match(line);
    if (!match) continue;

    const href = decodeEntities(match[1]);
    if (!/^https?:\/\//i.test(href)) continue;

    remaining = remaining.replace(line, '');
    actions.push({ label, href, icon });
  }

  return { description: remaining, actions };
};
