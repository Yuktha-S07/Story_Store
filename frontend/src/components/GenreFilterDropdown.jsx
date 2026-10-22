import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { getAllGenresTheme, getGenreTheme } from '../utils/genreTheme';

/**
 * Colour coded genre picker used on the discovery page.
 * Every genre gets its own swatch so the active filter is recognisable at a glance.
 */
export default function GenreFilterDropdown({ options = [], value = '', onChange, allLabel = 'All genres' }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const items = useMemo(
    () => [{ value: '', label: allLabel, isAll: true }, ...options],
    [options, allLabel],
  );

  const selectedIndex = items.findIndex((item) => item.value === value);
  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : items[0];
  const selectedTheme = selectedItem?.isAll ? getAllGenresTheme() : getGenreTheme(selectedItem?.label);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const optionNodes = listRef.current?.querySelectorAll('[role="option"]');
    optionNodes?.[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const selectOption = (option) => {
    onChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + items.length) % items.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = items[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by genre"
        onClick={() => {
          setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        className={`inline-flex min-w-[13rem] items-center justify-between gap-2.5 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedTheme.button}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${selectedTheme.dot}`} aria-hidden="true" />
          <span className="truncate">{selectedItem?.label || allLabel}</span>
        </span>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Genres"
          className="absolute left-0 top-full z-30 mt-2 max-h-72 w-full min-w-[13rem] overflow-y-auto rounded-2xl border border-[#e6ded6] bg-white p-1.5 text-left shadow-[0_18px_45px_rgba(79,53,46,0.16)] dark:border-[#4b3b5d] dark:bg-[#211a29]"
        >
          {items.map((item, index) => {
            const theme = item.isAll ? getAllGenresTheme() : getGenreTheme(item.label);
            const isSelected = item.value === value;

            return (
              <button
                key={item.value || 'all'}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                  isSelected
                    ? theme.button
                    : `border-transparent text-[#4b4450] hover:bg-[#fdf3ee] dark:text-[#e6dced]! dark:hover:bg-[#332740] ${
                        index === activeIndex ? 'bg-[#fdf3ee] dark:bg-[#332740]' : ''
                      }`
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${theme.dot}`} aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
                {isSelected && <FiCheck className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
