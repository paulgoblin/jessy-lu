const HOME_PATH = '/';
const MAX_HISTORY = 1;

const appState = {
  lastFocusedElement: null,
  hasVisitedHome: window.location.pathname === HOME_PATH,
};

function handleDetailFocus(e) {
  appState.lastFocusedElement = e.currentTarget;
}

function handleClientNav(e) {
  e.preventDefault();
  const renderedPath = clientNav(e.currentTarget.pathname);
  manageDialogFocus(e, renderedPath);
}

// Returns the path of the page that was navigated to, if any.
function clientNav(nextPath) {
  if (nextPath === location.pathname) return;
  const nextState = getPathState(nextPath);
  const renderedPath = renderPage(nextPath, nextState);
  navigate(renderedPath, nextState);
  return renderedPath;
}

function handlePopState(e) {
  const renderedPath = renderPage(location.pathname, e.state);
  manageDialogFocus(null, renderedPath);
}
window.onpopstate = handlePopState;

function manageDialogFocus(e, renderedPath) {
  if (!renderedPath) return;
  if (renderedPath === HOME_PATH) {
    // Set focus on last detail element
    if (appState.lastFocusedElement) {
      appState.lastFocusedElement.focus({ preventScroll: true });
    }
  } else {
    const closeButton = document.getElementById('close');
    // set focus on close button in dialog
    if (closeButton) {
      closeButton.focus({ preventScroll: true });
    }
  }
}

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

function navigate(nextPath, nextState) {
  const currentPath = window.location.pathname;
  const next = [nextState, '', nextPath];

  // home -> detail
  if (currentPath === HOME_PATH) {
    window.history.pushState(...next);
  // detail -> home
  } else if (nextPath === HOME_PATH) {
    if (appState.hasVisitedHome) {
      // onpopstate will automatically update appState.historyStack
      window.history.back();
    } else {
      // the app was started on a detail page.
      window.history.replaceState(...next);
      appState.hasVisitedHome = true;
    }
  // detail -> detail
  } else {
    // navigating from detail -> detail
    window.history.replaceState(...next);
  }
}

// Renders a page for a path, if that page exists. Otherwise renders the home page
// Returns the path of the rendered page.
function renderPage(path, state) {
  const template = getPathTemplate(path);
  let renderedPath;
  clearDetail();
  updatePageTitle(state);
  if (template) {
    renderDetail(template);
    renderedPath = path;
  } else {
    renderedPath = HOME_PATH;
  }
  return renderedPath;
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

document.onkeydown = function (evt) {
  if (['Escape', 'Esc'].includes(evt.key)) {
    clientNav(HOME_PATH);
  }
};
