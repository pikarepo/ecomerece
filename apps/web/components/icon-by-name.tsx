'use client';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CategoryIcon from '@mui/icons-material/Category';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { ComponentType } from 'react';

const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  AutoAwesome: AutoAwesomeIcon,
  Box: Inventory2Icon,
  Category: CategoryIcon,
  Favorite: FavoriteIcon,
  Heart: FavoriteIcon,
  LocalOffer: LocalOfferIcon,
  LocalShipping: LocalShippingIcon,
  RestartAlt: RestartAltIcon,
  RotateCcw: RestartAltIcon,
  Shield: ShieldIcon,
  ShieldCheck: ShieldIcon,
  Sparkles: AutoAwesomeIcon,
  Star: StarIcon,
  Storefront: StorefrontIcon,
  Truck: LocalShippingIcon,
  Whatshot: WhatshotIcon,
};

type IconByNameProps = SvgIconProps & { name?: string };

export function IconByName({ name, ...props }: IconByNameProps) {
  const Icon = (name && ICONS[name]) || Inventory2Icon;
  return <Icon {...props} />;
}
