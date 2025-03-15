///////////////////////////////////////
/*  "devDependencies": {
    "@babel/core": "^7.24.7",
    "javascript-obfuscator": "^4.1.0",
    "node-canvas": "https://github.com/Automattic/node-canvas/releases/download/v2.11.2/canvas-v2.11.2-node-v120-win32-unknown-x64.tar.gz",
    "shelljs": "^0.8.5",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "vite-plugin-babel": "^1.2.0",
    "vite-plugin-pwa": "^0.20.0",
    "workbox-build": "^7.1.1",
    "workbox-window": "^7.1.0"
  },
  "dependencies": {
    "@pdfme/pdf-lib": "^1.18.3",
    "@popperjs/core": "^2.11.8",
    "bootstrap": "^5.3.3",
    "fontfaceobserver": "^2.3.0",
    "fontkit": "^2.0.2",
    "konva": "^9.3.11",
    "pdfjs-dist": "3.4.120"
  }*/
/////////////////////////////////////

//import "bootstrap-icons/font/bootstrap-icons.css";
import "/src/bootstrap-icons/bootstrap-icons.css";
//import Afont from "/src/ArialUnicode.ttf";
import Afont from "/src/GoNotoKurrent-Regular.ttf";

export const cMapFolder = "./cmaps/";

import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.css"

import blankPdf from './blank.pdf';
export { blankPdf };

import Konva from "konva";
import * as pdfjsLib from "pdfjs-dist";
import * as PDFLib from "@pdfme/pdf-lib";
import * as fontkit from "fontkit";
import FontFaceObserver from "fontfaceobserver";
import "pdfjs-dist/build/pdf.worker.entry";

export const q = (selector) => document.querySelector(selector);
export const qAll = (selector) => document.querySelectorAll(selector);
export const on = (element, event, handler) => element.addEventListener(event, handler);

export const importedPdfData = {};
export const pdfPages = new Map();
export const stgLyr = new Map();
export const FIX_RES_WDH = 1600;

export const globalPageWidth = () => q("#pdf-row").clientWidth * 0.67;
export const globalScaleFactor = () => globalPageWidth() / FIX_RES_WDH;

export function showAlertModal(message) {
  const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
  const alertModalBody = document.getElementById('alertModalBody');
  alertModalBody.innerHTML = message;
  alertModal.show();
}

export function showSaveModal(message) {
  const saveModal = new bootstrap.Modal(document.getElementById('saveModal'));
  const saveModalBody = document.getElementById('saveModalBody');
  saveModalBody.innerHTML = message;
  saveModal.show();
}

export function showloadModal() {
  const loadModal = new bootstrap.Modal(document.getElementById("loadModal"));
  loadModal.show();
  setTimeout(() => {
    loadModal.hide();
  }, 500);
}



export const fontDefault = new FontFaceObserver('Default Font');
export const font = new FontFace('Default Font', `url(${Afont})`, {
  style: 'normal',
});

document.fonts.add(font);
font.load();





//**//
//Resize//

export function udtPgWidths() {
  const pdfContent = q(".pdf-content");
  const pageWrappers = Array.from(pdfContent.querySelectorAll(".page-wrapper"));

  stgLyr.forEach((stageAndLayer, pageWrapper) => {
    const page = pageWrapper.querySelector("canvas");
    const ratio = page.height / page.width;
    const updateSize = (element) => {
      element.style.width = `${globalPageWidth()}px`;
      element.style.height = `${globalPageWidth() * ratio}px`;
    };
    updateSize(page);
    updateSize(pageWrapper);

    const imgLayer = pageWrapper.querySelector(".image-layer");
    if (imgLayer) {

      updateSize(imgLayer);

      const konvajscontent = imgLayer.querySelector(".konvajs-content");
      updateSize(konvajscontent);

      const stage = stageAndLayer.stage;
      const layer = stageAndLayer.layer;

      stage.width(globalPageWidth());
      stage.height(globalPageWidth() * ratio);

      if (drawTimeout !== null) {
        clearTimeout(drawTimeout);
      }

      drawTimeout = setTimeout(() => {
        stage.draw();
        layer.draw();
        layer.batchDraw();
        drawTimeout = null;
      }, 20);

      stage.scale({ x: globalScaleFactor(), y: globalScaleFactor() });

      const transformers = layer.find('Transformer');

      stage.on('click tap', function (e) {
        //selectTrBox(e, transformers, stage, layer);
      });

      transformers.forEach((tr) => {
        if (tr) {
          const deleteButton = tr.findOne('.delete-button');
          if (deleteButton) {
            const trDelGrp = deleteButton.parent;
            trDelGrp.position(tr.findOne('.top-right').position());

            if (q("#pdf-row").clientWidth <= 400) {
              tr.anchorSize(5);
              trDelGrp.scale({ x: 0.5, y: 0.5 });
              tr.rotateAnchorOffset(20);

            } else {
              tr.anchorSize(10);
              trDelGrp.scale({ x: 1, y: 1 });
              tr.rotateAnchorOffset(30);
            }

          }
          tr.forceUpdate();
        }

      });

    }

  });
}

//Resize//
//**//
//Transfbox//

export function rmTrAllOutOfBounds(tr, node, stage, layer, destroy) {
  const nodeRect = node.getClientRect();
  const stageWidth = stage.width();
  const stageHeight = stage.height();

  const allOutOfBounds =
    nodeRect.x + nodeRect.width < 0 ||
    nodeRect.y + nodeRect.height < 0 ||
    nodeRect.x > stageWidth ||
    nodeRect.y > stageHeight;

  if (allOutOfBounds) {

    if (destroy == true) {
      tr.detach();
      node.destroy();
      layer.draw();
      stage.draw();
    }
    return true;
  } else {
    return false;
  }
}

export function createTrDelGrp(tr, node, stage, layer) {
  const circleX = new Konva.Circle({
    radius: 10,
    fill: 'red',
    name: 'delete-button',
    listening: true,
    hoverCursor: 'pointer',
  });

  const crossLine1 = new Konva.Line({
    points: [-4, -4, 4, 4],
    stroke: 'white',
    strokeWidth: 1.5,
  });

  const crossLine2 = new Konva.Line({
    points: [-4, 4, 4, -4],
    stroke: 'white',
    strokeWidth: 1.5,
  });

  const trDelGrp = new Konva.Group({
    x: 0,
    y: 0,
  });

  trDelGrp.add(circleX);
  trDelGrp.add(crossLine1);
  trDelGrp.add(crossLine2);

  trDelGrp.on('mouseover', () => {
    stage.container().style.cursor = 'pointer';
  });

  trDelGrp.on('mouseout', () => {
    stage.container().style.cursor = 'default';
  });

  const handleDelete = () => {
    node.destroy();
    tr.destroy();
    layer.draw();
    stage.container().style.cursor = 'default';
  };

  trDelGrp.on('click', handleDelete);
  trDelGrp.on('touchstart', handleDelete);
  trDelGrp.position(tr.findOne('.top-right').position());

  node.on('transform', () => trUdtDelPos(tr, trDelGrp));
  node.on('dragend', () => {
    trUdtDelPos(tr, trDelGrp);
    rmTrAllOutOfBounds(tr, node, stage, layer, true);
  });
  node.on('dragmove', () => trUdtDelPos(tr, trDelGrp));
  node.on('transformend', () => {
    trUdtDelPos(tr, trDelGrp);
    rmTrAllOutOfBounds(tr, node, stage, layer, true);
  });
  on(window, "resize", () => {
    rmTrAllOutOfBounds(tr, node, stage, layer, true);
  });

  function trUdtDelPos(tr, trDelGrp) {
    trDelGrp.position(tr.findOne('.top-right').position());
  }

  return trDelGrp;
}

//Transfbox//
//**//
//PDFJS Page//

export async function renderPDF(pdf, pdfContent, pdfFileName, append = false) {
  if (!pdf) {
    return;
  }

  let startPgNum = 1;

  if (append) {
    const existingPages = Array.from(pdfContent.querySelectorAll(".page-wrapper"));
    startPgNum = existingPages.length + 1;
  }

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const pdfDataKey = `${pdfFileName}-${pageNum}`;
    const page = await pdf.getPage(pageNum);
    await renderPage(page, startPgNum + pageNum - 1, pdfContent, pdfDataKey, append);
  }
}


export async function renderPage(page, pageNum, pdfContent, pdfDataKey, append = false) {
  const canvas = document.createElement("canvas");
  const existingWrapper = pdfContent.querySelector(`[data-page-number="${pageNum}"]`);
  const wrapper = existingWrapper || document.createElement("div");
  wrapper.setAttribute("data-page-number", pageNum);
  wrapper.setAttribute("data-pdf-data-key", pdfDataKey);
  pdfPages.set(pdfDataKey, page);
  canvas.style.display = "block";
  wrapper.classList.add("page-wrapper");

  const deleteBtn = createButton("x-circle-fill", "page-delete", () => {
    wrapper.remove();
    updatePdfDataKeys();
  });

  const upBtn = createButton("arrow-up-circle-fill", "page-up", () => {
    const previousWrapper = wrapper.previousElementSibling;
    if (previousWrapper) {
      wrapper.parentNode.insertBefore(wrapper, previousWrapper);
      updatePdfDataKeys();
    }
  });

  const downBtn = createButton("arrow-down-circle-fill", "page-down", () => {
    const nextWrapper = wrapper.nextElementSibling;
    if (nextWrapper) {
      wrapper.parentNode.insertBefore(nextWrapper, wrapper);
      updatePdfDataKeys();
    }
  });

  wrapper.appendChild(deleteBtn);
  wrapper.appendChild(upBtn);
  wrapper.appendChild(downBtn);

  const scale = (FIX_RES_WDH / page.getViewport({ scale: 1 }).width);
  const scaledViewport = page.getViewport({ scale });
  const renderContext = { canvasContext: canvas.getContext("2d"), viewport: scaledViewport };
  canvas.height = scaledViewport.height;
  canvas.width = scaledViewport.width;
  canvas.style.transformOrigin = "0 0";

  if (!existingWrapper) {
    wrapper.append(canvas, deleteBtn, upBtn, downBtn);
    pdfContent.appendChild(wrapper);
  }
  await page.render(renderContext).promise;

  let stage;
  let layer;

  let imgLayer = wrapper.querySelector(".image-layer");
  imgLayer = document.createElement("div");
  imgLayer.classList.add("image-layer");
  imgLayer.style.position = "absolute";
  imgLayer.style.top = "0";
  imgLayer.style.left = "0";
  const pageHeight = (globalPageWidth() / canvas.width) * canvas.height;

  stage = new Konva.Stage({
    container: imgLayer,
    width: globalPageWidth(),
    height: pageHeight,
  });

  imgLayer.style.width = `${globalPageWidth()}px`;
  imgLayer.style.height = `${pageHeight * globalScaleFactor()}px`;

  layer = new Konva.Layer();
  stage.add(layer);

  wrapper.appendChild(imgLayer);

  stage.scale({ x: globalScaleFactor(), y: globalScaleFactor() });

  const borderRect = new Konva.Rect({
    x: -0.8,
    y: 0,
    width: FIX_RES_WDH,
    height: ((FIX_RES_WDH / canvas.width) * canvas.height) - 1,
    stroke: '#2196f3',
    strokeWidth: 15,
    visible: false,
    listening: false,
  });

  layer.add(borderRect);

  stage.draw();
  layer.draw();
  stgLyr.set(wrapper, { stage, layer });
  udtPgWidths();

  function togglePageSelection(wrapper, isSelected) {
    const borderRect = stgLyr.get(wrapper).stage.findOne('Rect');
    borderRect.visible(isSelected);
    stgLyr.get(wrapper).stage.draw();
    wrapper.setAttribute('data-selected', isSelected.toString());
  }

  function AutoSelectPg() {
    const pageWrappers = Array.from(pdfContent.querySelectorAll(".page-wrapper"));
    const visiblePage = pageWrappers.find((page) => {
      const rect = page.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    });

    const pageToSelect = visiblePage || pageWrappers[0];

    pageWrappers.forEach((page) => {
      if (page !== pageToSelect) {
        togglePageSelection(page, false);
      }
    });

    if (pageToSelect) {
      togglePageSelection(pageToSelect, true);
    }
  }

  AutoSelectPg();

  wrapper.addEventListener('click', (event) => {
    const pageWrappers = Array.from(pdfContent.querySelectorAll(".page-wrapper"));
    const isSelected = wrapper.getAttribute('data-selected') === 'true';

    if (!isSelected) {
      pageWrappers.forEach((page) => {
        if (page !== wrapper) {
          togglePageSelection(page, false);
        }
      });
      togglePageSelection(wrapper, true);
    }
  });
  udtPgWidths();
}


export async function addPDF() {
  const file = q("#pdf-page-input").files[0];
  if (!file) return;
  const fileReader = new FileReader();
  fileReader.onload = async (event) => {
    const loadModal = new bootstrap.Modal(document.getElementById("loadModal"));
    loadModal.show();
    const pdfArrayBuffer = event.target.result;
    const pdfContent = q(".pdf-content");
    let pdfFileName = file.name.replace(/-/g, '_');
    const loadingTask = pdfjsLib.getDocument({
      data: pdfArrayBuffer,
      cMapUrl: cMapFolder,
      cMapPacked: true,
    });
    const pdf = await loadingTask.promise;
    importedPdfData[pdfFileName] = pdfArrayBuffer;

    await renderPDF(pdf, pdfContent, pdfFileName, true);

    setTimeout(() => {
      loadModal.hide();
    }, 1000);
  };
  fileReader.readAsArrayBuffer(file);
  q("#pdf-page-input").value = "";
}


export function clearAllPDF() {
  const pdfContent = q(".pdf-content");
  if (pdfContent.innerHTML == "") {
    showAlertModal("Already clear all PDF pages!");
  } else {
    const clearModal = new bootstrap.Modal(document.getElementById("clearModal"));    
    clearModal.show();
    const doneButton = document.getElementById("clearDoneButton");
    doneButton.addEventListener("click", () => {
      pdfContent.innerHTML = "";
      clearModal.hide();
    })  
  }
}


export function updatePdfDataKeys() {
  const pages = qAll(".page-wrapper");
  pages.forEach((page, index) => {
    const oldPdfDataKey = page.getAttribute("data-pdf-data-key");
    const [pdfFileName, oldPgNum] = oldPdfDataKey.split("-");

    const newPgNum = index + 1;
    const pdfDataKey = `${pdfFileName}-${oldPgNum}`;
    page.setAttribute("data-pdf-data-key", pdfDataKey);
    page.setAttribute("data-page-number", newPgNum);
  });
}


export function createButton(iconName, className, onClick) {
  const btn = document.createElement("button");
  btn.classList.add(className);
  btn.innerHTML = `<i class="bi-${iconName}"></i>`;
  on(btn, "click", onClick);
  return btn;
}

//PDFJS Page//
//**//

//Add Image//

export async function importImage(imageUrldraw) {
  let imageUrl;
  if (!imageUrldraw) {
    const imageFile = q("#image-input").files[0];
    if (!imageFile) return;

    const supportedImageTypes = ['image/png', 'image/jpeg'];
    if (!supportedImageTypes.includes(imageFile.type)) {
      showAlertModal('Unsupported image type.<br>Please select a PNG or JPEG image.');
      q("#image-input").value = "";
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      imageUrl = event.target.result;
      processImage(imageUrl);
    };
    fileReader.readAsDataURL(imageFile);
    q("#image-input").value = "";
  } else {
    async function urlToDataUrl(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    imageUrl = await urlToDataUrl(imageUrldraw);
    processImage(imageUrl);
  }
  function processImage(imageUrl) {
    udtPgWidths();
    const pdfContent = q(".pdf-content");
    const pageWrappers = Array.from(pdfContent.querySelectorAll(".page-wrapper"));

    const selectedPgWrpr = pageWrappers.find((page) => {
      return page.getAttribute('data-selected') === 'true';
    });

    if (!selectedPgWrpr) return;

    let stage, layer;

    const getStageAndLayer = stgLyr.get(selectedPgWrpr);
    stage = getStageAndLayer.stage;
    layer = getStageAndLayer.layer;

    const imageObj = new Image();

    imageObj.src = imageUrl;
    imageObj.onload = () => {
      stage.batchDraw();

      const img = new Konva.Image({
        x: FIX_RES_WDH * 0.25,
        y: FIX_RES_WDH / imageObj.width * imageObj.height * 0.25,
        image: imageObj,
        width: FIX_RES_WDH * 0.5,
        height: FIX_RES_WDH / imageObj.width * imageObj.height * 0.5,
        draggable: true,
        name: "Image",
        originalImageUrl: imageUrl,
      });

      layer.add(img);

      const isMobile = () => window.innerWidth <= 400;

      const tr = new Konva.Transformer({
        keepRatio: true,
        rotationSnaps: [-135, -90, -45, 0, 45, 90, 135, -180],
        rotationSnapTolerance : 1.2,
        minScaleX: 0.01,
        minScaleY: 0.01,
        flipEnabled: false,
        anchorSize: isMobile() ? 5 : 10,
        rotateAnchorOffset: isMobile() ? 20 : 30,
      });
      layer.add(tr);
      tr.nodes([img]);
      layer.draw();

      const trDelGrp = createTrDelGrp(tr, img, stage, layer);
      tr.add(trDelGrp);
      trDelGrp.scale(isMobile() ? { x: 0.5, y: 0.5 } : { x: 1, y: 1 });



      img.on("dblclick dbltap", () => {
        const imageModal = new bootstrap.Modal(document.getElementById("imageModal"));
        imageModal.show();

        const inputOpacity = document.getElementById("opacityPicker");

        inputOpacity.value = img.opacity() * 100; // Set the value of the opacity picker to the current opacity of the image

        const doneButton = document.getElementById("imgdoneButton");
        doneButton.addEventListener("click", () => {
          img.opacity(inputOpacity.value / 100); // Set the opacity of the image to the value of the opacity picker
          img.show();
          tr.show();
          tr.forceUpdate();

          lastTransparency = inputOpacity.value; // Store the last transparency value

          if (drawTimeout !== null) {
            clearTimeout(drawTimeout);
          }
          drawTimeout = setTimeout(() => {
            layer.batchDraw();
            drawTimeout = null;
          }, 100);

          imageModal.hide();
          udtPgWidths();
        });

        imageModal._element.addEventListener("hidden.bs.modal", () => {

          if (drawTimeout !== null) {
            clearTimeout(drawTimeout);
          }
          drawTimeout = setTimeout(() => {
            layer.batchDraw();
            drawTimeout = null;
          }, 100);

        }, { once: true });
      });
    };
  };
  udtPgWidths();
}

//Add Image//
//**//
//Saving//

export async function embedImgToPdfPage(pdfDoc) {
  const pages = Array.from(qAll(".page-wrapper"));

  for (const page of pages) {
    const pageNum = parseInt(page.getAttribute("data-page-number"), 10);
    const pdfPage = pdfDoc.getPages()[pageNum - 1];
    const imgLayer = page.querySelector(".image-layer");

    const pdfDataKey = page.getAttribute("data-pdf-data-key");
    const pdfInPts = pdfPages.get(pdfDataKey);
    const viewport = pdfInPts.getViewport({ scale: 1 });
    const widthInPts = viewport.width;
    const heightInPts = viewport.height;
    const ratioToPts = widthInPts / FIX_RES_WDH;

    if (imgLayer) {
      const stageAndLayer = stgLyr.get(page);
      const stage = stageAndLayer.stage;
      const layer = stageAndLayer.layer;

      const nodes = layer.getChildren().sort((a, b) => a.getZIndex() - b.getZIndex());

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node.attrs.name === 'Image') {
          const img = node;
          const imgDataUrl = img.attrs.originalImageUrl;
          const imgUint8Array = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
          let imgObj;
          const mimeType = imgDataUrl.split(';')[0].split(':')[1];
          if (mimeType === 'image/png') {
            imgObj = await pdfDoc.embedPng(imgUint8Array);
          } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
            imgObj = await pdfDoc.embedJpg(imgUint8Array);
          } else { }

          const imgWidth = img.width() * img.scaleX() * ratioToPts;
          const imgHeight = img.height() * img.scaleY() * ratioToPts;

          const imgR = img.rotation();

          const radians = (Math.PI / 180) * imgR;
          const imgBottomLeftXInKonva = img.x() - img.height() * img.scaleY() * Math.sin(radians);
          const imgBottomLeftYInKonva = img.y() + img.height() * img.scaleY() * Math.cos(radians);
          const newImgX = imgBottomLeftXInKonva * ratioToPts;
          const newImgY = (pdfPage.getHeight() - imgBottomLeftYInKonva * ratioToPts);
          const imgOpacity = img.opacity();

          pdfPage.drawImage(imgObj, {
            x: newImgX,
            y: newImgY,
            width: imgWidth,
            height: imgHeight,
            rotate: PDFLib.degrees(imgR * (-1)),
            opacity: imgOpacity,
          });
        }

        if (node.attrs.name === 'Text') {
          const textNode = node;
          const text = textNode.text();
          const fontSize = textNode.fontSize();
          const fontColor = textNode.fill();
          const opacity = textNode.opacity();
          const rotation = textNode.rotation();

          const x = textNode.x() * ratioToPts;
          const y = (pdfPage.getHeight() - textNode.y() * ratioToPts);

          const { red, green, blue } = hexToRgb(fontColor);

          const xOffset = (fontSize * 0.0012 + 4.2) * ratioToPts;
          const yOffset = (fontSize * 0.7777 + 3.925) * ratioToPts;

          const rotationRadians = (Math.PI / 180) * rotation;
          const rotatedXOffset = xOffset * Math.cos(rotationRadians) - yOffset * Math.sin(rotationRadians);
          const rotatedYOffset = xOffset * Math.sin(rotationRadians) + yOffset * Math.cos(rotationRadians);

          const fontUrl = Afont;
          const response = await fetch(fontUrl);
          const fontBytes = await response.arrayBuffer();
          const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

          pdfPage.drawText(text, {
            x: x + rotatedXOffset,
            y: y - rotatedYOffset,
            size: fontSize * ratioToPts,
            color: PDFLib.rgb(red, green, blue),
            opacity: opacity,
            rotate: PDFLib.degrees(-rotation),
            lineHeight: textNode.lineHeight() * fontSize * ratioToPts,
            font: customFont,
          });
        }

        if (node.attrs.name === 'Rect') {
          const rect = node;
          const rectWidth = rect.width() * rect.scaleX() * ratioToPts;
          const rectHeight = rect.height() * rect.scaleY() * ratioToPts;

          const rectR = rect.rotation();
          const radians = (Math.PI / 180) * rectR;
          const rectBottomLeftXInKonva = rect.x() - rect.height() * rect.scaleY() * Math.sin(radians);
          const rectBottomLeftYInKonva = rect.y() + rect.height() * rect.scaleY() * Math.cos(radians);
          const newRectX = rectBottomLeftXInKonva * ratioToPts;
          const newRectY = (pdfPage.getHeight() - rectBottomLeftYInKonva * ratioToPts);

          const rectOpacity = rect.opacity();
          const rectColor = rect.fill();

          const { red, green, blue } = hexToRgb(rectColor);

          pdfPage.drawRectangle({
            x: newRectX,
            y: newRectY,
            width: rectWidth,
            height: rectHeight,
            rotate: PDFLib.degrees(rectR * (-1)),
            color: PDFLib.rgb(red, green, blue),
            opacity: rectOpacity,
          });
        }
        function hexToRgb(hex) {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? {
              red: parseInt(result[1], 16) / 255,
              green: parseInt(result[2], 16) / 255,
              blue: parseInt(result[3], 16) / 255,
            }
            : null;
        }
      }
    }
  }
}

export async function saveModifiedPDF() {

  const pages = Array.from(qAll(".page-wrapper"));
  if (pages.length === 0) {
    showAlertModal("No PDF page for saving !");
    return;
  }
  const loadModal = new bootstrap.Modal(document.getElementById("loadModal"));
  loadModal.show();
  const editedPdf = await PDFLib.PDFDocument.create();


  for (const page of pages) {
    const pdfDataKey = page.dataset.pdfDataKey;
    const pgNum = parseInt(page.getAttribute("data-page-number"), 10);
    const pdfFileName = pdfDataKey.split("-")[0];
    const pdfFilePgNum = parseInt(pdfDataKey.split("-")[1], 10);
    //console.log("pdfDataKey:", pdfDataKey, "pgNum:", pgNum, "pdfFilePgNum:", pdfFilePgNum);
    if (importedPdfData[pdfFileName]) {
      const pdfData = importedPdfData[pdfFileName];
      //console.log("pdfData:", pdfData);
      const srcPdfDoc = await PDFLib.PDFDocument.load(pdfData);
      //console.log("srcPdfDoc:", srcPdfDoc);

      const [copiedPage] = await editedPdf.copyPages(srcPdfDoc, [pdfFilePgNum - 1]);
      //console.log("copiedPage:", copiedPage);
      editedPdf.addPage(copiedPage);
    }
  }

  await editedPdf.registerFontkit(fontkit);
  await embedImgToPdfPage(editedPdf);
  await editedPdf.setProducer('zPDF by zenqlo.com');
  await editedPdf.setCreator('zPDF by zenqlo.com');

  const editedPdfData = await editedPdf.save();
/*
  const editedPdfBlob = new Blob([editedPdfData], { type: "application/pdf", blob: true  });
  //const editedPdfUrl = URL.createObjectURL(editedPdfBlob);
  const editedPdfUrl = window.URL.createObjectURL(editedPdfBlob);
  const link = document.createElement("a");
  link.href = editedPdfUrl;
  link.download = "zPDF-edited.pdf";
  link.click();
*/

const editedPdfBlob = new Blob([editedPdfData], { type: "application/pdf" });
const xhr = new XMLHttpRequest();
xhr.open('GET', URL.createObjectURL(editedPdfBlob), true);
xhr.responseType = 'blob';
xhr.onload = function() {
  if (xhr.status === 200) {
    const blob = xhr.response;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zPDF-edited.pdf";
    link.click();
  }
};
xhr.send();



  setTimeout(() => {
    loadModal.hide();
  }, 500);  
  showSaveModal("<h3>Thank you for using zPDF !</h3><p>by zenqlo.com</p>");
}

//Saving//
//**//
//Blank page//

export async function addBlankPDF() {
  const response = await fetch(blankPdf);
  const pdfArrayBuffer = await response.arrayBuffer();
  const pdfContent = q(".pdf-content");
  let pdfFileName = 'blank.pdf';
  const loadingTask = pdfjsLib.getDocument({
    data: pdfArrayBuffer,
    cMapUrl: cMapFolder,
    cMapPacked: true,
  });
  const pdf = await loadingTask.promise;
  //console.log(pdfArrayBuffer);
  importedPdfData[pdfFileName] = pdfArrayBuffer;

  await renderPDF(pdf, pdfContent, pdfFileName, true);
}

//Blank page//
//**//
//Add Text//

export let activeTextBox = null;
export let sltTextNode = null;
export let selectedTr = null;
export let allText = "";

export let lastSize = 150;
export let lastColor = '#FF0000';
export let lastTransparency = 100;

export function addText() {
  Promise.all([fontDefault.load()])
    .then(() => {
      const pdfContent = q(".pdf-content");
      const pageWrappers = Array.from(pdfContent.querySelectorAll(".page-wrapper"));

      const selectedPgWrpr = pageWrappers.find((page) => {
        return page.getAttribute('data-selected') === 'true';
      });

      if (!selectedPgWrpr) return;

      let stage, layer;

      const getStageAndLayer = stgLyr.get(selectedPgWrpr);
      stage = getStageAndLayer.stage;
      layer = getStageAndLayer.layer;

      const textNode = new Konva.Text({
        text: 'New text',
        x: 50,
        y: 80,
        fontSize: lastSize,
        draggable: true,
        padding: 4,
        fill: lastColor,
        wrap: 'none',
        ellipsis: false,
        fontFamily: 'Default Font',
        opacity: lastTransparency / 100,
        name: "Text",
      });

      layer.add(textNode);

      const isMobile = () => window.innerWidth <= 400;
      const tr = new Konva.Transformer({
        enabledAnchors: [],
        boundBoxFunc: (oldBox, newBox) => {
          newBox.width = Math.max(30, newBox.width);
          return newBox;
        },
        rotationSnaps: [-135, -90, -45, 0, 45, 90, 135, -180],
        rotationSnapTolerance : 1.2,
        flipEnabled: false,
        anchorSize: isMobile() ? 5 : 10,
        rotateAnchorOffset: isMobile() ? 20 : 30,
      });

      tr.nodes([textNode]);
      layer.add(tr);

      const trDelGrp = createTrDelGrp(tr, textNode, stage, layer);
      tr.add(trDelGrp);
      trDelGrp.scale(isMobile() ? { x: 0.5, y: 0.5 } : { x: 1, y: 1 });

      textNode.on("dblclick dbltap", () => {
        sltTextNode = textNode;
        selectedTr = tr;

        const addTextModal = new bootstrap.Modal(document.getElementById("addTextModal"));
        addTextModal.show();

        const inputText = document.getElementById("Textarea");
        const inputColor = document.getElementById("inputColor");
        const inputFontSize = document.getElementById("inputFontSize");
        const inputTransparency = document.getElementById("transparencyPicker");

        inputText.value = textNode.text();
        inputColor.value = textNode.fill();
        inputFontSize.value = textNode.fontSize();
        inputTransparency.value = textNode.opacity() * 100;

        const doneButton = document.getElementById("doneButton");
        doneButton.addEventListener("click", () => {
          if (!sltTextNode || !selectedTr) return;

          const inputText = document.getElementById("Textarea");
          const inputColor = document.getElementById("inputColor");
          const inputFontSize = document.getElementById("inputFontSize");
          const inputTransparency = document.getElementById("transparencyPicker");

          sltTextNode.text(inputText.value);
          sltTextNode.fill(inputColor.value);
          sltTextNode.fontSize(Number(inputFontSize.value));
          sltTextNode.opacity(inputTransparency.value / 100);
          sltTextNode.show();
          selectedTr.show();
          selectedTr.forceUpdate();

          lastSize = Number(inputFontSize.value);
          lastColor = inputColor.value;
          lastTransparency = inputTransparency.value;

          if (rmTrAllOutOfBounds(selectedTr, textNode, stage, layer, false)) {
            const stageWidth = stage.width();
            const stageHeight = stage.height();
            sltTextNode.x((stageWidth - sltTextNode.width()) / 2);
            sltTextNode.y((stageHeight - sltTextNode.height()) / 2);
            selectedTr.forceUpdate();
          }

          if (drawTimeout !== null) {
            clearTimeout(drawTimeout);
          }
          drawTimeout = setTimeout(() => {
            layer.batchDraw();
            drawTimeout = null;
          }, 100);

          addTextModal.hide();
          udtPgWidths();
        });

        addTextModal._element.addEventListener("hidden.bs.modal", () => {

          if (drawTimeout !== null) {
            clearTimeout(drawTimeout);
          }
          drawTimeout = setTimeout(() => {
            layer.batchDraw();
            drawTimeout = null;
          }, 100);

        }, { once: true });
      });
    })
  udtPgWidths();
}

//Add Text//
//**//
//DRAW//
export let drawstage;
export let drawModal;

export function drawSign() {

  //console.log(".page-wrapper");
  drawModal = new bootstrap.Modal(document.getElementById('drawModal'));

  drawModal.show();

  document.getElementById('drawModal').addEventListener('shown.bs.modal', (event) => {
    let modalContent = document.querySelector('.modal-content');

    const width = modalContent.offsetWidth * 0.9;
    const height = width * 0.75;
    drawstage = new Konva.Stage({
      container: 'drawContainer',
      width: width,
      height: height,
    });
    const layer = new Konva.Layer();
    drawstage.add(layer);
    let isPaint = false;
    let lastLine;


    drawstage.on('mousedown touchstart', function (e) {
      isPaint = true;
      let pos = drawstage.getPointerPosition();
      lastLine = new Konva.Line({
        stroke: document.getElementById('colorPicker').value,
        strokeWidth: parseInt(document.getElementById('widthPicker').value, 10),
        globalCompositeOperation: 'source-over',
        points: [pos.x, pos.y],
        draggable: true,
      });
      layer.add(lastLine);
    });

    drawstage.on('mouseup touchend', function () {
      isPaint = false;
    });

    drawstage.on('mousemove touchmove', function () {
      if (!isPaint || !lastLine) {
        return;
      }
      const pos = drawstage.getPointerPosition();
      let newPoints = lastLine.points().concat([pos.x, pos.y]);
      lastLine.points(newPoints);
      layer.batchDraw();
    });
  });

  on(q("#saveDrawing"), "click", () => {
    if (drawstage) {
      let dataURL;
      dataURL = drawstage.toDataURL({ pixelRatio: 3 });

      const blob = dataURLtoBlob(dataURL);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = url;
      link.click();

      importImage(url);

      if (drawstage) {
        drawstage.destroy();
        drawstage = null;
      }
      drawModal.hide();
    } else {
      //console.log('drawstage is undefined');
    }
    if (drawstage) {
      drawstage.destroy();
      drawstage = null;
    }
    drawModal.hide();
    //q("#image-input").click();

  });

  function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

}
////

export let rectlastColor = '#DFFE00';
export let rectlastTransparency = 50;

export async function addRectangle() {
  const pdfContent = q(".pdf-content");
  const pageWrappers = Array.from(pdfContent.querySelectorAll(".page-wrapper"));

  const selectedPgWrpr = pageWrappers.find((page) => {
    return page.getAttribute('data-selected') === 'true';
  });

  if (!selectedPgWrpr) return;

  let stage, layer;

  const getStageAndLayer = stgLyr.get(selectedPgWrpr);

  stage = getStageAndLayer.stage;
  layer = getStageAndLayer.layer;

  const rect = new Konva.Rect({
    x: FIX_RES_WDH * 0.25,
    y: FIX_RES_WDH * 0.25,
    width: FIX_RES_WDH * 0.5,
    height: FIX_RES_WDH * 0.5,
    fill: rectlastColor,
    opacity: rectlastTransparency / 100,
    draggable: true,
    name: "Rect"
  });

  layer.add(rect);

  const isMobile = () => window.innerWidth <= 400;
  const tr = new Konva.Transformer({
    keepRatio: true,
    rotationSnaps: [-135, -90, -45, 0, 45, 90, 135, -180],
    rotationSnapTolerance : 1.2,
    minScaleX: 0.01,
    minScaleY: 0.01,
    flipEnabled: false,
    anchorSize: isMobile() ? 5 : 10,
    rotateAnchorOffset: isMobile() ? 20 : 30,
  });
  layer.add(tr);
  tr.nodes([rect]);
  layer.draw();

  const trDelGrp = createTrDelGrp(tr, rect, stage, layer);
  tr.add(trDelGrp);
  trDelGrp.scale(isMobile() ? { x: 0.5, y: 0.5 } : { x: 1, y: 1 });

  rect.on("dblclick dbltap", () => {
    const colorModal = new bootstrap.Modal(document.getElementById("rectModal"));
    colorModal.show();

    const inputOpacity = document.getElementById("rectopacityPicker");
    const inputColor = document.getElementById("rectcolorPicker");

    inputOpacity.value = rectlastTransparency;
    inputColor.value = rectlastColor;
    const doneButton = document.getElementById("rectdoneButton");
    doneButton.addEventListener("click", () => {
      rect.opacity(inputOpacity.value / 100);
      rect.fill(inputColor.value);
      rect.show();
      tr.show();
      tr.forceUpdate();

      rectlastTransparency = inputOpacity.value;
      rectlastColor = inputColor.value;

      if (drawTimeout !== null) {
        clearTimeout(drawTimeout);
      }
      drawTimeout = setTimeout(() => {
        layer.batchDraw();
        drawTimeout = null;
      }, 100);

      colorModal.hide();
      udtPgWidths();
    });
    colorModal._element.addEventListener("hidden.bs.modal", () => {

      if (drawTimeout !== null) {
        clearTimeout(drawTimeout);
      }
      drawTimeout = setTimeout(() => {
        layer.batchDraw();
        drawTimeout = null;
      }, 100);

    }, { once: true });
  });
  udtPgWidths();
}
let drawTimeout = null;