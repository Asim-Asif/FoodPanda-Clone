document.querySelector(".close-logo")?.addEventListener("click", () => {
  const cont1 = document.querySelector(".cont-1");
  const cont2 = document.querySelector(".cont-2");
  cont1.style.display = "none";
  cont2.style.top = "0";
});

new Typed("#autowriting", {
  strings: ["discounts on your first order!", "free delivery on your first order!"],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true
});
