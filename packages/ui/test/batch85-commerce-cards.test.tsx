import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  CouponCard,
  CreditCardVisual,
  FlightCard,
  formatPrice,
  GiftCard,
  HotelCard,
  ListingCard,
  maskCardNumber,
  ProductCard,
  PropertyCard,
  TicketCard,
} from '../components/data/CommerceCards';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('formatPrice / maskCardNumber', () => {
  test('formats a price in USD', () => {
    expect(formatPrice(1234.5)).toBe('$1,234.50');
  });

  test('honours the currency argument', () => {
    expect(formatPrice(10, 'EUR')).toContain('€');
  });

  test('masks all but the last four digits', () => {
    expect(maskCardNumber('4242424242424242')).toBe('•••• •••• •••• 4242');
  });
});

describe('ProductCard', () => {
  test('shows title, price, rating and stock', () => {
    const { container, unmount } = render(
      createElement(ProductCard, {
        title: 'Trail Runner',
        price: 89,
        rating: 4,
        reviews: 128,
        stock: 'in-stock',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Trail Runner');
    expect(text).toContain('$89.00');
    expect(text).toContain('(128)');
    expect(text).toContain('In stock');
    unmount();
  });

  test('renders original price and a computed discount badge', () => {
    const { container, unmount } = render(
      createElement(ProductCard, { title: 'Sale item', price: 75, originalPrice: 100 }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('$100.00');
    expect(text).toContain('-25%');
    unmount();
  });

  test('fires onAddToCart when the button is clicked', () => {
    let clicks = 0;
    const { container, unmount } = render(
      createElement(ProductCard, {
        title: 'Add me',
        price: 5,
        onAddToCart: () => {
          clicks += 1;
        },
      }),
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Add to cart');
    act(() => fire(button, 'click'));
    expect(clicks).toBe(1);
    unmount();
  });

  test('renders a wishlist button when onWishlist is given', () => {
    let toggled = 0;
    const { container, unmount } = render(
      createElement(ProductCard, {
        title: 'Heart',
        price: 1,
        onWishlist: () => {
          toggled += 1;
        },
      }),
    );
    const wish = container.querySelector('[aria-label="Add to wishlist"]') as HTMLButtonElement;
    expect(wish).not.toBeNull();
    act(() => fire(wish, 'click'));
    expect(toggled).toBe(1);
    unmount();
  });

  test('renders a link root when href is given', () => {
    const { container, unmount } = render(
      createElement(ProductCard, { title: 'Linked', price: 1, href: '/p/1' }),
    );
    expect(container.firstElementChild?.tagName).toBe('A');
    unmount();
  });
});

describe('PropertyCard / ListingCard', () => {
  test('shows price, address and bed/bath/area meta', () => {
    const { container, unmount } = render(
      createElement(PropertyCard, {
        title: 'Sunny loft',
        price: 3200,
        priceInterval: 'month',
        address: '12 Main St',
        beds: 3,
        baths: 2,
        area: 1400,
        tag: 'For rent',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('$3,200.00');
    expect(text).toContain('/month');
    expect(text).toContain('12 Main St');
    expect(text).toContain('3 bd');
    expect(text).toContain('2 ba');
    expect(text).toContain('1400 sqft');
    expect(text).toContain('For rent');
    unmount();
  });

  test('ListingCard renders as a property card', () => {
    const { container, unmount } = render(
      createElement(ListingCard, { title: 'Alias', price: 100 }),
    );
    expect(container.textContent).toContain('$100.00');
    unmount();
  });
});

describe('HotelCard', () => {
  test('shows name, location, star class and nightly rate', () => {
    const { container, unmount } = render(
      createElement(HotelCard, {
        name: 'Grand Hotel',
        location: 'Lisbon',
        stars: 4,
        rating: 4.7,
        reviews: 512,
        pricePerNight: 180,
        amenities: ['wifi', 'pool'],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Grand Hotel');
    expect(text).toContain('Lisbon');
    expect(text).toContain('4.7');
    expect(text).toContain('512 reviews');
    expect(text).toContain('$180.00');
    expect(text).toContain('/ night');
    const stars = container.querySelector('[aria-label="4 star hotel"]');
    expect(stars).not.toBeNull();
    const wifi = container.querySelector('[aria-label="wifi"]');
    expect(wifi).not.toBeNull();
    unmount();
  });
});

describe('FlightCard', () => {
  test('shows itinerary and price with direct label', () => {
    const { container, unmount } = render(
      createElement(FlightCard, {
        airline: 'Skyline',
        from: 'SFO',
        to: 'JFK',
        departTime: '08:00',
        arriveTime: '16:30',
        duration: '5h 30m',
        price: 240,
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Skyline');
    expect(text).toContain('SFO');
    expect(text).toContain('JFK');
    expect(text).toContain('5h 30m');
    expect(text).toContain('Direct');
    expect(text).toContain('$240.00');
    unmount();
  });

  test('labels one or more stops', () => {
    const { container, unmount } = render(
      createElement(FlightCard, {
        airline: 'A',
        from: 'X',
        to: 'Y',
        departTime: '1',
        arriveTime: '2',
        stops: 2,
        price: 1,
      }),
    );
    expect(container.textContent).toContain('2 stops');
    unmount();
  });

  test('fires onSelect', () => {
    let selected = 0;
    const { container, unmount } = render(
      createElement(FlightCard, {
        airline: 'A',
        from: 'X',
        to: 'Y',
        departTime: '1',
        arriveTime: '2',
        price: 1,
        onSelect: () => {
          selected += 1;
        },
      }),
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(selected).toBe(1);
    unmount();
  });
});

describe('TicketCard', () => {
  test('shows event details, seat and stub code', () => {
    const { container, unmount } = render(
      createElement(TicketCard, {
        event: 'Final match',
        date: 'May 12',
        venue: 'Arena',
        section: 'A',
        row: '7',
        seat: '14',
        price: 60,
        code: 'TX-9F2',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Final match');
    expect(text).toContain('May 12');
    expect(text).toContain('Arena');
    expect(text).toContain('Sec A');
    expect(text).toContain('Row 7');
    expect(text).toContain('Seat 14');
    expect(text).toContain('$60.00');
    expect(text).toContain('TX-9F2');
    unmount();
  });

  test('links the event name when href is given', () => {
    const { container, unmount } = render(
      createElement(TicketCard, { event: 'Linked event', href: '/e/1' }),
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/e/1');
    unmount();
  });
});

describe('CouponCard', () => {
  test('shows discount, code, expiry and copies', () => {
    let copies = 0;
    const { container, unmount } = render(
      createElement(CouponCard, {
        discount: '20% OFF',
        title: 'first order',
        code: 'SAVE20',
        expires: 'Jun 1',
        onCopy: () => {
          copies += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('20% OFF');
    expect(text).toContain('SAVE20');
    expect(text).toContain('Jun 1');
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(copies).toBe(1);
    unmount();
  });
});

describe('GiftCard', () => {
  test('shows brand, formatted balance and code', () => {
    const { container, unmount } = render(
      createElement(GiftCard, { brand: 'Acme', balance: 50, code: 'GIFT-1234' }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Acme');
    expect(text).toContain('$50.00');
    expect(text).toContain('GIFT-1234');
    unmount();
  });
});

describe('CreditCardVisual', () => {
  test('masks the number and exposes an accessible group label', () => {
    const { container, unmount } = render(
      createElement(CreditCardVisual, {
        brand: 'Visa',
        number: '4242424242424242',
        holder: 'Ada Lovelace',
        expiry: '05/28',
      }),
    );
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Card Visa ending 4242');
    const text = container.textContent ?? '';
    expect(text).toContain('•••• •••• •••• 4242');
    expect(text).toContain('Ada Lovelace');
    expect(text).toContain('05/28');
    unmount();
  });
});
