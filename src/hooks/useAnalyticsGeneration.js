import { useState } from 'react';

export function useAnalyticsGeneration() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (filteredNews, filterLabel) => {
    if (!filteredNews?.length) {
      setError('Немає новин для аналізу. Завантажте дані або оберіть інші фільтри.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const items = filteredNews.slice(0, 30);
    const newsText = items
      .map((n, i) => {
        const date = n.date ? n.date.toLocaleDateString('uk-UA') : '';
        return `${i + 1}. [${date}] ${n.title}\n   ${n.summary || ''}`;
      })
      .join('\n\n');

    const prompt = `МАКСИМУМ 40 СЛІВ. КОРОТЕНЬКІ РЕЧЕННЯ. БЕЗ ВОДИ.

**Ризики:** 1 коротке речення
**Дія:** 1 коротке речення

Новини:
${newsText}`;

    try {
      const response = await fetch('https://news-digest-eosin.vercel.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Помилка сервера: HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data.text);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  return { generate, result, loading, error, clear };
}
