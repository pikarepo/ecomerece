# UI Components Catalog (`components.md`)

> **MANDATORY RULE:** Whenever any new functionality or component is added, modified, or extended in `packages/ui` or the frontend workspace, this file (`components.md`) MUST be updated immediately to document the component, its path, exports, props, and behavior.

This document provides a comprehensive index of all UI components, controls, surfaces, patterns, and modules built in `@ecomerece/ui` (and consuming apps). All components follow the design system tokens (`mat-*`, `--m-*`, `focusRing()`) and headless/accessible patterns.

## Table of Contents

- [Controls (#controls)](#category-controls)
- [Data (#data)](#category-data)
- [Feedback (#feedback)](#category-feedback)
- [Form (#form)](#category-form)
- [List (#list)](#category-list)
- [Modules (#modules)](#category-modules)
- [Navigation (#navigation)](#category-navigation)
- [Overlay (#overlay)](#category-overlay)
- [Surface (#surface)](#category-surface)
- [Physics & Game Kernel (#physics)](#category-physics)
- [Web App Components (#web-app)](#category-web-app)

## Category: Controls <a id="category-controls"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`Button.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Button.tsx) | `Button`, `IconButton` | UI component for Button |
| [`CallControls.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/CallControls.tsx) | `MicButton`, `CameraButton`, `ScreenShareButton`, `EndCallButton`, `CallControls` | UI component for CallControls |
| [`Checkbox.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Checkbox.tsx) | `Checkbox` | UI component for Checkbox |
| [`ChipButton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/ChipButton.tsx) | `ChipButton`, `FilterChip`, `ChoiceChip`, `SuggestionChip`, `TabChip`, `InputChip` | UI component for ChipButton |
| [`Confirm.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Confirm.tsx) | `HoldToConfirmButton`, `SwipeToConfirm`, `DoubleClickToConfirm` | UI component for Confirm |
| [`Cooldown.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Cooldown.tsx) | `CooldownButton`, `ResendCodeButton`, `CountdownButton` | UI component for Cooldown |
| [`EffectButton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/EffectButton.tsx) | `EffectButton`, `RippleButton`, `MagneticButton`, `ShimmerButton`, `GlowButton` | UI component for EffectButton |
| [`GradientBorderButton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/GradientBorderButton.tsx) | `GradientBorderButton` | UI component for GradientBorderButton |
| [`Handles.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Handles.tsx) | `GripDots`, `DragHandle`, `GripButton`, `ResizeHandle`, `PullHandle` | UI component for Handles |
| [`MediaControls.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/MediaControls.tsx) | `MediaControls`, `PlayPauseButton` | UI component for MediaControls |
| [`NavButtons.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/NavButtons.tsx) | `ArrowButton`, `StepperButtons`, `ScrollButton` | UI component for NavButtons |
| [`NumberInput.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/NumberInput.tsx) | `NumberInput` | UI component for NumberInput |
| [`ProviderButtons.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/ProviderButtons.tsx) | `SignInButton`, `WalletButton`, `AppStoreBadge`, `QrDownload` | UI component for ProviderButtons |
| [`Radio.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Radio.tsx) | `Radio` | UI component for Radio |
| [`Range.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Range.tsx) | `Range` | UI component for Range |
| [`SegmentedControl.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/SegmentedControl.tsx) | `SegmentedControl` | UI component for SegmentedControl |
| [`Slider.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Slider.tsx) | `Slider` | UI component for Slider |
| [`SliderExtras.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/SliderExtras.tsx) | `MarksSlider`, `TooltipSlider`, `VerticalSlider`, `HistogramSlider`, `StepperSlider` | UI component for SliderExtras |
| [`Switch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Switch.tsx) | `Switch` | UI component for Switch |
| [`ViewportControls.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/ViewportControls.tsx) | `ZoomControls`, `PanPad`, `RotateControl` | UI component for ViewportControls |
| [`WindowButtons.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/WindowButtons.tsx) | `ExpandCollapseButton`, `FullscreenButton`, `WindowControls` | UI component for WindowButtons |

### `Button.tsx`

- **Path:** [`packages/ui/components/controls/Button.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Button.tsx)
- **Exports:** `Button`, `IconButton`
- **Types & Interfaces:** `ButtonProps`, `IconButtonProps`

### `CallControls.tsx`

- **Path:** [`packages/ui/components/controls/CallControls.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/CallControls.tsx)
- **Exports:** `MicButton`, `CameraButton`, `ScreenShareButton`, `EndCallButton`, `CallControls`
- **Types & Interfaces:** `CallDeviceButtonProps`, `MicButtonProps`, `CameraButtonProps`, `ScreenShareButtonProps`, `EndCallButtonProps`, `CallControlsProps`

### `Checkbox.tsx`

- **Path:** [`packages/ui/components/controls/Checkbox.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Checkbox.tsx)
- **Exports:** `Checkbox`
- **Types & Interfaces:** `CheckboxProps`

### `ChipButton.tsx`

- **Path:** [`packages/ui/components/controls/ChipButton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/ChipButton.tsx)
- **Exports:** `ChipButton`, `FilterChip`, `ChoiceChip`, `SuggestionChip`, `TabChip`, `InputChip`
- **Types & Interfaces:** `ChipVariant`, `ChipButtonProps`, `ChipDerivativeProps`, `InputChipProps`

### `Confirm.tsx`

- **Path:** [`packages/ui/components/controls/Confirm.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Confirm.tsx)
- **Exports:** `HoldToConfirmButton`, `SwipeToConfirm`, `DoubleClickToConfirm`
- **Types & Interfaces:** `HoldToConfirmButtonProps`, `SwipeToConfirmProps`, `DoubleClickToConfirmProps`

### `Cooldown.tsx`

- **Path:** [`packages/ui/components/controls/Cooldown.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Cooldown.tsx)
- **Exports:** `CooldownButton`, `ResendCodeButton`, `CountdownButton`
- **Types & Interfaces:** `CooldownButtonProps`, `ResendCodeButtonProps`, `CountdownButtonProps`

### `EffectButton.tsx`

- **Path:** [`packages/ui/components/controls/EffectButton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/EffectButton.tsx)
- **Exports:** `EffectButton`, `RippleButton`, `MagneticButton`, `ShimmerButton`, `GlowButton`
- **Types & Interfaces:** `ButtonEffect`, `EffectMaterial`, `EffectVariant`, `EffectButtonProps`, `EffectButtonWrapperProps`

### `GradientBorderButton.tsx`

- **Path:** [`packages/ui/components/controls/GradientBorderButton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/GradientBorderButton.tsx)
- **Exports:** `GradientBorderButton`
- **Types & Interfaces:** `GradientRole`, `GradientBorderVariant`, `GradientBorderSize`, `GradientBorderButtonProps`

### `Handles.tsx`

- **Path:** [`packages/ui/components/controls/Handles.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Handles.tsx)
- **Exports:** `GripDots`, `DragHandle`, `GripButton`, `ResizeHandle`, `PullHandle`
- **Types & Interfaces:** `GripOrientation`, `GripProps`, `DragHandleProps`, `GripButtonProps`, `ResizeEdge`, `ResizeHandleProps`, `PullHandleProps`

### `MediaControls.tsx`

- **Path:** [`packages/ui/components/controls/MediaControls.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/MediaControls.tsx)
- **Exports:** `MediaControls`, `PlayPauseButton`
- **Types & Interfaces:** `RepeatMode`, `MediaControlsProps`, `PlayPauseButtonProps`

### `NavButtons.tsx`

- **Path:** [`packages/ui/components/controls/NavButtons.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/NavButtons.tsx)
- **Exports:** `ArrowButton`, `StepperButtons`, `ScrollButton`
- **Types & Interfaces:** `ArrowDirection`, `ArrowButtonProps`, `StepperButtonsProps`, `ScrollButtonProps`

### `NumberInput.tsx`

- **Path:** [`packages/ui/components/controls/NumberInput.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/NumberInput.tsx)
- **Exports:** `NumberInput`
- **Types & Interfaces:** `NumberInputProps`

### `ProviderButtons.tsx`

- **Path:** [`packages/ui/components/controls/ProviderButtons.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/ProviderButtons.tsx)
- **Exports:** `SignInButton`, `WalletButton`, `AppStoreBadge`, `QrDownload`
- **Types & Interfaces:** `AuthProvider`, `WalletProvider`, `AppStore`, `SignInButtonProps`, `WalletButtonProps`, `AppStoreBadgeProps`, `QrDownloadProps`

### `Radio.tsx`

- **Path:** [`packages/ui/components/controls/Radio.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Radio.tsx)
- **Exports:** `Radio`
- **Types & Interfaces:** `RadioProps`

### `Range.tsx`

- **Path:** [`packages/ui/components/controls/Range.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Range.tsx)
- **Exports:** `Range`
- **Types & Interfaces:** `RangeValue`, `RangeProps`

### `SegmentedControl.tsx`

- **Path:** [`packages/ui/components/controls/SegmentedControl.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/SegmentedControl.tsx)
- **Exports:** `SegmentedControl`
- **Types & Interfaces:** `SegmentedOption`, `SegmentedControlProps`

### `Slider.tsx`

- **Path:** [`packages/ui/components/controls/Slider.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Slider.tsx)
- **Exports:** `Slider`
- **Types & Interfaces:** `SliderProps`

### `SliderExtras.tsx`

- **Path:** [`packages/ui/components/controls/SliderExtras.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/SliderExtras.tsx)
- **Exports:** `MarksSlider`, `TooltipSlider`, `VerticalSlider`, `HistogramSlider`, `StepperSlider`
- **Types & Interfaces:** `SliderMark`, `MarksSliderProps`, `TooltipSliderProps`, `VerticalSliderProps`, `HistogramSliderProps`, `StepperSliderProps`

### `Switch.tsx`

- **Path:** [`packages/ui/components/controls/Switch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/Switch.tsx)
- **Exports:** `Switch`
- **Types & Interfaces:** `SwitchProps`

### `ViewportControls.tsx`

- **Path:** [`packages/ui/components/controls/ViewportControls.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/ViewportControls.tsx)
- **Exports:** `ZoomControls`, `PanPad`, `RotateControl`
- **Types & Interfaces:** `ZoomControlsProps`, `PanPadProps`, `RotateControlProps`

### `WindowButtons.tsx`

- **Path:** [`packages/ui/components/controls/WindowButtons.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/controls/WindowButtons.tsx)
- **Exports:** `ExpandCollapseButton`, `FullscreenButton`, `WindowControls`
- **Types & Interfaces:** `ExpandCollapseButtonProps`, `FullscreenButtonProps`, `WindowControlsProps`

## Category: Data <a id="category-data"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`Bullet.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Bullet.tsx) | `Bullet` | UI component for Bullet |
| [`BusinessHours.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/BusinessHours.tsx) | `parseHm`, `formatClock12`, `businessStatus`, `BusinessHours` | UI component for BusinessHours |
| [`CardVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/CardVariants.tsx) | `HorizontalCard`, `OverlayImageCard`, `HoverRevealCard`, `FlipCard`, `ExpandableCard`, `SelectableCard`, `DraggableCard`, `StackedCards` | UI component for CardVariants |
| [`Carousel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Carousel.tsx) | `Carousel` | UI component for Carousel |
| [`CommerceCards.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/CommerceCards.tsx) | `formatPrice`, `maskCardNumber`, `ProductCard`, `PropertyCard`, `HotelCard`, `FlightCard`, `TicketCard`, `CouponCard`, `CreditCardVisual`, `GiftCard`, `ListingCard` | UI component for CommerceCards |
| [`ContentCards.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/ContentCards.tsx) | `ArticleCard`, `BlogCard`, `NewsCard`, `VideoCard`, `AlbumCard`, `PodcastCard`, `RecipeCard`, `MovieCard`, `MusicCard` | UI component for ContentCards |
| [`Countdown.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Countdown.tsx) | `Countdown` | UI component for Countdown |
| [`DataBar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/DataBar.tsx) | `DataBar` | UI component for DataBar |
| [`Documents.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Documents.tsx) | `DocumentPreview`, `DocumentThumbnails`, `AnnotationPins`, `VersionHistory`, `DiffView`, `ReaderMode`, `TocPanel` | UI component for Documents |
| [`Duration.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Duration.tsx) | `Duration` | UI component for Duration |
| [`FilterBuilder.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/FilterBuilder.tsx) | `SortBuilder`, `FilterBuilder`, `SavedViews`, `DateRangePresets`, `FacetedFilterPanel`, `DEFAULT_OPERATORS` | UI component for FilterBuilder |
| [`Financial.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Financial.tsx) | `formatMoney`, `PriceChangeBadge`, `PriceTicker`, `TickerTape`, `OrderBook`, `DepthChart`, `PortfolioBreakdown`, `TransactionList`, `BalanceCard`, `InvoiceReceipt`, `BudgetBar` | UI component for Financial |
| [`GaugeKPI.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/GaugeKPI.tsx) | `GaugeKPI` | UI component for GaugeKPI |
| [`HeatCell.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/HeatCell.tsx) | `heatIntensity`, `heatClass`, `HeatCell` | UI component for HeatCell |
| [`IconIndicators.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/IconIndicators.tsx) | `StatusLights`, `formatDelta`, `TrendArrow` | UI component for IconIndicators |
| [`LoadingVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/LoadingVariants.tsx) | `InfiniteScrollLoader`, `RouteProgressBar`, `SplashScreen` | UI component for LoadingVariants |
| [`MediaDisplay.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/MediaDisplay.tsx) | `fmtTime`, `ThumbnailGrid`, `PosterCard`, `PlaylistRow`, `PodcastRow`, `NowPlayingBar`, `LyricsView`, `QueuePanel` | UI component for MediaDisplay |
| [`MetricCard.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/MetricCard.tsx) | `MetricCard` | UI component for MetricCard |
| [`Pagination.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Pagination.tsx) | `Pagination` | UI component for Pagination |
| [`Progress.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Progress.tsx) | `Progress`, `SegmentedMeter` | UI component for Progress |
| [`PromoCode.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/PromoCode.tsx) | `PromoCode` | UI component for PromoCode |
| [`SLAIndicator.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/SLAIndicator.tsx) | `SLAIndicator` | UI component for SLAIndicator |
| [`Skeleton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Skeleton.tsx) | `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonRow`, `SkeletonCircle`, `SkeletonTable`, `SkeletonGroup` | UI component for Skeleton |
| [`Sparkline.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Sparkline.tsx) | `Sparkline` | UI component for Sparkline |
| [`Spinner.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Spinner.tsx) | `Spinner` | UI component for Spinner |
| [`StatTile.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/StatTile.tsx) | `StatTile` | UI component for StatTile |
| [`Status.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Status.tsx) | `SyncStatus`, `SaveStatus`, `ConnectionQuality`, `BatteryIndicator` | UI component for Status |
| [`StockIndicator.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/StockIndicator.tsx) | `StockIndicator` | UI component for StockIndicator |
| [`Stopwatch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Stopwatch.tsx) | `formatStopwatch`, `Stopwatch` | UI component for Stopwatch |
| [`Table.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Table.tsx) | `cycleSort`, `Table` | UI component for Table |
| [`TimeAgo.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/TimeAgo.tsx) | `TimeAgo` | UI component for TimeAgo |
| [`TimeDifference.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/TimeDifference.tsx) | `TimeDifference` | UI component for TimeDifference |
| [`TimezoneClock.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/TimezoneClock.tsx) | `TimezoneClock` | UI component for TimezoneClock |
| [`WorkCards.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/WorkCards.tsx) | `ContactCard`, `BusinessCard`, `TeamMemberCard`, `ReviewCard`, `NotificationCard`, `TaskCard`, `ProjectCard`, `FileCard`, `FolderCard`, `AppCard`, `IntegrationCard`, `FeatureCard`, `MetricAlertCard` | UI component for WorkCards |

### `Bullet.tsx`

- **Path:** [`packages/ui/components/data/Bullet.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Bullet.tsx)
- **Exports:** `Bullet`
- **Types & Interfaces:** `BulletTone`, `BulletProps`

### `BusinessHours.tsx`

- **Path:** [`packages/ui/components/data/BusinessHours.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/BusinessHours.tsx)
- **Exports:** `parseHm`, `formatClock12`, `businessStatus`, `BusinessHours`
- **Types & Interfaces:** `BusinessHoursProps`, `BusinessStatus`, `BusinessHoursOptions`

### `CardVariants.tsx`

- **Path:** [`packages/ui/components/data/CardVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/CardVariants.tsx)
- **Exports:** `HorizontalCard`, `OverlayImageCard`, `HoverRevealCard`, `FlipCard`, `ExpandableCard`, `SelectableCard`, `DraggableCard`, `StackedCards`
- **Types & Interfaces:** `HorizontalCardProps`, `OverlayImageCardProps`, `HoverRevealCardProps`, `FlipCardProps`, `ExpandableCardProps`, `SelectableCardProps`, `DraggableCardProps`, `StackedCardsProps`

### `Carousel.tsx`

- **Path:** [`packages/ui/components/data/Carousel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Carousel.tsx)
- **Exports:** `Carousel`
- **Types & Interfaces:** `CarouselProps`

### `CommerceCards.tsx`

- **Path:** [`packages/ui/components/data/CommerceCards.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/CommerceCards.tsx)
- **Exports:** `formatPrice`, `maskCardNumber`, `ProductCard`, `PropertyCard`, `HotelCard`, `FlightCard`, `TicketCard`, `CouponCard`, `CreditCardVisual`, `GiftCard`, `ListingCard`
- **Types & Interfaces:** `ProductCardProps`, `PropertyCardProps`, `HotelCardProps`, `FlightCardProps`, `TicketCardProps`, `CouponCardProps`, `CreditCardVisualProps`, `GiftCardProps`, `ListingCardProps`

### `ContentCards.tsx`

- **Path:** [`packages/ui/components/data/ContentCards.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/ContentCards.tsx)
- **Exports:** `ArticleCard`, `BlogCard`, `NewsCard`, `VideoCard`, `AlbumCard`, `PodcastCard`, `RecipeCard`, `MovieCard`, `MusicCard`
- **Types & Interfaces:** `ArticleCardProps`, `BlogCardProps`, `NewsCardProps`, `VideoCardProps`, `AlbumCardProps`, `PodcastCardProps`, `RecipeCardProps`, `MovieCardProps`

### `Countdown.tsx`

- **Path:** [`packages/ui/components/data/Countdown.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Countdown.tsx)
- **Exports:** `Countdown`
- **Types & Interfaces:** `CountdownProps`

### `DataBar.tsx`

- **Path:** [`packages/ui/components/data/DataBar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/DataBar.tsx)
- **Exports:** `DataBar`
- **Types & Interfaces:** `DataBarProps`

### `Documents.tsx`

- **Path:** [`packages/ui/components/data/Documents.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Documents.tsx)
- **Exports:** `DocumentPreview`, `DocumentThumbnails`, `AnnotationPins`, `VersionHistory`, `DiffView`, `ReaderMode`, `TocPanel`
- **Types & Interfaces:** `DocumentPreviewProps`, `DocumentPage`, `DocumentThumbnailsProps`, `AnnotationPin`, `AnnotationPinsProps`, `DocumentVersion`, `VersionHistoryProps`, `DiffLine`, `DiffViewProps`, `ReaderModeProps`, `ReaderSize`, `TocPanelProps`

### `Duration.tsx`

- **Path:** [`packages/ui/components/data/Duration.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Duration.tsx)
- **Exports:** `Duration`
- **Types & Interfaces:** `DurationProps`

### `FilterBuilder.tsx`

- **Path:** [`packages/ui/components/data/FilterBuilder.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/FilterBuilder.tsx)
- **Exports:** `SortBuilder`, `FilterBuilder`, `SavedViews`, `DateRangePresets`, `FacetedFilterPanel`, `DEFAULT_OPERATORS`
- **Types & Interfaces:** `SortDir`, `SortRule`, `SortBuilderProps`, `FilterRule`, `FilterBuilderProps`, `SavedView`, `SavedViewsProps`, `DateRangePreset`, `DateRangePresetsProps`, `FacetOption`, `FacetGroup`, `FacetedFilterPanelProps`

### `Financial.tsx`

- **Path:** [`packages/ui/components/data/Financial.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Financial.tsx)
- **Exports:** `formatMoney`, `PriceChangeBadge`, `PriceTicker`, `TickerTape`, `OrderBook`, `DepthChart`, `PortfolioBreakdown`, `TransactionList`, `BalanceCard`, `InvoiceReceipt`, `BudgetBar`
- **Types & Interfaces:** `PriceChangeBadgeProps`, `PriceQuote`, `PriceTickerProps`, `TickerTapeProps`, `OrderLevel`, `OrderBookProps`, `DepthChartProps`, `Holding`, `PortfolioBreakdownProps`, `Transaction`, `TransactionListProps`, `BalanceCardProps`, `InvoiceLine`, `InvoiceReceiptProps`, `BudgetBarProps`

### `GaugeKPI.tsx`

- **Path:** [`packages/ui/components/data/GaugeKPI.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/GaugeKPI.tsx)
- **Exports:** `GaugeKPI`
- **Types & Interfaces:** `GaugeKPIProps`

### `HeatCell.tsx`

- **Path:** [`packages/ui/components/data/HeatCell.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/HeatCell.tsx)
- **Exports:** `heatIntensity`, `heatClass`, `HeatCell`
- **Types & Interfaces:** `HeatRamp`, `HeatCellProps`

### `IconIndicators.tsx`

- **Path:** [`packages/ui/components/data/IconIndicators.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/IconIndicators.tsx)
- **Exports:** `StatusLights`, `formatDelta`, `TrendArrow`
- **Types & Interfaces:** `StatusLevel`, `StatusLightsProps`, `TrendDirection`, `TrendTone`, `TrendArrowProps`

### `LoadingVariants.tsx`

- **Path:** [`packages/ui/components/data/LoadingVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/LoadingVariants.tsx)
- **Exports:** `InfiniteScrollLoader`, `RouteProgressBar`, `SplashScreen`
- **Types & Interfaces:** `InfiniteScrollLoaderProps`, `RouteProgressBarProps`, `SplashScreenProps`

### `MediaDisplay.tsx`

- **Path:** [`packages/ui/components/data/MediaDisplay.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/MediaDisplay.tsx)
- **Exports:** `fmtTime`, `ThumbnailGrid`, `PosterCard`, `PlaylistRow`, `PodcastRow`, `NowPlayingBar`, `LyricsView`, `QueuePanel`
- **Types & Interfaces:** `MediaThumb`, `ThumbnailGridProps`, `PosterCardProps`, `PlaylistRowProps`, `PodcastRowProps`, `NowPlayingBarProps`, `LyricLine`, `LyricsViewProps`, `QueueItem`, `QueuePanelProps`

### `MetricCard.tsx`

- **Path:** [`packages/ui/components/data/MetricCard.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/MetricCard.tsx)
- **Exports:** `MetricCard`
- **Types & Interfaces:** `MetricCardProps`

### `Pagination.tsx`

- **Path:** [`packages/ui/components/data/Pagination.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Pagination.tsx)
- **Exports:** `Pagination`
- **Types & Interfaces:** `PaginationProps`

### `Progress.tsx`

- **Path:** [`packages/ui/components/data/Progress.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Progress.tsx)
- **Exports:** `Progress`, `SegmentedMeter`
- **Types & Interfaces:** `ProgressVariant`, `ProgressProps`, `SegmentedMeterSegment`, `SegmentedMeterProps`

### `PromoCode.tsx`

- **Path:** [`packages/ui/components/data/PromoCode.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/PromoCode.tsx)
- **Exports:** `PromoCode`
- **Types & Interfaces:** `PromoCodeState`, `PromoCodeProps`

### `SLAIndicator.tsx`

- **Path:** [`packages/ui/components/data/SLAIndicator.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/SLAIndicator.tsx)
- **Exports:** `SLAIndicator`
- **Types & Interfaces:** `SLAIndicatorProps`

### `Skeleton.tsx`

- **Path:** [`packages/ui/components/data/Skeleton.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Skeleton.tsx)
- **Exports:** `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonRow`, `SkeletonCircle`, `SkeletonTable`, `SkeletonGroup`
- **Types & Interfaces:** `SkeletonProps`, `SkeletonTextProps`, `SkeletonCardProps`, `SkeletonRowProps`, `SkeletonCircleProps`, `SkeletonTableProps`, `SkeletonGroupProps`

### `Sparkline.tsx`

- **Path:** [`packages/ui/components/data/Sparkline.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Sparkline.tsx)
- **Exports:** `Sparkline`
- **Types & Interfaces:** `SparklineProps`

### `Spinner.tsx`

- **Path:** [`packages/ui/components/data/Spinner.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Spinner.tsx)
- **Exports:** `Spinner`
- **Types & Interfaces:** `SpinnerVariant`, `SpinnerProps`

### `StatTile.tsx`

- **Path:** [`packages/ui/components/data/StatTile.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/StatTile.tsx)
- **Exports:** `StatTile`
- **Types & Interfaces:** `StatTileProps`

### `Status.tsx`

- **Path:** [`packages/ui/components/data/Status.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Status.tsx)
- **Exports:** `SyncStatus`, `SaveStatus`, `ConnectionQuality`, `BatteryIndicator`
- **Types & Interfaces:** `SyncState`, `SyncStatusProps`, `SaveState`, `SaveStatusProps`, `ConnectionLevel`, `ConnectionQualityProps`, `BatteryIndicatorProps`

### `StockIndicator.tsx`

- **Path:** [`packages/ui/components/data/StockIndicator.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/StockIndicator.tsx)
- **Exports:** `StockIndicator`
- **Types & Interfaces:** `StockLevel`, `StockIndicatorProps`

### `Stopwatch.tsx`

- **Path:** [`packages/ui/components/data/Stopwatch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Stopwatch.tsx)
- **Exports:** `formatStopwatch`, `Stopwatch`
- **Types & Interfaces:** `StopwatchProps`

### `Table.tsx`

- **Path:** [`packages/ui/components/data/Table.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/Table.tsx)
- **Exports:** `cycleSort`, `Table`
- **Types & Interfaces:** `SortDirection`, `TableSort`, `TableResponsive`, `TableColumn`, `TableColumnGroup`, `TableProps`

### `TimeAgo.tsx`

- **Path:** [`packages/ui/components/data/TimeAgo.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/TimeAgo.tsx)
- **Exports:** `TimeAgo`
- **Types & Interfaces:** `TimeAgoProps`

### `TimeDifference.tsx`

- **Path:** [`packages/ui/components/data/TimeDifference.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/TimeDifference.tsx)
- **Exports:** `TimeDifference`
- **Types & Interfaces:** `TimeDifferenceProps`

### `TimezoneClock.tsx`

- **Path:** [`packages/ui/components/data/TimezoneClock.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/TimezoneClock.tsx)
- **Exports:** `TimezoneClock`
- **Types & Interfaces:** `TimezoneClockProps`

### `WorkCards.tsx`

- **Path:** [`packages/ui/components/data/WorkCards.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/data/WorkCards.tsx)
- **Exports:** `ContactCard`, `BusinessCard`, `TeamMemberCard`, `ReviewCard`, `NotificationCard`, `TaskCard`, `ProjectCard`, `FileCard`, `FolderCard`, `AppCard`, `IntegrationCard`, `FeatureCard`, `MetricAlertCard`
- **Types & Interfaces:** `ContactCardProps`, `BusinessCardProps`, `TeamMemberCardProps`, `ReviewCardProps`, `NotificationCardProps`, `TaskPriority`, `TaskCardProps`, `ProjectCardProps`, `FileKind`, `FileCardProps`, `FolderCardProps`, `AppCardProps`, `IntegrationCardProps`, `FeatureCardProps`, `MetricAlertStatus`, `MetricAlertCardProps`

## Category: Feedback <a id="category-feedback"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`Banner.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/Banner.tsx) | `Banner` | UI component for Banner |
| [`ConfirmDialog.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/ConfirmDialog.tsx) | `ConfirmDialog` | Destructive confirmation per §24.1 — a modal on desktop. Use <BottomSheet> directly if you need a phone-first sheet instead. |
| [`Guidance.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/Guidance.tsx) | `InlineHelp`, `HelpPanel`, `ProductTour`, `ChecklistWidget`, `TipsCarousel`, `FeatureAnnouncement`, `ChangelogPopup`, `OnboardingModal` | UI component for Guidance |
| [`ScrollUtils.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/ScrollUtils.tsx) | `ScrollProgress`, `useScrollSpy`, `ScrollSpy`, `ScrollReveal`, `ScrollToTop` | UI component for ScrollUtils |
| [`StatePages.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/StatePages.tsx) | `OfflineState`, `ErrorPage`, `UnderConstructionPage`, `ExpiredLinkPage`, `ThankYouPage`, `VerificationPendingPage`, `ERROR_PAGE_COPY` | UI component for StatePages |
| [`States.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/States.tsx) | `EmptyState`, `ErrorState` | UI component for States |
| [`SystemBanners.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/SystemBanners.tsx) | `AnnouncementBanner`, `PromoBanner`, `CookieConsentBanner`, `GdprConsentModal`, `PromptModal`, `formatCountdown`, `SessionTimeoutWarning` | UI component for SystemBanners |
| [`Toast.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/Toast.tsx) | `clampProgress`, `ToastProvider`, `useToast` | UI component for Toast |

### `Banner.tsx`

- **Path:** [`packages/ui/components/feedback/Banner.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/Banner.tsx)
- **Exports:** `Banner`
- **Types & Interfaces:** `BannerTone`, `BannerProps`

### `ConfirmDialog.tsx`

- **Path:** [`packages/ui/components/feedback/ConfirmDialog.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/ConfirmDialog.tsx)
- **Exports:** `ConfirmDialog`
- **Types & Interfaces:** `ConfirmDialogProps`
- **Overview:** Destructive confirmation per §24.1 — a modal on desktop. Use <BottomSheet> directly if you need a phone-first sheet instead.

### `Guidance.tsx`

- **Path:** [`packages/ui/components/feedback/Guidance.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/Guidance.tsx)
- **Exports:** `InlineHelp`, `HelpPanel`, `ProductTour`, `ChecklistWidget`, `TipsCarousel`, `FeatureAnnouncement`, `ChangelogPopup`, `OnboardingModal`
- **Types & Interfaces:** `InlineHelpProps`, `HelpPanelItem`, `HelpPanelProps`, `TourStep`, `ProductTourProps`, `GuidanceChecklistItem`, `ChecklistWidgetProps`, `GuidanceTip`, `TipsCarouselProps`, `FeatureAnnouncementProps`, `ChangelogEntry`, `ChangelogPopupProps`, `OnboardingFeature`, `OnboardingModalProps`

### `ScrollUtils.tsx`

- **Path:** [`packages/ui/components/feedback/ScrollUtils.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/ScrollUtils.tsx)
- **Exports:** `ScrollProgress`, `useScrollSpy`, `ScrollSpy`, `ScrollReveal`, `ScrollToTop`
- **Types & Interfaces:** `ScrollProgressProps`, `UseScrollSpyOptions`, `ScrollSpyProps`, `ScrollRevealProps`, `ScrollToTopProps`

### `StatePages.tsx`

- **Path:** [`packages/ui/components/feedback/StatePages.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/StatePages.tsx)
- **Exports:** `OfflineState`, `ErrorPage`, `UnderConstructionPage`, `ExpiredLinkPage`, `ThankYouPage`, `VerificationPendingPage`, `ERROR_PAGE_COPY`
- **Types & Interfaces:** `OfflineStateProps`, `StatePageErrorCode`, `ErrorPageProps`, `UnderConstructionPageProps`, `ExpiredLinkPageProps`, `ThankYouPageProps`, `VerificationPendingPageProps`

### `States.tsx`

- **Path:** [`packages/ui/components/feedback/States.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/States.tsx)
- **Exports:** `EmptyState`, `ErrorState`
- **Types & Interfaces:** `EmptyStateProps`, `ErrorStateProps`

### `SystemBanners.tsx`

- **Path:** [`packages/ui/components/feedback/SystemBanners.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/SystemBanners.tsx)
- **Exports:** `AnnouncementBanner`, `PromoBanner`, `CookieConsentBanner`, `GdprConsentModal`, `PromptModal`, `formatCountdown`, `SessionTimeoutWarning`
- **Types & Interfaces:** `AnnouncementBannerProps`, `PromoBannerProps`, `CookiePreferences`, `CookieConsentBannerProps`, `ConsentPurpose`, `GdprConsentModalProps`, `PromptKind`, `PromptModalProps`, `SessionTimeoutWarningProps`

### `Toast.tsx`

- **Path:** [`packages/ui/components/feedback/Toast.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/feedback/Toast.tsx)
- **Exports:** `clampProgress`, `ToastProvider`, `useToast`
- **Types & Interfaces:** `ToastTone`, `ToastPosition`, `Toast`, `ToastInput`, `PromiseToastLabels`

## Category: Form <a id="category-form"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`AdvancedPickers.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/AdvancedPickers.tsx) | `EmojiPicker`, `FontPicker`, `IconPicker`, `GradientPicker`, `ShadowPicker`, `EMOJI_GROUPS`, `DEFAULT_FONTS`, `DEFAULT_ICONS`, `DEFAULT_GRADIENTS`, `DEFAULT_SHADOWS` | UI component for AdvancedPickers |
| [`ChipInputs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/ChipInputs.tsx) | `TagInput`, `TokenInput`, `EmailChipsInput`, `EMAIL_RE` | UI component for ChipInputs |
| [`Combobox.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Combobox.tsx) | `Combobox` | UI component for Combobox |
| [`DatePicker.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/DatePicker.tsx) | `DatePicker` | UI component for DatePicker |
| [`Field.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Field.tsx) | `Field` | UI component for Field |
| [`FileUpload.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/FileUpload.tsx) | `FileUpload` | UI component for FileUpload |
| [`FormLayouts.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/FormLayouts.tsx) | `FormWizard`, `TabbedForm`, `ConditionalField`, `FieldArray` | UI component for FormLayouts |
| [`Input.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Input.tsx) | `Input` | UI component for Input |
| [`OTP.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/OTP.tsx) | `OTP` | UI component for OTP |
| [`PatternInputs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/PatternInputs.tsx) | `detectCardBrand`, `formatCardNumber`, `CardNumberInput`, `formatExpiry`, `isExpiryValid`, `CardExpiryInput`, `CardCvcInput`, `CardInput`, `normalizeIban`, `formatIban`, `isValidIban`, `IbanInput`, `formatSsn`, `SsnInput`, `formatPostalCode`, `PostalCodeInput`, `CoordinatesInput` | UI component for PatternInputs |
| [`Pickers.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Pickers.tsx) | `Picker`, `UnitPicker`, `CurrencyPicker`, `TimezonePicker`, `AvatarPicker`, `DEFAULT_UNITS`, `DEFAULT_CURRENCIES` | UI component for Pickers |
| [`SearchField.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SearchField.tsx) | `SearchField` | UI component for SearchField |
| [`SecurityForms.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SecurityForms.tsx) | `TwoFactorSetup`, `RecoveryCodes`, `PasskeyPrompt`, `Honeypot` | UI component for SecurityForms |
| [`Select.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Select.tsx) | `Select` | UI component for Select |
| [`SelectionExtras.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SelectionExtras.tsx) | `TileSelect`, `ImageSelectGrid`, `SwatchSelect`, `ToggleChipGroup`, `NpsScale`, `LikertScale`, `LikertGroup`, `ThumbsRating`, `DEFAULT_LIKERT` | UI component for SelectionExtras |
| [`SmartInputs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SmartInputs.tsx) | `PasswordStrength`, `EmailInput`, `UrlInput`, `UsernameInput`, `PasswordInput` | UI component for SmartInputs |
| [`TemplatePickers.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/TemplatePickers.tsx) | `TemplatePicker`, `LayoutPicker`, `ThemePicker`, `DEFAULT_TEMPLATES`, `DEFAULT_LAYOUTS`, `DEFAULT_THEMES` | UI component for TemplatePickers |
| [`TextField.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/TextField.tsx) | `TextField` | UI component for TextField |
| [`Textarea.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Textarea.tsx) | `Textarea` | UI component for Textarea |
| [`TimePicker.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/TimePicker.tsx) | `TimePicker` | UI component for TimePicker |
| [`UploadExtras.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/UploadExtras.tsx) | `UploadQueue`, `CameraCapture`, `PasteImageZone` | UI component for UploadExtras |
| [`Validation.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Validation.tsx) | `AsyncValidationIndicator`, `DirtyIndicator`, `focusFirstInvalid`, `ValidationSummary`, `useBeforeUnload`, `UnsavedChangesBar` | UI component for Validation |

### `AdvancedPickers.tsx`

- **Path:** [`packages/ui/components/form/AdvancedPickers.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/AdvancedPickers.tsx)
- **Exports:** `EmojiPicker`, `FontPicker`, `IconPicker`, `GradientPicker`, `ShadowPicker`, `EMOJI_GROUPS`, `DEFAULT_FONTS`, `DEFAULT_ICONS`, `DEFAULT_GRADIENTS`, `DEFAULT_SHADOWS`
- **Types & Interfaces:** `EmojiGroup`, `EmojiPickerProps`, `FontOption`, `FontPickerProps`, `IconPickerProps`, `GradientPreset`, `GradientPickerProps`, `ShadowPreset`, `ShadowPickerProps`

### `ChipInputs.tsx`

- **Path:** [`packages/ui/components/form/ChipInputs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/ChipInputs.tsx)
- **Exports:** `TagInput`, `TokenInput`, `EmailChipsInput`, `EMAIL_RE`
- **Types & Interfaces:** `TagInputProps`, `Token`, `TokenInputProps`, `EmailChipsInputProps`

### `Combobox.tsx`

- **Path:** [`packages/ui/components/form/Combobox.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Combobox.tsx)
- **Exports:** `Combobox`
- **Types & Interfaces:** `ComboboxOption`, `ComboboxProps`

### `DatePicker.tsx`

- **Path:** [`packages/ui/components/form/DatePicker.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/DatePicker.tsx)
- **Exports:** `DatePicker`
- **Types & Interfaces:** `DatePickerProps`

### `Field.tsx`

- **Path:** [`packages/ui/components/form/Field.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Field.tsx)
- **Exports:** `Field`
- **Types & Interfaces:** `FieldProps`

### `FileUpload.tsx`

- **Path:** [`packages/ui/components/form/FileUpload.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/FileUpload.tsx)
- **Exports:** `FileUpload`
- **Types & Interfaces:** `FileUploadProps`

### `FormLayouts.tsx`

- **Path:** [`packages/ui/components/form/FormLayouts.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/FormLayouts.tsx)
- **Exports:** `FormWizard`, `TabbedForm`, `ConditionalField`, `FieldArray`
- **Types & Interfaces:** `WizardStep`, `FormWizardProps`, `FormTab`, `TabbedFormProps`, `ConditionalFieldProps`, `FieldArrayProps`

### `Input.tsx`

- **Path:** [`packages/ui/components/form/Input.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Input.tsx)
- **Exports:** `Input`
- **Types & Interfaces:** `InputProps`

### `OTP.tsx`

- **Path:** [`packages/ui/components/form/OTP.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/OTP.tsx)
- **Exports:** `OTP`
- **Types & Interfaces:** `OTPProps`

### `PatternInputs.tsx`

- **Path:** [`packages/ui/components/form/PatternInputs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/PatternInputs.tsx)
- **Exports:** `detectCardBrand`, `formatCardNumber`, `CardNumberInput`, `formatExpiry`, `isExpiryValid`, `CardExpiryInput`, `CardCvcInput`, `CardInput`, `normalizeIban`, `formatIban`, `isValidIban`, `IbanInput`, `formatSsn`, `SsnInput`, `formatPostalCode`, `PostalCodeInput`, `CoordinatesInput`
- **Types & Interfaces:** `CardBrand`, `CardNumberInputProps`, `CardExpiryInputProps`, `CardCvcInputProps`, `CardInputProps`, `IbanInputProps`, `SsnInputProps`, `PostalCodeInputProps`, `Coordinates`, `CoordinatesInputProps`

### `Pickers.tsx`

- **Path:** [`packages/ui/components/form/Pickers.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Pickers.tsx)
- **Exports:** `Picker`, `UnitPicker`, `CurrencyPicker`, `TimezonePicker`, `AvatarPicker`, `DEFAULT_UNITS`, `DEFAULT_CURRENCIES`
- **Types & Interfaces:** `PickerOption`, `PickerProps`, `UnitOption`, `UnitPickerProps`, `CurrencyOption`, `CurrencyPickerProps`, `TimezonePickerProps`, `AvatarPickerProps`

### `SearchField.tsx`

- **Path:** [`packages/ui/components/form/SearchField.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SearchField.tsx)
- **Exports:** `SearchField`
- **Types & Interfaces:** `SearchFieldProps`

### `SecurityForms.tsx`

- **Path:** [`packages/ui/components/form/SecurityForms.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SecurityForms.tsx)
- **Exports:** `TwoFactorSetup`, `RecoveryCodes`, `PasskeyPrompt`, `Honeypot`
- **Types & Interfaces:** `TwoFactorStatus`, `TwoFactorSetupProps`, `RecoveryCodesProps`, `PasskeyPromptProps`, `HoneypotProps`

### `Select.tsx`

- **Path:** [`packages/ui/components/form/Select.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Select.tsx)
- **Exports:** `Select`
- **Types & Interfaces:** `SelectProps`

### `SelectionExtras.tsx`

- **Path:** [`packages/ui/components/form/SelectionExtras.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SelectionExtras.tsx)
- **Exports:** `TileSelect`, `ImageSelectGrid`, `SwatchSelect`, `ToggleChipGroup`, `NpsScale`, `LikertScale`, `LikertGroup`, `ThumbsRating`, `DEFAULT_LIKERT`
- **Types & Interfaces:** `TileOption`, `TileSelectProps`, `ImageOption`, `ImageSelectGridProps`, `SwatchOption`, `SwatchSelectProps`, `ToggleChipOption`, `ToggleChipGroupProps`, `NpsScaleProps`, `LikertScaleProps`, `LikertItem`, `LikertGroupProps`, `ThumbsValue`, `ThumbsRatingProps`

### `SmartInputs.tsx`

- **Path:** [`packages/ui/components/form/SmartInputs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/SmartInputs.tsx)
- **Exports:** `PasswordStrength`, `EmailInput`, `UrlInput`, `UsernameInput`, `PasswordInput`
- **Types & Interfaces:** `EmailInputProps`, `UrlInputProps`, `UsernameStatus`, `UsernameInputProps`, `PasswordRule`, `PasswordStrengthProps`, `PasswordInputProps`

### `TemplatePickers.tsx`

- **Path:** [`packages/ui/components/form/TemplatePickers.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/TemplatePickers.tsx)
- **Exports:** `TemplatePicker`, `LayoutPicker`, `ThemePicker`, `DEFAULT_TEMPLATES`, `DEFAULT_LAYOUTS`, `DEFAULT_THEMES`
- **Types & Interfaces:** `TemplateOption`, `TemplatePickerProps`, `LayoutOption`, `LayoutPickerProps`, `ThemeOption`, `ThemePickerProps`

### `TextField.tsx`

- **Path:** [`packages/ui/components/form/TextField.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/TextField.tsx)
- **Exports:** `TextField`
- **Types & Interfaces:** `TextFieldVariant`, `TextFieldSize`, `TextFieldProps`

### `Textarea.tsx`

- **Path:** [`packages/ui/components/form/Textarea.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Textarea.tsx)
- **Exports:** `Textarea`
- **Types & Interfaces:** `TextareaProps`

### `TimePicker.tsx`

- **Path:** [`packages/ui/components/form/TimePicker.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/TimePicker.tsx)
- **Exports:** `TimePicker`
- **Types & Interfaces:** `TimePickerProps`

### `UploadExtras.tsx`

- **Path:** [`packages/ui/components/form/UploadExtras.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/UploadExtras.tsx)
- **Exports:** `UploadQueue`, `CameraCapture`, `PasteImageZone`
- **Types & Interfaces:** `UploadStatus`, `UploadItem`, `UploadQueueProps`, `CameraCaptureProps`, `PasteImageZoneProps`

### `Validation.tsx`

- **Path:** [`packages/ui/components/form/Validation.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/form/Validation.tsx)
- **Exports:** `AsyncValidationIndicator`, `DirtyIndicator`, `focusFirstInvalid`, `ValidationSummary`, `useBeforeUnload`, `UnsavedChangesBar`
- **Types & Interfaces:** `ValidationStatus`, `AsyncValidationIndicatorProps`, `DirtyIndicatorProps`, `ValidationIssue`, `ValidationSummaryProps`, `UnsavedChangesBarProps`

## Category: List <a id="category-list"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`Accordion.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/Accordion.tsx) | `Accordion`, `AccordionItem` | UI component for Accordion |
| [`GroupedList.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/GroupedList.tsx) | `ListRow`, `GroupedList` | UI component for GroupedList |
| [`ListHeader.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/ListHeader.tsx) | `ListHeader` | UI component for ListHeader |
| [`Lists.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/Lists.tsx) | `ChatList`, `ContactList`, `NotificationList`, `ChecklistList`, `TodoList`, `PlaylistList`, `SearchResults`, `StickyHeaderList`, `AlphabetIndexList`, `SwipeList`, `ReorderableList`, `InfiniteList`, `NestedList` | UI component for Lists |
| [`Timeline.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/Timeline.tsx) | `Timeline` | UI component for Timeline |

### `Accordion.tsx`

- **Path:** [`packages/ui/components/list/Accordion.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/Accordion.tsx)
- **Exports:** `Accordion`, `AccordionItem`
- **Types & Interfaces:** `AccordionProps`, `AccordionItemProps`

### `GroupedList.tsx`

- **Path:** [`packages/ui/components/list/GroupedList.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/GroupedList.tsx)
- **Exports:** `ListRow`, `GroupedList`
- **Types & Interfaces:** `ListRowProps`, `GroupedListProps`

### `ListHeader.tsx`

- **Path:** [`packages/ui/components/list/ListHeader.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/ListHeader.tsx)
- **Exports:** `ListHeader`
- **Types & Interfaces:** `ListHeaderProps`

### `Lists.tsx`

- **Path:** [`packages/ui/components/list/Lists.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/Lists.tsx)
- **Exports:** `ChatList`, `ContactList`, `NotificationList`, `ChecklistList`, `TodoList`, `PlaylistList`, `SearchResults`, `StickyHeaderList`, `AlphabetIndexList`, `SwipeList`, `ReorderableList`, `InfiniteList`, `NestedList`
- **Types & Interfaces:** `ChatMessage`, `ChatListProps`, `ContactItem`, `ContactListProps`, `NotificationItem`, `NotificationListProps`, `ChecklistItem`, `ChecklistListProps`, `TodoPriority`, `TodoItem`, `TodoListProps`, `PlaylistTrack`, `PlaylistListProps`, `SearchResultItem`, `SearchResultsProps`, `StickyGroup`, `StickyHeaderListProps`, `AlphabetItem`, `AlphabetIndexListProps`, `SwipeItem`, `SwipeListProps`, `ReorderableItem`, `ReorderableListProps`, `InfiniteListProps`, `NestedNode`, `NestedListProps`

### `Timeline.tsx`

- **Path:** [`packages/ui/components/list/Timeline.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/list/Timeline.tsx)
- **Exports:** `Timeline`
- **Types & Interfaces:** `TimelineTone`, `TimelineItem`, `TimelineProps`

## Category: Modules <a id="category-modules"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`DataGrid.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/modules/DataGrid.tsx) | `DataGrid` | UI component for DataGrid |
| [`SkinManager.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/modules/SkinManager.tsx) | `formatBytes`, `SkinManager` | UI component for SkinManager |

### `DataGrid.tsx`

- **Path:** [`packages/ui/components/modules/DataGrid.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/modules/DataGrid.tsx)
- **Exports:** `DataGrid`
- **Types & Interfaces:** `Column`, `DataGridProps`

### `SkinManager.tsx`

- **Path:** [`packages/ui/components/modules/SkinManager.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/modules/SkinManager.tsx)
- **Exports:** `formatBytes`, `SkinManager`
- **Types & Interfaces:** `SkinInstallStatus`, `SkinManagerItem`, `SkinManagerProps`

## Category: Navigation <a id="category-navigation"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`AppShell.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/AppShell.tsx) | `AppShell` | Optional fixed-width left region (sidebar/master). Renders at md:tall. |
| [`BottomNavVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/BottomNavVariants.tsx) | `BottomTabBarFAB`, `FloatingBottomNav` | UI component for BottomNavVariants |
| [`BottomTabBar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/BottomTabBar.tsx) | `BottomTabBar` | UI component for BottomTabBar |
| [`Breadcrumb.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Breadcrumb.tsx) | `Breadcrumb` | UI component for Breadcrumb |
| [`CommandMenu.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/CommandMenu.tsx) | `CommandMenu` | UI component for CommandMenu |
| [`FloatingNav.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/FloatingNav.tsx) | `Dock`, `RadialMenu`, `Hamburger`, `OffCanvas`, `FullscreenMenu` | UI component for FloatingNav |
| [`FloatingToolbar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/FloatingToolbar.tsx) | `FloatingToolbar`, `BubbleMenu`, `InlineToolbar` | UI component for FloatingToolbar |
| [`Footer.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Footer.tsx) | `SocialBar`, `MegaFooter`, `FatFooter`, `StickyFooter` | UI component for Footer |
| [`HistoryNav.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/HistoryNav.tsx) | `HistoryDropdown`, `RecentlyViewed` | UI component for HistoryNav |
| [`IconRail.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/IconRail.tsx) | `IconRail` | UI component for IconRail |
| [`Link.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Link.tsx) | `Link` | UI component for Link |
| [`ShareLinks.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/ShareLinks.tsx) | `PermalinkCopier`, `ShareLink` | UI component for ShareLinks |
| [`SideNavVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/SideNavVariants.tsx) | `MultiLevelSidebar`, `MiniSidebar`, `AccordionNav` | UI component for SideNavVariants |
| [`Sidebar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Sidebar.tsx) | `Sidebar` | UI component for Sidebar |
| [`SiteSearch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/SiteSearch.tsx) | `SiteSearch` | UI component for SiteSearch |
| [`Stepper.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Stepper.tsx) | `stepStatus`, `ProgressDots`, `Stepper`, `TimelineStepper` | UI component for Stepper |
| [`Tabs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Tabs.tsx) | `Tabs` | UI component for Tabs |
| [`TabsVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/TabsVariants.tsx) | `StickyTabs`, `ClosableTabs`, `DraggableTabs`, `OverflowTabs`, `DocumentTabs` | UI component for TabsVariants |
| [`Toolbar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Toolbar.tsx) | `Toolbar`, `ToolbarButton`, `ToolbarSeparator` | UI component for Toolbar |
| [`TopBar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/TopBar.tsx) | `TopBar` | UI component for TopBar |
| [`TreeView.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/TreeView.tsx) | `TreeView` | UI component for TreeView |
| [`VoiceSearch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/VoiceSearch.tsx) | `getSpeechRecognition`, `useSpeechRecognition`, `VoiceSearchButton` | UI component for VoiceSearch |

### `AppShell.tsx`

- **Path:** [`packages/ui/components/navigation/AppShell.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/AppShell.tsx)
- **Exports:** `AppShell`
- **Types & Interfaces:** `AppShellProps`
- **Overview:** Optional fixed-width left region (sidebar/master). Renders at md:tall.

### `BottomNavVariants.tsx`

- **Path:** [`packages/ui/components/navigation/BottomNavVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/BottomNavVariants.tsx)
- **Exports:** `BottomTabBarFAB`, `FloatingBottomNav`
- **Types & Interfaces:** `BottomNavAction`, `FabPosition`, `BottomTabBarFABProps`, `FloatingBottomNavProps`

### `BottomTabBar.tsx`

- **Path:** [`packages/ui/components/navigation/BottomTabBar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/BottomTabBar.tsx)
- **Exports:** `BottomTabBar`
- **Types & Interfaces:** `BottomTabItem`, `BottomTabBarProps`

### `Breadcrumb.tsx`

- **Path:** [`packages/ui/components/navigation/Breadcrumb.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Breadcrumb.tsx)
- **Exports:** `Breadcrumb`
- **Types & Interfaces:** `BreadcrumbItem`, `BreadcrumbProps`

### `CommandMenu.tsx`

- **Path:** [`packages/ui/components/navigation/CommandMenu.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/CommandMenu.tsx)
- **Exports:** `CommandMenu`
- **Types & Interfaces:** `CommandItem`, `CommandGroup`, `CommandMenuProps`

### `FloatingNav.tsx`

- **Path:** [`packages/ui/components/navigation/FloatingNav.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/FloatingNav.tsx)
- **Exports:** `Dock`, `RadialMenu`, `Hamburger`, `OffCanvas`, `FullscreenMenu`
- **Types & Interfaces:** `DockItem`, `DockProps`, `RadialMenuItem`, `RadialMenuProps`, `HamburgerProps`, `OffCanvasProps`, `FullscreenMenuItem`, `FullscreenMenuProps`

### `FloatingToolbar.tsx`

- **Path:** [`packages/ui/components/navigation/FloatingToolbar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/FloatingToolbar.tsx)
- **Exports:** `FloatingToolbar`, `BubbleMenu`, `InlineToolbar`
- **Types & Interfaces:** `ToolbarPlacement`, `FloatingToolbarProps`, `BubbleMenuProps`, `InlineToolbarProps`

### `Footer.tsx`

- **Path:** [`packages/ui/components/navigation/Footer.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Footer.tsx)
- **Exports:** `SocialBar`, `MegaFooter`, `FatFooter`, `StickyFooter`
- **Types & Interfaces:** `FooterLink`, `FooterColumn`, `SocialLink`, `SocialBarProps`, `MegaFooterProps`, `FatFooterProps`, `StickyFooterProps`

### `HistoryNav.tsx`

- **Path:** [`packages/ui/components/navigation/HistoryNav.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/HistoryNav.tsx)
- **Exports:** `HistoryDropdown`, `RecentlyViewed`
- **Types & Interfaces:** `HistoryEntry`, `HistoryDropdownProps`, `RecentlyViewedItem`, `RecentlyViewedProps`

### `IconRail.tsx`

- **Path:** [`packages/ui/components/navigation/IconRail.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/IconRail.tsx)
- **Exports:** `IconRail`
- **Types & Interfaces:** `RailItem`, `IconRailProps`

### `Link.tsx`

- **Path:** [`packages/ui/components/navigation/Link.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Link.tsx)
- **Exports:** `Link`
- **Types & Interfaces:** `LinkVariant`, `LinkProps`

### `ShareLinks.tsx`

- **Path:** [`packages/ui/components/navigation/ShareLinks.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/ShareLinks.tsx)
- **Exports:** `PermalinkCopier`, `ShareLink`
- **Types & Interfaces:** `PermalinkCopierProps`, `ShareMethod`, `ShareResult`, `ShareLinkProps`

### `SideNavVariants.tsx`

- **Path:** [`packages/ui/components/navigation/SideNavVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/SideNavVariants.tsx)
- **Exports:** `MultiLevelSidebar`, `MiniSidebar`, `AccordionNav`
- **Types & Interfaces:** `NavLeaf`, `NavGroup`, `NavItem`, `MultiLevelSidebarProps`, `MiniSidebarProps`, `AccordionNavGroup`, `AccordionNavProps`

### `Sidebar.tsx`

- **Path:** [`packages/ui/components/navigation/Sidebar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Sidebar.tsx)
- **Exports:** `Sidebar`
- **Types & Interfaces:** `SidebarItem`, `SidebarProps`

### `SiteSearch.tsx`

- **Path:** [`packages/ui/components/navigation/SiteSearch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/SiteSearch.tsx)
- **Exports:** `SiteSearch`
- **Types & Interfaces:** `SiteSearchItem`, `SiteSearchSection`, `SiteSearchProps`

### `Stepper.tsx`

- **Path:** [`packages/ui/components/navigation/Stepper.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Stepper.tsx)
- **Exports:** `stepStatus`, `ProgressDots`, `Stepper`, `TimelineStepper`
- **Types & Interfaces:** `StepStatus`, `ProgressDotsProps`, `StepItem`, `StepperProps`, `TimelineStep`, `TimelineStepperProps`

### `Tabs.tsx`

- **Path:** [`packages/ui/components/navigation/Tabs.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Tabs.tsx)
- **Exports:** `Tabs`
- **Types & Interfaces:** `TabItem`, `TabsProps`

### `TabsVariants.tsx`

- **Path:** [`packages/ui/components/navigation/TabsVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/TabsVariants.tsx)
- **Exports:** `StickyTabs`, `ClosableTabs`, `DraggableTabs`, `OverflowTabs`, `DocumentTabs`
- **Types & Interfaces:** `StickyTabsProps`, `ClosableTabItem`, `ClosableTabsProps`, `DraggableTabsProps`, `OverflowTabsProps`, `DocumentTabItem`, `DocumentTabsProps`

### `Toolbar.tsx`

- **Path:** [`packages/ui/components/navigation/Toolbar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/Toolbar.tsx)
- **Exports:** `Toolbar`, `ToolbarButton`, `ToolbarSeparator`
- **Types & Interfaces:** `ToolbarOrientation`, `ToolbarProps`, `ToolbarButtonProps`, `ToolbarSeparatorProps`

### `TopBar.tsx`

- **Path:** [`packages/ui/components/navigation/TopBar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/TopBar.tsx)
- **Exports:** `TopBar`
- **Types & Interfaces:** `TopBarProps`

### `TreeView.tsx`

- **Path:** [`packages/ui/components/navigation/TreeView.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/TreeView.tsx)
- **Exports:** `TreeView`
- **Types & Interfaces:** `TreeNode`, `TreeViewProps`

### `VoiceSearch.tsx`

- **Path:** [`packages/ui/components/navigation/VoiceSearch.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/navigation/VoiceSearch.tsx)
- **Exports:** `getSpeechRecognition`, `useSpeechRecognition`, `VoiceSearchButton`
- **Types & Interfaces:** `SpeechRecognitionHandle`, `SpeechRecognitionCtor`, `UseSpeechRecognitionOptions`, `SpeechRecognitionState`, `VoiceSearchButtonProps`

## Category: Overlay <a id="category-overlay"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`ActionSheet.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/ActionSheet.tsx) | `ActionSheet` | UI component for ActionSheet |
| [`BottomSheet.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/BottomSheet.tsx) | `BottomSheet` | Render as a centred modal from md: up instead of a full-width bottom sheet, per DESIGN.md §21.10 — never stretch a bottom sheet across desktop. |
| [`CartDrawer.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/CartDrawer.tsx) | `CartDrawer` | UI component for CartDrawer |
| [`Dropdown.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Dropdown.tsx) | `Dropdown` | UI component for Dropdown |
| [`FloatingPanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/FloatingPanel.tsx) | `FloatingPanel` | UI component for FloatingPanel |
| [`HoverCard.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/HoverCard.tsx) | `HoverCard` | UI component for HoverCard |
| [`Modal.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Modal.tsx) | `Modal` | UI component for Modal |
| [`ModalVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/ModalVariants.tsx) | `clampStep`, `WizardDialog` | UI component for ModalVariants |
| [`PinnedPanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PinnedPanel.tsx) | `PinnedPanel` | UI component for PinnedPanel |
| [`PipContainer.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PipContainer.tsx) | `PipContainer` | UI component for PipContainer |
| [`PopoutPanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PopoutPanel.tsx) | `PopoutPanel` | UI component for PopoutPanel |
| [`Popover.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Popover.tsx) | `Popover` | UI component for Popover |
| [`PopoverVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PopoverVariants.tsx) | `MegaDropdown`, `QuickViewPanel` | UI component for PopoverVariants |
| [`SidePanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/SidePanel.tsx) | `SidePanel` | UI component for SidePanel |
| [`Tooltip.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Tooltip.tsx) | `Tooltip` | UI component for Tooltip |

### `ActionSheet.tsx`

- **Path:** [`packages/ui/components/overlay/ActionSheet.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/ActionSheet.tsx)
- **Exports:** `ActionSheet`
- **Types & Interfaces:** `ActionSheetOption`, `ActionSheetProps`

### `BottomSheet.tsx`

- **Path:** [`packages/ui/components/overlay/BottomSheet.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/BottomSheet.tsx)
- **Exports:** `BottomSheet`
- **Types & Interfaces:** `BottomSheetProps`
- **Overview:** Render as a centred modal from md: up instead of a full-width bottom sheet, per DESIGN.md §21.10 — never stretch a bottom sheet across desktop.

### `CartDrawer.tsx`

- **Path:** [`packages/ui/components/overlay/CartDrawer.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/CartDrawer.tsx)
- **Exports:** `CartDrawer`
- **Types & Interfaces:** `CartLine`, `CartDrawerProps`

### `Dropdown.tsx`

- **Path:** [`packages/ui/components/overlay/Dropdown.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Dropdown.tsx)
- **Exports:** `Dropdown`
- **Types & Interfaces:** `DropdownItem`, `DropdownProps`

### `FloatingPanel.tsx`

- **Path:** [`packages/ui/components/overlay/FloatingPanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/FloatingPanel.tsx)
- **Exports:** `FloatingPanel`
- **Types & Interfaces:** `FloatingPanelProps`

### `HoverCard.tsx`

- **Path:** [`packages/ui/components/overlay/HoverCard.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/HoverCard.tsx)
- **Exports:** `HoverCard`
- **Types & Interfaces:** `HoverCardProps`

### `Modal.tsx`

- **Path:** [`packages/ui/components/overlay/Modal.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Modal.tsx)
- **Exports:** `Modal`
- **Types & Interfaces:** `ModalProps`

### `ModalVariants.tsx`

- **Path:** [`packages/ui/components/overlay/ModalVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/ModalVariants.tsx)
- **Exports:** `clampStep`, `WizardDialog`
- **Types & Interfaces:** `ModalWizardStep`, `WizardDialogProps`

### `PinnedPanel.tsx`

- **Path:** [`packages/ui/components/overlay/PinnedPanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PinnedPanel.tsx)
- **Exports:** `PinnedPanel`
- **Types & Interfaces:** `PinnedEdge`, `PinnedRole`, `PinnedPanelProps`

### `PipContainer.tsx`

- **Path:** [`packages/ui/components/overlay/PipContainer.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PipContainer.tsx)
- **Exports:** `PipContainer`
- **Types & Interfaces:** `PipCorner`, `PipContainerProps`

### `PopoutPanel.tsx`

- **Path:** [`packages/ui/components/overlay/PopoutPanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PopoutPanel.tsx)
- **Exports:** `PopoutPanel`
- **Types & Interfaces:** `PopoutPanelProps`

### `Popover.tsx`

- **Path:** [`packages/ui/components/overlay/Popover.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Popover.tsx)
- **Exports:** `Popover`
- **Types & Interfaces:** `PopoverProps`

### `PopoverVariants.tsx`

- **Path:** [`packages/ui/components/overlay/PopoverVariants.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/PopoverVariants.tsx)
- **Exports:** `MegaDropdown`, `QuickViewPanel`
- **Types & Interfaces:** `MegaMenuItem`, `MegaMenuColumn`, `MegaDropdownProps`, `QuickViewMeta`, `QuickViewPanelProps`

### `SidePanel.tsx`

- **Path:** [`packages/ui/components/overlay/SidePanel.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/SidePanel.tsx)
- **Exports:** `SidePanel`
- **Types & Interfaces:** `SidePanelProps`

### `Tooltip.tsx`

- **Path:** [`packages/ui/components/overlay/Tooltip.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/overlay/Tooltip.tsx)
- **Exports:** `Tooltip`
- **Types & Interfaces:** `TooltipProps`

## Category: Surface <a id="category-surface"></a>

| Component File | Key Exports | Description |
|---|---|---|
| [`AnimatedText.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/AnimatedText.tsx) | `Typewriter`, `FadeInText`, `WordRotator`, `ScrambleText`, `SplitText` | UI component for AnimatedText |
| [`AspectRatio.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/AspectRatio.tsx) | `AspectRatio` | UI component for AspectRatio |
| [`Avatar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Avatar.tsx) | `getInitials`, `Avatar` | UI component for Avatar |
| [`Badge.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Badge.tsx) | `Badge`, `Chip`, `Tag`, `StatusDot` | UI component for Badge |
| [`Card.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Card.tsx) | `Card` | UI component for Card |
| [`Editorial.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Editorial.tsx) | `DropCap`, `PullQuote`, `FootnoteRef`, `Footnote`, `FootnoteList`, `Citation` | UI component for Editorial |
| [`Gallery.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Gallery.tsx) | `MosaicGrid`, `MosaicItem`, `Bento`, `BentoCell`, `MasonryBoard`, `JustifiedGallery` | UI component for Gallery |
| [`IconTile.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/IconTile.tsx) | `IconTile` | UI component for IconTile |
| [`Inline.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Inline.tsx) | `InlineBadge`, `Abbr`, `Definition`, `Code` | UI component for Inline |
| [`InlineText.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/InlineText.tsx) | `Mention`, `Hashtag`, `Emoji`, `TextDiff` | UI component for InlineText |
| [`Kbd.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Kbd.tsx) | `Kbd` | UI component for Kbd |
| [`LineClamp.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/LineClamp.tsx) | `LineClamp` | UI component for LineClamp |
| [`LineClampText.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/LineClampText.tsx) | `LineClampText` | UI component for LineClampText |
| [`Mobile.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Mobile.tsx) | `SafeArea`, `KeyboardAvoidingView`, `PullToRefresh` | UI component for Mobile |
| [`Orientation.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Orientation.tsx) | `useOrientation`, `Orientation` | UI component for Orientation |
| [`People.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/People.tsx) | `AvatarGroup`, `TeamStack`, `NameRole`, `Byline` | UI component for People |
| [`Primitives.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Primitives.tsx) | `Div`, `Box`, `Container`, `Stack`, `HStack`, `Grid`, `Frame`, `Bleed`, `Cluster`, `Switcher`, `Reel`, `SidebarLayout`, `Imposter`, `Cover`, `MultiColumn`, `Columns`, `Gutter`, `Offset`, `Push`, `Pull`, `Show`, `Hide`, `VisuallyHidden`, `Surface`, `Well`, `Raised`, `Panel`, `Chrome`, `Ground`, `Text`, `Heading`, `Display`, `Subtitle` | UI component for Primitives |
| [`Rating.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Rating.tsx) | `Rating` | UI component for Rating |
| [`ReadMore.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/ReadMore.tsx) | `ReadMore` | UI component for ReadMore |
| [`SceneBackdrop.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/SceneBackdrop.tsx) | `SceneBackdrop` | UI component for SceneBackdrop |
| [`ScrollArea.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/ScrollArea.tsx) | `ScrollArea` | UI component for ScrollArea |
| [`Separator.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Separator.tsx) | `Separator` | UI component for Separator |
| [`Sticky.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Sticky.tsx) | `StickySidebar`, `StickyToc`, `StickyCtaBar` | UI component for Sticky |
| [`Swipe.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Swipe.tsx) | `Swipeable`, `SwipeActions` | UI component for Swipe |
| [`TextEffects.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/TextEffects.tsx) | `GradientText`, `OutlineText` | UI component for TextEffects |

### `AnimatedText.tsx`

- **Path:** [`packages/ui/components/surface/AnimatedText.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/AnimatedText.tsx)
- **Exports:** `Typewriter`, `FadeInText`, `WordRotator`, `ScrambleText`, `SplitText`
- **Types & Interfaces:** `TypewriterProps`, `FadeInTextProps`, `WordRotatorProps`, `ScrambleTextProps`, `SplitTextProps`

### `AspectRatio.tsx`

- **Path:** [`packages/ui/components/surface/AspectRatio.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/AspectRatio.tsx)
- **Exports:** `AspectRatio`
- **Types & Interfaces:** `AspectRatioProps`

### `Avatar.tsx`

- **Path:** [`packages/ui/components/surface/Avatar.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Avatar.tsx)
- **Exports:** `getInitials`, `Avatar`
- **Types & Interfaces:** `PresenceStatus`, `AvatarProps`

### `Badge.tsx`

- **Path:** [`packages/ui/components/surface/Badge.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Badge.tsx)
- **Exports:** `Badge`, `Chip`, `Tag`, `StatusDot`
- **Types & Interfaces:** `BadgeProps`, `ChipProps`, `StatusDotProps`

### `Card.tsx`

- **Path:** [`packages/ui/components/surface/Card.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Card.tsx)
- **Exports:** `Card`
- **Types & Interfaces:** `CardProps`

### `Editorial.tsx`

- **Path:** [`packages/ui/components/surface/Editorial.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Editorial.tsx)
- **Exports:** `DropCap`, `PullQuote`, `FootnoteRef`, `Footnote`, `FootnoteList`, `Citation`
- **Types & Interfaces:** `DropCapSize`, `DropCapProps`, `PullQuoteProps`, `FootnoteRefProps`, `FootnoteProps`, `FootnoteListProps`, `CitationProps`

### `Gallery.tsx`

- **Path:** [`packages/ui/components/surface/Gallery.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Gallery.tsx)
- **Exports:** `MosaicGrid`, `MosaicItem`, `Bento`, `BentoCell`, `MasonryBoard`, `JustifiedGallery`
- **Types & Interfaces:** `MosaicGridProps`, `MosaicItemProps`, `BentoProps`, `BentoCellProps`, `MasonryBoardProps`, `JustifiedImage`, `JustifiedGalleryProps`

### `IconTile.tsx`

- **Path:** [`packages/ui/components/surface/IconTile.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/IconTile.tsx)
- **Exports:** `IconTile`
- **Types & Interfaces:** `IconTileProps`

### `Inline.tsx`

- **Path:** [`packages/ui/components/surface/Inline.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Inline.tsx)
- **Exports:** `InlineBadge`, `Abbr`, `Definition`, `Code`
- **Types & Interfaces:** `InlineBadgeTone`, `InlineBadgeProps`, `AbbrProps`, `DefinitionProps`, `CodeProps`

### `InlineText.tsx`

- **Path:** [`packages/ui/components/surface/InlineText.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/InlineText.tsx)
- **Exports:** `Mention`, `Hashtag`, `Emoji`, `TextDiff`
- **Types & Interfaces:** `MentionProps`, `HashtagProps`, `EmojiProps`, `TextDiffProps`

### `Kbd.tsx`

- **Path:** [`packages/ui/components/surface/Kbd.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Kbd.tsx)
- **Exports:** `Kbd`
- **Types & Interfaces:** `KbdProps`

### `LineClamp.tsx`

- **Path:** [`packages/ui/components/surface/LineClamp.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/LineClamp.tsx)
- **Exports:** `LineClamp`
- **Types & Interfaces:** `LineClampProps`

### `LineClampText.tsx`

- **Path:** [`packages/ui/components/surface/LineClampText.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/LineClampText.tsx)
- **Exports:** `LineClampText`
- **Types & Interfaces:** `LineClampTextProps`

### `Mobile.tsx`

- **Path:** [`packages/ui/components/surface/Mobile.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Mobile.tsx)
- **Exports:** `SafeArea`, `KeyboardAvoidingView`, `PullToRefresh`
- **Types & Interfaces:** `SafeAreaEdge`, `SafeAreaProps`, `KeyboardBehavior`, `KeyboardAvoidingViewProps`, `PullToRefreshProps`

### `Orientation.tsx`

- **Path:** [`packages/ui/components/surface/Orientation.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Orientation.tsx)
- **Exports:** `useOrientation`, `Orientation`
- **Types & Interfaces:** `OrientationValue`, `OrientationProps`

### `People.tsx`

- **Path:** [`packages/ui/components/surface/People.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/People.tsx)
- **Exports:** `AvatarGroup`, `TeamStack`, `NameRole`, `Byline`
- **Types & Interfaces:** `AvatarPerson`, `AvatarGroupProps`, `TeamMember`, `TeamStackProps`, `NameRoleProps`, `BylineProps`

### `Primitives.tsx`

- **Path:** [`packages/ui/components/surface/Primitives.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Primitives.tsx)
- **Exports:** `Div`, `Box`, `Container`, `Stack`, `HStack`, `Grid`, `Frame`, `Bleed`, `Cluster`, `Switcher`, `Reel`, `SidebarLayout`, `Imposter`, `Cover`, `MultiColumn`, `Columns`, `Gutter`, `Offset`, `Push`, `Pull`, `Show`, `Hide`, `VisuallyHidden`, `Surface`, `Well`, `Raised`, `Panel`, `Chrome`, `Ground`, `Text`, `Heading`, `Display`, `Subtitle`
- **Types & Interfaces:** `DivProps`, `ContainerWidth`, `ContainerProps`, `StackGap`, `StackProps`, `HStackProps`, `GridCols`, `GridProps`, `FrameRatio`, `FrameProps`, `BleedProps`, `ClusterJustify`, `ClusterProps`, `SwitcherProps`, `ReelProps`, `SidebarLayoutProps`, `ImposterProps`, `CoverProps`, `MultiColumnCount`, `MultiColumnProps`, `ColumnsProps`, `GutterProps`, `OffsetProps`, `PushPullProps`, `Breakpoint`, `BreakpointProps`, `VisuallyHiddenProps`, `MaterialRole`, `SurfaceProps`, `TextTone`, `TextSize`, `TextProps`, `HeadingProps`, `DisplaySize`, `DisplayProps`, `SubtitleSize`, `SubtitleProps`

### `Rating.tsx`

- **Path:** [`packages/ui/components/surface/Rating.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Rating.tsx)
- **Exports:** `Rating`
- **Types & Interfaces:** `RatingProps`

### `ReadMore.tsx`

- **Path:** [`packages/ui/components/surface/ReadMore.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/ReadMore.tsx)
- **Exports:** `ReadMore`
- **Types & Interfaces:** `ReadMoreProps`

### `SceneBackdrop.tsx`

- **Path:** [`packages/ui/components/surface/SceneBackdrop.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/SceneBackdrop.tsx)
- **Exports:** `SceneBackdrop`

### `ScrollArea.tsx`

- **Path:** [`packages/ui/components/surface/ScrollArea.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/ScrollArea.tsx)
- **Exports:** `ScrollArea`
- **Types & Interfaces:** `ScrollAreaProps`

### `Separator.tsx`

- **Path:** [`packages/ui/components/surface/Separator.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Separator.tsx)
- **Exports:** `Separator`
- **Types & Interfaces:** `SeparatorProps`

### `Sticky.tsx`

- **Path:** [`packages/ui/components/surface/Sticky.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Sticky.tsx)
- **Exports:** `StickySidebar`, `StickyToc`, `StickyCtaBar`
- **Types & Interfaces:** `StickySidebarProps`, `TocItem`, `StickyTocProps`, `StickyCtaBarProps`

### `Swipe.tsx`

- **Path:** [`packages/ui/components/surface/Swipe.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/Swipe.tsx)
- **Exports:** `Swipeable`, `SwipeActions`
- **Types & Interfaces:** `SwipeDirection`, `SwipeableProps`, `SwipeActionTone`, `SwipeAction`, `SwipeActionsProps`

### `TextEffects.tsx`

- **Path:** [`packages/ui/components/surface/TextEffects.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/components/surface/TextEffects.tsx)
- **Exports:** `GradientText`, `OutlineText`
- **Types & Interfaces:** `TextEffectRole`, `GradientTextProps`, `OutlineTextProps`

## Category: Physics & Game Kernel <a id="category-physics"></a>

- **Path:** [`packages/ui/lib/physics/`](file:///home/abdul-ahad/Desktop/hono_backend/packages/ui/lib/physics)
- **Import:** `@ecomerece/ui/physics`
- **Key Modules:**
  - `accumulate.ts`: Fixed timestep accumulator (`FIXED_DT = 1/60`), `interpolationAlpha` for buttery 60/120fps rendering.
  - `fsm.ts`: State machine (`createGameFsm`) with strict transitions: `menu -> playing -> paused -> gameover`.
  - `motion.ts`: `approach`, `rampSpeed`, `clamp`.
  - `collision.ts`: Swept continuous collision detection (`sweep`), `circleOverlaps`, `findOverlaps` — guarantees zero tunneling even at maximum closing velocity.
  - `odometer.ts`: Accurate distance tracker (`createOdometer`), `difficultyTier`.
  - `spawn.ts`: Seeded traffic spawner (`createSpawner`), `spawnInterval`, `pickLane` across configurable lane counts.
  - `rng.ts`: Seeded pseudo-random number generator (`mulberry32`, `randInt`, `randFloat`). Runs are 100% deterministic.

## Category: Web App Components <a id="category-web-app"></a>

### Lane Runner Arcade Game (`DriveGame.tsx`)

- **Path:** [`apps/web/components/game/DriveGame.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/apps/web/components/game/DriveGame.tsx)
- **Route:** [`apps/web/app/game/page.tsx`](file:///home/abdul-ahad/Desktop/hono_backend/apps/web/app/game/page.tsx) -> `/game`
- **Overview:** Arcade 2D racing car dodger on the physics kernel. Features:
  - **In-Game HUD & Controls:** Steering (`ArrowButton` pair / `PanPad` D-Pad), Nitro Boost (up-arrow) and Brake (down-arrow) pedals layered directly INSIDE the viewport, fully interactive in both windowed and Fullscreen modes (`FullscreenButton`).
  - **Responsive Aspect Fit:** `fitWorld()` (in `palette.ts`) contains the lane world to the canvas, then extends it on the free axis so phones and landscape fill edge-to-edge with zero letterbox bands; the road stays centred and player is anchored to the world bottom.
  - **Fullscreen Landscape Mode:** Entering fullscreen hides the mode/sound/shortcut chrome and shows only the steering arrows, boost/brake arrows, and the graphical meters; a best-effort `screen.orientation.lock('landscape')` is requested and a rotate hint is shown in portrait.
  - **Graphical Meters:** Circular Speedometer arc gauge (`GaugeKPI`), Tachometer RPM meter (`SegmentedMeter`), and Tier Milestone meter (`Progress`).
  - **Authentic Racing Sensation:** Responsive acceleration/deceleration physics, pitch weight transfer, volumetric forward headlights, speed warp lines, red/white racing rumble strips, body lean into turns, brake lights, and tire skid marks.
  - **Guaranteed Escape Corridors:** Solvability law ensures at least one lane remains open across all longitudinal windows on 3–8 lanes.
  - **3 to 8 Lane Modes:** Configured via `StepperButtons` with dynamic asphalt geometry and density-balanced traffic.
- **Palette Engine:** [`apps/web/components/game/palette.ts`](file:///home/abdul-ahad/Desktop/hono_backend/apps/web/components/game/palette.ts) — Injected CSS token reader (`data-skin`, `data-theme`) repainting canvas in real time; world metric calculators, including `fitWorld()` / `FittedWorld` for letterbox-free aspect fitting.
- **Sound Engine:** [`apps/web/components/game/audio.ts`](file:///home/abdul-ahad/Desktop/hono_backend/apps/web/components/game/audio.ts) — Procedural Web Audio API synthesizer for engine hum pitch-bending, coin chimes, turbo whooshes, brake squeals, and crash explosions.

