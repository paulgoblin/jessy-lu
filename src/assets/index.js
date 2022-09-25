function clientNav(e) {
  e.preventDefault();
  console.log(e);
  console.log(e.currentTarget);
  window.history.pushState(
    {} /* state */,
    document.title,
    e.currentTarget.href,
  );
}
