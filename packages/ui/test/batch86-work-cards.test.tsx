import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  AppCard,
  BusinessCard,
  ContactCard,
  FeatureCard,
  FileCard,
  FolderCard,
  IntegrationCard,
  MetricAlertCard,
  NotificationCard,
  ProjectCard,
  ReviewCard,
  TaskCard,
  TeamMemberCard,
} from '../components/data/WorkCards';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('ContactCard', () => {
  test('shows name, role, company and contact links', () => {
    const { container, unmount } = render(
      createElement(ContactCard, {
        name: 'Ada Lovelace',
        role: 'Engineer',
        company: 'Analytical',
        email: 'ada@example.com',
        phone: '+15551234',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Ada Lovelace');
    expect(text).toContain('Engineer');
    expect(text).toContain('Analytical');
    expect(container.querySelector('a[href="mailto:ada@example.com"]')).not.toBeNull();
    expect(container.querySelector('a[href="tel:+15551234"]')).not.toBeNull();
    unmount();
  });

  test('fires onEmail', () => {
    let clicked = 0;
    const { container, unmount } = render(
      createElement(ContactCard, {
        name: 'X',
        onEmail: () => {
          clicked += 1;
        },
      }),
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(clicked).toBe(1);
    unmount();
  });
});

describe('BusinessCard', () => {
  test('shows rating, address, phone and trimmed website', () => {
    const { container, unmount } = render(
      createElement(BusinessCard, {
        name: 'Cafe',
        category: 'Coffee',
        rating: 4,
        reviews: 210,
        address: '1 Bean St',
        phone: '+15550000',
        website: 'https://cafe.example',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Coffee');
    expect(text).toContain('1 Bean St');
    expect(text).toContain('cafe.example');
    expect(text).not.toContain('https://cafe.example');
    expect(container.querySelector('[role="img"][aria-label="4 out of 5"]')).not.toBeNull();
    unmount();
  });
});

describe('TeamMemberCard', () => {
  test('shows role, bio, email and socials', () => {
    const { container, unmount } = render(
      createElement(TeamMemberCard, {
        name: 'Mia Okafor',
        role: 'Design lead',
        bio: 'Builds systems.',
        email: 'mia@example.com',
        socials: [{ label: 'GitHub', href: 'https://gh.example' }],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Design lead');
    expect(text).toContain('Builds systems.');
    expect(container.querySelector('a[href="mailto:mia@example.com"]')).not.toBeNull();
    expect(container.querySelector('a[href="https://gh.example"]')?.textContent).toBe('GitHub');
    unmount();
  });
});

describe('ReviewCard', () => {
  test('shows author, verified, rating, body and helpful', () => {
    let helpful = 0;
    const { container, unmount } = render(
      createElement(ReviewCard, {
        author: 'Sam',
        rating: 5,
        date: '2 days ago',
        title: 'Great',
        body: 'Loved it.',
        verified: true,
        helpfulCount: 12,
        onHelpful: () => {
          helpful += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Sam');
    expect(text).toContain('Verified');
    expect(text).toContain('Loved it.');
    expect(text).toContain('12');
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(helpful).toBe(1);
    unmount();
  });
});

describe('NotificationCard', () => {
  test('shows unread marker and fires read/dismiss', () => {
    let read = 0;
    let dismissed = 0;
    const { container, unmount } = render(
      createElement(NotificationCard, {
        title: 'Build finished',
        message: 'All green.',
        time: '1m ago',
        unread: true,
        onRead: () => {
          read += 1;
        },
        onDismiss: () => {
          dismissed += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Build finished');
    expect(text).toContain('All green.');
    expect(container.querySelector('[aria-label="unread"]')).not.toBeNull();
    const buttons = container.querySelectorAll('button');
    act(() => fire(buttons[0] as HTMLButtonElement, 'click'));
    act(() =>
      fire(container.querySelector('[aria-label="Dismiss"]') as HTMLButtonElement, 'click'),
    );
    expect(read).toBe(1);
    expect(dismissed).toBe(1);
    unmount();
  });
});

describe('TaskCard', () => {
  test('shows metadata and toggles completion', () => {
    let toggled = 0;
    const { container, unmount } = render(
      createElement(TaskCard, {
        title: 'Ship batch 86',
        description: 'Build the work cards.',
        done: false,
        priority: 'urgent',
        assignee: 'Ada',
        due: 'Tomorrow',
        tags: ['ui', 'batch'],
        onToggle: () => {
          toggled += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Ship batch 86');
    expect(text).toContain('urgent');
    expect(text).toContain('Ada');
    expect(text).toContain('Tomorrow');
    expect(text).toContain('ui');
    const toggle = container.querySelector('[aria-pressed]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    act(() => fire(toggle, 'click'));
    expect(toggled).toBe(1);
    unmount();
  });
});

describe('ProjectCard', () => {
  test('shows status, progress, members and task counts', () => {
    const { container, unmount } = render(
      createElement(ProjectCard, {
        name: 'Apollo',
        description: 'Redesign.',
        status: 'Active',
        progress: 60,
        members: [{ name: 'Ada' }, { name: 'Alan' }],
        due: 'Jun 1',
        doneCount: 3,
        taskCount: 8,
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Apollo');
    expect(text).toContain('Active');
    expect(text).toContain('60%');
    expect(text).toContain('3/8 tasks');
    expect(text).toContain('Jun 1');
    unmount();
  });
});

describe('FileCard', () => {
  test('shows kind, size, modified and fires download', () => {
    let downloads = 0;
    const { container, unmount } = render(
      createElement(FileCard, {
        name: 'Quarterly',
        kind: 'pdf',
        size: '2 MB',
        modified: 'Yesterday',
        onDownload: () => {
          downloads += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Quarterly');
    expect(text).toContain('pdf');
    expect(text).toContain('2 MB');
    expect(text).toContain('Yesterday');
    const button = container.querySelector(
      '[aria-label="Download Quarterly"]',
    ) as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(downloads).toBe(1);
    unmount();
  });
});

describe('FolderCard', () => {
  test('shows item count, modified and shared state', () => {
    const { container, unmount } = render(
      createElement(FolderCard, { name: 'Photos', itemCount: 3, modified: 'Mon', shared: true }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Photos');
    expect(text).toContain('3 items');
    expect(text).toContain('Mon');
    expect(text).toContain('Shared');
    unmount();
  });
});

describe('AppCard', () => {
  test('shows rating and install action', () => {
    let acted = 0;
    const { container, unmount } = render(
      createElement(AppCard, {
        name: 'Focus',
        description: 'Stay on task.',
        category: 'Productivity',
        rating: 4.5,
        installed: false,
        onAction: () => {
          acted += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Focus');
    expect(text).toContain('Productivity');
    expect(container.querySelector('[role="img"][aria-label="4.5 out of 5"]')).not.toBeNull();
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Install');
    act(() => fire(button, 'click'));
    expect(acted).toBe(1);
    unmount();
  });

  test('shows Open when installed', () => {
    const { container, unmount } = render(
      createElement(AppCard, { name: 'Focus', installed: true, onAction: () => {} }),
    );
    expect(container.querySelector('button')?.textContent).toContain('Open');
    unmount();
  });
});

describe('IntegrationCard', () => {
  test('shows connected badge and toggles', () => {
    let toggled = 0;
    const { container, unmount } = render(
      createElement(IntegrationCard, {
        name: 'Stripe',
        description: 'Payments',
        connected: true,
        onToggle: () => {
          toggled += 1;
        },
      }),
    );
    expect(container.textContent).toContain('Connected');
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Disconnect');
    act(() => fire(button, 'click'));
    expect(toggled).toBe(1);
    unmount();
  });
});

describe('FeatureCard', () => {
  test('shows title, description and link label', () => {
    const { container, unmount } = render(
      createElement(FeatureCard, {
        title: 'Realtime',
        description: 'Live updates.',
        href: '/docs/realtime',
        linkLabel: 'Read more',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Realtime');
    expect(text).toContain('Live updates.');
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/docs/realtime');
    expect(link.textContent).toContain('Read more');
    unmount();
  });
});

describe('MetricAlertCard', () => {
  test('shows status, value, threshold and trend', () => {
    let viewed = 0;
    const { container, unmount } = render(
      createElement(MetricAlertCard, {
        metric: 'Error rate',
        value: '4.2%',
        threshold: '2%',
        status: 'warning',
        message: 'Above target.',
        trend: 12,
        onView: () => {
          viewed += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Error rate');
    expect(text).toContain('4.2%');
    expect(text).toContain('Warning');
    expect(text).toContain('Threshold 2%');
    expect(text).toContain('Above target.');
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(viewed).toBe(1);
    unmount();
  });
});
