const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

const menu_home = require("./pages/home");
const menu_register = require("./pages/register");
const menu_info = require("./pages/info");
const menu_score = require("./pages/score");
const menu_answer = require("./pages/answer");
const menu_commun = require("./pages/commun");

const menus = {
  HOME: menu_home.STARTING_POINT,
  INFO: menu_info.INFO,
  CHECK_SCORE: menu_score.CHECK_SCORE,

  // REGISTER PAGES
  START_REGISTER: menu_register.START_REGISTER, 
  SCHOOL_CODE: menu_register.SCHOOL_CODE,
  SCHOOL_LEVEL: menu_register.SCHOOL_LEVEL,
  SCHOOL_LEVEL_BASIC: menu_register.SCHOOL_LEVEL_BASIC,
  SCHOOL_LEVEL_HUMANITY: menu_register.SCHOOL_LEVEL_HUMANITY,
  SCHOOL_LEVEL_HUMANITY_CLASS: menu_register.SCHOOL_LEVEL_HUMANITY_CLASS,
  END_REGISTER: menu_register.END_REGISTER,

  // ANSWER PAGES
  ANSWER: menu_answer.ANSWER,
  CONTINUE_ANSWER: menu_answer.CONTINUE_ANSWER,
  QUESTION_OPTIONS: menu_answer.QUESTION_OPTIONS,
  QUESTION_ANSWER: menu_answer.QUESTION_ANSWER,
  ANSWER_AFTER: menu_answer.ANSWER_AFTER,
  END_ANSWER: menu_answer.END_ANSWER,

  // Score PAGES
  CHECK_SCORE: menu_score.CHECK_SCORE,

  // COMMUN PAGES
  END_APPLICATION: menu_commun.END_APPLICATION
};

async function handleUssdInput(session, userInput, msisdn) {
  let step = null ;
  let userInputTrimmed = userInput ? userInput.trim() : null;
  // Injecter MSISDN dès le début
  session.msisdn = session.msisdn || msisdn;

  // Compteur de séquence
  session.sequence = (session.sequence || 0) + 1;

  if(session.step && session.stepSaveAs && userInputTrimmed ){
    // Sauvegarder l'input de l'utilisateur dans session.data si saveAs est défini
    session.data = session.data || {};
    session.data[session.stepSaveAs] = userInputTrimmed;
  }

  if((session.nextSteps  || session.nextStep )&& userInputTrimmed) {
    try{  
      if(session.nextSteps[userInputTrimmed]){
        step = session.nextSteps[userInputTrimmed];
        logJson({ event: "USER_INPUT_STEP", input: userInputTrimmed, nextStep: step, sessionId: session.id }); 
      } 
    }catch(e){
      if(session.nextStep){
        step = session.nextStep;
        logJson({ event: "USER_INPUT_STEP_DEFAULT", input: userInputTrimmed, nextStep: step, sessionId: session.id });
      }
    }
    
  }else{
    logJson({ event: "USER_INPUT_NO_STEP", input: userInputTrimmed, sessionId: session.id });
  }

  // Récupérer le menu courant
  let currentMenu = menus[step] || menus.HOME;
  let result;

  logJson({ event: "CURRENT_MENU", menu: currentMenu.step, sessionId: session.id }); 

  try {
    if (currentMenu.handler) { 
      result = await currentMenu.handler(session, userInputTrimmed); 
    }else{
      result = currentMenu;
    }

    // 3️⃣ Menu simple statique sans handler ni nextSteps
    if (!result) {
      result = {
        text: currentMenu.text || "Menu indisponible",
        end: !!currentMenu.end
      };
    }

  } catch (err) {
    logError(err, { stage: "menuHandler", step: session.step, sessionId: session.id });
    return {
      text: "Erreur, veuillez réessayer",
      end: true,
      sequence: session.sequence
    };
  }

  // 4️⃣ Log JSON pour Kibana/Grafana
  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  // 5️⃣ Fin de parcours : soumettre les données
  if (result.end) {
    try {
      if(result.url){
        submitService.submit(result.url, session.data || {});
        logJson({ event: "SUBMIT_DATA", sessionId: session.id, data: session.data });
      }
    } catch (err) {
      logError(err, { stage: "submitService", sessionId: session.id, sequence: session.sequence });
    }

    return {
      text: result.text,
      end: true,
      sequence: session.sequence
    };
  }
  userInputTrimmed = null; // Clear userInput after using
  session.nextSteps = result.nextSteps; // pour le menu suivant
  session.nextStep = result.nextStep // default;
  session.step = step  // Mettre à jour le step pour les logs
  session.stepSaveAs = currentMenu.saveAs; // pour les logs

  // 6️⃣ Retour menu courant ou suivant
  return {
    text: result.text,
    end: false,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
