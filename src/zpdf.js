/*import {
  q, qAll, on,
  importedPdfData, pdfPages, stgLyr, FIX_RES_WDH,
  globalPageWidth, globalScaleFactor,
  showAlertModal, fontDefault,
  udtPgWidths,
  renderPDF, renderPage, addPDF, clearAllPDF, updatePdfDataKeys, createButton,
  rmTrAllOutOfBounds, createTrDelGrp,
  importImage,
  embedImgToPdfPage, saveModifiedPDF,
  addBlankPDF,
  addText,
  drawSign,
  activeTextBox, sltTextNode, selectedTr, allText, drawstage, drawModal,
  addRectangle, showloadModal
} from './scripts.js';*/

import {
  q, on,
  showAlertModal,
  udtPgWidths,
  addPDF, clearAllPDF,
  importImage,
  saveModifiedPDF,
  addBlankPDF,
  addText,
  drawSign,
  addRectangle, showloadModal
} from './scripts.js';


document.addEventListener('DOMContentLoaded', () => {
  on(q("#save-btn"), "click", saveModifiedPDF);
  on(q("#clear-btn"), "click", clearAllPDF);
  on(q("#pdf-page-btn"), "click", () => { showloadModal(); q("#pdf-page-input").click(); });
  on(q("#pdf-page-input"), "change", () => { addPDF(); });
});


on(window, "resize", () => {
  udtPgWidths();
});


on(q("#image-btn"), "click", () => {
  if (q(".pdf-content").querySelector(".page-wrapper")) {
    showloadModal();
    q("#image-input").click();
  } else {
    showAlertModal("Please add PDF page before adding image.");
  }
});


on(q("#image-input"), "change", () => importImage());


on(q("#blank-page-btn"), "click", () => {
  showloadModal();
  addBlankPDF();
});


on(q("#text-btn"), "click", () => {
  if (q(".pdf-content").querySelector(".page-wrapper")) {
    showloadModal();
    addText();
  } else {
    showAlertModal("Please add PDF page before adding text.");
  }
});


on(q("#draw-btn"), "click", async () => {
  if (q(".pdf-content").querySelector(".page-wrapper")) {
    showloadModal();
    drawSign();
  } else {
    showAlertModal("Please add PDF page before drawing.");
  }
});


on(q("#rect-btn"), "click", async () => {
  if (q(".pdf-content").querySelector(".page-wrapper")) {
    showloadModal();
    addRectangle();
  } else {
    showAlertModal("Please add PDF page before adding rectangle.");
  }
});


