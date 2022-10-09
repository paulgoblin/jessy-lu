const HOME_PATH = '/';

const appState = {
  lastFocusedElement: null,
};

function handleDetailFocus(e) {
  appState.lastFocusedElement = e.currentTarget;
}

function handleClientNav(e) {
  e.preventDefault();
  const decodedPath = decodeURI(e.currentTarget.pathname);
  const renderedPath = clientNav(decodedPath);
  manageDialogFocus(e, renderedPath);
}

// Returns the path of the page that was navigated to, if any.
function clientNav(nextPath) {
  const currentPath = decodeURI(location.pathname);
  if (nextPath === currentPath) return;
  const nextState = getPathState(nextPath);
  const renderedPath = renderPage(nextPath, nextState);
  navigate(renderedPath, nextState);
  return renderedPath;
}

function handlePopState(e) {
  const nextPath = decodeURI(location.pathname);
  const renderedPath = renderPage(nextPath, e.state);
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

function navigate(path, state) {
  window.history.replaceState(
    state,
    '',
    path,
  );
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

// Some crazy hack to get srcset working on mobile
// where only the thumbnail src is loaded at first.
// We need to manually load the fullsize image.
const hasLoadedDetail = {};
const loadingImages = {};
function detailImageLoad(event) {
  const src = event.target.src;
  // full size has already loaded
  if (hasLoadedDetail[src]) return;

  // Else, this event is for the thumbnail size onload.
  // Manually load the full size and then toggle img.src to render it
  const newImg = new Image;
  loadingImages[src] = newImg;
  newImg.onload = function() {
    // if the target is still around, set the src manually
    // to force render the correct resolution
    if (event.target) {
      hasLoadedDetail[src] = true;
      event.target.src = src;
    }
    console.log("Finished loading image", src);
    delete loadingImages[src];
  }
  newImg.src = src; // start loading the image
}

const removalObserver = new MutationObserver(function (e) {
  if (e[0].removedNodes) {
    // only expect 1 removed node for now. It's the overlay
    const overlay = e[0].removedNodes[0];
    if (!overlay) return; // event is not removal event
    for (let img of overlay.getElementsByTagName('img')) {
      console.log("Noe removal", img.src, loadingImages)
      if (loadingImages[img.src]) {
        console.log("Cancelling image", img.src);
        loadingImages[img.src].src = "";
        delete loadingImages[img.src];
      }
    }
  }
});

removalObserver.observe(document.getElementById('main-container'), { childList: true });
