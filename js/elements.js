const fullName = $("#fullName");
const username = $("#username");
const startButton = $("#startButton");
const showHealths = $("#showHealths");
const showCountDowns = $("#showCountDowns");
const showGameStatus = $("#showGameStatus");
const showTime = $("#showTime");
const showTimeUsed = $("#showTimeUsed");
const saveModifier = $("#saveModifier");
const deleteLevel = $("#deleteLevel");
const waitingWindow = $("#waitingWindow");
const createMode = $("#createMode");
const localMode = $("#localMode");
const onlineMode = $("#onlineMode");
const rankingTable = $("#rankingTable")
const lvlNo = $("#lvlNo")
const levelCreatorName = $("#levelCreatorName")
const lvlRank = $("#lvlRank")
const lvlTime = $("#lvlTime")
const previewClose = $("#previewClose");
const showPreview = $("#showPreview");
const signOut = $("#signOut");
const levelModifier = $("#levelModifier");
const modeType = $("#modeType");
const privacy = $("#privacy");
const homeButton = $("#homeButton");
const privacyModifier = $("#privacyModifier");
const searchInput = $("#searchInput");
const volumeInput = $("#volumeInput");
const gyroSenInput = $("#gyroSenInput");
const vibrateOnOff = $("#vibrateOnOff");
const gyroOnOff = $("#gyroOnOff");
const modeOptions = $$(".mode");
const maps = $$(".map");
const closeModifier = $("#closeModifier");
const undoBtn = $("#undoBtn");
const redoBtn = $("#redoBtn");
const saveBtn = $("#saveBtn");
const makeTesting = $("#makeTesting");
const closeBtn = $("#closeBtn");
const createLevel = $("#createLevel");
const nextLevelButton = $("#nextLevelButton");



const CVS = $("#mainCanvas");
const previewCanvas = $("#preview");
const cvsModifier = $("#cvsModifier");
const CTX = CVS.getContext("2d");
const PREVIEW_CTX = previewCanvas.getContext("2d");
const MODIFIER_CTX = cvsModifier.getContext("2d");
const paddleImage = createPaddleImage();
const ballImage = createBallImage();
const blockImages = createBlockImages();
let ctx = CTX;

cvsModifier.width = previewCanvas.width = CVS.width = CVS_W;
CVS.height = CVS_H;
cvsModifier.height = previewCanvas.height = SIZE * (cols - 1);

CTX.imageSmoothingQuality = "high";
PREVIEW_CTX.imageSmoothingQuality = "high";
MODIFIER_CTX.imageSmoothingQuality = "high";