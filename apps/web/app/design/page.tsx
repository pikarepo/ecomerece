'use client';

import {
  Abbr,
  Accordion,
  AccordionItem,
  ActionSheet,
  AlbumCard,
  AnnouncementBanner,
  AppStoreBadge,
  ArrowButton,
  ArticleCard,
  AspectRatio,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  BatteryIndicator,
  Bento,
  BentoCell,
  Bleed,
  BlogCard,
  BottomSheet,
  BottomTabBar,
  BottomTabBarFAB,
  Breadcrumb,
  BubbleMenu,
  Bullet,
  BusinessHours,
  Button,
  Byline,
  CallControls,
  CameraButton,
  Card,
  Carousel,
  CartDrawer,
  type CartLine,
  Checkbox,
  Chip,
  ChipButton,
  ChoiceChip,
  ChangelogPopup,
  ChecklistWidget,
  Citation,
  Cluster,
  Code,
  Columns,
  Combobox,
  ConfirmDialog,
  ConnectionQuality,
  Container,
  CookieConsentBanner,
  CooldownButton,
  Countdown,
  CountdownButton,
  CouponCard,
  Cover,
  CreditCardVisual,
  cn,
  DataBar,
  DataGrid,
  DatePicker,
  Definition,
  Display,
  Div,
  DoubleClickToConfirm,
  DragHandle,
  DropCap,
  Dropdown,
  Duration,
  EffectButton,
  Emoji,
  EmptyState,
  EndCallButton,
  ErrorPage,
  ErrorState,
  ExpandCollapseButton,
  ExpiredLinkPage,
  FadeInText,
  FatFooter,
  Field,
  FileUpload,
  FilterChip,
  FlightCard,
  FloatingBottomNav,
  FloatingPanel,
  FloatingToolbar,
  Footnote,
  FootnoteList,
  FootnoteRef,
  FeatureAnnouncement,
  Frame,
  FullscreenButton,
  focusRing,
  GaugeKPI,
  GdprConsentModal,
  GiftCard,
  GlowButton,
  GradientBorderButton,
  GradientText,
  GripButton,
  GroupedList,
  Gutter,
  Hashtag,
  Heading,
  HeatCell,
  Hide,
  HoldToConfirmButton,
  HotelCard,
  HelpPanel,
  HoverCard,
  HStack,
  IconButton,
  IconRail,
  IconTile,
  Imposter,
  InlineBadge,
  InlineToolbar,
  Input,
  InputChip,
  JustifiedGallery,
  Kbd,
  KeyboardAvoidingView,
  LineClamp,
  Link,
  ListHeader,
  ListingCard,
  ListRow,
  MagneticButton,
  MasonryBoard,
  MediaControls,
  MegaFooter,
  Mention,
  MetricCard,
  MicButton,
  Modal,
  MovieCard,
  MosaicGrid,
  MosaicItem,
  MultiColumn,
  NameRole,
  NewsCard,
  NumberInput,
  Offset,
  Orientation,
  OTP,
  OutlineText,
  Pagination,
  PanPad,
  PinnedPanel,
  PipContainer,
  PodcastCard,
  PopoutPanel,
  OfflineState,
  OnboardingModal,
  Popover,
  ProductCard,
  ProductTour,
  Progress,
  PromoBanner,
  PromptModal,
  PropertyCard,
  PromoCode,
  Pull,
  PullHandle,
  PullQuote,
  PullToRefresh,
  Push,
  QrDownload,
  Radio,
  Raised,
  Range,
  Rating,
  ReadMore,
  RecipeCard,
  Reel,
  ResendCodeButton,
  ResizeHandle,
  RippleButton,
  RotateControl,
  RouteProgressBar,
  SafeArea,
  SaveStatus,
  ScrambleText,
  ScreenShareButton,
  ScrollArea,
  ScrollButton,
  ScrollProgress,
  ScrollReveal,
  ScrollSpy,
  ScrollToTop,
  SearchField,
  SegmentedControl,
  SegmentedMeter,
  Select,
  Separator,
  SessionTimeoutWarning,
  ShimmerButton,
  Show,
  Sidebar,
  SidebarLayout,
  SidePanel,
  SignInButton,
  Skeleton,
  SkeletonTable,
  SkeletonText,
  SLAIndicator,
  Slider,
  SocialBar,
  Sparkline,
  Spinner,
  SplashScreen,
  SplitText,
  Stack,
  Stage3D,
  StatTile,
  StatusDot,
  StatusLights,
  StepperButtons,
  StickyCtaBar,
  StickyFooter,
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
  type TableColumn,
  type TableSort,
  Tabs,
  Tag,
  TeamStack,
  ThankYouPage,
  Text,
  Textarea,
  TextDiff,
  TicketCard,
  TimeAgo,
  Timeline,
  TipsCarousel,
  TimePicker,
  TimezoneClock,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  TopBar,
  TreeView,
  TrendArrow,
  Typewriter,
  UnderConstructionPage,
  useInterval,
  usePrevious,
  useSkin,
  useToast,
  useToggle,
  VerificationPendingPage,
  VideoCard,
  VisuallyHidden,
  WalletButton,
  Well,
  WindowControls,
  WordRotator,
  ZoomControls,
  AvatarPicker,
  CardCvcInput,
  CardExpiryInput,
  CardInput,
  CardNumberInput,
  CoordinatesInput,
  CurrencyPicker,
  EmailInput,
  EmojiPicker,
  FontPicker,
  GradientPicker,
  IbanInput,
  IconPicker,
  LayoutPicker,
  PasswordInput,
  PostalCodeInput,
  ShadowPicker,
  SsnInput,
  TemplatePicker,
  TextField,
  ThemePicker,
  TimezonePicker,
  UnitPicker,
  UrlInput,
  UsernameInput,
} from '@ecomerece/ui';
import {
  AccordionNav,
  AsyncValidationIndicator,
  CameraCapture,
  ClosableTabs,
  type CommandGroup,
  type CommandItem,
  CommandMenu,
  ConditionalField,
  DateRangePresets,
  Dock,
  DocumentTabs,
  DraggableTabs,
  DirtyIndicator,
  EmailChipsInput,
  FacetedFilterPanel,
  FieldArray,
  FilterBuilder,
  FormWizard,
  FullscreenMenu,
  HistogramSlider,
  Hamburger,
  HistoryDropdown,
  type HistoryEntry,
  ImageSelectGrid,
  PermalinkCopier,
  RecentlyViewed,
  type RecentlyViewedItem,
  ShareLink,
  SiteSearch,
  type SiteSearchSection,
  VoiceSearchButton,
  LikertScale,
  MarksSlider,
  MiniSidebar,
  MultiLevelSidebar,
  NpsScale,
  OffCanvas,
  OverflowTabs,
  PasteImageZone,
  ProgressDots,
  RadialMenu,
  SavedViews,
  SortBuilder,
  StepperSlider,
  Stepper,
  StickyTabs,
  SwatchSelect,
  TimelineStepper,
  TabbedForm,
  TagInput,
  ThumbsRating,
  TileSelect,
  ToggleChipGroup,
  TokenInput,
  TooltipSlider,
  UnsavedChangesBar,
  UploadQueue,
  Honeypot,
  PasskeyPrompt,
  RecoveryCodes,
  TwoFactorSetup,
  TwoFactorStatus,
  ValidationSummary,
  VerticalSlider,
  AppCard,
  BusinessCard,
  ContactCard,
  DraggableCard,
  ExpandableCard,
  FeatureCard,
  FileCard,
  FlipCard,
  FolderCard,
  HorizontalCard,
  HoverRevealCard,
  IntegrationCard,
  MetricAlertCard,
  NotificationCard,
  OverlayImageCard,
  ProjectCard,
  ReviewCard,
  SelectableCard,
  StackedCards,
  TaskCard,
  TeamMemberCard,
  AlphabetIndexList,
  ChatList,
  ChecklistList,
  ContactList,
  InfiniteList,
  InfiniteScrollLoader,
  InlineHelp,
  NestedList,
  NotificationList,
  PlaylistList,
  ReorderableList,
  SearchResults,
  StickyHeaderList,
  SwipeList,
  TodoList,
  AnnotationPins,
  DiffView,
  DocumentPreview,
  DocumentThumbnails,
  ReaderMode,
  TocPanel,
  VersionHistory,
  BalanceCard,
  BudgetBar,
  DepthChart,
  InvoiceReceipt,
  OrderBook,
  PortfolioBreakdown,
  PriceChangeBadge,
  PriceTicker,
  TickerTape,
  TransactionList,
  LyricsView,
  NowPlayingBar,
  PlaylistRow,
  PodcastRow,
  PosterCard,
  QueuePanel,
  ThumbnailGrid,
  WizardDialog,
  MegaDropdown,
  QuickViewPanel,
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
  Github,
  Globe,
  Home,
  Instagram,
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
  Twitter,
  Underline,
  Upload,
  User,
  Youtube,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

        {/* ════════════════ BATCHES 62–69 ════════════════ */}

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
        {show('controls') && (
          <Section
            title="Form inputs II (batches 43–48)"
            subtitle="Text variants · smart & pattern inputs · pickers"
          >
            <Stack gap={5}>
              <SubSection title="Text field variants (batch 43)">
                <Grid2>
                  <TextField variant="outlined" label="Outlined" placeholder="you@example.com" />
                  <TextField variant="filled" label="Filled" placeholder="Search…" />
                  <TextField variant="underlined" label="Underlined" placeholder="Underlined" />
                  <TextField variant="borderless" label="Borderless" placeholder="Borderless" />
                  <TextField variant="inset" label="Inset" placeholder="Inset" />
                  <TextField floating label="Floating label" />
                  <TextField
                    label="With counter"
                    defaultValue="Count me"
                    maxLength={20}
                    showCount
                  />
                  <TextField label="With hint" hint="We never share your email" />
                </Grid2>
              </SubSection>

              <SubSection title="Smart inputs (batch 44)">
                <Grid2>
                  <EmailInput aria-label="Email" placeholder="ada@gm" defaultValue="ada@gm" />
                  <UrlInput aria-label="Website" placeholder="example" defaultValue="example" />
                  <UsernameInput
                    aria-label="Username"
                    placeholder="Choose a username"
                    defaultValue="ada"
                  />
                  <PasswordInput aria-label="Password" placeholder="Password" defaultValue="secret" />
                </Grid2>
              </SubSection>

              <SubSection title="Pattern inputs (batch 45)">
                <Grid2>
                  <CardNumberInput aria-label="Card" defaultValue="4242424242424242" />
                  <CardExpiryInput aria-label="Expiry" defaultValue="1229" />
                  <CardCvcInput aria-label="CVC" defaultValue="123" />
                  <IbanInput aria-label="IBAN" defaultValue="GB82WEST12345698765432" />
                  <SsnInput aria-label="SSN" defaultValue="123456789" mask />
                  <PostalCodeInput aria-label="Postal" defaultValue="sw1a1aa" />
                  <CoordinatesInput latitude={51.5} longitude={-0.12} />
                  <CardInput number="4242 4242 4242 4242" />
                </Grid2>
              </SubSection>

              <SubSection title="Pickers I (batch 46)">
                <Grid2>
                  <UnitPicker value="px" />
                  <CurrencyPicker value="USD" />
                  <TimezonePicker value="UTC" />
                  <AvatarPicker name="Ada Lovelace" />
                </Grid2>
              </SubSection>

              <SubSection title="Pickers II (batch 47)">
                <div className="flex flex-wrap items-start gap-4">
                  <EmojiPicker />
                  <FontPicker value="georgia" />
                  <IconPicker value="heart" />
                  <GradientPicker />
                  <ShadowPicker />
                </div>
              </SubSection>

              <SubSection title="Pickers III — template / layout / theme (batch 48)">
                <Stack gap={4}>
                  <TemplatePicker value="blank" />
                  <LayoutPicker value="single" />
                  <ThemePicker value="light" />
                </Stack>
              </SubSection>
            </Stack>
          </Section>
        )}

        {/* ═══════════════ NAV BUTTONS (batch 55) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Stepper, arrow & scroll buttons (batch 55)"
            subtitle="± stepper pair · chevron arrows · scroll nudge"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <StepperButtons value={3} onValueChange={() => {}}>
                    3
                  </StepperButtons>
                  <StepperButtons value={1} min={0} max={5} size="sm" variant="ghost" onValueChange={() => {}}>
                    1
                  </StepperButtons>
                  <ArrowButton direction="left" />
                  <ArrowButton direction="right" />
                  <ArrowButton direction="up" />
                  <ArrowButton direction="down" />
                  <ScrollButton direction="down" />
                </HStack>
                <Text size="sm" tone="ink-2">
                  `StepperButtons` clamps to `min`/`max`; `ScrollButton` scrolls its `target` (or the
                  window) by `amount` px.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ WINDOW BUTTONS (batch 56) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Expand, fullscreen & window controls (batch 56)"
            subtitle="Panel chrome — chevron toggle · fullscreen API · minimize/maximize/close"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <ExpandCollapseButton expanded={false} />
                  <ExpandCollapseButton expanded />
                  <FullscreenButton />
                  <WindowControls />
                  <WindowControls traffic />
                </HStack>
                <Text size="sm" tone="ink-2">
                  `FullscreenButton` tracks `fullscreenchange`; `WindowControls` has a glyph mode and a
                  macOS-style `traffic` mode.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ VIEWPORT & MEDIA CONTROLS (batch 57) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Zoom, pan, rotate & media controls (batch 57)"
            subtitle="Viewport transform + media transport"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={5} className="flex-wrap items-center">
                  <ZoomControls value={1} onValueChange={() => {}} />
                  <PanPad onPan={() => {}} />
                  <RotateControl value={0} onValueChange={() => {}} />
                </HStack>
                <MediaControls
                  playing
                  onPlayPause={() => {}}
                  onStop={() => {}}
                  onNext={() => {}}
                  onPrevious={() => {}}
                  onShuffle={() => {}}
                  onRepeatToggle={() => {}}
                />
                <Text size="sm" tone="ink-2">
                  Zoom clamps to `min`/`max`; `PanPad` emits direction vectors; repeat cycles
                  off → all → one.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ CALL CONTROLS (batch 58) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Call controls (batch 58)"
            subtitle="Mic · camera · screen share · end call"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <MicButton muted={false} />
                  <MicButton muted />
                  <CameraButton enabled />
                  <CameraButton enabled={false} />
                  <ScreenShareButton sharing={false} />
                  <ScreenShareButton sharing />
                  <EndCallButton />
                </HStack>
                <CallControls
                  muted={false}
                  cameraOn
                  sharing={false}
                  onToggleMute={() => {}}
                  onToggleCamera={() => {}}
                  onToggleShare={() => {}}
                  onEndCall={() => {}}
                />
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ CONTEXTUAL TOOLBARS (batch 59) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Floating, bubble & inline toolbars (batch 59)"
            subtitle="Positioned toolbars for editors and text-selection menus"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <FloatingToolbar>
                    <ToolbarButton aria-label="Bold">
                      <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton aria-label="Italic">
                      <Italic className="size-4" />
                    </ToolbarButton>
                  </FloatingToolbar>
                  <BubbleMenu>
                    <ToolbarButton aria-label="Copy">
                      <Copy className="size-4" />
                    </ToolbarButton>
                  </BubbleMenu>
                  <InlineToolbar>
                    <ToolbarButton aria-label="Bold">
                      <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton aria-label="Italic">
                      <Italic className="size-4" />
                    </ToolbarButton>
                  </InlineToolbar>
                </HStack>
                <Text size="sm" tone="ink-2">
                  `FloatingToolbar` positions itself from `x`/`y`; `BubbleMenu` `preventDefault`s
                  mousedown so a text selection survives; `InlineToolbar` is a compact inline strip.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ HANDLES (batch 60) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Drag, resize & pull handles (batch 60)"
            subtitle="Grip dots · resize affordances · bottom-sheet pull pill"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={4} className="flex-wrap items-center">
                  <DragHandle />
                  <GripButton />
                  <ResizeHandle edge="horizontal" />
                  <ResizeHandle edge="vertical" />
                  <ResizeHandle />
                  <div className="w-48">
                    <PullHandle />
                  </div>
                </HStack>
                <Text size="sm" tone="ink-2">
                  `ResizeHandle` exposes `onResize` (pointer down) and a `data-resize-edge`; the
                  `PullHandle` is the familiar bottom-sheet pill.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ PROVIDER BUTTONS (batch 61) ═══════════════ */}
        {show('controls') && (
          <Section
            title="Sign-in, wallet & store buttons (batch 61)"
            subtitle="Identity providers · wallet checkout · app-store badges · QR download"
          >
            <Card padding="md">
              <Stack gap={4}>
                <HStack gap={3} className="flex-wrap items-center">
                  <SignInButton provider="apple" />
                  <SignInButton provider="google" />
                  <SignInButton provider="github" />
                  <SignInButton provider="microsoft" />
                </HStack>
                <HStack gap={3} className="flex-wrap items-center">
                  <WalletButton provider="apple-pay" />
                  <WalletButton provider="google-pay" />
                  <WalletButton provider="paypal" />
                </HStack>
                <HStack gap={3} className="flex-wrap items-center">
                  <AppStoreBadge store="app-store" href="#" />
                  <AppStoreBadge store="google-play" href="#" />
                  <QrDownload
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'></svg>"
                    label="Scan to download"
                    size="sm"
                  />
                </HStack>
                <Text size="sm" tone="ink-2">
                  Identity buttons label themselves `Sign in with {'{provider}'}`; wallet buttons use
                  the `mat-primary` fill; `QrDownload` frames a QR `src` (or children) with a caption.
                </Text>
              </Stack>
            </Card>
          </Section>
        )}

        {/* ═══════════════ FORM INPUTS II (batches 43–48) ═══════════════ */}
        {show('controls') && <Batches62To69Demos />}
        {show('controls') && <Batch70SecurityDemos />}
        {show('layout') && <Batch71NavDemos />}
        {show('layout') && <Batch72TabsDemos />}
        {show('layout') && <Batch73StepperDemos />}
        {show('layout') && <Batch74SideNavDemos />}
        {show('layout') && <Batch75BottomNavDemos />}
        {show('layout') && <Batch76FooterDemos />}
        {show('layout') && <Batch77CommandMenuDemos />}
        {show('layout') && <Batch78ShareHistoryDemos />}
        {show('layout') && <Batch79SiteSearchDemos />}

        {/* ── fixed bottom tab bar ── */}
        <BottomTabBar items={navItems} value="home" onChange={() => {}} />
      

        {/* ═══════════════ TABLE VARIANTS (batch 80) ═══════════════ */}
        {show('data') && <Batch80TableVariantsDemos />}

        {/* ═══════════════ TABLE POWER (batch 81) ═══════════════ */}
        {show('data') && <Batch81TablePowerDemos />}

        {/* ═══════════════ IN-CELL MARKS (batch 82) ═══════════════ */}
        {show('data') && <Batch82InCellDemos />}

        {/* ═══════════════ PEOPLE (batch 83) ═══════════════ */}
        {show('data') && <Batch83PeopleDemos />}

        {/* ═══════════════ CONTENT CARDS (batch 84) ═══════════════ */}
        {show('data') && <Batch84ContentCardDemos />}

        {/* ═══════════════ COMMERCE CARDS (batch 85) ═══════════════ */}
        {show('data') && <Batch85CommerceCardDemos />}

        {/* ═══════════════ WORK CARDS (batch 86) ═══════════════ */}
        {show('data') && <Batch86WorkCardDemos />}

        {/* ═══════════════ LISTS (batch 87) ═══════════════ */}
        {show('data') && <Batch87ListDemos />}

        {/* ═══════════════ DOCUMENTS (batch 90) ═══════════════ */}
        {show('data') && <Batch90DocumentDemos />}

        {/* ═══════════════ FINANCIAL (batch 91) ═══════════════ */}
        {show('data') && <Batch91FinancialDemos />}

        {/* ═══════════════ MEDIA DISPLAY (batch 92) ═══════════════ */}
        {show('data') && <Batch92MediaDisplayDemos />}

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

        {/* ═══════════════ MODAL VARIANTS (batch 93) ═══════════════ */}
        {show('overlay') && <Batch93ModalVariantDemos />}

        {/* ═══════════════ POPOVER VARIANTS (batch 94) ═══════════════ */}
        {show('overlay') && <Batch94PopoverVariantDemos />}

        {/* ═══════════════ TOAST UPGRADES (batch 95) ═══════════════ */}
        {show('feedback') && <Batch95ToastDemos />}

        {/* ═══════════════ SYSTEM BANNERS (batch 96) ═══════════════ */}
        {show('feedback') && <Batch96SystemBannerDemos />}

        {/* ═══════════════ LOADING (batch 97) ═══════════════ */}
        {show('feedback') && <Batch97LoadingDemos />}

        {/* ═══════════════ STATE PAGES (batch 98) ═══════════════ */}
        {show('feedback') && <Batch98StatePageDemos />}

        {/* ═══════════════ GUIDANCE (batch 99) ═══════════════ */}
        {show('feedback') && <Batch99GuidanceDemos />}
      </div>
    </Stage3D>
  );
}


/* ──────────────── batch 62–69 demos (self-contained state) ──────────────── */

const IMG_SLATE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%23334155'/><circle cx='40' cy='40' r='16' fill='%2394a3b8'/></svg>";
const IMG_TEAL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%230f766e'/><circle cx='40' cy='40' r='16' fill='%235eead4'/></svg>";
const IMG_CLAY =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%237c2d12'/><circle cx='40' cy='40' r='16' fill='%23fdba74'/></svg>";

function Batches62To69Demos() {
  /* batch 62 — selection extras */
  const [tile, setTile] = useState('standard');
  const [imgs, setImgs] = useState<string[]>(['p1']);
  const [swatch, setSwatch] = useState('#6366f1');
  const [chips, setChips] = useState<string[]>(['new-in']);
  const [nps, setNps] = useState<number | null>(9);
  const [likert, setLikert] = useState<number | null>(4);
  const [thumbs, setThumbs] = useState<'up' | 'down' | null>('up');
  /* batch 63 — slider extras */
  const [mslider, setMSlider] = useState(40);
  const [tslider, setTSlider] = useState(60);
  const [vslider, setVSlider] = useState(30);
  const [hslider, setHSlider] = useState(50);
  const [sslider, setSSlider] = useState(20);
  /* batch 64 — chip inputs */
  const [tags, setTags] = useState(['sale']);
  const [tokens, setTokens] = useState<Array<{ key: string; value: string }>>([
    { key: 'env', value: 'prod' },
  ]);
  const [emails, setEmails] = useState(['ada@example.com']);
  /* batch 68 — field arrays & conditional */
  const [rows, setRows] = useState(['Line item A']);
  const [shipAlt, setShipAlt] = useState(true);
  /* batch 69 — search & filter */
  const [rules, setRules] = useState<Array<{ field: string; operator: string; value: string }>>([
    { field: 'price', operator: 'is greater than', value: '100' },
  ]);
  const [sorts, setSorts] = useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
    { field: 'name', dir: 'asc' },
  ]);
  const [facets, setFacets] = useState<Record<string, string[]>>({ category: ['Phone'] });
  const [preset, setPreset] = useState<'today' | '7d' | '30d' | 'month' | 'year' | 'custom'>('7d');
  /* batch 67 — UnsavedChangesBar demo dirty flag (never leave `when` hard-wired
   * true: it arms beforeunload globally and pins the bar on the page). */
  const [unsavedDemo, setUnsavedDemo] = useState(false);

  const catalogFields = [
    { id: 'name', label: 'Name' },
    { id: 'price', label: 'Price' },
    { id: 'category', label: 'Category' },
  ];

  return (
    <>
      <Section
        title="Selection extras (batch 62)"
        subtitle="Tile select · image grid · swatches · toggle chips · NPS · Likert · thumbs"
      >
        <Stack gap={5}>
          <SubSection title="Tile select & image grid">
            <Stack gap={4}>
              <TileSelect
                value={tile}
                onValueChange={setTile}
                label="Shipping"
                options={[
                  { value: 'standard', label: 'Standard', description: '3–5 business days' },
                  { value: 'express', label: 'Express', description: '1–2 business days' },
                  { value: 'overnight', label: 'Overnight', description: 'Next morning' },
                ]}
              />
              <ImageSelectGrid
                columns={3}
                label="Cover photo"
                selected={imgs}
                onSelectedChange={setImgs}
                items={[
                  { id: 'p1', src: IMG_SLATE, label: 'Slate' },
                  { id: 'p2', src: IMG_TEAL, label: 'Teal' },
                  { id: 'p3', src: IMG_CLAY, label: 'Clay' },
                ]}
              />
            </Stack>
          </SubSection>
          <SubSection title="Swatches, toggle chips & thumbs">
            <HStack gap={5} className="flex-wrap items-start">
              <SwatchSelect
                value={swatch}
                onValueChange={setSwatch}
                label="Color"
                colors={['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444']}
              />
              <ToggleChipGroup
                values={chips}
                onValuesChange={setChips}
                label="Tags"
                options={[
                  { value: 'new-in', label: 'New in' },
                  { value: 'sale', label: 'Sale' },
                  { value: 'clearance', label: 'Clearance' },
                  { value: 'organic', label: 'Organic' },
                ]}
              />
              <ThumbsRating value={thumbs} onValueChange={setThumbs} />
            </HStack>
          </SubSection>
          <SubSection title="Survey scales">
            <Stack gap={4}>
              <NpsScale value={nps} onValueChange={setNps} />
              <LikertScale value={likert} onValueChange={setLikert} label="How was checkout?" />
            </Stack>
          </SubSection>
        </Stack>
      </Section>

      <Section
        title="Slider extras (batch 63)"
        subtitle="Marks · tooltip · vertical · histogram · stepper"
      >
        <Card padding="md">
          <Stack gap={5}>
            <MarksSlider
              value={mslider}
              onValueChange={setMSlider}
              label="Quality"
              marks={[
                { value: 0, label: 'Low' },
                { value: 50, label: 'Mid' },
                { value: 100, label: 'High' },
              ]}
            />
            <TooltipSlider value={tslider} onValueChange={setTSlider} label="With tooltip" />
            <HStack gap={6} className="items-end">
              <VerticalSlider value={vslider} onValueChange={setVSlider} label="Vertical" />
              <HistogramSlider
                value={hslider}
                onValueChange={setHSlider}
                label="Price distribution"
                bins={[2, 5, 9, 14, 20, 26, 22, 16, 10, 6, 3]}
              />
            </HStack>
            <StepperSlider value={sslider} onValueChange={setSSlider} label="Stepper" step={10} />
          </Stack>
        </Card>
      </Section>

      <Section
        title="Chip inputs, uploads & validation (batches 64–67)"
        subtitle="Tag/token/email chips · upload queue, camera & paste · async/dirty/summary"
      >
        <Stack gap={5}>
          <SubSection title="Chip inputs (batch 64)">
            <Grid2>
              <TagInput
                values={tags}
                onValuesChange={setTags}
                suggestions={['new-in', 'clearance', 'gift']}
              />
              <TokenInput tokens={tokens} onTokensChange={setTokens} label="HTTP headers" />
              <EmailChipsInput emails={emails} onEmailsChange={setEmails} />
            </Grid2>
          </SubSection>
          <SubSection title="Upload upgrades (batch 66)">
            <Stack gap={3}>
              <UploadQueue
                items={[
                  { id: 'a', name: 'hero.png', size: 204_800, progress: 40, status: 'uploading' },
                  { id: 'b', name: 'sheet.pdf', size: 1_024_000, progress: 100, status: 'done' },
                  {
                    id: 'c',
                    name: 'clip.mov',
                    size: 2_048_000,
                    progress: 12,
                    status: 'error',
                    error: 'Network error',
                  },
                ]}
              />
              <HStack gap={3} className="flex-wrap items-center">
                <CameraCapture />
                <PasteImageZone className="flex-1" />
              </HStack>
            </Stack>
          </SubSection>
          <SubSection title="Validation parts (batch 67)">
            <Stack gap={3}>
              <HStack gap={4} className="flex-wrap items-center">
                <AsyncValidationIndicator status="validating" message="Checking availability…" />
                <DirtyIndicator dirty={unsavedDemo} touched />
              </HStack>
              <ValidationSummary
                issues={[
                  { field: 'email', message: 'Enter a valid email address' },
                  { field: 'zip', message: 'Postal code is required' },
                ]}
              />
              <HStack gap={3}>
                <Button size="sm" variant="secondary" onClick={() => setUnsavedDemo((v) => !v)}>
                  {unsavedDemo ? 'Clear dirty' : 'Make form dirty'}
                </Button>
                <UnsavedChangesBar
                  when={unsavedDemo}
                  onSave={() => setUnsavedDemo(false)}
                  onDiscard={() => setUnsavedDemo(false)}
                />
              </HStack>
            </Stack>
          </SubSection>
        </Stack>
      </Section>

      <Section
        title="Form layouts (batch 68)"
        subtitle="Wizard · tabbed form · conditional fields · field arrays"
      >
        <Stack gap={5}>
          <FormWizard
            steps={[
              { id: 'account', label: 'Account', content: <Text size="sm" tone="ink-2">Account details step</Text> },
              { id: 'shipping', label: 'Shipping', content: <Text size="sm" tone="ink-2">Shipping details step</Text> },
              { id: 'review', label: 'Review', content: <Text size="sm" tone="ink-2">Review & confirm step</Text> },
            ]}
          />
          <TabbedForm
            tabs={[
              { id: 'profile', label: 'Profile', content: <Text size="sm" tone="ink-2">Profile fields</Text> },
              { id: 'security', label: 'Security', content: <Text size="sm" tone="ink-2">Security fields</Text> },
            ]}
          />
          <Stack gap={3}>
            <Checkbox
              checked={shipAlt}
              onCheckedChange={setShipAlt}
              label="Ship to a different address"
            />
            <ConditionalField show={shipAlt}>
              <TextField label="Alternative address" placeholder="Street, city, ZIP" />
            </ConditionalField>
          </Stack>
          <FieldArray
            label="Line items"
            values={rows}
            renderItem={(value) => <span className="text-sm text-ink">{value}</span>}
            onAdd={() => setRows((r) => [...r, `Line item ${r.length + 1}`])}
            onRemove={(i) => setRows((r) => r.filter((_, j) => j !== i))}
          />
        </Stack>
      </Section>

      <Section
        title="Search & filter (batch 69)"
        subtitle="Sort/filter builders · saved views · date-range presets · faceted panel"
      >
        <Grid2>
          <Card padding="md">
            <SortBuilder fields={catalogFields} value={sorts} onChange={setSorts} />
          </Card>
          <Card padding="md">
            <FilterBuilder fields={catalogFields} value={rules} onChange={setRules} />
          </Card>
          <Card padding="md">
            <SavedViews
              activeId="all"
              views={[
                { id: 'all', name: 'All products', count: 128 },
                { id: 'cheap', name: 'Under $100', count: 12 },
              ]}
              onSelect={() => {}}
            />
          </Card>
          <Card padding="md">
            <Stack gap={3}>
              <DateRangePresets active={preset} onSelect={setPreset} />
              <FacetedFilterPanel
                selected={facets}
                onChange={setFacets}
                onClear={() => setFacets({})}
                groups={[
                  {
                    id: 'category',
                    label: 'Category',
                    options: [
                      { value: 'Phone', label: 'Phone', count: 12 },
                      { value: 'Laptop', label: 'Laptop', count: 5 },
                    ],
                  },
                  {
                    id: 'brand',
                    label: 'Brand',
                    options: [
                      { value: 'acme', label: 'Acme', count: 7 },
                      { value: 'umbra', label: 'Umbra', count: 10 },
                    ],
                  },
                ]}
              />
            </Stack>
          </Card>
        </Grid2>
      </Section>
    </>
  );
}


/* ──────────────── batch 70 demo (self-contained state) ──────────────── */

function Batch70SecurityDemos() {
  const [status, setStatus] = useState<TwoFactorStatus>('idle');
  const [revealed, setRevealed] = useState(false);
  const [hpValue, setHpValue] = useState('');

  return (
    <Section
      title="Security forms (batch 70)"
      subtitle="2FA setup · recovery codes · passkey prompt · honeypot"
    >
      <Grid2>
        <Card padding="md">
          <TwoFactorSetup
            issuer="Aeroforge"
            account="ada@example.com"
            secret="jbswy3dpehp3h3nd"
            otpauthUri="otpauth://totp/Aeroforge:ada@example.com?secret=jbswy3dpehp3h3nd&issuer=Aeroforge"
            status={status}
            onVerify={() => setStatus('verified')}
          />
        </Card>
        <Stack gap={5}>
          <Card padding="md">
            <RecoveryCodes
              codes={['H7G2-K9QZ', 'M4T8-B1XR', 'P0VD-65NW']}
              masked={!revealed}
              onReveal={() => setRevealed((v) => !v)}
              onRegenerate={() => setRevealed(false)}
            />
          </Card>
          <PasskeyPrompt onContinue={() => {}} onCancel={() => {}} />
        </Stack>
        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Honeypot (invisible — gate submissions on an empty value):
            </Text>
            <TextField
              label="Website"
              placeholder="https://…"
              value={hpValue}
              onChange={(e) => setHpValue(e.currentTarget.value)}
            />
            <Honeypot value="" onValueChange={() => {}} />
            <Text size="xs" tone="ink-3">
              Bot-filled value detected: {hpValue ? 'yes' : 'no'}
            </Text>
          </Stack>
        </Card>
      </Grid2>
    </Section>
  );
}


/* ──────────────── batch 71 demo (self-contained state) ──────────────── */

function Batch71NavDemos() {
  const [radialOpen, setRadialOpen] = useState(false);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  return (
    <Section
      title="Floating nav (batch 71)"
      subtitle="dock · radial menu · hamburger · off-canvas drawer · fullscreen menu"
    >
      <Grid2>
        <Card padding="md">
          <Stack gap={4}>
            <Text size="sm" tone="ink-2">
              Hamburger (morphs into an ✕):
            </Text>
            <Hamburger
              open={burgerOpen}
              onOpenChange={setBurgerOpen}
              label="Toggle demo navigation"
            />
            <HStack gap={3}>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Open off-canvas
              </Button>
              <Button variant="secondary" onClick={() => setOverlayOpen(true)}>
                Open fullscreen menu
              </Button>
            </HStack>
          </Stack>
        </Card>
        <Card padding="md">
          <Stack gap={4}>
            <Text size="sm" tone="ink-2">
              Radial menu (click the centre toggle):
            </Text>
            <div className="h-40">
              <RadialMenu
                open={radialOpen}
                onOpenChange={setRadialOpen}
                items={[
                  { id: 'edit', label: 'Edit', icon: <Pencil size={16} /> },
                  { id: 'copy', label: 'Copy', icon: <Copy size={16} /> },
                  { id: 'star', label: 'Star', icon: <Star size={16} /> },
                  { id: 'trash', label: 'Delete', icon: <Trash2 size={16} /> },
                ]}
              />
            </div>
          </Stack>
        </Card>
        <Card padding="md">
          <Stack gap={2}>
            <Text size="sm" tone="ink-2">
              Dock — floats fixed at the top edge of the viewport:
            </Text>
            <Dock
              edge="top"
              items={[
                { id: 'home', label: 'Home', icon: <Home size={18} />, active: true },
                { id: 'search', label: 'Search', icon: <Search size={18} /> },
                { id: 'bag', label: 'Bag', icon: <ShoppingBag size={18} /> },
                { id: 'alerts', label: 'Alerts', icon: <Bell size={18} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
              ]}
            />
          </Stack>
        </Card>
      </Grid2>

      <OffCanvas open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Off-canvas panel">
        <Stack gap={3}>
          <Text size="sm" tone="ink-2">
            Slide-in drawer with scrim. Escape or a scrim click closes it.
          </Text>
          <Link href="#" onClick={() => setDrawerOpen(false)}>
            Close from a link
          </Link>
        </Stack>
      </OffCanvas>

      <FullscreenMenu
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        header="Aeroforge"
        items={[
          { id: 'shop', label: 'Shop' },
          { id: 'lookbook', label: 'Lookbook' },
          { id: 'about', label: 'About' },
          { id: 'contact', label: 'Contact' },
        ]}
      />
    </Section>
  );
}


/* ──────────────── batch 72 demo (self-contained state) ──────────────── */

function Batch72TabsDemos() {
  const [stickyVal, setStickyVal] = useState('all');
  const [closableVal, setClosableVal] = useState('home');
  const [dragVal, setDragVal] = useState('inbox');
  const [overVal, setOverVal] = useState('e');
  const [docVal, setDocVal] = useState('ts');
  const [closableItems, setClosableItems] = useState([
    { value: 'home', label: 'Home' },
    { value: 'docs', label: 'Docs' },
    { value: 'api', label: 'API reference' },
  ]);

  return (
    <Section
      title="Tabs variants (batch 72)"
      subtitle="sticky · closable/editable · draggable · overflow · browser/document/workspace"
    >
      <Stack gap={6}>
        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Sticky — pins inside its scroll container:
            </Text>
            <StickyTabs
              value={stickyVal}
              onChange={setStickyVal}
              items={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
                { value: 'done', label: 'Done' },
              ]}
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Closable + editable — double-click a label to rename it:
            </Text>
            <ClosableTabs
              value={closableVal}
              onChange={setClosableVal}
              editable
              onRename={(v, label) =>
                setClosableItems((items) =>
                  items.map((i) => (i.value === v ? { ...i, label } : i)),
                )
              }
              onClose={(v) => {
                setClosableItems((items) => items.filter((i) => i.value !== v));
                if (closableVal === v) setClosableVal('');
              }}
              items={closableItems}
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Draggable — drag a tab onto another, or focus one and press Alt+←/→:
            </Text>
            <DraggableTabs
              value={dragVal}
              onChange={setDragVal}
              items={[
                { value: 'inbox', label: 'Inbox' },
                { value: 'drafts', label: 'Drafts' },
                { value: 'sent', label: 'Sent' },
                { value: 'archive', label: 'Archive' },
              ]}
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Overflow — past maxVisible the tail moves into the More menu (active stays inline):
            </Text>
            <OverflowTabs
              maxVisible={4}
              value={overVal}
              onChange={setOverVal}
              items={[
                { value: 'a', label: 'Alpha' },
                { value: 'b', label: 'Beta' },
                { value: 'c', label: 'Gamma' },
                { value: 'd', label: 'Delta' },
                { value: 'e', label: 'Epsilon' },
              ]}
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={4}>
            <Text size="sm" tone="ink-2">
              Browser chrome — traffic lights, favicons, hover close:
            </Text>
            <DocumentTabs
              chrome="browser"
              value={docVal}
              onChange={setDocVal}
              onClose={(v) => setDocVal(v === docVal ? '' : docVal)}
              items={[
                { value: 'ts', label: 'index.ts', icon: <FileText size={14} /> },
                { value: 'css', label: 'styles.css', icon: <Layers size={14} /> },
                { value: 'md', label: 'README.md', icon: <Box size={14} /> },
              ]}
            />
            <Text size="sm" tone="ink-2">
              Workspace chrome — icons in chips:
            </Text>
            <DocumentTabs
              chrome="workspace"
              value={docVal}
              onChange={setDocVal}
              items={[
                { value: 'ts', label: 'Editor', icon: <Pencil size={12} /> },
                { value: 'css', label: 'Preview', icon: <Globe size={12} /> },
                { value: 'md', label: 'Terminal', icon: <Box size={12} /> },
              ]}
            />
          </Stack>
        </Card>
      </Stack>
    </Section>
  );
}


/* ──────────────── batch 73 demo (self-contained state) ──────────────── */

function Batch73StepperDemos() {
  const [dot, setDot] = useState(2);
  const [step, setStep] = useState(1);
  const [vstep, setVstep] = useState(1);
  const [tstep, setTstep] = useState(0);

  return (
    <Section
      title="Steppers (batch 73)"
      subtitle="progress dots · numbered steps · vertical · clickable · timeline"
    >
      <Stack gap={6}>
        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Progress dots (clickable; active dot stretches):
            </Text>
            <ProgressDots count={5} value={dot} onChange={setDot} label="Onboarding pages" />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={4}>
            <Text size="sm" tone="ink-2">
              Numbered stepper (click a completed step):
            </Text>
            <Stepper
              value={step}
              onChange={setStep}
              steps={[
                { label: 'Cart', description: '2 items' },
                { label: 'Shipping', description: 'Address & method' },
                { label: 'Payment', description: 'Card or wallet' },
                { label: 'Done', description: 'Receipt', disabled: true },
              ]}
            />
            <Text size="sm" tone="ink-2">
              Vertical + error state:
            </Text>
            <Stepper
              orientation="vertical"
              value={vstep}
              errorAt={vstep === 3 ? 2 : undefined}
              onChange={setVstep}
              steps={[
                { label: 'Upload', description: 'Choose a file' },
                { label: 'Scan', description: 'Virus + type check' },
                { label: 'Publish', description: 'Needs review' },
                { label: 'Live' },
              ]}
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Timeline stepper (time-machine log):
            </Text>
            <TimelineStepper
              value={tstep}
              onChange={setTstep}
              steps={[
                { title: 'Depart Tokyo', timestamp: '09:00', description: 'Desk drawer portal' },
                { title: 'Edo period', timestamp: '1603', description: 'Samurai encounter' },
                { title: 'Future Tokyo', timestamp: '2112', description: 'Future Expo opening' },
                { title: 'Return', timestamp: '—' },
              ]}
            />
          </Stack>
        </Card>
      </Stack>
    </Section>
  );
}

/* ──────────────── batch 74 demo (self-contained state) ──────────────── */

function Batch74SideNavDemos() {
  const [mlActive, setMlActive] = useState('products');
  const [miniActive, setMiniActive] = useState('home');
  const [accActive, setAccActive] = useState('orders');

  return (
    <Section
      title="Side navigation (batch 74)"
      subtitle="multi-level sidebar · mini/icon-only sidebar · accordion nav"
    >
      <div className="flex flex-wrap items-start gap-4">
        <Card padding="md">
          <Stack gap={2}>
            <Text size="sm" tone="ink-2">
              Multi-level (nested groups expand in place; active path auto-opens):
            </Text>
            <MultiLevelSidebar
              items={[
                { id: 'overview', label: 'Overview', icon: Home },
                {
                  id: 'catalog',
                  label: 'Catalogue',
                  icon: Box,
                  children: [
                    { id: 'products', label: 'Products' },
                    { id: 'categories', label: 'Categories', badge: 12 },
                    { id: 'inventory', label: 'Inventory', disabled: true },
                  ],
                },
                {
                  id: 'orders',
                  label: 'Orders',
                  icon: ShoppingBag,
                  badge: 3,
                  children: [
                    { id: 'open-orders', label: 'Open' },
                    { id: 'shipped', label: 'Shipped' },
                    { id: 'returns', label: 'Returns' },
                  ],
                },
                { id: 'team', label: 'Team', icon: User },
              ]}
              value={mlActive}
              onChange={setMlActive}
              defaultExpanded={['catalog']}
              className="static rounded-card"
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={2}>
            <Text size="sm" tone="ink-2">
              Mini sidebar (collapse to icon-only rail):
            </Text>
            <MiniSidebar
              items={[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'products', label: 'Products', icon: Box },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: 2 },
                { id: 'reports', label: 'Reports', icon: Layers },
                { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
              ]}
              value={miniActive}
              onChange={setMiniActive}
              className="static rounded-card"
            />
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={2}>
            <Text size="sm" tone="ink-2">
              Accordion nav (groups disclose; several can stay open):
            </Text>
            <AccordionNav
              groups={[
                {
                  id: 'store',
                  label: 'Store',
                  icon: ShoppingBag,
                  items: [
                    { id: 'orders', label: 'Orders', badge: 2 },
                    { id: 'returns', label: 'Returns' },
                    { id: 'refunds', label: 'Refunds', disabled: true },
                  ],
                },
                {
                  id: 'content',
                  label: 'Content',
                  icon: FileText,
                  items: [
                    { id: 'pages', label: 'Pages' },
                    { id: 'media', label: 'Media' },
                  ],
                },
                {
                  id: 'system',
                  label: 'System',
                  icon: Settings,
                  items: [
                    { id: 'team', label: 'Team' },
                    { id: 'api', label: 'API keys' },
                  ],
                },
              ]}
              value={accActive}
              onChange={setAccActive}
              defaultOpen={['store']}
              allowMultiple
              className="static w-64"
            />
          </Stack>
        </Card>
      </div>
    </Section>
  );
}

/* ──────────────── batch 75 demo (self-contained state) ──────────────── */

function Batch75BottomNavDemos() {
  const [fabTab, setFabTab] = useState('home');
  const [fabPos, setFabPos] = useState<'center' | 'start' | 'end'>('center');
  const [floatTab, setFloatTab] = useState('home');
  const [labelTab, setLabelTab] = useState('orders');

  const action = { icon: Plus, label: 'Create', onClick: () => {} };

  return (
    <Section
      title="Bottom nav variants (batch 75)"
      subtitle="bottom tab bar + raised FAB · floating pill nav"
    >
      <Stack gap={4}>
        <Card padding="md">
          <Stack gap={3}>
            <Text size="sm" tone="ink-2">
              Bottom tab bar with a raised centre FAB (static preview; the real component
              pins to the viewport bottom). Switch the FAB position:
            </Text>
            <HStack gap={2}>
              {(['center', 'start', 'end'] as const).map((pos) => (
                <Button
                  key={pos}
                  size="sm"
                  variant={fabPos === pos ? 'primary' : 'secondary'}
                  onClick={() => setFabPos(pos)}
                >
                  {pos}
                </Button>
              ))}
            </HStack>
            <div className="pt-8">
              <BottomTabBarFAB
                items={navItems}
                value={fabTab}
                onChange={setFabTab}
                action={action}
                fabPosition={fabPos}
                className="static rounded-card"
              />
            </div>
          </Stack>
        </Card>

        <Card padding="md">
          <Stack gap={5}>
            <Stack gap={3}>
              <Text size="sm" tone="ink-2">
                Floating pill nav — icon-only (labels become native tooltips):
              </Text>
              <FloatingBottomNav
                items={navItems}
                value={floatTab}
                onChange={setFloatTab}
                className="static"
              />
            </Stack>
            <Stack gap={2}>
              <Text size="sm" tone="ink-2">
                Floating pill nav — labels + an optional FAB above the centre:
              </Text>
              <div className="pt-8">
                <FloatingBottomNav
                  items={navItems}
                  value={labelTab}
                  onChange={setLabelTab}
                  labels
                  action={{ icon: Plus, label: 'New order', onClick: () => {} }}
                  className="static"
                />
              </div>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Section>
  );
}

/* ──────────────── batch 76 demo (self-contained state) ──────────────── */

function Batch76FooterDemos() {
  const social = [
    { label: 'GitHub', href: 'https://github.com', icon: Github },
    { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
  ];
  const columns = [
    {
      title: 'Shop',
      links: [
        { label: 'New arrivals', href: '#new' },
        { label: 'Best sellers', href: '#best' },
        { label: 'Sale', href: '#sale' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Press', href: '#press' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help centre', href: '#help' },
        { label: 'Shipping', href: '#shipping' },
        { label: 'Returns', href: '#returns' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#privacy' },
        { label: 'Terms', href: '#terms' },
      ],
    },
  ];

  return (
    <Section
      title="Footers (batch 76)"
      subtitle="mega · fat · sticky · social bar"
    >
      <Stack gap={8}>
        <Stack gap={2}>
          <Text size="sm" tone="ink-2">
            Social bar (labelled nav, external links open in a new tab):
          </Text>
          <SocialBar links={social} />
        </Stack>

        <Stack gap={2}>
          <Text size="sm" tone="ink-2">
            Mega footer (sitemap columns + newsletter + bottom bar):
          </Text>
          <div className="overflow-hidden rounded-card border border-line/15">
            <MegaFooter
              brand={
                <div>
                  <p className="text-lg font-semibold tracking-tight">Aeroforge</p>
                  <Text size="sm" tone="ink-2">
                    Components for people who ship.
                  </Text>
                </div>
              }
              newsletter={
                <Stack gap={2} className="max-w-xs">
                  <Text size="xs" tone="ink-3">
                    Join the newsletter
                  </Text>
                  <TextField label="Email" placeholder="you@example.com" />
                </Stack>
              }
              columns={columns}
              social={social}
              legal="© 2026 Aeroforge Labs"
              legalLinks={[
                { label: 'Privacy', href: '#privacy' },
                { label: 'Cookies', href: '#cookies' },
              ]}
            />
          </div>
        </Stack>

        <Stack gap={2}>
          <Text size="sm" tone="ink-2">
            Fat footer (oversized wordmark + tagline):
          </Text>
          <div className="overflow-hidden rounded-card border border-line/15">
            <FatFooter
              brand="Aeroforge"
              tagline="A design system that keeps its shape across every skin — from flat to 3D."
              columns={columns.slice(0, 3)}
              social={social}
              legal="Made in Tokyo · Berlin · São Paulo"
            />
          </div>
        </Stack>

        <Stack gap={2}>
          <Text size="sm" tone="ink-2">
            Sticky footer (pins to the bottom of this scroll area — consent / action bar):
          </Text>
          <div className="relative h-40 overflow-y-auto rounded-card border border-line/15 bg-canvas">
            <div className="space-y-2 p-4 text-sm text-ink-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <p key={i}>Scroll content line {i + 1} — the bar stays pinned below.</p>
              ))}
            </div>
            <StickyFooter
              actions={
                <>
                  <Button size="sm" variant="secondary">
                    Decline
                  </Button>
                  <Button size="sm">Accept</Button>
                </>
              }
              onDismiss={() => {}}
            >
              We use cookies to improve your experience.
            </StickyFooter>
          </div>
        </Stack>
      </Stack>
    </Section>
  );
}

function Batch77CommandMenuDemos() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState(['Dark mode', 'Shipping settings']);

  const quickActions: CommandItem[] = [
    {
      id: 'quick-new-order',
      label: 'New order',
      icon: Plus,
      shortcut: ['⌘', 'N'],
      onSelect: () => {},
    },
    {
      id: 'quick-new-product',
      label: 'New product',
      icon: ShoppingBag,
      shortcut: ['⌘', 'P'],
      onSelect: () => {},
    },
  ];

  const groups: CommandGroup[] = [
    {
      id: 'go-to',
      label: 'Go to',
      items: [
        { id: 'go-dashboard', label: 'Dashboard', icon: Home, keywords: ['home', 'overview'] },
        { id: 'go-orders', label: 'Orders', icon: ShoppingBag, keywords: ['purchases'] },
        {
          id: 'go-settings',
          label: 'Settings',
          icon: Settings,
          shortcut: ['⌘', ','],
          keywords: ['preferences'],
        },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      items: [
        { id: 'act-copy-link', label: 'Copy page link', icon: Copy, hint: 'Ctrl+C' },
        { id: 'act-archive', label: 'Archive view', icon: Box, disabled: true },
      ],
    },
  ];

  return (
    <Section
      title="Command menu (batch 77)"
      subtitle="groups · recent searches · quick actions · keyboard hints"
    >
      <Stack gap={4}>
        <Row>
          <Button onClick={() => setOpen(true)}>Open command menu</Button>
          <span className="flex items-center gap-1 text-xs text-ink-3">
            <Kbd size="sm">⌘</Kbd>
            <Kbd size="sm">K</Kbd>
            <span>opens it · type ord, or press ↵ on a recent search to submit free text</span>
          </span>
        </Row>
        <Text size="sm" tone="ink-2">
          Quick actions pin first, recent searches appear while the query is empty, and every
          group filters live by label or keyword. Disabled items stay visible but inert.
        </Text>
      </Stack>
      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        value={query}
        onValueChange={setQuery}
        quickActions={quickActions}
        groups={groups}
        recentSearches={recents}
        onClearRecentSearches={() => setRecents([])}
        onSubmitQuery={(search) => {
          setRecents((prev) => [search, ...prev.filter((item) => item !== search)].slice(0, 5));
          setQuery('');
          setOpen(false);
        }}
        footer={
          <Text size="xs" tone="ink-4">
            Aeroforge search
          </Text>
        }
      />
    </Section>
  );
}

function Batch78ShareHistoryDemos() {
  const [copied, setCopied] = useState<string | null>(null);
  const [shared, setShared] = useState<string | null>(null);
  const [navigated, setNavigated] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentlyViewedItem[]>([
    { id: 'trail-runner', label: 'Trail Runner', hint: '$120', href: '/products/trail-runner' },
    { id: 'wool-socks', label: 'Wool Socks', hint: '$18', href: '/products/wool-socks' },
    { id: 'rain-shell', label: 'Rain Shell', hint: '$240', href: '/products/rain-shell' },
  ]);

  const history: HistoryEntry[] = [
    { id: 'overview', label: 'Overview', hint: '/dashboard', icon: Home },
    { id: 'orders', label: 'Orders', hint: '/orders', icon: Box },
    { id: 'settings', label: 'Settings', hint: '/settings', icon: Settings },
  ];

  return (
    <Section
      title="Share links & history nav (batch 78)"
      subtitle="permalink/anchor copier · share-link copier · back/history dropdown · recently viewed"
    >
      <Stack gap={4}>
        <Row>
          <PermalinkCopier
            url="https://aeroforge.test/products/trail-runner"
            anchor="reviews"
            variant="secondary"
            size="md"
            onCopied={(text) => setCopied(text)}
          />
          <ShareLink
            url="https://aeroforge.test/products/trail-runner"
            title="Trail Runner"
            onShare={(result) => setShared(`${result.method} → ${result.url}`)}
          />
          <HistoryDropdown
            entries={history}
            onBack={() => setNavigated('back')}
            onNavigate={(entry) => setNavigated(entry.id)}
          />
        </Row>
        <Text size="sm" tone="ink-2">
          {`Copy a permalink, share through the platform sheet (clipboard fallback), or open the back/history menu.${
            copied ? ` · copied ${copied}` : ''
          }${shared ? ` · last share: ${shared}` : ''}${navigated ? ` · last navigation: ${navigated}` : ''}`}
        </Text>
        <RecentlyViewed
          items={recent}
          onSelect={(item) => setNavigated(item.id)}
          onClear={() => setRecent([])}
        />
        <RecentlyViewed
          items={recent}
          title="Recently viewed — list"
          layout="list"
          max={3}
          onSelect={(item) => setNavigated(item.id)}
          className="max-w-sm"
        />
      </Stack>
    </Section>
  );
}

function Batch79SiteSearchDemos() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');

  const trending: SiteSearchSection[] = [
    {
      id: 'trending',
      label: 'Trending now',
      items: [
        { id: 'gore-tex', label: 'Gore-Tex jacket', hint: 'Popular', icon: Star },
        { id: 'winter-boots', label: 'Winter boots', hint: 'Popular', icon: Box },
      ],
    },
  ];

  const sections: SiteSearchSection[] = [
    {
      id: 'products',
      label: 'Products',
      items: [
        { id: 'trail-runner', label: 'Trail Runner', hint: 'Footwear', icon: Star, keywords: ['shoes'] },
        { id: 'wool-socks', label: 'Wool Socks', hint: 'Accessories', icon: Box, keywords: ['wool'] },
        { id: 'rain-shell', label: 'Rain Shell', hint: 'Outerwear', icon: Star, keywords: ['waterproof'] },
      ],
    },
    {
      id: 'pages',
      label: 'Pages',
      items: [
        { id: 'shipping', label: 'Shipping policy', hint: 'Docs', keywords: ['delivery'] },
        { id: 'returns', label: 'Returns & refunds', hint: 'Docs', keywords: ['refund'] },
      ],
    },
  ];

  return (
    <Section
      title="Site search & voice search (batch 79)"
      subtitle="top overlay · grouped suggestions · keyboard hints · Web Speech mic"
    >
      <Stack gap={4}>
        <Row>
          <Button onClick={() => setOpen(true)}>Open site search</Button>
          <VoiceSearchButton
            onResult={(text, isFinal) => {
              if (isFinal) setVoiceText(text);
            }}
            onError={(error) => setVoiceText(`error: ${error}`)}
          />
          <span className="flex items-center gap-1 text-xs text-ink-3">
            <Kbd size="sm">↑↓</Kbd>
            <Kbd size="sm">↵</Kbd>
            <span>{voiceText ? `voice → ${voiceText}` : 'type or use the mic'}</span>
          </span>
        </Row>
        <Text size="sm" tone="ink-2">
          {submitted
            ? `Submitted query: ${submitted}`
            : 'Trending sections show while the query is empty; typing filters every section. The mic degrades to a disabled control when the Web Speech API is unavailable.'}
        </Text>
        <SiteSearch
          open={open}
          onClose={() => setOpen(false)}
          value={query}
          onValueChange={setQuery}
          trending={trending}
          sections={sections}
          onSubmit={(text) => {
            setSubmitted(text);
            setOpen(false);
          }}
          footer={
            <Text size="xs" tone="ink-4">
              Aeroforge search
            </Text>
          }
        />
      </Stack>
    </Section>
  );
}

interface DemoProduct {
  id: number;
  name: string;
  sku: string;
  qty: number;
  price: number;
}

interface DemoTreeRow {
  id: number;
  name: string;
  qty: number;
  children?: DemoTreeRow[];
}

const demoProducts: DemoProduct[] = [
  { id: 1, name: 'Trail Runner', sku: 'TR-100', qty: 42, price: 120 },
  { id: 2, name: 'Wool Socks', sku: 'WS-200', qty: 8, price: 18 },
  { id: 3, name: 'Rain Shell', sku: 'RS-300', qty: 15, price: 240 },
  { id: 4, name: 'Day Pack', sku: 'DP-400', qty: 27, price: 96 },
];

function Batch80TableVariantsDemos() {
  const columns: Array<TableColumn<DemoProduct>> = [
    { key: 'name', header: 'Product', cell: (r) => r.name },
    { key: 'sku', header: 'SKU', cell: (r) => r.sku },
    { key: 'qty', header: 'Qty', cell: (r) => r.qty, align: 'right' },
    { key: 'price', header: 'Price', cell: (r) => `$${r.price.toFixed(2)}`, align: 'right' },
  ];

  const tree: DemoTreeRow[] = [
    {
      id: 1,
      name: 'Footwear',
      qty: 2,
      children: [
        { id: 10, name: 'Trail Runner', qty: 42 },
        { id: 11, name: 'Wool Socks', qty: 8 },
      ],
    },
    { id: 2, name: 'Outerwear', qty: 1, children: [{ id: 20, name: 'Rain Shell', qty: 15 }] },
  ];

  return (
    <Section
      title="Table variants (batch 80)"
      subtitle="striped · bordered · hoverable · compact · borderless · responsive stack · card-rows · nested/tree · master-detail"
    >
      <Grid2>
        <SubSection title="Striped & bordered">
          <Table columns={columns} rows={demoProducts} rowKey={(r) => r.id} striped bordered />
        </SubSection>

        <SubSection title="Compact & hoverable">
          <Table
            columns={columns}
            rows={demoProducts}
            rowKey={(r) => r.id}
            density="compact"
            hoverable
          />
        </SubSection>

        <SubSection title="Borderless">
          <Table columns={columns} rows={demoProducts} rowKey={(r) => r.id} borderless />
        </SubSection>

        <SubSection title="Card rows">
          <Table columns={columns} rows={demoProducts} rowKey={(r) => r.id} cardRows />
        </SubSection>

        <SubSection title="Responsive stack">
          <Table columns={columns} rows={demoProducts} rowKey={(r) => r.id} responsive="stack" />
        </SubSection>

        <SubSection title="Nested / tree">
          <Table
            columns={[
              { key: 'name', header: 'Category', cell: (r) => r.name },
              { key: 'qty', header: 'Items', cell: (r) => r.qty, align: 'right' },
            ]}
            rows={tree}
            rowKey={(r) => r.id}
            getSubRows={(r) => r.children}
            density="compact"
          />
        </SubSection>
      </Grid2>

      <SubSection title="Master-detail">
        <Table
          columns={columns}
          rows={demoProducts}
          rowKey={(r) => r.id}
          defaultExpandedKeys={[1]}
          renderDetail={(r) => (
            <div className="flex flex-col gap-1 text-xs text-ink-2">
              <p>
                {r.name} — {r.sku}
              </p>
              <p className="font-mono">
                {r.qty} in stock · ${r.price.toFixed(2)} each
              </p>
            </div>
          )}
        />
      </SubSection>
    </Section>
  );
}

function Batch81TablePowerDemos() {
  const [sorts, setSorts] = useState<TableSort[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [order, setOrder] = useState(demoProducts.map((p) => p.id));

  const ordered = order
    .map((id) => demoProducts.find((p) => p.id === id))
    .filter((p): p is DemoProduct => Boolean(p));

  const columns: Array<TableColumn<DemoProduct>> = [
    {
      key: 'name',
      header: 'Product',
      cell: (r) => edits[`${r.id}-name`] ?? r.name,
      sortKey: 'name',
    },
    { key: 'sku', header: 'SKU', cell: (r) => r.sku, width: 120 },
    { key: 'qty', header: 'Qty', cell: (r) => r.qty, align: 'right', sortKey: 'qty' },
    { key: 'price', header: 'Price', cell: (r) => `$${r.price.toFixed(2)}`, align: 'right' },
  ];

  return (
    <Section
      title="Table power (batch 81)"
      subtitle="editable cells · frozen columns · resizable columns · reorderable rows · multi-sort · merged cells"
    >
      <SubSection title="Editable · multi-sort · reorderable · resizable">
        <Table
          columns={columns}
          rows={ordered}
          rowKey={(r) => r.id}
          editable
          editPlaceholder="Type…"
          onCellEdit={(rk, ck, v) => setEdits((prev) => ({ ...prev, [`${rk}-${ck}`]: v }))}
          multiSort
          sorts={sorts}
          onSortsChange={setSorts}
          resizable
          reorderable
          onReorder={(from, to) =>
            setOrder((prev) => {
              const next = [...prev];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return next;
            })
          }
        />
        <Text size="xs" tone="ink-3">
          {`Sort: ${
            sorts.length
              ? sorts.map((s, i) => `${i + 1}. ${s.key} ${s.direction}`).join(' · ')
              : 'none — shift-click a header to stack clauses'
          }`}
        </Text>
      </SubSection>

      <SubSection title="Frozen columns & merged cells">
        <Table
          columns={[
            {
              key: 'name',
              header: 'Product',
              cell: (r) => r.name,
              frozen: 'left',
              width: 140,
            },
            {
              key: 'details',
              header: 'Details',
              cell: (r) => `${r.sku} · ${r.qty} in stock`,
              colSpan: 2,
            },
            {
              key: 'price',
              header: 'Price',
              cell: (r) => `$${r.price.toFixed(2)}`,
              align: 'right',
              frozen: 'right',
              width: 100,
            },
          ]}
          rows={demoProducts}
          rowKey={(r) => r.id}
          maxHeight={220}
        />
      </SubSection>
    </Section>
  );
}

function Batch82InCellDemos() {
  const heatRows = [
    { label: 'Mon', values: [12, 40, 88, 63, 25] },
    { label: 'Tue', values: [74, 55, 31, 92, 47] },
    { label: 'Wed', values: [8, 23, 66, 71, 99] },
  ];

  return (
    <Section
      title="In-cell marks (batch 82)"
      subtitle="Bullet graph · heat cell · traffic-light & trend indicators"
    >
      <SubSection title="Bullet">
        <div className="flex max-w-sm flex-col gap-2">
          <Bullet value={72} target={85} ranges={[60, 85]} showValue tone="success" />
          <Bullet value={48} target={80} ranges={[50, 75]} showValue tone="warning" />
          <Bullet value={21} target={40} ranges={[40, 70]} showValue tone="danger" />
        </div>
      </SubSection>

      <SubSection title="Heat cell">
        <div className="flex flex-col gap-2">
          {heatRows.map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <Text size="xs" tone="ink-3" className="w-8">
                {row.label}
              </Text>
              {row.values.map((v, i) => (
                <HeatCell key={i} value={v} min={0} max={100} ramp="accent" />
              ))}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Text size="xs" tone="ink-3">
              diverging
            </Text>
            {[-9, -3, 0, 4, 11].map((v) => (
              <HeatCell key={v} value={v} min={-12} max={12} ramp="diverging" />
            ))}
          </div>
        </div>
      </SubSection>

      <SubSection title="Traffic lights & trend arrows">
        <div className="flex flex-wrap items-center gap-6">
          <StatusLights level="good" label="Build" />
          <StatusLights level="warn" label="Coverage" />
          <StatusLights level="bad" label="Lint" />
          <StatusLights level="neutral" label="Deploy" />
          <StatusLights level="good" size="md" orientation="column" label="DB" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <TrendArrow direction="up" value={12.4} percent />
          <TrendArrow direction="down" value={-3.2} percent />
          <TrendArrow direction="flat" value={0} />
          <TrendArrow direction="up" value={9} percent upIsGood={false} />
          <TrendArrow direction="down" value={5} percent tone="accent" />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch83PeopleDemos() {
  const team = [
    { name: 'Alex Chen', role: 'Product Designer' },
    { name: 'Mia Okafor', role: 'Staff Engineer' },
    { name: 'Sam Rivera', role: 'Data Scientist' },
    { name: 'Nina Patel', role: 'Engineering Manager' },
    { name: 'Leo Kim', role: 'Design Lead' },
    { name: 'Ada Lovelace', role: 'Principal Engineer' },
  ];

  return (
    <Section
      title="People (batch 83)"
      subtitle="Avatar status/badge · avatar group +N · name+role block · author byline · team stack"
    >
      <SubSection title="Avatar status & badge">
        <div className="flex items-center gap-4">
          <Avatar name="Alex Chen" status="online" />
          <Avatar name="Mia Okafor" status="away" />
          <Avatar name="Sam Rivera" status="busy" />
          <Avatar name="Nina Patel" status="offline" />
          <Avatar
            name="Leo Kim"
            size="lg"
            status="online"
            badge={
              <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-ink">
                ★
              </span>
            }
          />
        </div>
      </SubSection>

      <SubSection title="Avatar group & team stack">
        <div className="flex flex-col gap-6">
          <AvatarGroup people={team} max={4} />
          <AvatarGroup people={team} max={3} size="sm" total={40} />
          <TeamStack members={team} max={4} />
        </div>
      </SubSection>

      <SubSection title="Name + role block">
        <div className="flex flex-col gap-4">
          <NameRole name="Alex Chen" role="Product Designer" avatar={{ name: 'Alex Chen', status: 'online' }} />
          <NameRole
            name="Mia Okafor"
            role="Staff Engineer · Platform"
            avatar={{ name: 'Mia Okafor' }}
            href="#mia"
            trailing={<Text size="xs" tone="ink-3">Follow</Text>}
          />
          <NameRole name="Nina Patel" role="EM" avatar={{ name: 'Nina Patel' }} stacked />
        </div>
      </SubSection>

      <SubSection title="Author byline">
        <div className="flex flex-col gap-2">
          <Byline prefix="By" author="Alex Chen" role="Staff Writer" date="Mar 3, 2026" href="#alex" avatar={{ name: 'Alex Chen' }} />
          <Byline author="Mia Okafor" date="2 days ago" size="md" />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch84ContentCardDemos() {
  return (
    <Section
      title="Content cards (batch 84)"
      subtitle="Article · Blog · News · Video · Music/Album · Podcast · Movie · Recipe"
    >
      <SubSection title="Article · News">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard
            title="The quiet rise of edge rendering"
            excerpt="Why teams are moving compute closer to the user, and what it costs."
            category="Engineering"
            author="Alex Chen"
            date="Mar 3"
            readTime="6 min read"
            href="#article"
          />
          <NewsCard
            headline="Chipmakers post record quarter"
            section="Business"
            summary="Demand for accelerators continues to outstrip supply."
            source="Reuters"
            date="1h ago"
            href="#news"
          />
        </div>
      </SubSection>

      <SubSection title="Blog · Recipe">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BlogCard
            title="Notes on building a design system"
            excerpt="Ten lessons from shipping a shared component library."
            author={{ name: 'Mia Okafor' }}
            date="2 days ago"
            tags={['design', 'react']}
            readTime="8 min read"
            href="#blog"
          />
          <RecipeCard
            title="Miso ramen, weeknight edition"
            cookTime="45 min"
            servings={4}
            difficulty="medium"
            rating={4.5}
            href="#recipe"
          />
        </div>
      </SubSection>

      <SubSection title="Video · Podcast">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <VideoCard
            title="Deep dive: how the scheduler works"
            duration="12:04"
            channel="Systems Weekly"
            views="1.2M views"
            date="3 days ago"
            href="#video"
          />
          <PodcastCard
            title="On distributed consensus"
            show="Deep Dive"
            episode={42}
            duration="48 min"
            date="Mon"
            href="#podcast"
          />
        </div>
      </SubSection>

      <SubSection title="Music/Album · Movie">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AlbumCard title="Neon Horizons" artist="Rivers" year={2024} tracks={11} href="#album" />
          <MovieCard
            title="Arrival"
            year={2016}
            runtime="116m"
            rating={4}
            genres={['Sci-Fi', 'Drama']}
            href="#movie"
          />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch85CommerceCardDemos() {
  return (
    <Section
      title="Commerce cards (batch 85)"
      subtitle="Product · Property/Listing · Hotel · Flight · Ticket · Coupon · Gift card · Credit-card visual"
    >
      <SubSection title="Product · Property">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            title="Trail Runner GTX"
            price={89}
            originalPrice={120}
            rating={4}
            reviews={128}
            badge="Sale"
            badgeTone="danger"
            stock="in-stock"
            href="#product"
          />
          <ProductCard
            title="Merino base layer"
            price={65}
            rating={5}
            reviews={42}
            badge="New"
            stock="low-stock"
            onAddToCart={() => {}}
            onWishlist={() => {}}
          />
          <PropertyCard
            title="Sunny loft, river view"
            price={3200}
            priceInterval="month"
            address="12 Main St, Lisbon"
            beds={3}
            baths={2}
            area={1400}
            tag="For rent"
            href="#property"
          />
        </div>
      </SubSection>

      <SubSection title="Hotel · Flight">
        <div className="grid gap-4 lg:grid-cols-2">
          <HotelCard
            name="Grand Hotel"
            location="Lisbon, Portugal"
            stars={4}
            rating={4.7}
            reviews={512}
            pricePerNight={180}
            amenities={['wifi', 'pool', 'breakfast']}
            href="#hotel"
          />
          <FlightCard
            airline="Skyline Air"
            from="SFO"
            to="JFK"
            departTime="08:00"
            arriveTime="16:30"
            duration="5h 30m"
            price={240}
            onSelect={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Ticket · Coupon">
        <div className="grid gap-4 lg:grid-cols-2">
          <TicketCard
            event="Championship final"
            date="May 12"
            venue="Downtown Arena"
            section="A"
            row="7"
            seat="14"
            price={60}
            code="TX-9F2"
            href="#ticket"
          />
          <CouponCard
            discount="20% OFF"
            title="first order"
            code="SAVE20"
            expires="Jun 1"
            onCopy={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Gift card · Credit-card visual">
        <div className="flex flex-wrap gap-4">
          <GiftCard brand="Acme" balance={50} code="GIFT-1234" expiry="12/28" />
          <CreditCardVisual
            brand="Visa"
            number="4242424242424242"
            holder="Ada Lovelace"
            expiry="05/28"
          />
          <CreditCardVisual
            brand="Mastercard"
            number="5555444433331111"
            holder="Alan Turing"
            expiry="09/27"
            tone="raised"
          />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch86WorkCardDemos() {
  return (
    <Section
      title="Work cards (batch 86)"
      subtitle="Contact · Business · Team member · Review · Notification · Task · Project · File · Folder · App · Integration · Feature · Metric alert + Flip/Expandable/Selectable/Draggable/Stacked/Horizontal/Overlay-image/Hover-reveal"
    >
      <SubSection title="Contact · Business · Team member">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ContactCard
            name="Ada Lovelace"
            role="Principal engineer"
            company="Analytical"
            email="ada@example.com"
            phone="+15550100"
            onEmail={() => {}}
            onCall={() => {}}
          />
          <BusinessCard
            name="Cafe Nowhere"
            category="Coffee shop"
            rating={4}
            reviews={210}
            address="1 Bean St, Portland"
            phone="+15550200"
            website="https://cafe.example"
            onDirections={() => {}}
          />
          <TeamMemberCard
            name="Mia Okafor"
            role="Design lead"
            bio="Builds calm interfaces and the systems behind them."
            email="mia@example.com"
            socials={[
              { label: 'GitHub', href: '#github' },
              { label: 'X', href: '#x' },
            ]}
          />
        </div>
      </SubSection>

      <SubSection title="Review · Notification">
        <div className="grid gap-4 lg:grid-cols-2">
          <ReviewCard
            author="Sam Rivera"
            rating={5}
            date="2 days ago"
            title="Exactly what I needed"
            body="Fast, clear, and the details are all in one place."
            verified
            helpfulCount={12}
            onHelpful={() => {}}
          />
          <NotificationCard
            icon={Bell}
            title="Deploy succeeded"
            message="Production is running the latest build."
            time="1m ago"
            unread
            onRead={() => {}}
            onDismiss={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Task · Project">
        <div className="grid gap-4 lg:grid-cols-2">
          <TaskCard
            title="Review the migration plan"
            description="Check rollback steps and the cutover window."
            priority="high"
            assignee="Ada"
            due="Tomorrow"
            tags={['db', 'ops']}
            onToggle={() => {}}
          />
          <ProjectCard
            name="Apollo redesign"
            description="Refresh the storefront and admin surfaces."
            status="Active"
            progress={60}
            members={[{ name: 'Ada' }, { name: 'Alan' }, { name: 'Mia' }]}
            due="Jun 1"
            doneCount={3}
            taskCount={8}
          />
        </div>
      </SubSection>

      <SubSection title="File · Folder · App · Integration">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FileCard
            name="Q3-report"
            kind="pdf"
            size="2 MB"
            modified="Yesterday"
            onDownload={() => {}}
          />
          <FolderCard name="Design assets" itemCount={24} modified="Mon" shared />
          <AppCard
            name="Focus"
            icon={Box}
            category="Productivity"
            rating={4.5}
            description="Block distractions during deep work."
            onAction={() => {}}
          />
          <IntegrationCard
            name="Acme Pay"
            icon={Globe}
            description="Sync payments and refunds automatically."
            connected
            onToggle={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Feature · Metric alert">
        <div className="grid gap-4 lg:grid-cols-2">
          <FeatureCard
            icon={Layers}
            title="Composable by default"
            description="Every surface is a role; the skin decides the look."
            href="#features"
          />
          <MetricAlertCard
            metric="API error rate"
            value="4.2%"
            threshold="2%"
            status="warning"
            message="Above the 5-minute target — paging the on-call."
            trend={12}
            onView={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Variants — horizontal · overlay image · hover reveal">
        <div className="grid gap-4 lg:grid-cols-3">
          <HorizontalCard
            title="Side by side"
            description="Media on the left, content on the right, actions pinned."
            href="#h"
            actions={<span className="text-xs text-accent">Open</span>}
          />
          <OverlayImageCard
            title="Field notes"
            description="Text over a darkened scrim keeps contrast in every skin."
            ctaLabel="Read the series"
            href="#overlay"
          />
          <HoverRevealCard
            title="Reveal on hover"
            description="Detail slides in on hover or keyboard focus."
            href="#reveal"
          />
        </div>
      </SubSection>

      <SubSection title="Variants — flip · expandable · selectable · draggable · stacked">
        <div className="grid gap-6 lg:grid-cols-3">
          <FlipCard
            front={
              <div className="mat-card rounded-card p-4">
                <p className="text-sm font-medium text-ink">Front</p>
                <p className="mt-1 text-xs text-ink-3">Tap flip to reveal the answer.</p>
              </div>
            }
            back={
              <div className="mat-card rounded-card p-4">
                <p className="text-sm font-medium text-ink">Back</p>
                <p className="mt-1 text-xs text-ink-3">Roles, not colours.</p>
              </div>
            }
            flipLabel="Flip card"
          />
          <ExpandableCard title="Details" summary="Collapsed by default" defaultOpen>
            <p className="text-xs text-ink-2">
              The body mounts once and toggles with <code>hidden</code>, so state is preserved.
            </p>
          </ExpandableCard>
          <div className="flex flex-col gap-3">
            <SelectableCard title="Starter" description="For side projects" selected onSelect={() => {}} />
            <SelectableCard title="Scale" description="For growing teams" selected={false} onSelect={() => {}} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <DraggableCard title="Drag me" description="Grab the handle to reorder." />
          <StackedCards
            label="Recent"
            max={2}
            items={[
              <div key="1" className="mat-card rounded-card p-4 text-sm text-ink">
                Newest message
              </div>,
              <div key="2" className="mat-card rounded-card p-4 text-sm text-ink">
                Older message
              </div>,
              <div key="3" className="mat-card rounded-card p-4 text-sm text-ink">
                Oldest message
              </div>,
            ]}
          />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch87ListDemos() {
  return (
    <Section
      title="Lists (batch 87)"
      subtitle="Chat · Contact · Notification · Checklist · Todo · Playlist · Search results · Sticky-header · Alphabet index · Swipe · Reorderable · Infinite · Nested"
    >
      <SubSection title="Chat · Contact · Notification">
        <div className="grid gap-4 lg:grid-cols-3">
          <ChatList
            messages={[
              { id: 'c1', name: 'Ada Lovelace', message: 'Ship it?', time: '2m', unread: 3 },
              { id: 'c2', name: 'Alan Turing', message: 'Reviewing now', time: '1h' },
              { id: 'c3', name: 'Mia Okafor', message: 'Looks good!', time: '2d' },
            ]}
            onSelect={() => {}}
          />
          <ContactList
            contacts={[
              { id: 'p1', name: 'Ada Lovelace', subtitle: 'Principal engineer', email: 'ada@example.com' },
              { id: 'p2', name: 'Alan Turing', subtitle: 'Research', email: 'alan@example.com' },
            ]}
            onSelect={() => {}}
          />
          <NotificationList
            items={[
              { id: 'n1', title: 'Deploy succeeded', description: 'Production is current', time: '1m', unread: true },
              { id: 'n2', title: 'New comment', description: 'On the migration plan', time: '2h' },
            ]}
            onSelect={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Checklist · Todo · Playlist">
        <div className="grid gap-4 lg:grid-cols-3">
          <ChecklistList
            items={[
              { id: 'k1', label: 'Buy milk', done: true },
              { id: 'k2', label: 'Walk the dog', done: false },
              { id: 'k3', label: 'Review PR', done: false },
            ]}
            onToggle={() => {}}
          />
          <TodoList
            items={[
              { id: 't1', label: 'Write the docs', priority: 'high', due: 'Today' },
              { id: 't2', label: 'Fix the flaky test', priority: 'medium', due: 'Fri', done: true },
            ]}
            onToggle={() => {}}
            onAdd={() => {}}
          />
          <PlaylistList
            tracks={[
              { id: 's1', title: 'Intro', artist: 'Rivers', duration: '1:02', playing: true },
              { id: 's2', title: 'Deep Dive', artist: 'Rivers', duration: '3:44' },
              { id: 's3', title: 'Coda', artist: 'Rivers', duration: '2:18' },
            ]}
            onSelect={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Search results · Sticky-header · Alphabet index">
        <div className="grid gap-4 lg:grid-cols-3">
          <SearchResults
            query="react"
            items={[
              { id: 'r1', title: 'React basics', snippet: 'Learn react fast', url: '/docs/react', type: 'Docs' },
              { id: 'r2', title: 'Advanced hooks', snippet: 'useEffect in depth', url: '/docs/hooks', type: 'Guide' },
            ]}
            onSelect={() => {}}
          />
          <StickyHeaderList
            groups={[
              { label: 'Today', items: [<ListRow key="a" title="Design review" description="10:00" />] },
              { label: 'Tomorrow', items: [<ListRow key="b" title="1:1 with Ada" description="14:30" />] },
            ]}
          />
          <AlphabetIndexList
            items={[
              { id: 'a1', name: 'Ada Lovelace' },
              { id: 'a2', name: 'Alan Turing' },
              { id: 'z1', name: 'Zoe Chen' },
            ]}
            onSelect={() => {}}
          />
        </div>
      </SubSection>

      <SubSection title="Swipe · Reorderable · Infinite · Nested">
        <div className="grid gap-4 lg:grid-cols-4">
          <SwipeList
            items={[{ id: 's1', title: 'Inbox zero', description: '3 left' }]}
            onComplete={() => {}}
            onDelete={() => {}}
          />
          <ReorderableList
            items={[
              { id: 'r1', label: 'Alpha' },
              { id: 'r2', label: 'Beta' },
              { id: 'r3', label: 'Gamma' },
            ]}
            onReorder={() => {}}
          />
          <InfiniteList
            items={[
              <ListRow key="i1" title="Loaded row one" />,
              <ListRow key="i2" title="Loaded row two" />,
            ]}
            hasMore
            onLoadMore={() => {}}
          />
          <NestedList
            nodes={[
              {
                id: 'n1',
                label: 'src',
                children: [
                  { id: 'n2', label: 'components', children: [{ id: 'n3', label: 'Button.tsx' }] },
                  { id: 'n4', label: 'index.ts' },
                ],
              },
            ]}
            onSelect={() => {}}
          />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch90DocumentDemos() {
  return (
    <Section
      title="Documents (batch 90)"
      subtitle="Preview · page thumbnails · annotation pins · version history · diff view · reader mode · TOC panel (StickyToc ✅ · TextDiff ✅ for inline)"
    >
      <SubSection title="Preview · thumbnails · TOC panel">
        <div className="grid gap-4 lg:grid-cols-[2fr_auto_1fr]">
          <DocumentPreview
            title="q3-contract.pdf"
            page={1}
            pageCount={3}
            zoom={100}
            onNextPage={() => {}}
            onPrevPage={() => {}}
            onZoomIn={() => {}}
            onZoomOut={() => {}}
            onDownload={() => {}}
            onFullscreen={() => {}}
          />
          <DocumentThumbnails
            pages={[{ id: 'p1', label: 'Cover' }, { id: 'p2' }, { id: 'p3' }]}
            activeId="p1"
            onSelect={() => {}}
          />
          <TocPanel
            items={[
              { id: 'intro', label: 'Introduction' },
              { id: 'terms', label: 'Terms' },
              { id: 'signature', label: 'Signature' },
            ]}
            activeId="terms"
          />
        </div>
      </SubSection>

      <SubSection title="Annotation pins">
        <AnnotationPins
          alt="Dashboard wireframe"
          pins={[
            { id: 'a1', x: 22, y: 28, label: 'Header', note: 'Increase contrast on the title' },
            { id: 'a2', x: 74, y: 62, label: 'Primary CTA', note: 'Move above the fold' },
            { id: 'a3', x: 48, y: 84, label: 'Footer' },
          ]}
          activeId="a1"
          onSelect={() => {}}
        />
      </SubSection>

      <SubSection title="Version history · diff view">
        <div className="grid gap-4 lg:grid-cols-2">
          <VersionHistory
            versions={[
              { id: 'v3', label: 'v3', author: 'Ada', date: 'Today', current: true, size: '18 KB' },
              { id: 'v2', label: 'v2', author: 'Alan', date: 'Yesterday', size: '17 KB', note: 'Tightened the terms clause' },
              { id: 'v1', label: 'v1', author: 'Ada', date: 'Last week', size: '16 KB' },
            ]}
            onDownload={() => {}}
            onRestore={() => {}}
          />
          <DiffView
            lines={[
              { left: 'function total(items) {', right: 'function total(items) {' },
              { left: '  return items.reduce(sum);', right: '  return items.reduce(sum, 0);' },
              { right: '  // guard empty input' },
              { left: '}' },
            ]}
          />
        </div>
      </SubSection>

      <SubSection title="Reader mode">
        <ReaderMode
          title="The Long Read"
          byline="By Ada Lovelace · 8 min"
          progress={35}
          defaultSize={2}
        >
          <p>
            Reading surfaces favour a comfortable measure and generous leading. The controls stay
            out of the way until the reader asks for them, and progress is reported without
            stealing focus from the text.
          </p>
          <p className="mt-3">
            Body copy inherits the active skin's ink ramp, so reader mode follows the same contrast
            contract as the rest of the system.
          </p>
        </ReaderMode>
      </SubSection>
    </Section>
  );
}

function Batch91FinancialDemos() {
  return (
    <Section
      title="Financial (batch 91)"
      subtitle="Price ticker & tape · price-change badge · order book · depth chart · portfolio breakdown · transactions · balance · invoice · budget bar"
    >
      <SubSection title="Price ticker · quote tape · change badge">
        <div className="flex flex-col gap-4">
          <TickerTape
            quotes={[
              { symbol: 'ACME', price: 128.4, change: 3.1, changePercent: 2.47 },
              { symbol: 'GLOBEX', price: 42.15, change: -0.62, changePercent: -1.45 },
              { symbol: 'INITECH', price: 9.87, change: 0.01, changePercent: 0.1 },
              { symbol: 'UMBRELLA', price: 301.2, change: 7.4, changePercent: 2.52 },
            ]}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PriceTicker
              quote={{
                symbol: 'ACME',
                name: 'Acme Corp',
                price: 128.4,
                change: 3.1,
                changePercent: 2.47,
                spark: [120, 122, 119, 124, 126, 123, 128],
              }}
            />
            <div className="mat-card flex flex-wrap items-center gap-2 rounded-card p-4">
              <PriceChangeBadge change={1.2} changePercent={2.4} />
              <PriceChangeBadge change={-1.2} changePercent={-2.4} />
              <PriceChangeBadge change={0} changePercent={0} />
              <PriceChangeBadge change={1.2} changePercent={2.4} upIsGood={false} />
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Order book · depth chart">
        <div className="grid gap-4 lg:grid-cols-2">
          <OrderBook
            bids={[
              { price: 128.2, size: 40 },
              { price: 128.1, size: 26 },
              { price: 128.0, size: 14 },
            ]}
            asks={[
              { price: 128.5, size: 32 },
              { price: 128.6, size: 21 },
              { price: 128.7, size: 9 },
            ]}
          />
          <DepthChart
            label="ACME market depth"
            bids={[
              { price: 128.2, size: 40 },
              { price: 128.1, size: 26 },
              { price: 128.0, size: 14 },
            ]}
            asks={[
              { price: 128.5, size: 32 },
              { price: 128.6, size: 21 },
              { price: 128.7, size: 9 },
            ]}
          />
        </div>
      </SubSection>

      <SubSection title="Portfolio breakdown · budget bar">
        <div className="grid gap-4 lg:grid-cols-2">
          <PortfolioBreakdown
            holdings={[
              { id: 'eq', label: 'Equities', value: 6400, tone: 'accent' },
              { id: 'bd', label: 'Bonds', value: 2400, tone: 'info' },
              { id: 'cr', label: 'Crypto', value: 800, tone: 'warning' },
              { id: 'ca', label: 'Cash', value: 400, tone: 'success' },
            ]}
          />
          <div className="flex flex-col gap-4">
            <BudgetBar label="Marketing" spent={1420} budget={2000} />
            <BudgetBar label="Travel" spent={1320} budget={1000} />
          </div>
        </div>
      </SubSection>

      <SubSection title="Balance · transactions">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <BalanceCard
            label="Checking account"
            amount={5400.25}
            available={5200}
            pending={200.25}
            actionLabel="Add funds"
            onAction={() => {}}
          />
          <TransactionList
            transactions={[
              { id: 't1', description: 'Payroll — Acme Corp', date: 'Oct 15', amount: 2400 },
              {
                id: 't2',
                description: 'Rent',
                date: 'Oct 14',
                amount: -900,
                category: 'Housing',
                pending: true,
              },
              { id: 't3', description: 'Refund — Order #1042', date: 'Oct 12', amount: 59.99 },
            ]}
          />
        </div>
      </SubSection>

      <SubSection title="Invoice / receipt">
        <InvoiceReceipt
          number="INV-2026-014"
          date="Oct 16, 2026"
          from="Acme Studio · billing@acme.test"
          to="Globex Corp · AP department"
          items={[
            { id: 'l1', description: 'Design sprint', quantity: 2, amount: 3200 },
            { id: 'l2', description: 'Hosting (monthly)', amount: 480 },
            { id: 'l3', description: 'Support retainer', amount: 600 },
          ]}
          taxRate={0.1}
        />
      </SubSection>
    </Section>
  );
}

function Batch92MediaDisplayDemos() {
  return (
    <Section
      title="Media display (batch 92)"
      subtitle="Thumbnail grid · poster · playlist row · podcast row · now-playing bar · lyrics · queue panel"
    >
      <SubSection title="Thumbnail grid">
        <ThumbnailGrid
          selectedId="t1"
          onSelect={() => {}}
          items={[
            { id: 't1', label: 'Intro clip', duration: '0:42', playing: true },
            { id: 't2', label: 'Studio session', duration: '4:17' },
            { id: 't3', label: 'Behind the scenes' },
            { id: 't4', label: 'Live at the harbour', duration: '12:03' },
            { id: 't5', label: 'Teaser' },
            { id: 't6', label: 'Full performance', duration: '8:55' },
          ]}
        />
      </SubSection>

      <SubSection title="Poster · playlist row · podcast row">
        <div className="grid gap-4 lg:grid-cols-[11rem_1fr_1fr]">
          <PosterCard
            className="w-44"
            title="Night Falls"
            meta="2026 · Drama"
            alt="Night Falls poster art"
            badge="NEW"
            onPlay={() => {}}
          />
          <div className="mat-card divide-y divide-line/10 overflow-hidden rounded-card">
            <PlaylistRow
              title="Starlight"
              artist="Muse"
              duration="4:17"
              playing
              liked
              onPlay={() => {}}
              onLike={() => {}}
            />
            <PlaylistRow
              title="Weightless"
              artist="Marconi Union"
              duration="8:00"
              onPlay={() => {}}
              onLike={() => {}}
            />
          </div>
          <div className="mat-card divide-y divide-line/10 overflow-hidden rounded-card">
            <PodcastRow
              title="Ep. 42 — Systems thinking"
              show="Ship It"
              date="Oct 14"
              duration="48 min"
              progress={0.35}
              onPlay={() => {}}
              onDownload={() => {}}
            />
            <PodcastRow
              title="Ep. 41 — Design tokens"
              show="Ship It"
              date="Oct 7"
              duration="52 min"
              progress={0.8}
              onPlay={() => {}}
            />
          </div>
        </div>
      </SubSection>

      <SubSection title="Now-playing bar">
        <NowPlayingBar
          title="Weightless"
          artist="Marconi Union"
          playing={false}
          elapsed={72}
          duration={200}
          onPlayPause={() => {}}
          onPrevious={() => {}}
          onNext={() => {}}
          onSeek={() => {}}
        />
      </SubSection>

      <SubSection title="Lyrics · queue panel">
        <div className="grid gap-4 lg:grid-cols-2">
          <LyricsView
            activeId="l2"
            onLineClick={() => {}}
            lines={[
              { id: 'l1', text: 'Row the boat ashore', timeMs: 12_000 },
              { id: 'l2', text: 'Stars are out tonight' },
              { id: 'l3', text: 'And we drift along the quiet water' },
              { id: 'l4', text: 'Hold the line until the morning' },
            ]}
          />
          <QueuePanel
            currentId="q2"
            onSelect={() => {}}
            onMove={() => {}}
            onRemove={() => {}}
            onClear={() => {}}
            items={[
              { id: 'q1', title: 'Starlight', artist: 'Muse', duration: '4:17' },
              { id: 'q2', title: 'Weightless', artist: 'Marconi Union', duration: '8:00' },
              { id: 'q3', title: 'Intro', artist: 'Deadmau5', duration: '2:12' },
            ]}
          />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch93ModalVariantDemos() {
  const [variant, setVariant] = useState<null | 'xl' | 'fullscreen' | 'scrollable' | 'side' | 'stack'>(
    null,
  );
  const [nestedOpen, setNestedOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const openVariant = (v: 'xl' | 'fullscreen' | 'scrollable' | 'side' | 'stack') => setVariant(v);
  const closeVariant = () => {
    setVariant(null);
    setNestedOpen(false);
  };

  return (
    <Section
      title="Modal variants (batch 93)"
      subtitle="xl / fullscreen sizes · scrollable body · side drawer · stacked/nested · wizard dialog"
    >
      <SubSection title="Open a variant">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => openVariant('xl')}>
            Extra large (xl)
          </Button>
          <Button variant="secondary" onClick={() => openVariant('fullscreen')}>
            Fullscreen
          </Button>
          <Button variant="secondary" onClick={() => openVariant('scrollable')}>
            Scrollable
          </Button>
          <Button variant="secondary" onClick={() => openVariant('side')}>
            Side drawer
          </Button>
          <Button variant="secondary" onClick={() => openVariant('stack')}>
            Stacked / nested
          </Button>
          <Button variant="primary" onClick={() => setWizardOpen(true)}>
            Wizard dialog
          </Button>
        </div>
        {finished && (
          <p className="mt-3 text-sm text-success">Wizard finished — project created.</p>
        )}
      </SubSection>

      <Modal
        open={variant === 'xl'}
        onClose={closeVariant}
        size="xl"
        title="Extra large modal"
        description={'size="xl" — max-w-4xl'}
        footer={
          <Button variant="primary" onClick={closeVariant}>
            Done
          </Button>
        }
      >
        <p className="text-sm text-ink-2">
          Roomy content area for editors, galleries or dense forms.
        </p>
      </Modal>

      <Modal
        open={variant === 'fullscreen'}
        onClose={closeVariant}
        size="fullscreen"
        title="Fullscreen modal"
        description={'size="fullscreen" — fills the viewport inside the backdrop inset'}
        footer={
          <Button variant="secondary" onClick={closeVariant}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-ink-2">
          Use for immersive flows that need every pixel — image editors, onboarding or previews.
        </p>
      </Modal>

      <Modal
        open={variant === 'scrollable'}
        onClose={closeVariant}
        size="lg"
        scrollable
        title="Scrollable modal"
        description="scrollable — header and footer stay pinned while the body scrolls"
        footer={
          <>
            <Button variant="secondary" onClick={closeVariant}>
              Cancel
            </Button>
            <Button variant="primary" onClick={closeVariant}>
              Save
            </Button>
          </>
        }
      >
        {Array.from({ length: 16 }, (_, i) => (
          <p key={i} className="mt-2 text-sm text-ink-2">
            Body line {i + 1} — the sticky header and footer remain visible while this scrolls.
          </p>
        ))}
      </Modal>

      <Modal
        open={variant === 'side'}
        onClose={closeVariant}
        side="right"
        title="Side drawer modal"
        description={'side="right" — anchored to the edge at full height'}
        footer={
          <Button variant="secondary" onClick={closeVariant}>
            Close
          </Button>
        }
      >
        <p className="text-sm text-ink-2">
          Drawer-flavoured modal for detail panes; the scrim still closes on click.
        </p>
      </Modal>

      <Modal
        open={variant === 'stack'}
        onClose={closeVariant}
        title="Outer modal"
        description="Stacked/nested — the outer dialog yields Escape and Tab while the inner one is open"
        trapFocus={!nestedOpen}
        closeOnEscape={!nestedOpen}
        footer={
          <Button variant="primary" onClick={() => setNestedOpen(true)}>
            Open nested modal
          </Button>
        }
      >
        <p className="text-sm text-ink-2">
          The dialog underneath disables its focus trap and Escape handler while a modal is stacked
          above it.
        </p>
        <Modal
          open={nestedOpen}
          onClose={() => setNestedOpen(false)}
          title="Nested modal"
          footer={
            <Button variant="secondary" onClick={() => setNestedOpen(false)}>
              Back to outer
            </Button>
          }
        >
          <p className="text-sm text-ink-2">Press Escape to close only this dialog.</p>
        </Modal>
      </Modal>

      <WizardDialog
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setWizardStep(0);
        }}
        title="Create a project"
        description="WizardDialog — stepped footer, Step X of N, ProgressDots"
        step={wizardStep}
        onStepChange={setWizardStep}
        onFinish={() => {
          setWizardOpen(false);
          setWizardStep(0);
          setFinished(true);
        }}
        steps={[
          {
            id: 'details',
            title: 'Project details',
            content: (
              <p className="text-sm text-ink-2">Name, description and owning team.</p>
            ),
          },
          {
            id: 'members',
            title: 'Invite members',
            content: (
              <p className="text-sm text-ink-2">Add emails or pick a workspace group.</p>
            ),
          },
          {
            id: 'review',
            title: 'Review & create',
            content: (
              <p className="text-sm text-ink-2">Confirm the details, then create the project.</p>
            ),
          },
        ]}
      />
    </Section>
  );
}

function Batch94PopoverVariantDemos() {
  return (
    <Section
      title="Popover variants (batch 94)"
      subtitle="Hover / focus triggers · arrow · mega dropdown · quick view / peek panel"
    >
      <SubSection title="Trigger modes & arrow">
        <div className="flex flex-wrap items-center gap-6">
          <Popover
            trigger={<Button variant="secondary">Hover me</Button>}
            triggerOn="hover"
            arrow
            content={<p className="px-2 py-1 text-sm text-ink">Opened on hover, with an arrow.</p>}
          />
          <Popover
            trigger={<Button variant="secondary">Focus me</Button>}
            triggerOn="focus"
            arrow
            side="top"
            content={
              <p className="px-2 py-1 text-sm text-ink">Opens on keyboard focus; leaves with focus.</p>
            }
          />
          <Popover
            trigger={<Button variant="secondary">Click (baseline)</Button>}
            align="end"
            content={
              <div className="w-48 p-2 text-sm text-ink">
                The original click popover still works unchanged.
              </div>
            }
          />
        </div>
      </SubSection>

      <SubSection title="Mega dropdown">
        <MegaDropdown
          trigger={<Button variant="primary">Products</Button>}
          columns={[
            {
              id: 'shop',
              title: 'Shop',
              items: [
                { id: 'laptops', label: 'Laptops', href: '#laptops', description: 'Work & play' },
                { id: 'phones', label: 'Phones', href: '#phones', description: 'Flagships' },
                { id: 'audio', label: 'Audio', href: '#audio' },
              ],
            },
            {
              id: 'services',
              title: 'Services',
              items: [
                { id: 'repair', label: 'Repair', description: 'Book a technician' },
                { id: 'trade', label: 'Trade-in', description: 'Credit for old gear' },
              ],
            },
            {
              id: 'company',
              title: 'Company',
              items: [
                { id: 'about', label: 'About', href: '#about' },
                { id: 'stores', label: 'Stores', href: '#stores' },
              ],
            },
          ]}
          footer={
            <p className="text-xs text-ink-3">Free shipping on orders over $50 — this week only.</p>
          }
        />
      </SubSection>

      <SubSection title="Quick view / peek panel">
        <div className="flex flex-wrap items-center gap-8 py-8">
          <QuickViewPanel
            trigger={<Button variant="secondary">Aurora Chair</Button>}
            title="Aurora Chair"
            subtitle="Ergonomics · In stock"
            description="A light task chair with a breathable mesh back."
            media={
              <div className="mat-well grid h-24 place-items-center text-xs text-ink-3">
                product photo
              </div>
            }
            meta={[
              { id: 'price', label: 'Price', value: '$249' },
              { id: 'rating', label: 'Rating', value: '4.8 ★' },
              { id: 'ship', label: 'Ships', value: '2–3 days' },
              { id: 'warranty', label: 'Warranty', value: '5 years' },
            ]}
            actions={
              <>
                <Button variant="primary" size="sm">
                  Add to cart
                </Button>
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </>
            }
          />
          <QuickViewPanel
            trigger={<Button variant="secondary">Ada Lovelace</Button>}
            title="Ada Lovelace"
            subtitle="Analytical Engine · Author"
            description="Peek cards also work for people, invoices or rows."
            meta={[
              { id: 'role', label: 'Role', value: 'Mathematician' },
              { id: 'files', label: 'Files', value: '12' },
            ]}
          />
        </div>
      </SubSection>
    </Section>
  );
}

const TOAST_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

function Batch95ToastDemos() {
  const { push, update, dismiss, promise } = useToast();
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIdRef = useRef('');

  useEffect(
    () => () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    },
    [],
  );

  const startUpload = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    let pct = 0;
    lastIdRef.current = push({ message: 'Uploading…', loading: true, progress: 0, durationMs: 0 });
    progressTimer.current = setInterval(() => {
      pct += 25;
      if (pct >= 100) {
        if (progressTimer.current) clearInterval(progressTimer.current);
        progressTimer.current = null;
        update(lastIdRef.current, {
          message: 'Upload complete',
          tone: 'success',
          loading: false,
          progress: undefined,
          durationMs: 4000,
        });
      } else {
        update(lastIdRef.current, { progress: pct, message: `Uploading ${pct}%` });
      }
    }, 350);
  };

  const runExport = () => {
    const task = new Promise<string>((resolve) => setTimeout(() => resolve('orders-q4.csv'), 1200));
    void promise(task, {
      loading: 'Exporting orders…',
      success: (file: string) => `Exported ${file}`,
      error: (e: unknown) => `Export failed: ${String(e)}`,
    }).catch(() => {});
  };

  const runFailingExport = () => {
    const task = new Promise<string>((_resolve, reject) =>
      setTimeout(() => reject(new Error('connection lost')), 1200),
    );
    void promise(task, {
      loading: 'Syncing…',
      success: 'Synced',
      error: (e: unknown) => `Sync failed — ${(e as Error).message}`,
    }).catch(() => {});
  };

  const pushGrouped = () => {
    push({ message: 'Saved “Aurora Chair”', tone: 'success', group: 'catalog-save' });
    setTimeout(() => {
      push({ message: 'Saved “Nimbus Desk”', tone: 'success', group: 'catalog-save' });
    }, 200);
    setTimeout(() => {
      push({ message: 'Saved “Vega Lamp”', tone: 'success', group: 'catalog-save' });
    }, 400);
  };

  return (
    <Section
      title="Toast upgrades (batch 95)"
      subtitle="Positions · loading & promise toast · grouped stack · progress toast"
    >
      <SubSection title="Positions">
        <Row>
          {TOAST_POSITIONS.map((p) => (
            <Button
              key={p}
              variant="secondary"
              size="sm"
              onClick={() => push({ message: `Toast at ${p}`, position: p })}
            >
              {p}
            </Button>
          ))}
        </Row>
        <Text as="span" tone="ink-3" size="sm" className="mt-2 block">
          Provider defaults to bottom-right; each button overrides the region per toast.
        </Text>
      </SubSection>

      <SubSection title="Loading · promise · progress">
        <Row>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => push({ message: 'Signing in…', loading: true })}
          >
            Sticky loading
          </Button>
          <Button variant="primary" size="sm" onClick={startUpload}>
            Run upload (progress)
          </Button>
          <Button variant="secondary" size="sm" onClick={runExport}>
            Promise export (success)
          </Button>
          <Button variant="secondary" size="sm" onClick={runFailingExport}>
            Promise sync (error)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (progressTimer.current) {
                clearInterval(progressTimer.current);
                progressTimer.current = null;
              }
              if (lastIdRef.current) dismiss(lastIdRef.current);
            }}
          >
            Dismiss last
          </Button>
        </Row>
        <Text as="span" tone="ink-3" size="sm" className="mt-2 block">
          Loading toasts are sticky (no auto-dismiss) until settled or dismissed; promise toasts
          settle to a success/error card and re-arm the normal duration.
        </Text>
      </SubSection>

      <SubSection title="Grouped toasts">
        <Row>
          <Button variant="secondary" size="sm" onClick={pushGrouped}>
            Push 3 saves (group)
          </Button>
          <Text as="span" tone="ink-3" size="sm">
            Collapses into one card with a +2 badge — latest message wins, timer resets.
          </Text>
        </Row>
      </SubSection>
    </Section>
  );
}

function Batch96SystemBannerDemos() {
  const { push } = useToast();
  const [announceOn, setAnnounceOn] = useState(true);
  const [promoOn, setPromoOn] = useState(true);
  const [cookieOn, setCookieOn] = useState(false);
  const [gdprOpen, setGdprOpen] = useState(false);
  const [prompt, setPrompt] = useState<'install' | 'update' | 'permission' | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const sessionTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSessionTimer = () => {
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }
  };

  useEffect(() => {
    if (sessionOpen && secondsLeft === 0) stopSessionTimer();
    return stopSessionTimer;
  }, [sessionOpen, secondsLeft]);

  const startSession = () => {
    stopSessionTimer();
    setSecondsLeft(90);
    setSessionOpen(true);
    sessionTimer.current = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
  };

  const endSession = (toast?: string, tone: 'success' | 'neutral' = 'success') => {
    stopSessionTimer();
    setSessionOpen(false);
    if (toast) push({ message: toast, tone });
  };

  const closeCookie = (toast: string, tone: 'success' | 'neutral' = 'success') => {
    setCookieOn(false);
    push({ message: toast, tone });
  };

  return (
    <Section
      title="System banners (batch 96)"
      subtitle="Announcement · promo · cookie consent · GDPR modal · install / update / permission prompts · session timeout"
    >
      <SubSection title="Announcement & promo">
        <div className="flex flex-col gap-3">
          <AnnouncementBanner
            open={announceOn}
            message="Scheduled maintenance Sunday 02:00–04:00 UTC — checkout may be briefly unavailable."
            linkHref="/status"
            linkLabel="Status"
            onDismiss={() => setAnnounceOn(false)}
          />
          <PromoBanner
            open={promoOn}
            badge={<Badge tone="accent">Limited time</Badge>}
            title="Spring sale — 20% off everything"
            description="Ends Sunday. Discount applies automatically at checkout."
            ctaLabel="Shop now"
            onCta={() => push({ message: 'Sale catalogue opened', tone: 'success' })}
            secondaryLabel="Remind me"
            onSecondary={() => push({ message: 'We’ll remind you Friday morning' })}
            onDismiss={() => setPromoOn(false)}
          />
          <Row>
            <Button variant="secondary" size="sm" onClick={() => setAnnounceOn((v) => !v)}>
              Toggle announcement
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPromoOn((v) => !v)}>
              Toggle promo
            </Button>
          </Row>
        </div>
      </SubSection>

      <SubSection title="Cookie consent & GDPR modal">
        <Row>
          <Button variant="secondary" size="sm" onClick={() => setCookieOn(true)}>
            Show cookie banner
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setGdprOpen(true)}>
            Open GDPR modal
          </Button>
        </Row>
        <CookieConsentBanner
          open={cookieOn}
          policyHref="/legal/cookies"
          onAcceptAll={() => closeCookie('All cookies accepted')}
          onReject={() => closeCookie('Non-essential cookies rejected', 'neutral')}
          onSave={(prefs) =>
            closeCookie(
              `Preferences saved — analytics ${prefs.analytics ? 'on' : 'off'}, marketing ${prefs.marketing ? 'on' : 'off'}`,
            )
          }
        />
        {gdprOpen && (
          <GdprConsentModal
            open
            onClose={() => setGdprOpen(false)}
            onAcceptAll={() => {
              setGdprOpen(false);
              push({ message: 'All purposes accepted', tone: 'success' });
            }}
            onRejectAll={() => {
              setGdprOpen(false);
              push({ message: 'Optional purposes rejected', tone: 'neutral' });
            }}
            onSave={(selected) => {
              setGdprOpen(false);
              push({
                message: `Consent saved — ${Object.values(selected).filter(Boolean).length} purposes on`,
                tone: 'success',
              });
            }}
          />
        )}
      </SubSection>

      <SubSection title="Install · update · permission prompts">
        <Row>
          <Button variant="secondary" size="sm" onClick={() => setPrompt('install')}>
            Install prompt
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPrompt('update')}>
            Update prompt
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPrompt('permission')}>
            Permission prompt
          </Button>
        </Row>
        {prompt && (
          <PromptModal
            kind={prompt}
            open
            onClose={() => setPrompt(null)}
            onConfirm={() => {
              push({ message: `${prompt} prompt confirmed`, tone: 'success' });
              setPrompt(null);
            }}
          />
        )}
        <Text as="span" tone="ink-3" size="sm" className="mt-2 block">
          One modal, three rationales — retitle, re-badge or override either label per flow.
        </Text>
      </SubSection>

      <SubSection title="Session timeout warning">
        <Row>
          <Button variant="secondary" size="sm" onClick={startSession}>
            Simulate 90s warning
          </Button>
          <Text as="span" tone="ink-3" size="sm">
            Live countdown; Escape and “Stay signed in” both extend, “Sign out now” ends early.
          </Text>
        </Row>
        <SessionTimeoutWarning
          open={sessionOpen}
          secondsLeft={secondsLeft}
          onStay={() => endSession('Session extended — you’re still signed in')}
          onSignOut={() => endSession('Signed out', 'neutral')}
        />
      </SubSection>
    </Section>
  );
}

const LOADING_SPINNER_VARIANTS = ['ring', 'dots', 'bars', 'pulse', 'orbit'] as const;

function Batch97LoadingDemos() {
  const [value, setValue] = useState(35);
  const [routeActive, setRouteActive] = useState(false);
  const [splashOpen, setSplashOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      for (const timer of list) clearTimeout(timer);
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const fetchNext = () => {
    if (loading || pages >= 3) return;
    setLoading(true);
    later(() => {
      setLoading(false);
      setPages((p) => p + 1);
    }, 900);
  };

  const hasMore = pages < 3;

  return (
    <Section
      title="Loading (batch 97)"
      subtitle="Spinner variants · progress variants · infinite-scroll loader · route bar · splash screen"
    >
      <RouteProgressBar active={routeActive} label="Loading demo" />

      <SubSection title="Spinner variants">
        <div className="flex flex-wrap items-start gap-8">
          {LOADING_SPINNER_VARIANTS.map((variant) => (
            <div key={variant} className="flex w-20 flex-col items-center gap-1">
              <Spinner variant={variant} className="py-4" />
              <span className="font-mono text-xs text-ink-3">{variant}</span>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Progress variants">
        <div className="flex max-w-xl flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Progress value={value} label="Demo progress" />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setValue((v) => Math.max(0, v - 10))}
            >
              −10%
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setValue((v) => Math.min(100, v + 10))}
            >
              +10%
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Progress variant="circular" value={value} />
            <div className="w-44">
              <Progress variant="stepped" steps={5} value={value} />
            </div>
            <div className="w-44">
              <Progress variant="buffer" value={60} buffer={85} />
            </div>
          </div>
          <div className="w-44">
            <Progress variant="indeterminate" value={0} />
          </div>
        </div>
      </SubSection>

      <SubSection title="Infinite-scroll footer">
        <div className="flex max-w-md flex-col rounded-card border border-line/10">
          <ul className="divide-y divide-line/10">
            {Array.from({ length: pages * 3 }, (_, i) => (
              <li key={i} className="px-4 py-2 text-sm">
                Item {i + 1}
              </li>
            ))}
          </ul>
          <InfiniteScrollLoader
            loading={loading}
            hasMore={hasMore}
            onLoadMore={fetchNext}
            endLabel="All items loaded"
          />
        </div>
        <Row className="mt-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchNext}
            disabled={loading || !hasMore}
          >
            Fetch next page
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPages(1)}>
            Reset demo
          </Button>
          <Text as="span" tone="ink-3" size="sm">
            Two more pages to load — auto mode uses IntersectionObserver where available,
            otherwise a Load more button.
          </Text>
        </Row>
      </SubSection>

      <SubSection title="Route transition bar">
        <Row>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setRouteActive(true);
              later(() => setRouteActive(false), 1100);
            }}
          >
            Simulate navigation
          </Button>
          <Text as="span" tone="ink-3" size="sm">
            Fixed at the viewport top — hidden from assistive tech while collapsed.
          </Text>
        </Row>
      </SubSection>

      <SubSection title="Splash screen">
        <Row>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setSplashOpen(true);
              later(() => setSplashOpen(false), 1600);
            }}
          >
            Show splash (auto-closes)
          </Button>
          <Text as="span" tone="ink-3" size="sm">
            Covers the viewport for 1.6s, then your bootstrap signal flips it away.
          </Text>
        </Row>
        <SplashScreen
          open={splashOpen}
          brand={<span>ACME Store</span>}
          title="ACME Store"
          description="Restoring your session"
          status="Warming up cache…"
        />
      </SubSection>
    </Section>
  );
}

const STATE_PAGE_CODES = [400, 403, 404, 500, 503] as const;

function Batch98StatePageDemos() {
  const { push } = useToast();

  return (
    <Section
      title="State pages (batch 98)"
      subtitle="Offline · 400/403/404/500/503 · under construction · expired link · thank-you · verification pending"
    >
      <SubSection title="Offline">
        <div className="max-w-lg rounded-card border border-line/10">
          <OfflineState
            status="Last synced 2 minutes ago"
            onRetry={() => push({ message: 'Connection restored', tone: 'success' })}
            action={
              <Button variant="ghost" onClick={() => push({ message: 'Picking up where you left off' })}>
                Continue offline
              </Button>
            }
          />
        </div>
      </SubSection>

      <SubSection title="HTTP error pages">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {STATE_PAGE_CODES.map((code) => (
            <div key={code} className="rounded-card border border-line/10">
              <ErrorPage
                code={code}
                onRetry={
                  code >= 500 ? () => push({ message: `Retrying the ${code} request…` }) : undefined
                }
                details={code === 500 ? 'req_8f21 · trace 3.2s' : undefined}
                secondaryAction={
                  code === 404 ? (
                    <a
                      href="/design"
                      className="inline-flex min-h-11 items-center rounded-control px-4 text-sm font-medium text-ink-2 transition-all duration-skin ease-skin hover:text-ink"
                    >
                      Back to design QA
                    </a>
                  ) : undefined
                }
              />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Under construction">
        <div className="max-w-lg rounded-card border border-line/10">
          <UnderConstructionPage
            eta="ETA: Friday"
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => push({ message: 'We’ll notify you at launch' })}
              >
                Notify me
              </Button>
            }
          />
        </div>
      </SubSection>

      <SubSection title="Expired link">
        <div className="max-w-lg rounded-card border border-line/10">
          <ExpiredLinkPage
            expiresAt="Expired 2026-10-16 09:00 UTC"
            onResend={() => push({ message: 'Fresh link sent', tone: 'success' })}
            homeHref="/"
          />
        </div>
      </SubSection>

      <SubSection title="Thank-you">
        <div className="max-w-lg rounded-card border border-line/10">
          <ThankYouPage
            reference="Order #1042"
            action={
              <Button size="sm" variant="primary" onClick={() => push({ message: 'Tracking order #1042' })}>
                Track order
              </Button>
            }
            homeHref="/"
          />
        </div>
      </SubSection>

      <SubSection title="Verification pending">
        <div className="max-w-lg rounded-card border border-line/10">
          <VerificationPendingPage
            maskedEmail="a•••@example.com"
            hint="Didn’t arrive? Check spam — it usually lands within a minute."
            onResend={() => push({ message: 'Verification email resent', tone: 'success' })}
          />
        </div>
      </SubSection>
    </Section>
  );
}

function Batch99GuidanceDemos() {
  const { push } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [checklist, setChecklist] = useState<
    Array<{ id: string; label: string; done?: boolean; href?: string }>
  >([
    { id: 'profile', label: 'Complete your profile', done: true },
    { id: 'store', label: 'Connect your store' },
    { id: 'team', label: 'Invite your team', href: '#invite' },
  ]);

  return (
    <Section
      title="Guidance (batch 99)"
      subtitle="Inline help · contextual panel · product tour · checklist · tips carousel · feature announcement · changelog · onboarding"
    >
      <SubSection title="Inline help & contextual help panel">
        <Row>
          <span className="text-sm">
            Orders ship within{' '}
            <InlineHelp title="Handling time">
              Two business days after payment clears.
            </InlineHelp>{' '}
            of payment.
          </span>
          <Button size="sm" variant="secondary" onClick={() => setHelpOpen(true)}>
            Open help panel
          </Button>
        </Row>
        <HelpPanel
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          items={[
            { id: 'shipping', label: 'Shipping times', description: 'When orders arrive.' },
            { id: 'returns', label: 'Returns & refunds', href: '/help/returns' },
            { id: 'billing', label: 'Billing FAQ', href: '/help/billing' },
          ]}
          footer={<p className="text-xs text-ink-3">Can’t find it? Contact support.</p>}
        />
      </SubSection>

      <SubSection title="Product tour (step / spotlight)">
        <Row>
          <Button size="sm" variant="primary" onClick={() => setTourOpen(true)}>
            Start the tour
          </Button>
          <Text as="span" tone="ink-3" size="sm">
            Scrim + ringed spotlight card; Skip and Escape both report back.
          </Text>
        </Row>
        <ProductTour
          open={tourOpen}
          steps={[
            { id: 's1', title: 'Your dashboard', description: 'Everything at a glance.' },
            { id: 's2', title: 'Bulk actions', description: 'Select rows to act on many at once.' },
            { id: 's3', title: 'That’s it', description: 'You’re ready to go.' },
          ]}
          onSkip={() => {
            setTourOpen(false);
            push({ message: 'Tour skipped' });
          }}
          onComplete={() => {
            setTourOpen(false);
            push({ message: 'Tour complete', tone: 'success' });
          }}
        />
      </SubSection>

      <SubSection title="Checklist widget & tips carousel">
        <div className="flex flex-wrap items-start gap-4">
          <ChecklistWidget
            className="w-80"
            items={checklist}
            onToggle={(id, done) =>
              setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)))
            }
            onDone={() => push({ message: 'Checklist complete!', tone: 'success' })}
            action={
              <Button size="sm" variant="ghost" onClick={() => push({ message: 'Opening next step…' })}>
                Continue setup
              </Button>
            }
          />
          <TipsCarousel
            className="w-80"
            tips={[
              { id: 't1', title: 'Keyboard first', body: 'Press / anywhere to search.' },
              { id: 't2', title: 'Undo is one ⌘Z away' },
              { id: 't3', title: 'Drag rows to reorder' },
            ]}
          />
        </div>
      </SubSection>

      <SubSection title="Feature announcement & changelog popup">
        <Row>
          <FeatureAnnouncement
            title="Bulk edit is here"
            description="Select rows, edit one cell, apply it to all of them."
            media={
              <div className="mat-well grid h-20 place-items-center text-xs text-ink-3">
                screenshot
              </div>
            }
            ctaLabel="Try it"
            onCta={() => push({ message: 'Opening bulk edit' })}
            onDismiss={() => push({ message: 'Announcement dismissed' })}
          />
          <ChangelogPopup
            viewAllHref="/releases"
            entries={[
              {
                version: '2.1.0',
                date: 'Oct 16',
                title: 'Faster tables',
                latest: true,
                items: ['Virtual scrolling', 'Frozen columns'],
              },
              { version: '2.0.4', date: 'Oct 9', title: 'Fixes', items: ['Toast timers'] },
            ]}
          />
        </Row>
      </SubSection>

      <SubSection title="Onboarding modal">
        <Row>
          <Button size="sm" variant="secondary" onClick={() => setOnboardOpen(true)}>
            Preview onboarding
          </Button>
        </Row>
        <OnboardingModal
          open={onboardOpen}
          onClose={() => setOnboardOpen(false)}
          onStart={() => {
            setOnboardOpen(false);
            push({ message: 'Let’s go!', tone: 'success' });
          }}
          brand={<span>ACME Store</span>}
          description="Three things to set up before you start selling."
          features={[
            { id: 'f1', title: 'Connect your store', description: 'Two-way product sync.' },
            { id: 'f2', title: 'Invite your team' },
            { id: 'f3', title: 'Pick a theme' },
          ]}
        />
      </SubSection>
    </Section>
  );
}
