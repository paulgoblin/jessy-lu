function clientNav(e) {
  e.preventDefault();
  const nextPath = e.currentTarget.pathname;
  const nextTemplate = getPathTemplate(nextPath);
  const nextState = getPathState(nextPath);
  renderPage(nextTemplate, nextState);
  navigate(nextPath, nextState);
}

function handlePopState(e) {
  const nextTemplate = getPathTemplate(location.pathname);
  renderPage(nextTemplate, e.state);
}
window.onpopstate = handlePopState;

function getPathState(path) {
  const pieceTemplate = getPathTemplate(path);
  // state must be serializable/clonable
  return pieceTemplate && pieceTemplate.dataset
    ? ({ ...pieceTemplate.dataset })
    : {};
}

function getPathTemplate(path) {
  const pieceName = path.replace('/', '');
  return document.getElementById(pieceName);
}

function navigate(path, state) {
  window.history.pushState(
    state,
    '',
    path,
  );
}

function renderPage(template, state) {
  clearDetail();
  if (template) {
    renderDetail(template);
  }
  updatePageTitle(state);
}

function clearDetail() {
  const detail = document.getElementById('detail');
  if (detail) detail.remove();
  document.getElementById('main-content').classList.remove('detail-mode');
}

function renderDetail(template) {
  const clone = template.content.cloneNode(true);
  document.getElementById('main-content').classList.add('detail-mode');
  document.getElementById('main-container').appendChild(clone);
}

function updatePageTitle(state) {
  const delim = ' | ';
  const baseTitle = document.title.split(delim)[0];
  document.title = (state && state.pieceTitle)
    ? [baseTitle, state.pieceTitle].join(delim) : baseTitle;
}
