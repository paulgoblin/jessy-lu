(function () {
  function clientNav(e) {
    e.preventDefault();

    const pieceName = e.currentTarget.pathname.replace('/', '');
    const pieceTemplate = document.getElementById(pieceName);
    clearDetail();
    if (!pieceTemplate) {
      navHome();
      return;
    }
    navToDetail(pieceTemplate, pieceName);
  }

  function clearDetail() {
    const detail = document.getElementById('detail');
    if (detail) detail.remove();
  }

  function navToDetail(template, path) {
    const clone = template.content.cloneNode(true);
    document.getElementById('main-container').appendChild(clone);
    navigate(path, template.dataset.title);
  }

  function navHome() {
    const newTitle = document.title.split(' | ')[0];
    navigate('/', newTitle);
  }

  function navigate(path, title) {
    window.history.pushState(
      { title },
      '',
      path,
    );
  }
}());
