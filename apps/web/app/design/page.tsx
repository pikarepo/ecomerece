'use client';

import {
  Abbr,
  Accordion,
  AccordionItem,
  ActionSheet,
  AspectRatio,
  Avatar,
  Badge,
  Banner,
  BatteryIndicator,
  Bento,
  BentoCell,
  Bleed,
  BottomSheet,
  BottomTabBar,
  Breadcrumb,
  BusinessHours,
  Button,
  Card,
  Carousel,
  CartDrawer,
  type CartLine,
  Checkbox,
  Chip,
  ChipButton,
  ChoiceChip,
  Citation,
  Cluster,
  Code,
  Columns,
  Combobox,
  ConfirmDialog,
  ConnectionQuality,
  Container,
  CooldownButton,
  Countdown,
  CountdownButton,
  Cover,
  cn,
  DataBar,
  DataGrid,
  DatePicker,
  Definition,
  Display,
  Div,
  DoubleClickToConfirm,
  DropCap,
  Dropdown,
  Duration,
  EffectButton,
  Emoji,
  EmptyState,
  ErrorState,
  FadeInText,
  Field,
  FileUpload,
  FilterChip,
  FloatingPanel,
  Footnote,
  FootnoteList,
  FootnoteRef,
  Frame,
  focusRing,
  GaugeKPI,
  GlowButton,
  GradientBorderButton,
  GradientText,
  GroupedList,
  Gutter,
  Hashtag,
  Heading,
  Hide,
  HoldToConfirmButton,
  HoverCard,
  HStack,
  IconButton,
  IconRail,
  IconTile,
  Imposter,
  InlineBadge,
  Input,
  InputChip,
  JustifiedGallery,
  Kbd,
  KeyboardAvoidingView,
  LineClamp,
  Link,
  ListHeader,
  ListRow,
  MagneticButton,
  MasonryBoard,
  Mention,
  MetricCard,
  Modal,
  MosaicGrid,
  MosaicItem,
  MultiColumn,
  NumberInput,
  Offset,
  Orientation,
  OTP,
  OutlineText,
  Pagination,
  PinnedPanel,
  PipContainer,
  PopoutPanel,
  Popover,
  Progress,
  PromoCode,
  Pull,
  PullQuote,
  PullToRefresh,
  Push,
  Radio,
  Raised,
  Range,
  Rating,
  ReadMore,
  Reel,
  ResendCodeButton,
  RippleButton,
  SafeArea,
  SaveStatus,
  ScrambleText,
  ScrollArea,
  ScrollProgress,
  ScrollReveal,
  ScrollSpy,
  ScrollToTop,
  SearchField,
  SegmentedControl,
  SegmentedMeter,
  Select,
  Separator,
  ShimmerButton,
  Show,
  Sidebar,
  SidebarLayout,
  SidePanel,
  Skeleton,
  SkeletonTable,
  SkeletonText,
  SLAIndicator,
  Slider,
  Sparkline,
  SplitText,
  Stack,
  Stage3D,
  StatTile,
  StatusDot,
  StickyCtaBar,
  StickySidebar,
  StickyToc,
  StockIndicator,
  Stopwatch,
  Subtitle,
  SuggestionChip,
  Surface,
  SwipeActions,
  Swipeable,
  SwipeToConfirm,
  Switch,
  Switcher,
  SyncStatus,
  TabChip,
  skinRegistry,
  supportsBackdropFilter,
  supportsWebgl2,
  Table,
  Tabs,
  Tag,
  Text,
  Textarea,
  TextDiff,
  TimeAgo,
  Timeline,
  TimePicker,
  TimezoneClock,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  TopBar,
  TreeView,
  Typewriter,
  useInterval,
  usePrevious,
  useSkin,
  useToast,
  useToggle,
  VisuallyHidden,
  Well,
  WordRotator,
} from '@ecomerece/ui';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bell,
  Bold,
  Box,
  Calendar,
  ChevronRight,
  Copy,
  CreditCard,
  FileText,
  Globe,
  Home,
  Italic,
  Layers,
  Link as LinkIcon,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  Underline,
  Upload,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/* ─────────────────────────── helpers ─────────────────────────── */

const SKIN_PICKER_BASE = '/skins/';

function isSupported(id: string, dimension: 'flat' | 'layered' | '3d'): boolean {
  if (typeof window === 'undefined') return true;
  if (dimension === '3d') return supportsWebgl2();
  if (id === 'glass') return supportsBackdropFilter();
  return true;
}

function useThemeControl() {
  const [choice, setChoiceState] = useState<'auto' | 'light' | 'dark'>('auto');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') setChoiceState(stored);
    } catch {}
  }, []);
  const setChoice = (next: 'auto' | 'light' | 'dark') => {
    setChoiceState(next);
    const root = document.documentElement;
    if (next === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next === 'auto' ? '' : next);
    } catch {}
  };
  return { choice, setChoice };
}

/* ─────────────────────────── layout primitives ─────────────────────────── */

function Section({
  title,
  note,
  subtitle,
  children,
  className,
}: {
  title: string;
  note?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const sub = subtitle ?? note;
  return (
    <section className={cn('mt-10', className)}>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-ink-2">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="mb-3 text-sm font-medium text-ink-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>;
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{children}</div>;
}

/* ─────────────────────────── static data ─────────────────────────── */

const tableRows = [
  { id: 'A1', device: 'MacBook Pro 16″', status: 'synced', size: '84.2 GB', os: 'macOS 15.1' },
  { id: 'A2', device: 'Studio desktop', status: 'pending', size: '268.1 GB', os: 'Windows 11' },
  { id: 'A3', device: 'iPhone 15 Pro', status: 'synced', size: '31.5 GB', os: 'iOS 18.2' },
  { id: 'A4', device: 'Pixel 8', status: 'failed', size: '112.7 GB', os: 'Android 15' },
  { id: 'A5', device: 'iPad Air', status: 'synced', size: '54.3 GB', os: 'iPadOS 18.1' },
];

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
  { value: 'ca', label: 'Canada' },
  { value: 'br', label: 'Brazil' },
];

const navItems = [
  { icon: Home, label: 'Home', value: 'home' },
  { icon: Search, label: 'Search', value: 'search' },
  { icon: ShoppingBag, label: 'Orders', value: 'orders', badge: 2 },
  { icon: Settings, label: 'Settings', value: 'settings' },
];

const carouselSlides = [
  <div
    key="s1"
    className="mat-card flex h-44 items-center justify-center rounded-card text-2xl font-bold text-ink-2"
  >
    Slide 1 — Hero Banner
  </div>,
  <div
    key="s2"
    className="mat-raised flex h-44 items-center justify-center rounded-card text-2xl font-bold text-ink-2"
  >
    Slide 2 — Featured Products
  </div>,
  <div
    key="s3"
    className="mat-well flex h-44 items-center justify-center rounded-card text-2xl font-bold text-ink-2"
  >
    Slide 3 — Seasonal Promo
  </div>,
  <div
    key="s4"
    className="mat-card flex h-44 items-center justify-center rounded-card text-2xl font-bold text-ink-2"
  >
    Slide 4 — New Arrivals
  </div>,
];

const treeNodes = [
  {
    id: 'electronics',
    label: 'Electronics',
    children: [
      {
        id: 'phones',
        label: 'Phones',
        children: [
          { id: 'android', label: 'Android' },
          { id: 'ios', label: 'iOS' },
        ],
      },
      { id: 'laptops', label: 'Laptops' },
    ],
  },
  {
    id: 'clothing',
    label: 'Clothing',
    children: [
      { id: 'mens', label: "Men's" },
      { id: 'womens', label: "Women's" },
    ],
  },
  { id: 'books', label: 'Books' },
];

const timelineItems = [
  { title: 'Order placed', timestamp: '09:00', tone: 'default' as const },
  {
    title: 'Payment confirmed',
    description: 'Visa ending 4242',
    timestamp: '09:02',
    tone: 'success' as const,
  },
  {
    title: 'Dispatched',
    description: 'DHL tracking #7291X',
    timestamp: '14:35',
    tone: 'success' as const,
    active: true,
  },
  { title: 'Out for delivery', timestamp: 'Tomorrow' },
  { title: 'Delivered', tone: 'default' as const },
];

const skinEntries = Object.entries(skinRegistry).map(([id, e]) => ({
  id,
  label: e.skin.label,
  cost: e.skin.cost,
  a11yTier: e.skin.a11yTier,
  dimension: e.skin.dimension,
  needs: e.skin.needs,
  fallback: e.skin.fallback,
  group: 'group' in e ? e.group : 'everyday',
  note: 'note' in e ? e.note : undefined,
  swatch: e.swatch as [string, string],
}));

/* Stable timestamp so SSR and client hydration agree (no `new Date()` in render). */
const DEMO_SYNCED_AT = '2026-10-14T09:41:07.000Z';

/* ─────────────────────────── grid demo data ─────────────────────────── */

const gridRows = Array.from({ length: 6000 }, (_, i) => {
  const status = (['active', 'pending', 'archived'] as const)[i % 3];
  return {
    id: `row-${i}`,
    name: `Item ${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(5, '0')}`,
    price: Math.round((Math.random() * 120 + 4) * 100) / 100,
    status,
    created: new Date(2024, 0, 1 + (i % 365)).toISOString().slice(0, 10),
  };
});

const gridColumns = [
  { key: 'name', header: 'Name', cell: (r: (typeof gridRows)[number]) => r.name, sortable: true },
  { key: 'sku', header: 'SKU', cell: (r: (typeof gridRows)[number]) => r.sku, sortable: true },
  {
    key: 'price',
    header: 'Price',
    cell: (r: (typeof gridRows)[number]) => `£${(r.price).toFixed(2)}`,
    align: 'right' as const,
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (r: (typeof gridRows)[number]) => (
      <StatusDot
        tone={r.status === 'active' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}
        label={r.status}
      />
    ),
    sortable: true,
  },
  {
    key: 'created',
    header: 'Created',
    cell: (r: (typeof gridRows)[number]) => r.created,
    sortable: true,
  },
];

/* ─────────────────────────── chart data (bar demo) ─────────────────────────── */

type BarDatum = {
  label: string;
  value: number;
  tone: 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
};

const revenueBars: BarDatum[] = [
  { label: 'Mon', value: 62, tone: 'accent' },
  { label: 'Tue', value: 74, tone: 'accent' },
  { label: 'Wed', value: 58, tone: 'accent' },
  { label: 'Thu', value: 91, tone: 'success' },
  { label: 'Fri', value: 80, tone: 'accent' },
  { label: 'Sat', value: 44, tone: 'neutral' },
  { label: 'Sun', value: 36, tone: 'neutral' },
];

const inventoryBars: BarDatum[] = [
  { label: 'Electronics', value: 72, tone: 'accent' },
  { label: 'Clothing', value: 55, tone: 'success' },
  { label: 'Books', value: 38, tone: 'warning' },
  { label: 'Home', value: 24, tone: 'danger' },
];

function BarChart({ data, unit = '', max }: { data: BarDatum[]; unit?: string; max?: number }) {
  const peak = max ?? Math.max(...data.map((d) => d.value), 1);
  const toneClass: Record<BarDatum['tone'], string> = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    neutral: 'bg-ink-3',
  };
  return (
    <div className="flex items-end gap-3" role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[10px] font-medium text-ink-3">
            {d.value}
            {unit}
          </span>
          <div
            className={cn(
              'w-full rounded-t-sm transition-all duration-skin ease-skin',
              toneClass[d.tone],
            )}
            style={{ height: `${Math.round((d.value / peak) * 140)}px` }}
          />
          <span className="text-[10px] text-ink-3">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

type LineDatum = { label: string; values: number[] };

const conversionLines: LineDatum[] = [
  { label: 'W1', values: [30, 45] },
  { label: 'W2', values: [42, 58] },
  { label: 'W3', values: [55, 62] },
  { label: 'W4', values: [40, 49] },
  { label: 'W5', values: [66, 78] },
  { label: 'W6', values: [72, 85] },
];

function LineChart({ series, labels }: { series: LineDatum['values'][]; labels: string[] }) {
  const points = series.map((vals, si) =>
    vals
      .map((v, i) => {
        const x = (i / Math.max(vals.length - 1, 1)) * 100;
        const y = 100 - v;
        return `${x},${y}`;
      })
      .join(' '),
  );
  const strokeClass = ['stroke-accent', 'stroke-success'];
  return (
    <div className="flex flex-col gap-2" role="img" aria-label="Line chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
        {points.map((p, i) => (
          <polyline
            key={i}
            points={p}
            fill="none"
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
            className={strokeClass[i % strokeClass.length]}
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-ink-3">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function DesignQaPage() {
  const themeCtrl = useThemeControl();
  const { skin, setSkin, fidelity, setFidelity, ready } = useSkin(skinEntries, {
    skinBase: SKIN_PICKER_BASE,
  });

  const [tab, setTab] = useState<'all' | 'controls' | 'data' | 'feedback' | 'layout' | 'overlay'>(
    'all',
  );

  const [page2, setPage2] = useState(5);
  const [pageSize2, setPageSize2] = useState(25);

  const [hookOn, toggleHookOn] = useToggle(false);
  const [hookTicks, setHookTicks] = useState(0);
  const prevHookOn = usePrevious(hookOn);
  useInterval(() => setHookTicks((t) => t + 1), hookOn ? 1000 : null);

  const [tableSel, setTableSel] = useState<Array<string | number>>([]);
  const [tableSort, setTableSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'device',
    direction: 'asc',
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartLine[]>([
    { id: 'sku-1', name: 'Aero Tee', meta: 'Size M · Black', price: '$32.00', qty: 1 },
    { id: 'sku-2', name: 'Trail Cap', price: '$24.00', qty: 2, maxQty: 5 },
  ]);
  const [promoState, setPromoState] = useState<'available' | 'applied'>('available');
  const [pipExpanded, setPipExpanded] = useState(false);
  const [popoutOpen, setPopoutOpen] = useState(false);

  // Controls state
  const [sliderVal, setSliderVal] = useState(55);
  const [rangeVal, setRangeVal] = useState<[number, number]>([20, 75]);
  const [numVal, setNumVal] = useState(3);
  const [ratingVal, setRatingVal] = useState(3.5);
  const [search, setSearch] = useState('');
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week');
  const [country, setCountry] = useState<string | null>(null);
  const [otpVal, setOtpVal] = useState('');
  const [dateVal, setDateVal] = useState<string | null>(null);
  const [timeVal, setTimeVal] = useState<string | null>('09:30');
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [radioVal, setRadioVal] = useState('week');
  const [toolbar1, setToolbar1] = useState<Record<string, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [alignVal, setAlignVal] = useState('left');
  const [treeSelected, setTreeSelected] = useState<string | null>('laptops');
  const [treeExpanded] = useState(['electronics', 'phones']);

  // Overlays
  const [listOpen, setListOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Nav
  const [railTab, setRailTab] = useState('home');
  const [sidebarTab, setSidebarTab] = useState('account');
  const [topBarTitle, setTopBarTitle] = useState('Project workspace');

  // Charts
  const [chartRange, setChartRange] = useState<'week' | 'month'>('week');
  const chartBars = useMemo(
    () =>
      chartRange === 'week'
        ? revenueBars
        : ([revenueBars[0], revenueBars[2], revenueBars[4]].map((b) => ({
            ...b,
            value: b.value + 20,
          })) as BarDatum[]),
    [chartRange],
  );

  // Grid demo state
  const [gridSortColumn, setGridSortColumn] = useState<string | undefined>('created');
  const [gridSortDirection, setGridSortDirection] = useState<'asc' | 'desc'>('desc');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const { push } = useToast();

  const activeFormatLabel =
    [toolbar1.bold && 'Bold', toolbar1.italic && 'Italic', toolbar1.underline && 'Underline']
      .filter(Boolean)
      .join(', ') || 'none';

  const show = (t: typeof tab) => tab === 'all' || tab === t;

  return (
    <Stage3D onFallback={(fb) => setSkin(fb)}>
      <div className="mx-auto max-w-shell p-4 pb-24 sm:p-6">
        {/* ── breadcrumb ── */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dev', href: '/dev' },
            { label: 'Design QA' },
          ]}
          className="mb-4"
        />

        {/* ── top bar ── */}
        <TopBar
          title={topBarTitle}
          subtitle="Every @ecomerece/ui component in one screen."
          leading={<IconTile icon={Layers} tone="accent" />}
        />

        <p className="mt-3 max-w-2xl text-sm text-ink-2">
          Resize the browser to see navigation recompose. Every surface uses only <Kbd>mat-*</Kbd>{' '}
          roles and theme token utilities — no raw colours.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => push({ message: 'Design page ready', tone: 'success' })}
          >
            Open a toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              push({
                message: 'Saved dashboard layout',
                tone: 'success',
                action: { label: 'Undo', onAction: () => {} },
              })
            }
          >
            Toast with undo
          </Button>
          <Button
            variant="ghost"
            onClick={() => push({ message: 'Storage almost full', tone: 'warning' })}
          >
            Warning toast
          </Button>
          <IconButton label="Notifications">
            <Bell className="size-5" />
          </IconButton>
        </div>

        {/* ═══════════════ AXES ═══════════════ */}
        <Card
          title="Axes — Skin × Theme × Fidelity"
          description="Markup never knows which combination is active"
          className="mt-6"
        >
          <div className="flex flex-col gap-5">
            {(['everyday', 'expressive', 'dimensional'] as const).map((group) => (
              <div key={group}>
                <p className="mb-2 text-xs font-medium capitalize text-ink-3">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {skinEntries
                    .filter((e) => e.group === group)
                    .map((entry) => {
                      const supported = !ready || isSupported(entry.id, entry.dimension);
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => setSkin(entry.id)}
                          disabled={!supported}
                          aria-pressed={skin === entry.id}
                          title={[
                            entry.note,
                            entry.a11yTier === 'AA-with-fallback'
                              ? 'lower contrast fallback'
                              : null,
                            `${entry.cost} cost`,
                            entry.dimension === '3d' ? 'Requires WebGL — slab engine' : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                          className={cn(
                            'mat-control flex min-h-11 items-center gap-2 rounded-control px-3 text-sm transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
                            !supported && 'pointer-events-none opacity-50',
                            focusRing(),
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="flex overflow-hidden rounded-chip"
                            style={{ width: 24, height: 16 }}
                          >
                            <span style={{ background: entry.swatch[0], width: 12, height: 16 }} />
                            <span style={{ background: entry.swatch[1], width: 12, height: 16 }} />
                          </span>
                          <span
                            className={skin === entry.id ? 'font-semibold text-ink' : 'text-ink-2'}
                          >
                            {entry.label}
                          </span>
                          {entry.dimension === '3d' && <Badge tone="accent">3D</Badge>}
                          {entry.cost !== 'low' && <Badge tone="neutral">{entry.cost}</Badge>}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="mb-2 text-xs font-medium text-ink-3">Theme</p>
                <SegmentedControl
                  value={themeCtrl.choice}
                  onChange={(v) => themeCtrl.setChoice(v as 'auto' | 'light' | 'dark')}
                  options={[
                    { label: 'Auto', value: 'auto' },
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-ink-3">Effects</p>
                <SegmentedControl
                  value={fidelity}
                  onChange={(v) => setFidelity(v as 'auto' | 'high' | 'low')}
                  options={[
                    { label: 'Auto', value: 'auto' },
                    { label: 'Full', value: 'high' },
                    { label: 'Reduce', value: 'low' },
                  ]}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ── section tabs ── */}
        <div className="mt-6">
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as typeof tab)}
            items={[
              { label: 'All', value: 'all' },
              { label: 'Controls', value: 'controls' },
              { label: 'Data & Display', value: 'data' },
              { label: 'Feedback', value: 'feedback' },
              { label: 'Layout & Nav', value: 'layout' },
              { label: 'Overlays', value: 'overlay' },
            ]}
          />
        </div>

        {/* ═══════════════ BUTTONS ═══════════════ */}
        {show('controls') && (
          <Section title="Buttons & Icon buttons" note="All variants, sizes, states.">
            <SubSection title="Variants">
              <Row>
                <Button variant="primary">Save changes</Button>
                <Button variant="secondary">Cancel</Button>
                <Button variant="ghost">Learn more</Button>
                <Button variant="danger">Delete</Button>
                <Button variant="destructive">Delete forever</Button>
              </Row>
            </SubSection>
            <SubSection title="Sizes & states">
              <Row>
                <Button variant="primary" size="sm">
                  Compact
                </Button>
                <Button variant="primary">Default</Button>
                <Button variant="primary" size="lg">
                  Prominent
                </Button>
                <Button variant="primary" isLoading loadingText="Saving…">
                  Save
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </Row>
            </SubSection>
            <SubSection title="Toolbar">
              <div className="flex flex-col gap-3">
                <Toolbar aria-label="Text formatting">
                  <ToolbarButton
                    pressed={toolbar1.bold}
                    aria-label="Bold"
                    onClick={() => setToolbar1((s) => ({ ...s, bold: !s.bold }))}
                  >
                    <Bold className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    pressed={toolbar1.italic}
                    aria-label="Italic"
                    onClick={() => setToolbar1((s) => ({ ...s, italic: !s.italic }))}
                  >
                    <Italic className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    pressed={toolbar1.underline}
                    aria-label="Underline"
                    onClick={() => setToolbar1((s) => ({ ...s, underline: !s.underline }))}
                  >
                    <Underline className="size-4" />
                  </ToolbarButton>
                  <ToolbarSeparator />
                  <ToolbarButton
                    pressed={alignVal === 'left'}
                    aria-label="Align left"
                    onClick={() => setAlignVal('left')}
                  >
                    <AlignLeft className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    pressed={alignVal === 'center'}
                    aria-label="Align center"
                    onClick={() => setAlignVal('center')}
                  >
                    <AlignCenter className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    pressed={alignVal === 'right'}
                    aria-label="Align right"
                    onClick={() => setAlignVal('right')}
                  >
                    <AlignRight className="size-4" />
                  </ToolbarButton>
                </Toolbar>
                <p className="text-xs text-ink-3">
                  Active: {activeFormatLabel} · Align: {alignVal}
                </p>
                <Toolbar aria-label="Inserts">
                  <ToolbarButton pressed={false} aria-label="Add" onClick={() => {}}>
                    <Plus className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton pressed={false} aria-label="Edit" onClick={() => {}}>
                    <Pencil className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton pressed={false} aria-label="Link" onClick={() => {}}>
                    <LinkIcon className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton pressed={false} aria-label="Copy" onClick={() => {}}>
                    <Copy className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    pressed={false}
                    aria-label="Delete"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="size-4" />
                  </ToolbarButton>
                </Toolbar>
              </div>
            </SubSection>
          </Section>
        )}

        {/* ═══════════════ SELECTION CONTROLS ═══════════════ */}
        {show('controls') && (
          <Section title="Selection & toggles">
            <Grid2>
              <div className="flex flex-col gap-4">
                <SubSection title="Switch & Checkbox">
                  <div className="flex flex-col gap-2">
                    <Switch
                      checked={switchOn}
                      onCheckedChange={setSwitchOn}
                      label="Enable notifications"
                    />
                    <Switch
                      checked={false}
                      onCheckedChange={() => {}}
                      label="Disabled feature"
                      disabled
                    />
                    <Separator className="my-1" />
                    <Checkbox checked={checked} onCheckedChange={setChecked} label="Remember me" />
                    <Checkbox checked={true} onCheckedChange={() => {}} label="Terms accepted" />
                    <Checkbox
                      checked={false}
                      indeterminate
                      onCheckedChange={() => {}}
                      label="Select all (partial)"
                    />
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => {}}
                      label="Disabled"
                      disabled
                    />
                  </div>
                </SubSection>
                <SubSection title="Radio">
                  <div className="flex gap-4">
                    {(['day', 'week', 'month'] as const).map((v) => (
                      <Radio
                        key={v}
                        checked={radioVal === v}
                        onCheckedChange={() => setRadioVal(v)}
                        label={v.charAt(0).toUpperCase() + v.slice(1)}
                      />
                    ))}
                  </div>
                </SubSection>
                <SubSection title="Segmented control">
                  <SegmentedControl
                    value={seg}
                    onChange={(v) => setSeg(v as typeof seg)}
                    options={[
                      { label: 'Day', value: 'day' },
                      { label: 'Week', value: 'week' },
                      { label: 'Month', value: 'month' },
                    ]}
                  />
                </SubSection>
              </div>

              <div className="flex flex-col gap-4">
                <SubSection title="Slider">
                  <Slider value={sliderVal} onValueChange={setSliderVal} label="Volume" showValue />
                  <Slider value={40} onValueChange={() => {}} disabled label="Disabled" showValue />
                </SubSection>
                <SubSection title="Range (dual-handle)">
                  <Range
                    value={rangeVal}
                    onValueChange={setRangeVal}
                    label="Price range"
                    showValue
                  />
                </SubSection>
                <SubSection title="Number input">
                  <NumberInput
                    value={numVal}
                    onValueChange={setNumVal}
                    label="Quantity"
                    min={1}
                    max={99}
                  />
                </SubSection>
                <SubSection title="Rating">
                  <Rating value={ratingVal} onValueChange={setRatingVal} label="Your rating" />
                  <p className="mt-1 text-xs text-ink-3">Value: {ratingVal}</p>
                </SubSection>
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ FORMS ═══════════════ */}
        {show('controls') && (
          <Section title="Form inputs" note="All form primitives.">
            <Grid2>
              <div className="flex flex-col gap-3">
                <Field label="Contact email" htmlFor="email-f">
                  <Input id="email-f" type="email" placeholder="you@example.com" />
                </Field>
                <Field label="Message" htmlFor="msg-f">
                  <Textarea id="msg-f" placeholder="Type here…" />
                </Field>
                <Field label="Carrier" htmlFor="carrier-f">
                  <Select id="carrier-f" defaultValue="">
                    <option value="" disabled>
                      Select a carrier…
                    </option>
                    <option>FedEx</option>
                    <option>UPS</option>
                    <option>DHL</option>
                  </Select>
                </Field>
                <Field label="Country (Combobox)" htmlFor="country-f">
                  <Combobox
                    options={countries}
                    value={country}
                    onValueChange={setCountry}
                    placeholder="Search countries…"
                  />
                </Field>
                <Field label="Error state" htmlFor="bad-f" error="Already in use">
                  <Input id="bad-f" type="email" invalid defaultValue="you@example.com" />
                </Field>
              </div>

              <div className="flex flex-col gap-3">
                <Field label="Search" htmlFor="search-f">
                  <SearchField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClear={() => setSearch('')}
                    placeholder="Search products…"
                  />
                </Field>
                <SubSection title="OTP input">
                  <OTP
                    length={4}
                    value={otpVal}
                    onValueChange={setOtpVal}
                    label="Verification code"
                    hint="Sent to your phone"
                  />
                </SubSection>
                <SubSection title="DatePicker">
                  <DatePicker
                    value={dateVal}
                    onValueChange={setDateVal}
                    label="Delivery date"
                    placeholder="Select date"
                  />
                </SubSection>
                <SubSection title="TimePicker">
                  <TimePicker
                    value={timeVal}
                    onValueChange={setTimeVal}
                    label="Preferred time"
                    minuteStep={15}
                  />
                </SubSection>
                <SubSection title="File upload">
                  <FileUpload
                    onFilesChange={() => {}}
                    accept=".pdf,.png,.jpg"
                    maxSize={5 * 1024 * 1024}
                    label="Drop files or click to browse"
                    hint="PDF, PNG, JPG up to 5 MB"
                    multiple
                  />
                </SubSection>
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ BADGES, CHIPS, SURFACE ═══════════════ */}
        {show('data') && (
          <Section title="Surface identifiers">
            <Grid2>
              <div className="flex flex-col gap-4">
                <SubSection title="Badges">
                  <Row>
                    <Badge tone="neutral">4</Badge>
                    <Badge tone="accent">Beta</Badge>
                    <Badge tone="success">Active</Badge>
                    <Badge tone="warning">Pending</Badge>
                    <Badge tone="danger">Error</Badge>
                  </Row>
                </SubSection>
                <SubSection title="Chips & Tags">
                  <Row>
                    <Chip>Filter</Chip>
                    <Chip dot tone="success">
                      Online
                    </Chip>
                    <Chip dot tone="danger">
                      Offline
                    </Chip>
                    <Tag tone="warning">Deprecated</Tag>
                    <Tag tone="neutral">v2.0</Tag>
                  </Row>
                </SubSection>
                <SubSection title="Status dots">
                  <Row>
                    <StatusDot tone="success" label="Online" />
                    <StatusDot tone="warning" label="Away" />
                    <StatusDot tone="danger" label="Offline" />
                    <StatusDot tone="neutral" label="Draft" />
                  </Row>
                </SubSection>
                <SubSection title="Rating (read-only)">
                  <Row>
                    <Rating value={1} readOnly />
                    <Rating value={2.5} readOnly />
                    <Rating value={4} readOnly />
                    <Rating value={5} readOnly />
                  </Row>
                </SubSection>
                <SubSection title="Kbd">
                  <Row>
                    <span className="text-sm text-ink-2">Save with</span>
                    <Kbd>⌘</Kbd>
                    <Kbd>S</Kbd>
                    <span className="text-sm text-ink-2">or</span>
                    <Kbd>Ctrl</Kbd>
                    <Kbd>S</Kbd>
                  </Row>
                </SubSection>
              </div>

              <div className="flex flex-col gap-4">
                <SubSection title="Icon tiles">
                  <Row>
                    <IconTile icon={Bell} tone="accent" />
                    <IconTile icon={Settings} tone="neutral" />
                    <IconTile icon={Trash2} tone="danger" />
                    <IconTile icon={ShoppingBag} tone="success" />
                    <IconTile icon={Globe} tone="warning" size="lg" />
                  </Row>
                </SubSection>
                <SubSection title="Avatars">
                  <div className="flex flex-col gap-3">
                    <Row>
                      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                        <Avatar key={size} name="Alex Chen" size={size} />
                      ))}
                    </Row>
                    <Row>
                      <Avatar name="Ava Lee" size="md" />
                      <Avatar name="Mia Okafor" size="md" />
                      <Avatar name="No photo" size="md" />
                      <Avatar name="Team" size="md" />
                    </Row>
                  </div>
                </SubSection>
                <SubSection title="Link">
                  <div className="flex flex-col gap-1.5">
                    <Link href="#">Default link</Link>
                    <Link href="#" variant="subtle">
                      Subtle link
                    </Link>
                    <Link href="#" variant="underline">
                      Underline link
                    </Link>
                    <Link href="https://example.com" target="_blank">
                      External link
                    </Link>
                  </div>
                </SubSection>
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ CHARTS & GRAPHS ═══════════════ */}
        {show('data') && (
          <Section
            title="Charts & graphs"
            note="Bar chart, line chart, meters — all theme-token only."
          >
            <Grid2>
              <Card title="Revenue" description="Weekly volume index">
                <div className="mb-3 flex justify-end">
                  <SegmentedControl
                    value={chartRange}
                    onChange={(v) => setChartRange(v as 'week' | 'month')}
                    options={[
                      { label: 'Week', value: 'week' },
                      { label: 'Month', value: 'month' },
                    ]}
                  />
                </div>
                <BarChart data={chartBars} />
              </Card>

              <Card title="Inventory by category" description="Prepared-to-sell ratio">
                <BarChart data={inventoryBars} max={100} unit="%" />
              </Card>

              <Card title="Conversion funnel" description="Visitors → purchases by week">
                <LineChart
                  series={conversionLines.map((d) => d.values)}
                  labels={conversionLines.map((d) => d.label)}
                />
              </Card>

              <Card title="Goal progress">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-ink-3">
                      <span>Monthly target</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-ink-3">
                      <span>Stock runway</span>
                      <span>33%</span>
                    </div>
                    <Progress value={33} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-ink-3">
                      <span>Refund rate</span>
                      <span>12%</span>
                    </div>
                    <Progress value={12} />
                  </div>
                  <SegmentedMeter
                    segments={[
                      { value: 55, tone: 'accent', label: 'Electronics' },
                      { value: 30, tone: 'success', label: 'Clothing' },
                      { value: 15, label: 'Other' },
                    ]}
                  />
                </div>
              </Card>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ INLINE DATA-VIZ (batch 9) ═══════════════ */}
        {show('data') && (
          <Section
            title="Inline data-viz (batch 9)"
            note="Sparkline, DataBar, MetricCard — designed for table cells and KPI rows."
          >
            <Grid2>
              <Card
                title="Metric card row"
                description="Key metrics: big number + trend + comparison"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricCard
                    label="Revenue"
                    value="£8,412"
                    trend={12.4}
                    comparison="vs last month"
                  />
                  <MetricCard label="Refunds" value="37" trend={-8.2} comparison="vs last month" />
                  <MetricCard label="Orders shipped" value="1,208" comparison="on target" />
                </div>
              </Card>
              <Card title="In-cell bars & sparklines" description="Table-grade micro-charts">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-ink-2">MacBook Pro</span>
                    <DataBar value={84} max={100} label="Disk used" showValue />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-ink-2">Pixel 8</span>
                    <DataBar value={112.7} max={200} tone="warning" label="Disk used" showValue />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-ink-2">A1-C0DE</span>
                    <Sparkline
                      data={[3, 5, 2, 6, 4, 7]}
                      label="Weekly A1-C0DE sales"
                      className="h-8 flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-ink-2">ZZ-SPY</span>
                    <Sparkline
                      data={[6, 4, 7, 3, 5, 2]}
                      variant="bar"
                      tone="success"
                      label="Weekly ZZ-SPY sales"
                      className="h-8 flex-1"
                    />
                  </div>
                </div>
              </Card>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ PROGRESS & METERS ═══════════════ */}
        {show('data') && (
          <Section title="Skeletons">
            <Grid2>
              <div>
                <p className="mb-2 text-xs text-ink-3">Text</p>
                <SkeletonText lines={3} />
              </div>
              <div>
                <p className="mb-2 text-xs text-ink-3">Table</p>
                <SkeletonTable rows={3} />
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ CAROUSEL ═══════════════ */}
        {show('data') && (
          <Section title="Carousel" note="Arrow navigation, dot indicators, wrapping.">
            <Carousel slides={carouselSlides} aria-label="Featured content" />
          </Section>
        )}

        {/* ═══════════════ ASPECT RATIO ═══════════════ */}
        {show('data') && (
          <Section title="AspectRatio" note="Children fill the space.">
            <Grid2>
              {([16 / 9, 4 / 3, 1] as const).map((ratio) => (
                <AspectRatio key={ratio} ratio={ratio}>
                  <div className="mat-card flex h-full w-full items-center justify-center rounded-card text-sm font-medium text-ink-3">
                    {ratio === 1 ? '1:1' : ratio === 16 / 9 ? '16:9' : '4:3'}
                  </div>
                </AspectRatio>
              ))}
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ SCROLL AREA ═══════════════ */}
        {show('data') && (
          <Section title="ScrollArea" note="Custom scrollbar with overflow cap.">
            <Grid2>
              <div>
                <p className="mb-2 text-xs text-ink-3">Vertical</p>
                <ScrollArea maxHeight="200px" className="mat-well rounded-card p-3">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="border-b border-line/10 py-2 text-sm text-ink-2">
                      List item {i + 1}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div>
                <p className="mb-2 text-xs text-ink-3">Horizontal</p>
                <ScrollArea
                  orientation="horizontal"
                  maxHeight="200px"
                  className="mat-well rounded-card p-3"
                >
                  <div className="flex gap-3">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className="flex h-16 w-24 shrink-0 items-center justify-center rounded-card border border-line/20 text-sm text-ink-3"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ TABLE ═══════════════ */}
        {show('data') && (
          <Section title="Table & pagination">
            <Card title="Device sync" description="Last 30 days">
              <Table
                columns={[
                  { key: 'device', header: 'Device', cell: (r) => r.device, sortKey: 'device' },
                  {
                    key: 'status',
                    header: 'Status',
                    cell: (r) => {
                      const map: Record<string, 'success' | 'warning' | 'danger'> = {
                        synced: 'success',
                        pending: 'warning',
                        failed: 'danger',
                      };
                      return <StatusDot tone={map[r.status] ?? 'success'} label={r.status} />;
                    },
                  },
                  {
                    key: 'size',
                    header: 'Used',
                    cell: (r) => r.size,
                    align: 'right',
                    sortKey: 'size',
                  },
                  { key: 'os', header: 'OS', cell: (r) => r.os },
                ]}
                rows={tableRows}
                rowKey={(r) => r.id}
                density="dense"
                maxHeight={200}
              />
              <div className="mt-3 flex justify-end">
                <Pagination page={1} pageCount={4} onPageChange={() => {}} />
              </div>
            </Card>
          </Section>
        )}

        {/* ═══════════════ TABLE ADD-ONS (batch 17) ═══════════════ */}
        {show('data') && (
          <Section
            title="Table add-ons (batch 17)"
            subtitle="Row selection + bulk bar · sortable chevrons · summary row · grouped headers"
          >
            <Table
              columnGroups={[
                { label: 'Identity', span: 2 },
                { label: 'Storage', span: 1, align: 'right' },
              ]}
              columns={[
                { key: 'device', header: 'Device', cell: (r) => r.device, sortKey: 'device' },
                { key: 'status', header: 'Status', cell: (r) => r.status, sortKey: 'status' },
                { key: 'size', header: 'Used', cell: (r) => r.size, align: 'right' },
              ]}
              rows={tableRows}
              rowKey={(r) => r.id}
              selectedKeys={tableSel}
              onSelectedKeysChange={setTableSel}
              sort={tableSort}
              onSort={(key, direction) => setTableSort({ key, direction })}
              density="dense"
              summary={['Summary', `${tableRows.length} devices`, '550 GB']}
              bulkBar={(sel, clear) => (
                <>
                  <span className="font-medium text-ink">{sel.length} selected</span>
                  <Button size="sm" variant="secondary" onClick={clear}>
                    Clear
                  </Button>
                </>
              )}
            />
          </Section>
        )}

        {/* ═══════════════ COMMERCE QUICK WINS (batch 18) ═══════════════ */}
        {show('data') && (
          <Section
            title="Commerce quick wins (batch 18)"
            subtitle="Promo code chip · stock indicator"
          >
            <HStack gap={4} className="flex-wrap items-center">
              {promoState === 'available' ? (
                <PromoCode
                  code="SAVE10"
                  description="10% off"
                  onApply={() => setPromoState('applied')}
                />
              ) : (
                <PromoCode
                  code="SAVE10"
                  description="10% off"
                  state="applied"
                  onRemove={() => setPromoState('available')}
                />
              )}
              <PromoCode code="EXPIRED" state="invalid" />
              <StockIndicator level="in-stock" count={48} />
              <StockIndicator level="low-stock" count={3} />
              <StockIndicator level="out-of-stock" />
              <StockIndicator level="preorder" />
            </HStack>
          </Section>
        )}

        {/* ═══════════════ TODO/08 COMPLETION (batches 11/12/17/18 leftovers) ═══════════════ */}
        {show('data') && (
          <Section
            title="todo/08 completion — stopwatch · business hours · gauge · status"
            subtitle="Stopwatch / BusinessHours / GaugeKPI / SyncStatus / SaveStatus / ConnectionQuality / BatteryIndicator"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card padding="md">
                <Stack gap={3}>
                  <Text size="sm" tone="ink-2">
                    Stopwatch & business hours
                  </Text>
                  <Stopwatch controls />
                  <BusinessHours open="09:00" close="17:00" />
                  <BusinessHours
                    open="10:00"
                    close="16:00"
                    days={[6, 0]}
                    openLabel="Open (weekend hours)"
                  />
                </Stack>
              </Card>
              <Card padding="md">
                <Stack gap={3}>
                  <Text size="sm" tone="ink-2">
                    Gauge KPI
                  </Text>
                  <HStack gap={6} className="flex-wrap">
                    <GaugeKPI label="Performance" value={72} hint="+6 this week" />
                    <GaugeKPI label="Error budget" value={9} hint="of 100 used" />
                  </HStack>
                </Stack>
              </Card>
            </div>
            <Card padding="md" className="mt-4">
              <Stack gap={3}>
                <Text size="sm" tone="ink-2">
                  Status family
                </Text>
                <HStack gap={4} className="flex-wrap">
                  <SyncStatus state="synced" lastSyncedAt={DEMO_SYNCED_AT} />
                  <SyncStatus state="syncing" />
                  <SyncStatus state="offline" />
                  <SyncStatus state="error" />
                </HStack>
                <HStack gap={4} className="flex-wrap">
                  <SaveStatus state="saved" />
                  <SaveStatus state="saving" />
                  <SaveStatus state="error" />
                </HStack>
                <HStack gap={4} className="flex-wrap">
                  <ConnectionQuality level="good" />
                  <ConnectionQuality level="fair" />
                  <ConnectionQuality level="poor" />
                  <ConnectionQuality level="offline" />
                  <BatteryIndicator level={78} />
                  <BatteryIndicator level={15} />
                  <BatteryIndicator level={40} charging />
                </HStack>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ PAGINATION V2 (batch 14) ═══════════════ */}
        {show('data') && (
          <Section
            title="Pagination v2 (batch 14)"
            subtitle="First/last · jump-to-page · page-size selector · total count"
          >
            <Card>
              <Pagination
                page={page2}
                pageCount={24}
                onPageChange={setPage2}
                showFirstLast
                showJump
                totalItems={600}
                pageSize={pageSize2}
                onPageSizeChange={(n) => {
                  setPageSize2(n);
                  setPage2(1);
                }}
              />
            </Card>
          </Section>
        )}

        {/* ═══════════════ DATA GRID ═══════════════ */}
        {show('data') && (
          <Section title="DataGrid" note="Virtualized, sortable, density toggle.">
            <DataGrid
              rows={gridRows}
              columns={gridColumns}
              getRowId={(row) => row.id}
              sortColumn={gridSortColumn}
              sortDirection={gridSortDirection}
              onSort={(columnKey, direction) => {
                setGridSortColumn(columnKey);
                setGridSortDirection(direction);
              }}
              density={gridDensity}
              className="max-w-2xl"
            />
            <div className="mt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-3">Density</span>
                <SegmentedControl
                  value={gridDensity}
                  onChange={(v) => setGridDensity(v as 'comfortable' | 'compact')}
                  options={[
                    { label: 'Comfortable', value: 'comfortable' },
                    { label: 'Compact', value: 'compact' },
                  ]}
                />
              </div>
              <div className="text-xs text-ink-3">
                Sort: <strong>{gridSortColumn ?? 'none'}</strong> · {gridSortDirection}
              </div>
            </div>
          </Section>
        )}

        {/* ═══════════════ TIMELINE ═══════════════ */}
        {show('data') && (
          <Section title="Timeline" note="Order fulfillment status with tone markers.">
            <div className="max-w-sm">
              <Timeline items={timelineItems} />
            </div>
          </Section>
        )}

        {/* ═══════════════ ACCORDION ═══════════════ */}
        {show('data') && (
          <Section title="Accordion">
            <div className="max-w-2xl">
              <Accordion defaultOpen={['payment']}>
                <AccordionItem id="payment" title="What payment methods do you accept?">
                  <p className="text-sm text-ink-2">
                    We accept Visa, Mastercard, Amex, PayPal and all major digital wallets.
                  </p>
                </AccordionItem>
                <AccordionItem id="shipping" title="How long does shipping take?">
                  <p className="text-sm text-ink-2">
                    Standard delivery: 3–5 business days. Express: next business day when ordered
                    before 2 PM.
                  </p>
                </AccordionItem>
                <AccordionItem id="returns" title="Can I return an item?">
                  <p className="text-sm text-ink-2">
                    Yes — 30-day hassle-free returns on all orders.
                  </p>
                </AccordionItem>
              </Accordion>
            </div>
          </Section>
        )}

        {/* ═══════════════ TREEVIEW ═══════════════ */}
        {show('data') && (
          <Section title="TreeView" note="Nested category browser, keyboard navigable.">
            <div className="mat-well max-w-xs rounded-card p-2">
              <TreeView
                nodes={treeNodes}
                selected={treeSelected}
                onSelect={setTreeSelected}
                defaultExpanded={treeExpanded}
              />
            </div>
            {treeSelected && (
              <p className="mt-2 text-xs text-ink-3">
                Selected: <strong>{treeSelected}</strong>
              </p>
            )}
          </Section>
        )}

        {/* ═══════════════ FEEDBACK ═══════════════ */}
        {show('feedback') && (
          <Section title="Feedback" note="Banners, empty states, error, toast.">
            <Grid2>
              <div className="flex flex-col gap-3">
                <SubSection title="Banners">
                  <div className="flex flex-col gap-3">
                    <Banner
                      tone="warning"
                      title="Storage nearly full"
                      description="Uploads stop at 200 GB."
                      action={
                        <Button variant="ghost" size="sm">
                          Upgrade
                        </Button>
                      }
                    />
                    <Banner
                      tone="success"
                      title="Payment confirmed"
                      description="Order #1042 is being processed."
                    />
                    <Banner
                      tone="danger"
                      title="Sync failed"
                      description="Check your network and try again."
                    />
                  </div>
                </SubSection>
              </div>
              <div className="flex flex-col gap-3">
                <SubSection title="Empty & error states">
                  <EmptyState
                    icon={ShoppingBag}
                    title="No orders yet"
                    description="Your first order starts here."
                    action={
                      <Button variant="primary" size="sm">
                        Place order
                      </Button>
                    }
                  />
                  <ErrorState
                    title="Something went wrong"
                    description="We could not load your orders right now."
                    onRetry={() => {}}
                  />
                </SubSection>
                <SubSection title="Toast">
                  <Row>
                    <Button
                      variant="primary"
                      onClick={() => push({ message: 'Saved', tone: 'success' })}
                    >
                      Success
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => push({ message: 'Deleted', tone: 'danger' })}
                    >
                      Danger
                    </Button>
                  </Row>
                </SubSection>
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ SCROLL UTILITIES (batch 25) ═══════════════ */}
        {show('feedback') && (
          <Section
            title="Scroll utilities (batch 25)"
            subtitle="ScrollProgress · ScrollSpy · ScrollReveal · ScrollToTop"
          >
            <Grid2>
              <SubSection title="Scroll progress & spy">
                <Stack gap={4}>
                  <div className="mat-well relative h-14 overflow-hidden rounded-card">
                    <Text size="sm" tone="ink-3" className="block p-4">
                      ScrollProgress (controlled, 35%)
                    </Text>
                    <ScrollProgress value={0.35} position="bottom" className="absolute" />
                  </div>
                  <ScrollSpy
                    className="static"
                    title="Spy-driven contents"
                    items={[
                      { id: 'spy-a', label: 'Section A' },
                      { id: 'spy-b', label: 'Section B' },
                      { id: 'spy-c', label: 'Section C' },
                    ]}
                  />
                </Stack>
              </SubSection>
              <SubSection title="Reveal & back-to-top">
                <Stack gap={4}>
                  <ScrollReveal visible>
                    <Well className="p-4 text-sm text-ink-2">
                      ScrollReveal — this block fades and rises into view.
                    </Well>
                  </ScrollReveal>
                  <div className="relative h-20">
                    <ScrollToTop visible className="absolute bottom-0 right-0" />
                    <Text size="sm" tone="ink-3">
                      ScrollToTop (controlled visible)
                    </Text>
                  </div>
                </Stack>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ PRIMITIVES — BUILD YOUR OWN ═══════════════ */}
        {show('layout') && (
          <Section
            title="Layout primitives — build your own"
            note="Div · Box · Container · Stack · HStack · Surface. These bare tags name only a ROLE (well, card, raised, panel, chrome, ground); the active skin paints them."
          >
            <Stack gap={6}>
              {/* Role gallery: same markup, every role */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Surface material="ground" className="p-4 text-sm text-ink-2">
                  mat-ground
                </Surface>
                <Surface material="panel" className="p-4 text-sm text-ink-2">
                  mat-panel
                </Surface>
                <Surface material="card" className="p-4 text-sm text-ink-2">
                  mat-card
                </Surface>
                <Raised className="p-4 text-sm text-ink-2">mat-raised</Raised>
                <Surface role="chrome" className="p-4 text-sm text-ink-2">
                  mat-chrome
                </Surface>
                <Well className="p-4 text-sm text-ink-2">mat-well</Well>
              </div>

              <Separator />

              {/* Radii: one Surface, four radius tokens */}
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Radius tokens
                </Text>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <Surface material="well" radius="chip" className="p-4 text-xs text-ink-2">
                    chip
                  </Surface>
                  <Surface material="well" radius="control" className="p-4 text-xs text-ink-2">
                    control
                  </Surface>
                  <Surface material="well" radius="card" className="p-4 text-xs text-ink-2">
                    card
                  </Surface>
                  <Surface material="well" radius="sheet" className="p-4 text-xs text-ink-2">
                    sheet
                  </Surface>
                </div>
              </div>

              <Separator />

              {/* Compose: a custom "stat card" built from primitives only */}
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Composed widget — built entirely from primitives
                </Text>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: 'Revenue',
                      value: '£8,412',
                      trend: '+12% MoM',
                      tone: 'success' as const,
                      material: 'card' as const,
                    },
                    {
                      label: 'Orders',
                      value: '1,208',
                      trend: '+3% MoM',
                      tone: 'success' as const,
                      material: 'well' as const,
                    },
                    {
                      label: 'Refunds',
                      value: '37',
                      trend: '-8% MoM',
                      tone: 'danger' as const,
                      material: 'raised' as const,
                    },
                  ].map((stat) => (
                    <Surface key={stat.label} material={stat.material} className="p-4">
                      <Stack gap={1}>
                        <Text tone="ink-3" size="xs">
                          {stat.label}
                        </Text>
                        <Text size="xl" className="font-semibold tracking-tight">
                          {stat.value}
                        </Text>
                        <Text tone={stat.tone === 'success' ? 'ink-3' : 'ink-3'} size="xs">
                          {stat.trend}
                        </Text>
                        <Badge tone={stat.tone}>
                          {stat.tone === 'success' ? 'on track' : 'review'}
                        </Badge>
                      </Stack>
                    </Surface>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Layout helpers in action */}
              <div className="flex flex-col gap-3">
                <Stack gap={2} className="max-w-xl">
                  <Container
                    width="prose"
                    bleed
                    className="mat-well rounded-card px-3 py-2 text-sm text-ink-2"
                  >
                    Container (prose width) — reading layouts, centered.
                  </Container>
                  <Stack gap={1}>
                    <Text size="sm">Stack gap=1</Text>
                    <Text size="sm" tone="ink-3">
                      Stack gap=3 default between cards
                    </Text>
                    <HStack gap={2}>
                      <Div className="mat-well rounded-card p-3 text-xs text-ink-2">
                        HStack · Div 1
                      </Div>
                      <Div className="mat-well rounded-card p-3 text-xs text-ink-2">
                        HStack · Div 2
                      </Div>
                    </HStack>
                  </Stack>
                </Stack>
              </div>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ EVERY LAYOUT PATTERNS (batch 19) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Every Layout patterns (batch 19)"
            subtitle="Frame · Bleed · Cluster · Switcher"
          >
            <Stack gap={6}>
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Frame — locked aspect ratio crop
                </Text>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Frame ratio="square" className="mat-well rounded-card">
                    <div className="grid place-items-center text-xs text-ink-3">square</div>
                  </Frame>
                  <Frame ratio="video" className="mat-well rounded-card">
                    <div className="grid place-items-center text-xs text-ink-3">video 16:9</div>
                  </Frame>
                  <Frame ratio="photo" className="mat-well rounded-card">
                    <div className="grid place-items-center text-xs text-ink-3">photo 4:3</div>
                  </Frame>
                  <Frame ratio="portrait" className="mat-well rounded-card">
                    <div className="grid place-items-center text-xs text-ink-3">portrait 3:4</div>
                  </Frame>
                </div>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Bleed — escape the container gutters
                </Text>
                <Container width="prose" className="mt-2 mat-well rounded-card py-3">
                  <Text size="sm" tone="ink-3">
                    Inside the container (padded).
                  </Text>
                  <Bleed className="mt-2 mat-card rounded-none py-3 text-center text-xs text-ink-2">
                    Full-bleed strip
                  </Bleed>
                  <Text size="sm" tone="ink-3" className="mt-2">
                    Back inside the container.
                  </Text>
                </Container>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Cluster — wrapping row with distribution
                </Text>
                <Cluster justify="between" className="mt-2">
                  {['New', 'Popular', 'Sale', 'Limited', 'Back in stock', 'Pre-order'].map((t) => (
                    <Badge key={t} tone="neutral">
                      {t}
                    </Badge>
                  ))}
                </Cluster>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Switcher — row above threshold, column below
                </Text>
                <Switcher className="mt-2">
                  <Surface className="p-4 text-sm text-ink-2">Switcher child A</Surface>
                  <Surface className="p-4 text-sm text-ink-2">Switcher child B</Surface>
                </Switcher>
              </div>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ EVERY LAYOUT PATTERNS II (batch 20) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Every Layout patterns II (batch 20)"
            subtitle="Reel · Sidebar · Imposter · Cover"
          >
            <Stack gap={6}>
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Reel — horizontal scroll rail (snap)
                </Text>
                <Reel snap className="mt-2 pb-2">
                  {Array.from({ length: 10 }, (_, i) => (
                    <Surface key={i} className="w-40 shrink-0 p-4 text-sm text-ink-2">
                      Item {i + 1}
                    </Surface>
                  ))}
                </Reel>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Sidebar — 16rem rail + flexible content
                </Text>
                <SidebarLayout className="mt-2">
                  <Surface material="well" className="p-4 text-sm text-ink-2">
                    Sidebar
                  </Surface>
                  <Surface className="p-4 text-sm text-ink-2">
                    Main content takes the remaining width and stacks below on narrow screens.
                  </Surface>
                </SidebarLayout>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Imposter — center one box in the flow
                </Text>
                <Imposter className="mt-2 mat-well min-h-40 rounded-card">
                  <Surface className="w-56 p-4 text-center text-sm text-ink-2">Centered</Surface>
                </Imposter>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Cover — fill a block, pin edges, center middle
                </Text>
                <Cover
                  minHeight="16rem"
                  className="mt-2 mat-well rounded-card p-4 text-xs text-ink-2"
                >
                  <div>Header (top)</div>
                  <div className="text-sm text-ink">Main (centered)</div>
                  <div>Footer (bottom)</div>
                </Cover>
              </div>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ COLUMN LAYOUT (batch 22) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Column layout (batch 22)"
            subtitle="MultiColumn · Columns · Gutter · Offset/Push/Pull"
          >
            <Stack gap={6}>
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  MultiColumn — newspaper text flow
                </Text>
                <MultiColumn count={3} className="mt-2 text-sm leading-relaxed text-ink-2">
                  The design system keeps every component bound to material roles and theme tokens.
                  A column flow like this is pure layout: it never names a colour, radius or shadow,
                  so it survives any skin change. Resize the viewport to watch the columns rebalance
                  automatically as the container width changes, without a single media query.
                </MultiColumn>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Columns — auto-fit responsive columns
                </Text>
                <Columns min="12rem" className="mt-2">
                  {['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'].map((c) => (
                    <Surface key={c} className="p-4 text-sm text-ink-2">
                      {c}
                    </Surface>
                  ))}
                </Columns>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Gutter — rhythm between flow siblings
                </Text>
                <Gutter size={4} className="mt-2 mat-well rounded-card p-4">
                  <Text size="sm" tone="ink-2">
                    First block
                  </Text>
                  <Text size="sm" tone="ink-2">
                    Second block (mt-4 from the gutter)
                  </Text>
                  <Text size="sm" tone="ink-2">
                    Third block
                  </Text>
                </Gutter>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Offset / Push / Pull — grid placement and nudges
                </Text>
                <div className="mt-2 grid grid-cols-12 gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="mat-well h-8 rounded-chip" />
                  ))}
                  <Offset
                    start={4}
                    span={6}
                    className="mat-card rounded-control p-2 text-center text-xs text-ink-2"
                  >
                    Offset start=4 span=6
                  </Offset>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Surface className="p-3 text-xs text-ink-2">baseline</Surface>
                  <Push amount="1.5rem">
                    <Surface className="p-3 text-xs text-ink-2">Push</Surface>
                  </Push>
                  <Pull amount="1.5rem">
                    <Surface className="p-3 text-xs text-ink-2">Pull</Surface>
                  </Pull>
                </div>
              </div>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ RESPONSIVE VISIBILITY (batch 23) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Responsive visibility (batch 23)"
            subtitle="Show/Hide breakpoint helpers · VisuallyHidden-but-focusable"
          >
            <Stack gap={4}>
              <div className="mat-well rounded-card p-4 text-sm text-ink-2">
                Resize the viewport:
                <Show above="md">
                  <span className="ml-2 text-ink">· visible at ≥ md (Show)</span>
                </Show>
                <Hide above="md">
                  <span className="ml-2 text-ink">· visible below md (Hide)</span>
                </Hide>
              </div>

              <Stack gap={1}>
                <Text size="sm" tone="ink-2">
                  There is a <VisuallyHidden>hidden accessible label</VisuallyHidden> in this
                  sentence — screen readers announce it, sighted users do not.
                </Text>
                <Text size="sm" tone="ink-3">
                  Press Tab:{' '}
                  <VisuallyHidden focusable>Skip to main content (focus to reveal)</VisuallyHidden>
                </Text>
              </Stack>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ STICKY LAYOUT (batch 24) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Sticky layout (batch 24)"
            subtitle="StickySidebar · StickyToc · StickyCtaBar"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_12rem]">
              <Stack gap={3}>
                <Text size="sm" tone="ink-2">
                  Scroll this column. The sidebar and the table of contents stick to the top while
                  the long article flows past.
                </Text>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="mat-well h-16 rounded-card" />
                ))}
              </Stack>
              <StickySidebar top="4rem">
                <StickyToc
                  activeId="section-2"
                  title="On this page"
                  items={[
                    { id: 'section-1', label: 'Overview' },
                    { id: 'section-2', label: 'Details' },
                    { id: 'section-3', label: 'Reviews' },
                  ]}
                />
              </StickySidebar>
            </div>

            <div className="relative mt-6 h-56 overflow-hidden rounded-card mat-well">
              <Text size="sm" tone="ink-3" className="block p-4">
                Product page preview — the CTA bar pins to the bottom edge of this panel.
              </Text>
              <StickyCtaBar
                className="absolute inset-x-0 bottom-0"
                action={<Button size="sm">Add to cart</Button>}
              >
                <Text size="sm" tone="ink-2">
                  Total · $48.00
                </Text>
              </StickyCtaBar>
            </div>
          </Section>
        )}

        {/* ═══════════════ GALLERIES (batch 26) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Galleries (batch 26)"
            subtitle="MosaicGrid · Bento · MasonryBoard · JustifiedGallery"
          >
            <Stack gap={6}>
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  MosaicGrid + MosaicItem
                </Text>
                <MosaicGrid columns={4} rowHeight="4rem" className="mt-2">
                  <MosaicItem colSpan={2} rowSpan={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      2×2
                    </Surface>
                  </MosaicItem>
                  <MosaicItem colSpan={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      2×1
                    </Surface>
                  </MosaicItem>
                  <MosaicItem rowSpan={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      1×2
                    </Surface>
                  </MosaicItem>
                  <MosaicItem colSpan={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      2×1
                    </Surface>
                  </MosaicItem>
                </MosaicGrid>
              </div>

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Bento — explicit placement
                </Text>
                <Bento columns={4} rowHeight="5rem" className="mt-2">
                  <BentoCell col={1} row={1} colSpan={2} rowSpan={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      Hero
                    </Surface>
                  </BentoCell>
                  <BentoCell col={3} row={1} rowSpan={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      Rail
                    </Surface>
                  </BentoCell>
                  <BentoCell col={4} row={1}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      A
                    </Surface>
                  </BentoCell>
                  <BentoCell col={4} row={2}>
                    <Surface className="grid h-full place-items-center p-3 text-xs text-ink-2">
                      B
                    </Surface>
                  </BentoCell>
                </Bento>
              </div>

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  MasonryBoard (Pinterest-style)
                </Text>
                <MasonryBoard columns={3} className="mt-2">
                  {[5, 3, 4, 2, 6, 3].map((h, i) => (
                    <div
                      key={i}
                      className="mat-well grid place-items-center rounded-card text-xs text-ink-2"
                      style={{ height: `${h}rem` }}
                    >
                      {h}rem
                    </div>
                  ))}
                </MasonryBoard>
              </div>

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  JustifiedGallery
                </Text>
                <JustifiedGallery
                  className="mt-2"
                  rowHeight={120}
                  items={[
                    { src: '/globe.svg', alt: 'Wide', aspect: 1.8 },
                    { src: '/next.svg', alt: 'Square', aspect: 1 },
                    { src: '/window.svg', alt: 'Portrait', aspect: 0.7 },
                  ]}
                />
              </div>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ MOBILE LAYOUT (batch 28) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Mobile layout (batch 28)"
            subtitle="SafeArea (notch) · KeyboardAvoidingView · PullToRefresh"
          >
            <Grid2>
              <SubSection title="Safe area & keyboard">
                <Stack gap={3}>
                  <SafeArea
                    edges={['top', 'bottom']}
                    className="mat-well rounded-card p-4 text-xs text-ink-2"
                  >
                    SafeArea — insets top &amp; bottom using env(safe-area-inset-*).
                  </SafeArea>
                  <KeyboardAvoidingView
                    offset={64}
                    className="mat-well rounded-card p-4 text-xs text-ink-2"
                  >
                    KeyboardAvoidingView — reserves 64px for the keyboard.
                  </KeyboardAvoidingView>
                </Stack>
              </SubSection>
              <SubSection title="Pull to refresh">
                <PullToRefresh
                  threshold={48}
                  onRefresh={() => new Promise((resolve) => setTimeout(resolve, 900))}
                  className="mat-well max-h-56 touch-pan-y overflow-hidden rounded-card"
                >
                  <Stack gap={2} className="p-4">
                    <Text size="sm" tone="ink-3">
                      Drag down to refresh
                    </Text>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="mat-card rounded-control p-2 text-xs text-ink-2">
                        List row {i + 1}
                      </div>
                    ))}
                  </Stack>
                </PullToRefresh>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ SWIPE GESTURES (batch 29) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Swipe gestures (batch 29)"
            subtitle="Swipeable · SwipeActions (list-row swipe)"
          >
            <Grid2>
              <SubSection title="Swipeable container">
                <Swipeable
                  className="mat-well grid h-32 place-items-center rounded-card text-sm text-ink-2"
                  onSwipe={(direction) => push({ message: `Swiped ${direction}`, tone: 'neutral' })}
                >
                  Drag in any direction
                </Swipeable>
              </SubSection>
              <SubSection title="Swipe actions">
                <Stack gap={2}>
                  {['Invoice #1042', 'Invoice #1043'].map((row) => (
                    <SwipeActions
                      key={row}
                      actions={[
                        {
                          label: 'Archive',
                          onAction: () => push({ message: `Archived ${row}`, tone: 'neutral' }),
                        },
                        {
                          label: 'Delete',
                          tone: 'danger',
                          onAction: () => push({ message: `Deleted ${row}`, tone: 'danger' }),
                        },
                      ]}
                    >
                      <div className="p-4 text-sm text-ink-2">{row} — swipe left</div>
                    </SwipeActions>
                  ))}
                </Stack>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ ORIENTATION (batch 30) ═══════════════ */}
        {show('layout') && (
          <Section title="Orientation (batch 30)" subtitle="Orientation wrapper · useOrientation">
            <Orientation
              orientation="landscape"
              className="mat-well grid min-h-24 place-items-center rounded-card p-4 text-sm text-ink-2"
              portrait={<span>Portrait layout: stacked</span>}
              landscape={<span>Landscape layout: side by side</span>}
            />
            <Orientation
              orientation="portrait"
              className="mt-3 mat-well grid min-h-24 place-items-center rounded-card p-4 text-sm text-ink-2"
              portrait={<span>Portrait layout: stacked</span>}
              landscape={<span>Landscape layout: side by side</span>}
            />
          </Section>
        )}

        {/* ═══════════════ TYPOGRAPHY VARIANTS (batch 31) ═══════════════ */}
        {show('layout') && (
          <Section title="Typography variants (batch 31)" subtitle="Display · Subtitle">
            <Stack gap={4} className="mat-well rounded-card p-6">
              <Display size="lg">Display lg</Display>
              <Display size="md">Display md</Display>
              <Display size="sm">Display sm</Display>
              <Subtitle size="md">Subtitle md — a supporting line beneath the title.</Subtitle>
              <Subtitle size="sm" tone="ink-3">
                Subtitle sm — quieter, for dense surfaces.
              </Subtitle>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ TEXT EFFECTS (batch 32) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Text effects (batch 32)"
            subtitle="GradientText · OutlineText — both bind to skin role tokens"
          >
            <Stack gap={4} className="mat-well rounded-card p-6">
              <Display size="md">
                <GradientText material="primary">Skin-owned gradient text</GradientText>
              </Display>
              <Display size="md">
                <OutlineText material="primary" strokeWidth="1.5px">
                  Skin-owned outline text
                </OutlineText>
              </Display>
              <Text size="sm" tone="ink-3">
                The gradient and stroke resolve from the active skin&apos;s role tokens, never a
                hard-coded colour.
              </Text>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ ANIMATED TEXT (batch 33) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Animated text (batch 33)"
            subtitle="Typewriter · FadeInText · WordRotator · ScrambleText · SplitText"
          >
            <Grid2>
              <SubSection title="Typewriter & fade">
                <Stack gap={4} className="text-sm text-ink-2">
                  <div>
                    <Text as="span" size="sm" tone="ink-3">
                      Typewriter:
                    </Text>{' '}
                    <Typewriter text="Building the interface…" speed={45} />
                  </div>
                  <FadeInText>
                    <Well className="p-3 text-sm text-ink-2">
                      FadeInText faded this in on mount.
                    </Well>
                  </FadeInText>
                </Stack>
              </SubSection>
              <SubSection title="Rotate, scramble, split">
                <Stack gap={4} className="text-sm text-ink-2">
                  <div>
                    <Text as="span" size="sm" tone="ink-3">
                      WordRotator:
                    </Text>{' '}
                    <WordRotator words={['fast', 'themed', 'tested', 'elegant']} interval={1600} />
                  </div>
                  <div>
                    <Text as="span" size="sm" tone="ink-3">
                      ScrambleText:
                    </Text>{' '}
                    <ScrambleText text="DECRYPTED" speed={60} />
                  </div>
                  <SplitText
                    text="Split into characters"
                    stagger={30}
                    className="text-base text-ink"
                  />
                </Stack>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ EDITORIAL (batch 34) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Editorial (batch 34)"
            subtitle="DropCap · PullQuote · Footnote/Endnote · Citation"
          >
            <Grid2>
              <SubSection title="Drop cap & pull quote">
                <Stack gap={4}>
                  <DropCap size="lg" className="text-sm text-ink-2">
                    The design system treats every visual decision as a skin-owned token, so a
                    single markup surface can wear any personality without rewriting a component.
                  </DropCap>
                  <PullQuote cite="Every Layout">
                    Components should be robust, not bespoke.
                  </PullQuote>
                </Stack>
              </SubSection>
              <SubSection title="Notes & citation">
                <Stack gap={4}>
                  <Text size="sm" tone="ink-2">
                    The skin engine resolves role tokens at paint time.
                    <FootnoteRef id="token" index={1} /> This keeps markup free of raw values.
                  </Text>
                  <Text size="sm" tone="ink-2">
                    Sources:
                    <Citation href="https://example.com" author="Heydon Pickering" year={2019}>
                      Every Layout
                    </Citation>
                  </Text>
                  <FootnoteList heading="Notes">
                    <Footnote id="token" index={1}>
                      Role tokens are `--m-&lt;role&gt;-*` custom properties.
                    </Footnote>
                  </FootnoteList>
                </Stack>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ INLINE (batch 35) ═══════════════ */}
        {show('layout') && (
          <Section title="Inline (batch 35)" subtitle="InlineBadge · Abbr · Definition · Code">
            <Grid2>
              <SubSection title="Inline badge">
                <Cluster gap={2}>
                  <InlineBadge tone="neutral">Draft</InlineBadge>
                  <InlineBadge tone="accent">Beta</InlineBadge>
                  <InlineBadge tone="success">Active</InlineBadge>
                  <InlineBadge tone="warning">Low stock</InlineBadge>
                  <InlineBadge tone="danger">Failed</InlineBadge>
                </Cluster>
              </SubSection>
              <SubSection title="Abbr · Definition · Code">
                <Stack gap={3} className="text-sm text-ink-2">
                  <div>
                    The <Abbr title="HyperText Markup Language">HTML</Abbr> tree is painted by the
                    skin engine.
                  </div>
                  <div>
                    A <Definition term="token" definition="A named design value" /> resolves at
                    paint time.
                  </div>
                  <div>
                    Set <Code>data-slab</Code> so the canvas takes over the surface.
                  </div>
                </Stack>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ INLINE TEXT (batch 36) ═══════════════ */}
        {show('layout') && (
          <Section title="Inline text (batch 36)" subtitle="Mention · Hashtag · Emoji · TextDiff">
            <Grid2>
              <SubSection title="Mention · Hashtag · Emoji">
                <Stack gap={3} className="text-sm text-ink-2">
                  <div>
                    <Mention href="/users/ada">ada</Mention> shipped the fix and{' '}
                    <Hashtag href="/tags/skins">skins</Hashtag> got a bump.{' '}
                    <Emoji label="party popper">🎉</Emoji>
                  </div>
                  <div>
                    Decorative emoji: <Emoji>🔥</Emoji> <Emoji>✨</Emoji> — hidden from AT.
                  </div>
                </Stack>
              </SubSection>
              <SubSection title="TextDiff (word + char)">
                <Stack gap={3} className="text-sm">
                  <TextDiff before="the quick brown fox" after="the slow brown fox jumps" />
                  <TextDiff before="kitten" after="sitten" by="char" className="font-mono" />
                </Stack>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ EFFECT BUTTONS (batch 38) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Effect buttons (batch 38)"
            subtitle="Ripple / Magnetic / Shimmer / Glow — the effect is a skin decision"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap">
                  <RippleButton>Save</RippleButton>
                  <ShimmerButton variant="secondary">Add to cart</ShimmerButton>
                  <GlowButton>Get started</GlowButton>
                  <MagneticButton variant="secondary">Pull</MagneticButton>
                </HStack>
                <HStack gap={4} className="flex-wrap">
                  <EffectButton effect="shimmer" material="raised">
                    Shimmer · raised
                  </EffectButton>
                  <EffectButton effect="glow" material="control" variant="secondary">
                    Glow · control
                  </EffectButton>
                </HStack>
                <Text size="sm" tone="ink-2">
                  Sheen reads `--m-&lt;role&gt;-sheen`, glow reads `--m-&lt;role&gt;-glow` (cyber
                  overrides it in dark); ripple paints with currentColor. Pick another skin to see
                  the effect follow.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ GRADIENT BORDER BUTTON (batch 39) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Gradient border button (batch 39)"
            subtitle="Ring painted from role tokens — glow × edge, per skin"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <GradientBorderButton>Get started</GradientBorderButton>
                  <GradientBorderButton variant="secondary">Learn more</GradientBorderButton>
                  <GradientBorderButton size="sm" variant="secondary">
                    Small
                  </GradientBorderButton>
                  <GradientBorderButton size="lg">Large</GradientBorderButton>
                  <GradientBorderButton material="raised" variant="secondary">
                    Raised role
                  </GradientBorderButton>
                </HStack>
                <Text size="sm" tone="ink-2">
                  The 1px ring reads `--m-&lt;role&gt;-glow` → `--m-&lt;role&gt;-edge` (token
                  fallbacks in engine.css) over the variant fill, so the gradient follows the active
                  skin.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ CONFIRM CONTROLS (batch 40) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Confirmation controls (batch 40)"
            subtitle="Hold · swipe · double-click — deliberate gestures before a destructive action"
          >
            <Card padding="md">
              <Stack gap={5}>
                <HStack gap={4} className="flex-wrap items-center">
                  <HoldToConfirmButton onConfirm={() => {}}>Hold to delete</HoldToConfirmButton>
                  <HoldToConfirmButton variant="secondary" duration={2200}>
                    Hold (2.2s)
                  </HoldToConfirmButton>
                  <DoubleClickToConfirm armedLabel="Click again" onConfirm={() => {}}>
                    Double-click to delete
                  </DoubleClickToConfirm>
                </HStack>
                <div className="max-w-sm">
                  <SwipeToConfirm onConfirm={() => {}}>Slide to pay</SwipeToConfirm>
                </div>
                <Text size="sm" tone="ink-2">
                  Hold fills a progress bar from `bg-accent/25`; swipe latches the thumb past 90% of
                  the track; double-click arms for 400ms. All three also confirm from the keyboard
                  (Enter / Space).
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ TIMED BUTTONS (batch 41) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Timed buttons (batch 41)"
            subtitle="Cooldown · resend-code · countdown — one interval loop, token-driven"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <CooldownButton seconds={5} onActivate={() => {}}>
                    Cooldown 5s
                  </CooldownButton>
                  <ResendCodeButton seconds={10} onResend={() => {}} />
                  <CountdownButton seconds={4}>Ready to continue</CountdownButton>
                </HStack>
                <Text size="sm" tone="ink-2">
                  `CooldownButton` disables while cooling and renders `cooldownLabel(left)`;
                  `ResendCodeButton` builds on it; `CountdownButton` counts down on mount then
                  re-enables and fires `onComplete`.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ CHIP-BUTTON FAMILY (batch 42) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Chip-button family (batch 42)"
            subtitle="Filter · choice · suggestion · tab · input — selection swaps mat-control → mat-primary"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={3} className="flex-wrap items-center">
                  <FilterChip selected onSelectedChange={() => {}}>
                    In stock
                  </FilterChip>
                  <FilterChip onSelectedChange={() => {}}>On sale</FilterChip>
                  <SuggestionChip onSelectedChange={() => {}}>Trending</SuggestionChip>
                </HStack>
                <HStack gap={3} className="flex-wrap items-center">
                  <ChoiceChip selected onSelectedChange={() => {}}>
                    Small
                  </ChoiceChip>
                  <ChoiceChip onSelectedChange={() => {}}>Medium</ChoiceChip>
                  <ChoiceChip onSelectedChange={() => {}}>Large</ChoiceChip>
                  <TabChip selected onSelectedChange={() => {}}>
                    Overview
                  </TabChip>
                  <TabChip onSelectedChange={() => {}}>Activity</TabChip>
                </HStack>
                <HStack gap={3} className="flex-wrap items-center">
                  <InputChip leading={<StatusDot tone="success" />} onRemove={() => {}}>
                    alice@example.com
                  </InputChip>
                  <InputChip onRemove={() => {}}>design</InputChip>
                </HStack>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ READ MORE (batch 37) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Read more (batch 37)"
            subtitle="ReadMore — clamped disclosure with toggle"
          >
            <Grid2>
              <SubSection title="Default (3 lines)">
                <ReadMore>
                  <p className="text-sm text-ink-2">
                    The skin engine paints every material role from tokens, so the same disclosure
                    widget can sit inside a frosted card, a neo-brutalist panel, or a clay surface
                    without a single markup change — collapse, expand, and focus behaviour all stay
                    identical while the paint job follows the active skin.
                  </p>
                </ReadMore>
              </SubSection>
              <SubSection title="Custom labels + 2 lines">
                <ReadMore lines={2} moreLabel="Expand" lessLabel="Collapse">
                  <p className="text-sm text-ink-2">
                    Disclosure text is clamped with the CSS line-clamp utility; the toggle is a real
                    button with aria-expanded and aria-controls, so screen readers announce the
                    state change correctly.
                  </p>
                </ReadMore>
              </SubSection>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ TIME & DATE (batch 11) ═══════════════ */}
        {tab === 'data' && (
          <Section
            title="Time & date (batch 11)"
            subtitle="TimeAgo / TimezoneClock / Countdown / Duration"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card padding="md">
                <Stack gap={2}>
                  <Text size="sm" tone="ink-2">
                    TimezoneClock (UTC-like)
                  </Text>
                  <TimezoneClock />
                  <TimezoneClock timezone="UTC" />
                </Stack>
              </Card>
              <Card padding="md">
                <Stack gap={2}>
                  <Text size="sm" tone="ink-2">
                    Countdown
                  </Text>
                  <HStack gap={2}>
                    <Countdown target={Date.now() + 3600000} />
                    <Countdown target={Date.now() + 120000} />
                  </HStack>
                  <Text size="sm" tone="ink-2">
                    Duration
                  </Text>
                  <HStack gap={2}>
                    <Duration ms={5000} />
                    <Duration ms={1500} precision="ms" />
                  </HStack>
                </Stack>
              </Card>
            </div>
          </Section>
        )}

        {/* ═══════════════ SCORECARD & HEALTH (batch 12) ═══════════════ */}
        {tab === 'data' && (
          <Section title="Scorecard & health (batch 12)" subtitle="StatTile / SLAIndicator">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatTile label="Active users" value="1,428" hint="+12% vs last week" trend="up" />
              <StatTile label="Churn" value="2.4%" hint="-0.3% vs last week" trend="down" />
              <StatTile label="Uptime" value="99.98%" hint="SLA stable" trend="flat" />
            </div>
            <HStack gap={3} className="mt-4">
              <SLAIndicator status="ok" label="API" />
              <SLAIndicator status="warn" label="Webhooks" />
              <SLAIndicator status="breach" label="Queue" />
            </HStack>
          </Section>
        )}
        {/* ═══════════════ LIST ═══════════════ */}
        {show('layout') && (
          <Section title="Lists">
            <Grid2>
              <div className="flex flex-col gap-2">
                <ListHeader title="Account" trailing={<span>4 items</span>} />
                <GroupedList inset>
                  <ListRow
                    icon={Bell}
                    iconTone="accent"
                    title="Notifications"
                    description="Push, email, in-app"
                    selected={listOpen}
                    onClick={() => setListOpen(true)}
                    trailing={<span className="text-xs text-ink-3">On</span>}
                  />
                  <ListRow
                    icon={CreditCard}
                    iconTone="neutral"
                    title="Payment methods"
                    description="2 cards on file"
                    trailing={<Badge tone="accent">New</Badge>}
                  />
                  <ListRow
                    icon={Trash2}
                    iconTone="danger"
                    title="Delete account"
                    description="This cannot be undone"
                    onClick={() => setConfirmOpen(true)}
                  />
                  <ListRow
                    icon={Settings}
                    title="Disabled row"
                    description="Not on this plan"
                    disabled
                  />
                </GroupedList>
              </div>
              <div className="flex flex-col gap-2">
                <ListHeader title="Recent activity" />
                <GroupedList>
                  <ListRow
                    icon={ShoppingBag}
                    iconTone="success"
                    title="Order #1042 shipped"
                    description="Estimated tomorrow"
                    trailing={<ChevronRight className="size-4 text-ink-4" />}
                  />
                  <ListRow
                    icon={Star}
                    iconTone="accent"
                    title="Review requested"
                    description="Rate your recent purchase"
                    trailing={<Badge tone="warning">Pending</Badge>}
                  />
                  <ListRow
                    icon={FileText}
                    iconTone="neutral"
                    title="Invoice generated"
                    description="PDF ready to download"
                  />
                </GroupedList>
              </div>
            </Grid2>
          </Section>
        )}

        {/* ═══════════════ SEPARATOR ═══════════════ */}
        {show('layout') && (
          <Section title="Separator">
            <div className="flex flex-col gap-4">
              <Separator />
              <div className="flex items-center gap-4">
                <p className="text-sm text-ink-2">Left</p>
                <Separator orientation="vertical" className="h-8" />
                <p className="text-sm text-ink-2">Right</p>
              </div>
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="shrink-0 text-xs text-ink-3">Or continue with</span>
                <Separator className="flex-1" />
              </div>
            </div>
          </Section>
        )}

        {/* ═══════════════ OVERLAYS ═══════════════ */}
        {show('layout') && (
          <Section
            title="Overlays"
            note="Modal, bottom sheet, side panel, action sheet, popover, dropdown, confirm."
          >
            <Row>
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Modal
              </Button>
              <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                Bottom sheet
              </Button>
              <Button variant="secondary" onClick={() => setPanelOpen(true)}>
                Side panel
              </Button>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                Confirm delete
              </Button>
              <Button variant="secondary" onClick={() => setMenuOpen(true)}>
                Dropdown
              </Button>
              <Button variant="secondary" onClick={() => setListOpen(true)}>
                Action sheet
              </Button>
              <Popover
                trigger={<Button variant="ghost">Popover</Button>}
                content={
                  <div className="flex flex-col gap-1 p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setModalOpen(true)}
                    >
                      Rename
                    </Button>
                    <Separator />
                    <Button variant="ghost" size="sm" className="w-full justify-start text-danger">
                      Delete
                    </Button>
                  </div>
                }
                align="end"
              />
            </Row>

            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Add a device"
              description="Open the app on the new device and enter this code."
            >
              <div className="rounded-control bg-surface-3 px-4 py-3 text-center font-mono text-lg font-semibold tracking-widest">
                4F9K-2X
              </div>
            </Modal>

            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => {
                setConfirmOpen(false);
                push({ message: 'Deleted', tone: 'danger' });
              }}
              title="Delete this order?"
              description="This cannot be undone."
              confirmLabel="Delete"
              destructive
            />

            <BottomSheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              md="modal"
              title="Choose a plan"
              description="Storage renews 12 October."
            >
              <SegmentedMeter
                segments={[
                  { value: 42, tone: 'accent', label: 'Documents' },
                  { value: 21, tone: 'success', label: 'Photos' },
                  { value: 3, label: 'Other' },
                ]}
              />
              <p className="mt-2 text-sm text-ink-2">156 GB of 200 GB used.</p>
              <Button variant="primary" fullWidth onClick={() => setSheetOpen(false)}>
                Change plan
              </Button>
            </BottomSheet>

            <SidePanel
              open={panelOpen}
              onClose={() => setPanelOpen(false)}
              title="Order #1042"
              description="Placed 12 November"
            >
              <div className="flex flex-col gap-3">
                <p className="text-sm">2 items · Total: £84.20</p>
                <Button variant="secondary" fullWidth>
                  Print invoice
                </Button>
                <Button variant="danger" fullWidth>
                  Cancel order
                </Button>
              </div>
            </SidePanel>

            <ActionSheet
              open={listOpen}
              onClose={() => setListOpen(false)}
              title="Notifications"
              cancelLabel="Close"
              options={[
                {
                  label: 'Push notifications',
                  icon: <Bell className="size-4" />,
                  onSelect: () => {},
                },
                { label: 'Email', icon: <Bell className="size-4" />, onSelect: () => {} },
                {
                  label: 'Disable all',
                  icon: <Bell className="size-4" />,
                  danger: true,
                  onSelect: () => {},
                },
              ]}
            />

            <Dropdown
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              align="start"
              triggerRef={undefined}
              items={[
                { label: 'Edit', icon: <Pencil className="size-4" />, onSelect: () => {} },
                { separator: true, label: '' },
                {
                  label: 'Delete',
                  icon: <Trash2 className="size-4" />,
                  danger: true,
                  onSelect: () => setConfirmOpen(true),
                },
              ]}
            />
          </Section>
        )}

        {/* ═══════════════ NAVIGATION ═══════════════ */}
        {show('layout') && (
          <Section title="Navigation patterns">
            <Grid2>
              <div className="flex flex-col gap-4">
                <SubSection title="TopBar">
                  <TopBar
                    title={topBarTitle}
                    leading={<IconTile icon={Layers} tone="accent" size="sm" />}
                  />
                </SubSection>
                <SubSection title="Icon rail">
                  <IconRail
                    items={[
                      { icon: Home, label: 'Home', value: 'home' },
                      { icon: Box, label: 'Products', value: 'products' },
                      { icon: ShoppingBag, label: 'Orders', value: 'orders' },
                      { icon: Settings, label: 'Settings', value: 'settings' },
                    ]}
                    value={railTab}
                    onChange={setRailTab}
                    className="static rounded-card"
                  />
                </SubSection>
                <SubSection title="Breadcrumb">
                  <Breadcrumb
                    items={[
                      { label: 'Catalogue', href: '/catalogue' },
                      { label: 'Electronics', href: '/catalogue/electronics' },
                      { label: 'Studio 16' },
                    ]}
                  />
                </SubSection>
                <SubSection title="Breadcrumb v2 (batch 15)">
                  <div className="flex flex-col gap-3">
                    <Breadcrumb
                      items={[
                        { label: 'Home', href: '/', icon: <Home className="size-3.5" /> },
                        { label: 'Catalogue', href: '/catalogue' },
                        { label: 'Electronics', href: '/catalogue/electronics' },
                        { label: 'Laptops', href: '/catalogue/electronics/laptops' },
                        { label: 'Studio 16' },
                      ]}
                      maxVisible={3}
                    />
                    <Breadcrumb
                      items={[
                        { label: 'Home', href: '/' },
                        { label: 'Account', href: '/account' },
                        { label: 'Orders' },
                      ]}
                      separator={<span className="text-ink-4">/</span>}
                    />
                  </div>
                </SubSection>
              </div>
              <div>
                <SubSection title="Sidebar">
                  <Sidebar
                    items={[
                      { leading: User, label: 'Account', value: 'account' },
                      { leading: ShoppingBag, label: 'Orders', value: 'orders', badge: 3 },
                      { leading: Layers, label: 'Catalogue', value: 'catalogue' },
                      { leading: Settings, label: 'Settings', value: 'settings', disabled: true },
                    ]}
                    value={sidebarTab}
                    onChange={setSidebarTab}
                    header={<p className="text-sm font-medium">Store admin</p>}
                    footer={<p className="text-xs text-ink-3">v2.0.0</p>}
                    className="static rounded-card"
                  />
                </SubSection>
                <SubSection title="TopBar editable">
                  <Input
                    value={topBarTitle}
                    onChange={(e) => setTopBarTitle(e.target.value)}
                    placeholder="Change TopBar title…"
                    aria-label="TopBar title"
                  />
                </SubSection>
              </div>
            </Grid2>

            <SubSection title="BottomTabBar (viewport bottom)">
              <p className="text-xs text-ink-3">
                Lives at the viewport bottom — see the fixed bar below.
              </p>
            </SubSection>
          </Section>
        )}

        {/* ═══════════════ OVERLAYS & HINTS (batch 13) ═══════════════ */}
        {tab === 'overlay' && (
          <Section title="Overlays & hints (batch 13)" subtitle="HoverCard / rich Tooltip">
            <HStack gap={4}>
              <HoverCard
                trigger={<Button variant="secondary">Hover top</Button>}
                content="Top tooltip"
                side="top"
              />
              <HoverCard
                trigger={<Button variant="secondary">Hover bottom</Button>}
                content="Bottom tooltip"
                side="bottom"
              />
              <HoverCard
                trigger={<Button variant="secondary">Hover right</Button>}
                content="Right tooltip"
                side="right"
              />
              <HoverCard
                trigger={<Button variant="secondary">Hover left</Button>}
                content="Left tooltip"
                side="left"
              />
            </HStack>
          </Section>
        )}

        {/* ═══════════════ MINI CART DRAWER (batch 18) ═══════════════ */}
        {tab === 'overlay' && (
          <Section title="Mini cart drawer (batch 18)" subtitle="CartDrawer on SidePanel">
            <Button variant="primary" onClick={() => setCartOpen(true)}>
              Open cart ({cartItems.reduce((n, l) => n + l.qty, 0)})
            </Button>
            <CartDrawer
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              items={cartItems}
              subtotal={`$${cartItems.reduce((n, l) => n + l.qty * Number.parseFloat(l.price.slice(1)), 0).toFixed(2)}`}
              onQtyChange={(id, qty) =>
                setCartItems((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)))
              }
              onRemove={(id) => setCartItems((prev) => prev.filter((l) => l.id !== id))}
              onCheckout={() => setCartOpen(false)}
            />
          </Section>
        )}

        {/* ═══════════════ FLOATING SURFACES (batch 21) ═══════════════ */}
        {tab === 'overlay' && (
          <Section
            title="Floating surfaces (batch 21)"
            subtitle="Pinned panel · floating panel · pop-out window · PiP container"
          >
            <Stack gap={6}>
              <div>
                <Text as="span" tone="ink-3" size="sm">
                  FloatingPanel — draggable utility window
                </Text>
                <div className="relative mt-2 h-56 overflow-hidden rounded-card mat-well">
                  <FloatingPanel title="Inspector" defaultPosition={{ x: 24, y: 20 }}>
                    Drag me by the grip.
                  </FloatingPanel>
                </div>
              </div>

              <Separator />

              <div>
                <Text as="span" tone="ink-3" size="sm">
                  Pop-out window — real browser window portal
                </Text>
                <div className="mt-2 flex items-center gap-3">
                  <Button variant="secondary" onClick={() => setPopoutOpen((v) => !v)}>
                    {popoutOpen ? 'Close popout' : 'Open popout'}
                  </Button>
                  <Text as="span" tone="ink-3" size="xs">
                    Opens a themed mini-window (fallback shown if blocked).
                  </Text>
                </div>
                <PopoutPanel
                  open={popoutOpen}
                  title="Design QA popout"
                  onClose={() => setPopoutOpen(false)}
                  fallback={
                    <Surface className="mt-3 p-4 text-sm text-ink-2">
                      Popup blocked — showing inline fallback.
                    </Surface>
                  }
                >
                  <Stack gap={2}>
                    <Heading level={3}>Popout content</Heading>
                    <Text size="sm" tone="ink-2">
                      This subtree renders into a separate window via a React portal.
                    </Text>
                  </Stack>
                </PopoutPanel>
              </div>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ PINNED PANEL & PIP (batch 21) ═══════════════ */}
        {tab === 'overlay' && (
          <Section
            title="Pinned panel & PiP (batch 21)"
            subtitle="Edge-pinned panel · picture-in-picture mini container"
          >
            <Stack gap={4}>
              <Text as="span" tone="ink-3" size="sm">
                PinnedPanel (bottom) and PipContainer (top-left) render fixed to the viewport
                corner.
              </Text>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setPipExpanded((v) => !v)}>
                  {pipExpanded ? 'Collapse PiP' : 'Expand PiP'}
                </Button>
              </div>
            </Stack>
            <PinnedPanel
              edge="bottom"
              className="bottom-20 left-1/2 w-[min(420px,90vw)] -translate-x-1/2 p-3 text-xs text-ink-2"
            >
              PinnedPanel — fixed to the bottom edge (demo).
            </PinnedPanel>
            <PipContainer
              corner="top-left"
              label="Now playing"
              expanded={pipExpanded}
              onToggle={setPipExpanded}
            >
              <Frame ratio="video" className="rounded-control">
                <div className="mat-well grid place-items-center text-xs text-ink-3">PiP clip</div>
              </Frame>
            </PipContainer>
          </Section>
        )}

        {/* ═══════════════ HOOKS (batch 16) ═══════════════ */}
        {show('layout') && (
          <Section
            title="Mini hooks (batch 16)"
            subtitle="useToggle · usePrevious · useInterval · useTimeout · useClickAway"
          >
            <Card>
              <HStack gap={4} className="items-center">
                <Button variant={hookOn ? 'primary' : 'secondary'} onClick={toggleHookOn}>
                  {hookOn ? 'Stop ticker' : 'Start ticker'}
                </Button>
                <span className="font-mono text-sm tabular-nums">ticks: {hookTicks}</span>
                <span className="text-sm text-ink-3">
                  previous toggle state: {String(prevHookOn)}
                </span>
              </HStack>
            </Card>
          </Section>
        )}

        {/* ── fixed bottom tab bar ── */}
        <BottomTabBar items={navItems} value="home" onChange={() => {}} />
      </div>
    </Stage3D>
  );
}
