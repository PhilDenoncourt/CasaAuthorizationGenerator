const fs = require('fs');
const hummus = require('hummus');

function addLetterhead(pdfWriter, page) {
  pdfWriter.mergePDFPagesToPage(page, 'server/assets/casa-stationary-blank.pdf');
}

function createTextOptions(pdfWriter) {
  var font = pdfWriter.getFontForFile('server/assets/NotoSerif-Regular.ttf');
  return {
    size:12,
    font,
    color:0x00
  }
}

function checkBox(condition, x,y,fontOptions, ctx) {
  if (condition) {
    ctx.writeText('XX', x, y, fontOptions);
  }
}

function createChildForm(req, embedLetterhead, pdfWriter) {
  var childPage = pdfWriter.createPage(0,0, 612, 792);
  pdfWriter.mergePDFPagesToPage(childPage, 'server/assets/HIPPAFormChild.pdf');
  if (embedLetterhead) {
    addLetterhead(pdfWriter, childPage);
  }

  var ctx = pdfWriter.startPageContentContext(childPage);

  let {
    adultName,
    address,
    city,
    state,
    zipCode,
    releaseName,
    releaseOrganization,
    childOtherInformation,
    childMentalHealth,
    childMedicalCare,
    childOtherInformationRecords,
    childMedicalCareRecords,
    childMentalHealthRecords,
    childIsMale,
    childIsFemale,
    childName
  } = req.body;

  var fontOptions = createTextOptions(pdfWriter);

  var csz = (city ? city + ', ' : '') + (state ? state + ' ' : '') + zipCode;

  ctx.writeText(adultName, 103, 567, fontOptions);
  ctx.writeText(address, 90, 160, fontOptions);
  ctx.writeText(csz, 90, 118, fontOptions);
  ctx.writeText(releaseName, 90, 430, fontOptions);
  ctx.writeText(releaseOrganization, 310, 430, fontOptions);
  ctx.writeText(childName, 95, 525, fontOptions);
  ctx.writeText(childOtherInformation, 166, 470, fontOptions);
  ctx.writeText(childOtherInformationRecords, 166, 300, fontOptions);
  checkBox(childMentalHealth, 97, 497, fontOptions, ctx);
  checkBox(childMedicalCare, 322, 497, fontOptions, ctx);
  checkBox(childOtherInformation, 97, 470, fontOptions, ctx);
  checkBox(childMentalHealthRecords, 97, 329, fontOptions, ctx);
  checkBox(childMedicalCareRecords, 322, 329, fontOptions, ctx);
  checkBox(childOtherInformationRecords, 97, 300, fontOptions, ctx);

  if (childIsMale) {
    ctx.drawRectangle(412, 535, 20,3, { type:'fill', color:0x00, width:3})
  }
  if (childIsFemale) {
    ctx.drawRectangle(441, 535, 51,3, { type:'fill', color:0x00, width:3})
  }
  pdfWriter.writePage(childPage);
}

function createAdultForm(req, embedLetterhead, pdfWriter) {
  var adultPage = pdfWriter.createPage(0,0, 612, 792);

  pdfWriter.mergePDFPagesToPage(adultPage, 'server/assets/HIPPAFormAdult.pdf');

  if (embedLetterhead) {
    addLetterhead(pdfWriter, adultPage);
  }

  var ctx = pdfWriter.startPageContentContext(adultPage);

  let {
    adultName,
    address,
    city,
    state,
    zipCode,
    adultMentalHealth,
    adultMedicalCare,
    adultSubstanceAbuseTreatment,
    adultHomeBasedCounseling,
    adultOtherInformation,
    adultMentalHealthEvaluations,
    adultHomeBasedCounselingEvaluations,
    adultSubstanceAbuseEvaluations,
    adultOtherRecordRelease,
    releaseName,
    releaseOrganization
  } = req.body;

  var fontOptions = createTextOptions(pdfWriter);

  var csz = (city ? city + ', ' : '') + (state ? state + ' ' : '') + zipCode;

  ctx.writeText(adultName, 103, 623, fontOptions);
  ctx.writeText(address, 90, 177, fontOptions);
  ctx.writeText(csz, 90, 132, fontOptions);
  ctx.writeText(releaseName, 94, 470, fontOptions);
  ctx.writeText(releaseOrganization, 340, 470, fontOptions);
  ctx.writeText(adultOtherInformation, 165, 512, fontOptions);
  ctx.writeText(adultOtherRecordRelease, 413, 328, fontOptions, ctx);
  checkBox(adultOtherInformation, 97, 512, fontOptions, ctx);
  checkBox(adultMentalHealth, 97, 568, fontOptions, ctx);
  checkBox(adultSubstanceAbuseTreatment, 97, 541, fontOptions, ctx);
  checkBox(adultMedicalCare, 328, 568, fontOptions, ctx);
  checkBox(adultHomeBasedCounseling, 328, 541, fontOptions, ctx);
  checkBox(adultMentalHealthEvaluations, 97, 355, fontOptions, ctx);
  checkBox(adultSubstanceAbuseEvaluations, 97, 328, fontOptions, ctx);
  checkBox(adultHomeBasedCounselingEvaluations, 346, 355, fontOptions, ctx);
  checkBox(adultOtherRecordRelease, 346, 328, fontOptions, ctx);

  pdfWriter.writePage(adultPage);
}

function createAuthorizationForm(req, pdfWriter) {
  let needAdult =
    req.body.adultMentalHealth ||
    req.body.adultMedicalCare ||
    req.body.adultSubstanceAbuseTreatment ||
    req.body.adultHomeBasedCounseling ||
    req.body.adultOtherInformation ||
    req.body.adultMentalHealthEvaluations ||
    req.body.adultHomeBasedCounselingEvaluations ||
    req.body.adultSubstanceAbuseEvaluations ||
    req.body.adultOtherRecordRelease;

  let needChild =
    req.body.childMentalHealth ||
    req.body.childMedicalCare ||
    req.body.childOtherInformation ||
    req.body.childMentalHealthRecords ||
    req.body.childMedicalCareRecords ||
    req.body.childOtherInformationRecords;

  let embedLetterhead =
    req.body.includeLetterHead;

  if (needAdult) {
    createAdultForm(req, embedLetterhead, pdfWriter);
  }

  if (needChild) {
    createChildForm(req, embedLetterhead, pdfWriter);
  }
}

export function generateForm(req, res) {
  res.writeHead(200, {'Content-Type': 'application/pdf'});
  var pdfWriter = hummus.createWriter(new hummus.PDFStreamForResponse(res));

  createAuthorizationForm(req, pdfWriter);

  pdfWriter.end();
  res.end();
}
