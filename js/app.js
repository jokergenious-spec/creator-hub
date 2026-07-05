console.log("Creator Hub Started 🚀");

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card span');
  cards.forEach((card, index) => {
    const values = ['0', '0', '0', '0'];
    card.textContent = values[index];
  });
});
