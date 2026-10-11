document.addEventListener('DOMContentLoaded', function () {
  const search = document.getElementById('reviewSearch');
  const category = document.getElementById('categoryFilter');
  const cards = Array.from(document.querySelectorAll('#reviewCards .card'));
  const empty = document.getElementById('noResults');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  function filterCards() {
    const query = (search?.value || '').trim().toLowerCase();
    const selectedCategory = category?.value || 'all';
    let visible = 0;
    cards.forEach(card => {
      const title = (card.dataset.title || card.textContent).toLowerCase();
      const cardCategory = (card.dataset.category || '').toLowerCase();
      const matches = title.includes(query) && (selectedCategory === 'all' || cardCategory === selectedCategory);
      card.hidden = !matches;
      if (matches) visible++;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }
  search?.addEventListener('input', filterCards);
  category?.addEventListener('change', filterCards);
});
