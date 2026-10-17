/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  ChangelogPopup,
  ChecklistWidget,
  FeatureAnnouncement,
  HelpPanel,
  InlineHelp,
  OnboardingModal,
  ProductTour,
  TipsCarousel,
} from '../components/feedback/Guidance';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function buttonByText(root: ParentNode, label: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find((b) => b.textContent === label);
}

function openDialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"][data-open="true"]');
}

describe('InlineHelp (batch 99)', () => {
  it('opens the explanation on click and closes on Escape', () => {
    const { container, unmount } = render(
      <InlineHelp title="What is an SKU?">
        Stock keeping unit — the unique code for one product variant.
      </InlineHelp>,
    );
    const trigger = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Help'); // sr-only name

    act(() => fire(trigger, 'click'));
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(container.textContent).toContain('What is an SKU?');
    expect(container.textContent).toContain('Stock keeping unit');

    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    unmount();
  });

  it('accepts a custom text label', () => {
    const { container, unmount } = render(<InlineHelp label="What's this?">Body copy.</InlineHelp>);
    expect(container.textContent).toContain("What's this?");
    unmount();
  });
});

describe('HelpPanel (batch 99)', () => {
  it('renders the right-side modal with article links and closes via ✕', () => {
    let closes = 0;
    const { unmount } = render(
      <HelpPanel
        open
        onClose={() => closes++}
        items={[
          { id: 'a', label: 'Shipping times', description: 'When orders arrive.' },
          { id: 'b', label: 'Returns', href: '/help/returns' },
        ]}
      >
        <p>Intro copy</p>
      </HelpPanel>,
    );
    const dialog = openDialog() as HTMLElement;
    expect(dialog.getAttribute('data-side')).toBe('right');
    expect(dialog.textContent).toContain('Help');
    expect(dialog.textContent).toContain('Intro copy');
    expect(dialog.textContent).toContain('Shipping times');
    const link = dialog.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/help/returns');

    const close = dialog.querySelector('[aria-label="Close"]') as HTMLButtonElement;
    act(() => close.click());
    expect(closes).toBe(1);
    unmount();
  });
});

describe('ProductTour (batch 99)', () => {
  it('steps forward/back, finishes, skips and reacts to Escape', () => {
    const events: string[] = [];
    const { unmount } = render(
      <ProductTour
        open
        steps={[
          { id: 'one', title: 'First stop', description: 'Welcome.' },
          { id: 'two', title: 'Second stop' },
        ]}
        onStepChange={(i) => events.push(`step:${i}`)}
        onComplete={() => events.push('complete')}
        onSkip={() => events.push('skip')}
      />,
    );
    const card = document.querySelector('[data-tour-card]') as HTMLElement;
    expect(card.textContent).toContain('Step 1 of 2');
    expect(card.textContent).toContain('First stop');
    expect(card.textContent).toContain('Welcome.');
    expect(document.querySelector('[data-tour-scrim]')).not.toBeNull();
    expect(document.querySelector('[data-tour-spotlight]')).toBeNull(); // no target

    act(() => (buttonByText(card, 'Next') as HTMLButtonElement).click());
    expect(card.textContent).toContain('Step 2 of 2');
    expect(card.textContent).toContain('Second stop');
    expect(events).toContain('step:1');

    act(() => (buttonByText(card, 'Back') as HTMLButtonElement).click());
    expect(card.textContent).toContain('Step 1 of 2');

    act(() => (buttonByText(card, 'Next') as HTMLButtonElement).click());
    act(() => (buttonByText(card, 'Finish') as HTMLButtonElement).click());
    expect(events).toContain('complete');

    act(() => (buttonByText(card, 'Skip') as HTMLButtonElement).click());
    expect(events).toContain('skip');

    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(events.filter((e) => e === 'skip').length).toBe(2);
    unmount();
  });

  it('jump via dots and controlled index', () => {
    const changes: number[] = [];
    const { unmount } = render(
      <ProductTour
        open
        step={1}
        steps={[
          { id: 'one', title: 'One' },
          { id: 'two', title: 'Two' },
        ]}
        onStepChange={(i) => changes.push(i)}
      />,
    );
    const card = document.querySelector('[data-tour-card]') as HTMLElement;
    // Controlled: stays on step 2 even when dots request index 0.
    expect(card.textContent).toContain('Step 2 of 2');
    const dot = card.querySelector('[aria-label="Go to page 1"]') as HTMLButtonElement;
    act(() => dot.click());
    expect(changes).toEqual([0]);
    expect(card.textContent).toContain('Step 2 of 2');
    unmount();
  });

  it('renders the spotlight box when the step has a matching target', () => {
    function Harness() {
      return (
        <div>
          <div id="tour-target">Target</div>
          <ProductTour
            open
            steps={[{ id: 's', title: 'Spot me', target: '#tour-target' }]}
            onSkip={() => {}}
          />
        </div>
      );
    }
    const { unmount } = render(<Harness />);
    const spot = document.querySelector('[data-tour-spotlight]') as HTMLElement;
    expect(spot).not.toBeNull();
    expect(spot.getAttribute('aria-hidden')).toBe('true');
    expect(spot.getAttribute('style')).toContain('width: 8px'); // 0 + padding
    unmount();
  });

  it('renders nothing while closed', () => {
    const { container, unmount } = render(
      <ProductTour open={false} steps={[{ id: 's', title: 'Hidden' }]} />,
    );
    expect(document.querySelector('[data-tour-card]')).toBeNull();
    expect(container.textContent ?? '').toBe('');
    unmount();
  });
});

describe('ChecklistWidget (batch 99)', () => {
  it('reports progress and fires toggle + onDone on completion', () => {
    const events: string[] = [];
    const { container, unmount } = render(
      <ChecklistWidget
        items={[
          { id: 'profile', label: 'Complete your profile', done: true },
          { id: 'invite', label: 'Invite a teammate' },
        ]}
        onToggle={(id, done) => events.push(`${id}:${done}`)}
        onDone={() => events.push('done')}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('1 of 2 done');
    const bar = root.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('50');

    const doneRow = root.querySelector('[aria-label="Complete your profile"]') as HTMLElement;
    expect(doneRow.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('.line-through')).not.toBeNull();

    const toggle = root.querySelector('[aria-label="Invite a teammate"]') as HTMLButtonElement;
    act(() => toggle.click());
    expect(events).toEqual(['invite:true', 'done']);
    unmount();
  });
});

describe('TipsCarousel (batch 99)', () => {
  it('cycles tips with wrap-around, dots and reports changes', () => {
    const changes: number[] = [];
    const { container, unmount } = render(
      <TipsCarousel
        tips={[
          { id: 'a', title: 'Drag to reorder', body: 'Rows move with the grip.' },
          { id: 'b', title: 'Press / to search' },
        ]}
        onIndexChange={(i) => changes.push(i)}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('Tip 1 of 2');
    expect(root.textContent).toContain('Drag to reorder');

    act(() => (buttonByText(root, 'Next tip') as HTMLButtonElement).click());
    expect(root.textContent).toContain('Tip 2 of 2');
    expect(root.textContent).toContain('Press / to search');

    act(() => (buttonByText(root, 'Next tip') as HTMLButtonElement).click());
    expect(root.textContent).toContain('Tip 1 of 2'); // wraps

    const dot = root.querySelector('[aria-label="Go to page 2"]') as HTMLButtonElement;
    act(() => dot.click());
    expect(changes.at(-1)).toBe(1);
    unmount();
  });
});

describe('FeatureAnnouncement (batch 99)', () => {
  it('shows NEW chip trigger, card content, CTA and dismiss', () => {
    const events: string[] = [];
    const { container, unmount } = render(
      <FeatureAnnouncement
        title="Bulk edit is here"
        description="Update many rows at once."
        media={<div data-testid="shot">screenshot</div>}
        ctaLabel="Try it"
        onCta={() => events.push('cta')}
        onDismiss={() => events.push('dismiss')}
      />,
    );
    const trigger = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    expect(trigger.textContent).toContain('What’s new');
    expect(trigger.textContent).toContain('New');

    act(() => fire(trigger, 'click'));
    expect(container.textContent).toContain('Bulk edit is here');
    expect(container.textContent).toContain('Update many rows at once.');
    expect(container.querySelector('svg, [data-testid="shot"]')).not.toBeNull();

    act(() => (buttonByText(container, 'Try it') as HTMLButtonElement).click());
    act(() => (buttonByText(container, 'Got it') as HTMLButtonElement).click());
    expect(events).toEqual(['cta', 'dismiss']);
    unmount();
  });
});

describe('ChangelogPopup (batch 99)', () => {
  it('lists versions with latest chip, bullets and view-all link', () => {
    const { container, unmount } = render(
      <ChangelogPopup
        entries={[
          {
            version: '2.1.0',
            date: 'Oct 16',
            title: 'Faster tables',
            latest: true,
            items: ['Virtual scrolling', 'Frozen columns'],
          },
          { version: '2.0.4', title: 'Fixes' },
        ]}
        viewAllHref="/releases"
      />,
    );
    const trigger = container.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    expect(trigger.textContent).toContain('Changelog');

    act(() => fire(trigger, 'click'));
    expect(container.textContent).toContain('What changed');
    expect(container.textContent).toContain('v2.1.0');
    expect(container.textContent).toContain('Latest');
    expect(container.textContent).toContain('Virtual scrolling');
    expect(container.textContent).toContain('v2.0.4');
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/releases');
    unmount();
  });
});

describe('OnboardingModal (batch 99)', () => {
  it('renders brand, features, and fires start/skip/Escape', () => {
    const events: string[] = [];
    const { unmount } = render(
      <OnboardingModal
        open
        onClose={() => events.push('close')}
        onStart={() => events.push('start')}
        brand={<span>ACME</span>}
        description="Three things to set up."
        features={[
          { id: 'f1', title: 'Connect your store', description: 'Two-way sync.' },
          { id: 'f2', title: 'Invite the team' },
        ]}
      />,
    );
    const dialog = openDialog() as HTMLElement;
    expect(dialog.textContent).toContain('Welcome aboard');
    expect(dialog.textContent).toContain('ACME');
    expect(dialog.textContent).toContain('Connect your store');
    expect(dialog.textContent).toContain('Two-way sync.');
    expect(dialog.querySelectorAll('li svg').length).toBe(2); // default Sparkles icons

    act(() => (buttonByText(dialog, 'Get started') as HTMLButtonElement).click());
    act(() => (buttonByText(dialog, 'Skip') as HTMLButtonElement).click());
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(events).toEqual(['start', 'close', 'close']);
    unmount();
  });
});
