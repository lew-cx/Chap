/**
 * The skin control and the token inspector.
 *
 * A fifth skin-aware file, and the only one that is not a layout. The rule is
 * that no *screen* may branch on the skin; the control surface for a setting
 * necessarily knows the setting, and the token inspector's whole job is to show
 * the values changing. Confining both to `shell/` keeps Settings itself
 * skin-blind — it renders this component and knows nothing.
 *
 * The inspector reads `--skin-*` back out of the live document rather than from
 * a list in TypeScript, so it cannot drift from tokens.css. It is the most
 * direct evidence for "two token sets, one component tree": every value here
 * changes and no component does.
 */

import { useEffect, useState } from 'react';

import { Section } from '../components/Screen.tsx';
import { useSkin } from '../store/skin.ts';

export function SkinPanel() {
  const skin = useSkin((state) => state.skin);
  const setSkin = useSkin((state) => state.setSkin);
  const tokens = useSkinTokens(skin);

  return (
    <>
      <Section title="skin" hint="⌘\ anywhere">
        <div className="flex gap-2">
          {(['bench', 'showroom'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="chip"
              aria-pressed={skin === option}
              onClick={() => setSkin(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="micro-label mt-2">
          bench is the working instrument panel; showroom is the display surface.
          Same components, different token values.
        </p>
      </Section>

      <Section title="token inspector" hint={`${tokens.length} live values`}>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {tokens.map(([name, value]) => (
                <tr key={name} className="row">
                  <td
                    className="numeric pr-4"
                    style={{ color: 'var(--skin-muted)', paddingBlock: '0.2rem' }}
                  >
                    {name}
                  </td>
                  <td className="numeric pr-4" style={{ paddingBlock: '0.2rem' }}>
                    {value}
                  </td>
                  <td style={{ width: '4rem' }}>
                    {/* A swatch when the value is a colour, so the table reads as
                        a palette rather than a wall of oklch(). */}
                    {/^(oklch|#|rgb|color-mix)/.test(value) && (
                      <span
                        className="inline-block h-3 w-10 rounded-(--radius-control)"
                        style={{ background: value, border: '1px solid var(--skin-line)' }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

/** Every `--skin-*` property the document currently resolves. */
function useSkinTokens(skin: string): [string, string][] {
  const [tokens, setTokens] = useState<[string, string][]>([]);

  useEffect(() => {
    const computed = getComputedStyle(document.documentElement);
    const names = new Set<string>();

    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // A cross-origin sheet. There are none today; be safe anyway.
      }
      for (const rule of rules) {
        if (!(rule instanceof CSSStyleRule)) continue;
        for (const property of rule.style) {
          if (property.startsWith('--skin-')) names.add(property);
        }
      }
    }

    setTokens(
      [...names]
        .sort()
        .map((name) => [name, computed.getPropertyValue(name).trim()] as [string, string]),
    );
  }, [skin]);

  return tokens;
}
