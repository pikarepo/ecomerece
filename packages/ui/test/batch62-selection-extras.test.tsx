/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  ImageSelectGrid,
  LikertGroup,
  NpsScale,
  SwatchSelect,
  ThumbsRating,
  TileSelect,
} from '../components/form/SelectionExtras';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 62 selection extras', () => {
  it('TileSelect marks the selection and emits an id', () => {
    const picked: string[] = [];
    const { container, unmount } = render(
      <TileSelect
        value="a"
        onValueChange={(id) => picked.push(id)}
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
      />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true');
    act(() => (buttons[1] as HTMLButtonElement).click());
    expect(picked).toEqual(['b']);
    unmount();
  });

  it('ImageSelectGrid toggles multiple selections', () => {
    const seen: string[][] = [];
    const items = [
      { id: 'a', src: '/a.png', label: 'A' },
      { id: 'b', src: '/b.png', label: 'B' },
    ];
    const { container, unmount } = render(
      <ImageSelectGrid items={items} selected={['a']} onSelectedChange={(s) => seen.push(s)} />,
    );
    act(() => (container.querySelector('button[aria-label="B"]') as HTMLButtonElement).click());
    expect(seen[0]).toEqual(['a', 'b']);
    unmount();
  });

  it('SwatchSelect supports single and multiple modes', () => {
    const single: string[] = [];
    const first = render(
      <SwatchSelect colors={['#f00', '#0f0']} value="#f00" onValueChange={(v) => single.push(v)} />,
    );
    act(() =>
      (first.container.querySelector('button[aria-label="#0f0"]') as HTMLButtonElement).click(),
    );
    expect(single).toEqual(['#0f0']);
    first.unmount();

    const multi: string[][] = [];
    const second = render(
      <SwatchSelect
        multiple
        colors={['#f00', '#0f0', '#00f']}
        values={['#f00']}
        onValuesChange={(v) => multi.push(v)}
      />,
    );
    act(() =>
      (second.container.querySelector('button[aria-label="#00f"]') as HTMLButtonElement).click(),
    );
    expect(multi[0]).toEqual(['#f00', '#00f']);
    second.unmount();
  });

  it('NpsScale emits the picked score 0–10', () => {
    const seen: number[] = [];
    const { container, unmount } = render(
      <NpsScale value={null} onValueChange={(v) => seen.push(v)} />,
    );
    expect(container.querySelectorAll('button').length).toBe(11);
    act(() => (container.querySelector('button[aria-label="9"]') as HTMLButtonElement).click());
    expect(seen).toEqual([9]);
    unmount();
  });

  it('LikertGroup reports the statement id and value', () => {
    const seen: Array<[string, number]> = [];
    const { container, unmount } = render(
      <LikertGroup
        items={[
          { id: 'a', statement: 'Statement A' },
          { id: 'b', statement: 'Statement B' },
        ]}
        values={{}}
        onValueChange={(id, value) => seen.push([id, value])}
      />,
    );
    const agreeButtons = container.querySelectorAll('button[aria-label="Agree"]');
    act(() => (agreeButtons[1] as HTMLButtonElement).click());
    expect(seen).toEqual([['b', 4]]);
    unmount();
  });

  it('ThumbsRating emits up and down', () => {
    const seen: string[] = [];
    const { container, unmount } = render(<ThumbsRating onValueChange={(v) => seen.push(v)} />);
    const buttons = container.querySelectorAll('button');
    act(() => (buttons[0] as HTMLButtonElement).click());
    act(() => (buttons[1] as HTMLButtonElement).click());
    expect(seen).toEqual(['up', 'down']);
    unmount();
  });
});
