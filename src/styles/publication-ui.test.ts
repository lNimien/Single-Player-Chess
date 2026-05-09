import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();

describe('publication mobile CSS contracts', () => {
  it('should reserve viewport gutters in board sizing to prevent 375px horizontal scroll', async () => {
    const variablesCss = await readFile(join(projectRoot, 'src/styles/variables.css'), 'utf8');

    expect(variablesCss).toContain('--mobile-viewport-gutter: 16px');
    expect(variablesCss).toContain('--board-size: min(calc(100vw - var(--mobile-viewport-gutter)), 608px)');
  });

  it('should remove square desktop minimums so the board can fit small phones', async () => {
    const squareCss = await readFile(join(projectRoot, 'src/components/Square/Square.css'), 'utf8');

    expect(squareCss).toContain('min-width: 0');
    expect(squareCss).toContain('min-height: 0');
  });

  it('should use a compact mobile breakpoint for stacked app and panel spacing', async () => {
    const appCss = await readFile(join(projectRoot, 'src/App.css'), 'utf8');
    const panelCss = await readFile(join(projectRoot, 'src/components/Panel/Panel.css'), 'utf8');

    expect(appCss).toContain('@media (max-width: 480px)');
    expect(appCss).toContain('padding-inline: var(--space-1)');
    expect(panelCss).toContain('@media (max-width: 480px)');
    expect(panelCss).toContain('max-height: none');
  });
});
