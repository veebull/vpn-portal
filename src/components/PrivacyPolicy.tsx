import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bestynet_privacy_ok';

export function PrivacyNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if user hasn't dismissed before
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className={`privacy-bar ${visible ? 'privacy-bar--in' : ''}`}
      role='banner'
    >
      <span className='privacy-bar-icon'>📊</span>
      <p className='privacy-bar-text'>
        Сайт использует Яндекс Метрику для анализа посещаемости. Личные данные
        не собираются.{' '}
        <a
          href='https://yandex.ru/legal/confidential/'
          target='_blank'
          rel='noreferrer'
          className='privacy-bar-link'
        >
          Подробнее
        </a>
      </p>
      <button
        className='privacy-bar-close'
        onClick={dismiss}
        aria-label='Закрыть'
      >
        ✕
      </button>
    </div>
  );
}
